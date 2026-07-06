import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { loadConcepts } from "../state/learnSlice";
import {
  GRAPH,
  SUBJECTS,
  chapterProgress,
  nextReadableConcept,
  shortSubjectName,
  type ChapterNode,
  type ConceptNode,
  type SubjectOption,
} from "../data/courseGraph";
import { NCERT_CONTENT, buildFallbackContent, type NcertContent } from "../data/ncertContent";

interface ReadingSelection {
  chapter: ChapterNode;
  concept: ConceptNode;
}

type ReaderStep = "intro" | `section-${number}` | "check" | "done";

export function LearnPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { status } = useAppSelector((s) => s.learn);

  const subjectId = searchParams.get("subject") ?? "polity";
  const topicParam = searchParams.get("topic");

  const [reading, setReading] = useState<ReadingSelection | null>(null);
  const [readerStep, setReaderStep] = useState<ReaderStep>("intro");

  useEffect(() => {
    if (status === "idle") dispatch(loadConcepts());
  }, [dispatch, status]);

  const selectedSubject = useMemo(
    () => SUBJECTS.find((s) => s.id === subjectId) ?? SUBJECTS[0],
    [subjectId],
  );
  const chapters = GRAPH[selectedSubject.id] ?? GRAPH.polity;
  const loading = status === "loading";

  // Auto-open topic from URL (e.g. resume from Courses)
  useEffect(() => {
    if (!topicParam || loading) return;
    for (const chapter of chapters) {
      const concept = chapter.concepts.find((c) => c.id === topicParam);
      if (concept && concept.status !== "locked") {
        setReading({ chapter, concept });
        setReaderStep("intro");
        break;
      }
    }
  }, [topicParam, chapters, loading]);

  const handleSubjectChange = (event: SelectChangeEvent) => {
    setSearchParams({ subject: event.target.value });
    setReading(null);
  };

  const openReading = (chapter: ChapterNode, concept: ConceptNode) => {
    if (concept.status === "locked") return;
    setReading({ chapter, concept });
    setReaderStep("intro");
    setSearchParams({ subject: selectedSubject.id, topic: concept.id });
  };

  const closeReading = () => {
    setReading(null);
    setSearchParams({ subject: selectedSubject.id });
  };

  if (loading) {
    return (
      <PageContainer maxWidth={1100} compact>
        <Skeleton width="40%" height={28} />
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2, mt: 1.5 }} />
      </PageContainer>
    );
  }

  if (reading) {
    return (
      <PageContainer maxWidth={780} compact>
        <NcertReader
          subject={selectedSubject}
          selection={reading}
          step={readerStep}
          onStepChange={setReaderStep}
          onBack={closeReading}
          onPractice={() => navigate("/practice")}
          onBackToCourses={() => navigate("/courses")}
        />
      </PageContainer>
    );
  }

  const totalDone = chapters.reduce((sum, ch) => sum + chapterProgress(ch).done, 0);
  const totalTopics = chapters.reduce((sum, ch) => sum + ch.concepts.length, 0);

  return (
    <PageContainer maxWidth={1100} compact>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.25}
        sx={{ mb: 1.5 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.35 }}>
            <Button
              size="small"
              variant="text"
              onClick={() => navigate("/courses")}
              sx={{ minWidth: 0, px: 0, fontSize: "0.72rem", fontWeight: 600 }}
            >
              Courses
            </Button>
            <Typography variant="caption" color="text.secondary">/</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>
              {shortSubjectName(selectedSubject.name)}
            </Typography>
          </Stack>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
            {selectedSubject.ncertBook}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedSubject.classLabel} · {totalDone}/{totalTopics} topics read
          </Typography>
        </Box>
        <Select
          value={selectedSubject.id}
          onChange={handleSubjectChange}
          size="small"
          sx={{
            width: { xs: "100%", sm: 260 },
            flexShrink: 0,
            bgcolor: "background.paper",
            borderRadius: 2,
            "& .MuiSelect-select": { py: 0.85, fontSize: "0.84rem" },
          }}
        >
          {SUBJECTS.map((s) => (
            <MenuItem key={s.id} value={s.id} sx={{ fontSize: "0.84rem" }}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <SectionCard pad="sm">
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.35 }}>
          Chapters
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.25, fontSize: "0.72rem" }}>
          Read chapters in order. Each chapter has topics — tap &quot;Start reading&quot; to begin.
        </Typography>

        <Stack spacing={1.25}>
          {chapters.map((chapter, index) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              index={index + 1}
              onRead={(concept) => openReading(chapter, concept)}
            />
          ))}
        </Stack>
      </SectionCard>
    </PageContainer>
  );
}

/* ───────────────────── Chapter list ───────────────────── */

function ChapterCard({
  chapter,
  index,
  onRead,
}: {
  chapter: ChapterNode;
  index: number;
  onRead: (concept: ConceptNode) => void;
}) {
  const { done, total, pct } = chapterProgress(chapter);
  const isComplete = done === total;
  const next = nextReadableConcept(chapter);
  const locked = chapter.concepts.every((c) => c.status === "locked");

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        border: (t) => `1px solid ${isComplete ? t.palette.success.main : t.palette.divider}`,
        bgcolor: locked ? (t) => t.palette.surface.subtle : "background.paper",
        opacity: locked ? 0.75 : 1,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: isComplete ? "success.main" : "text.primary",
            color: "#fff",
            fontWeight: 800,
            fontSize: "0.78rem",
          }}
        >
          {isComplete ? <CheckCircleRoundedIcon sx={{ fontSize: 20 }} /> : String(index).padStart(2, "0")}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.2, flexWrap: "wrap", gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {chapter.title}
            </Typography>
            {isComplete && (
              <Chip label="Complete" size="small" color="success" sx={{ height: 20, fontSize: "0.62rem", fontWeight: 600 }} />
            )}
            {locked && (
              <Chip icon={<LockRoundedIcon sx={{ fontSize: "12px !important" }} />} label="Locked" size="small" sx={{ height: 20, fontSize: "0.62rem" }} />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.68rem", mb: 0.75 }}>
            {chapter.ncertChapter} · {chapter.subtitle}
          </Typography>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
              {done}/{total} topics
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.68rem" }}>
              {pct}%
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={pct} color={isComplete ? "success" : "primary"} sx={{ height: 4, borderRadius: 999, mb: 1 }} />

          {/* Topic rows */}
          <Stack spacing={0.5} sx={{ mb: next ? 1 : 0 }}>
            {chapter.concepts.map((concept) => (
              <Stack key={concept.id} direction="row" spacing={0.75} alignItems="center">
                {concept.status === "mastered" ? (
                  <CheckCircleRoundedIcon sx={{ fontSize: 14, color: "success.main" }} />
                ) : concept.status === "locked" ? (
                  <LockRoundedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                ) : (
                  <Box sx={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid", borderColor: concept.status === "decaying" ? "warning.main" : "primary.main" }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: concept.id === next?.id ? 700 : 500,
                    color: concept.status === "locked" ? "text.disabled" : "text.primary",
                    textDecoration: concept.status === "mastered" ? "line-through" : "none",
                  }}
                >
                  {concept.title}
                  {concept.ncertPages && (
                    <Box component="span" sx={{ color: "text.secondary", ml: 0.5 }}>
                      · {concept.ncertPages}
                    </Box>
                  )}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {next && (
            <Button
              size="small"
              variant="contained"
              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => onRead(next)}
              sx={{ fontSize: "0.74rem" }}
            >
              {done > 0 ? "Continue reading" : "Start reading"}
            </Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

/* ───────────────────── Step-by-step reader ───────────────────── */

function NcertReader({
  subject,
  selection,
  step,
  onStepChange,
  onBack,
  onPractice,
  onBackToCourses,
}: {
  subject: SubjectOption;
  selection: ReadingSelection;
  step: ReaderStep;
  onStepChange: (s: ReaderStep) => void;
  onBack: () => void;
  onPractice: () => void;
  onBackToCourses: () => void;
}) {
  const { chapter, concept } = selection;
  const content = NCERT_CONTENT[concept.id] ?? buildFallbackContent(concept, chapter);

  const steps: ReaderStep[] = [
    "intro",
    ...content.sections.map((_, i) => `section-${i}` as ReaderStep),
    "check",
    "done",
  ];
  const stepIndex = steps.indexOf(step);
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  const goNext = () => {
    if (stepIndex < steps.length - 1) onStepChange(steps[stepIndex + 1]);
  };
  const goPrev = () => {
    if (stepIndex > 0) onStepChange(steps[stepIndex - 1]);
  };

  return (
    <Stack spacing={1.5}>
      {/* Progress header */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
          <Button size="small" variant="text" startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 16 }} />} onClick={onBack} sx={{ fontSize: "0.74rem", px: 0 }}>
            Back to chapters
          </Button>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.68rem" }}>
            Step {stepIndex + 1} of {steps.length}
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 999, mb: 1 }} />
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexWrap: "wrap", gap: 0.25 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
            {subject.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">›</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
            Ch. {chapter.number}
          </Typography>
          <Typography variant="caption" color="text.secondary">›</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.68rem" }}>
            {concept.title}
          </Typography>
        </Stack>
      </Box>

      <SectionCard pad="sm">
        {step === "intro" && <IntroStep content={content} concept={concept} />}
        {step.startsWith("section-") && (
          <SectionStep section={content.sections[parseInt(step.split("-")[1], 10)]} index={parseInt(step.split("-")[1], 10)} />
        )}
        {step === "check" && <CheckStep content={content} />}
        {step === "done" && (
          <DoneStep concept={concept} onPractice={onPractice} onBackToCourses={onBackToCourses} onBack={onBack} />
        )}
      </SectionCard>

      {/* Navigation footer */}
      {step !== "done" && (
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Button size="small" variant="outlined" disabled={stepIndex === 0} onClick={goPrev} sx={{ fontSize: "0.76rem" }}>
            Previous
          </Button>
          <Button size="small" variant="contained" endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />} onClick={goNext} sx={{ fontSize: "0.76rem" }}>
            {step === "check" ? "Finish reading" : "Next"}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

function IntroStep({ content, concept }: { content: NcertContent; concept: ConceptNode }) {
  return (
    <Stack spacing={1.25}>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexWrap: "wrap", gap: 0.5 }}>
        <Chip icon={<MenuBookRoundedIcon sx={{ fontSize: "14px !important" }} />} label="NCERT Reading" size="small" color="primary" sx={{ height: 24, fontSize: "0.68rem", fontWeight: 600 }} />
        <Chip label={content.ncertRef} size="small" variant="outlined" sx={{ height: 24, fontSize: "0.65rem" }} />
        <Chip label={`~${content.readMinutes} min`} size="small" variant="outlined" sx={{ height: 24, fontSize: "0.65rem" }} />
      </Stack>

      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
        {concept.title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.55, fontSize: "0.78rem" }}>
        {content.intro}
      </Typography>

      <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: (t) => t.palette.surface.subtle, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 0.75, fontSize: "0.72rem" }}>
          You will cover
        </Typography>
        <Stack direction="row" gap={0.5} sx={{ flexWrap: "wrap" }}>
          {content.covered.map((topic) => (
            <Chip key={topic} label={topic} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.62rem" }} />
          ))}
        </Stack>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
        Tap <strong>Next</strong> to read section by section. Takeaways appear at the end of each section.
      </Typography>
    </Stack>
  );
}

function SectionStep({ section, index }: { section: NcertContent["sections"][number]; index: number }) {
  return (
    <Stack spacing={1.25}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: 1.5,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: "primary.main",
            color: "#fff",
            fontWeight: 800,
            fontSize: "0.75rem",
          }}
        >
          {index + 1}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {section.title}
        </Typography>
      </Stack>

      <Typography variant="caption" sx={{ color: "text.primary", lineHeight: 1.65, fontSize: "0.8rem", display: "block" }}>
        {section.body}
      </Typography>

      {section.bullets && (
        <Stack spacing={0.5} sx={{ pl: 0.5 }}>
          {section.bullets.map((b) => (
            <Stack key={b} direction="row" spacing={0.75} alignItems="flex-start">
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0, mt: 0.6 }} />
              <Typography variant="caption" sx={{ lineHeight: 1.5, fontSize: "0.76rem" }}>
                {b}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {section.timeline && (
        <Box sx={{ borderRadius: 1.5, border: (t) => `1px solid ${t.palette.divider}`, overflow: "hidden" }}>
          {section.timeline.map((item, i) => (
            <Stack
              key={item.year}
              direction="row"
              spacing={1.25}
              sx={{
                px: 1.25,
                py: 0.85,
                bgcolor: i % 2 === 0 ? "background.paper" : (t) => t.palette.surface.subtle,
                borderBottom: i < section.timeline!.length - 1 ? (t) => `1px solid ${t.palette.divider}` : undefined,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", minWidth: 42, fontSize: "0.72rem" }}>
                {item.year}
              </Typography>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: "block", fontSize: "0.74rem" }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", lineHeight: 1.45 }}>
                  {item.detail}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      )}

      <Box
        sx={{
          px: 1.25,
          py: 1,
          borderLeft: (t) => `3px solid ${t.palette.warning.main}`,
          bgcolor: (t) => `${t.palette.warning.main}0d`,
          borderRadius: 1,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: "warning.dark", fontSize: "0.72rem" }}>
          Takeaway
        </Typography>
        <Typography variant="caption" sx={{ display: "block", mt: 0.25, lineHeight: 1.5, fontSize: "0.76rem" }}>
          {section.takeaway}
        </Typography>
      </Box>
    </Stack>
  );
}

function CheckStep({ content }: { content: NcertContent }) {
  return (
    <Stack spacing={1.25}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        Quick check — can you answer these?
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
        Try answering from memory before tapping Finish. No need to be perfect — this builds recall.
      </Typography>

      <Stack spacing={0.75}>
        {content.quickCheck.map((item, i) => (
          <Box key={item.question} sx={{ p: 1.1, borderRadius: 1.5, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", fontSize: "0.72rem" }}>
              Q{i + 1}. {item.question}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.35, fontSize: "0.68rem", fontStyle: "italic" }}>
              Hint: {item.hint}
            </Typography>
          </Box>
        ))}
      </Stack>

      {content.examTips.length > 0 && (
        <Box sx={{ p: 1.1, borderRadius: 1.5, bgcolor: (t) => `${t.palette.error.main}08`, border: (t) => `1px solid ${t.palette.error.main}33` }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "error.main", display: "block", mb: 0.5, fontSize: "0.72rem" }}>
            Exam tips
          </Typography>
          <Stack spacing={0.35}>
            {content.examTips.map((tip) => (
              <Typography key={tip} variant="caption" sx={{ fontSize: "0.72rem", lineHeight: 1.45 }}>
                · {tip}
              </Typography>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

function DoneStep({
  concept,
  onPractice,
  onBackToCourses,
  onBack,
}: {
  concept: ConceptNode;
  onPractice: () => void;
  onBackToCourses: () => void;
  onBack: () => void;
}) {
  return (
    <Stack spacing={1.5} alignItems="center" sx={{ py: 1, textAlign: "center" }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 48, color: "success.main" }} />
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        You finished reading: {concept.title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 360, fontSize: "0.76rem", lineHeight: 1.5 }}>
        Great work. Now attempt a few PYQs to lock this in, or continue to the next topic in the chapter list.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%", maxWidth: 400 }}>
        <Button fullWidth size="small" variant="contained" startIcon={<FactCheckRoundedIcon />} onClick={onPractice} sx={{ fontSize: "0.76rem" }}>
          Practice PYQs
        </Button>
        <Button fullWidth size="small" variant="outlined" onClick={onBack} sx={{ fontSize: "0.76rem" }}>
          Next topic
        </Button>
      </Stack>
      <Button size="small" variant="text" onClick={onBackToCourses} sx={{ fontSize: "0.72rem" }}>
        Back to all courses
      </Button>
    </Stack>
  );
}
