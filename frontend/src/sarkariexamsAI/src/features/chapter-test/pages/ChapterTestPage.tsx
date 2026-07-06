import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import TopicRoundedIcon from "@mui/icons-material/TopicRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionCard } from "@/components/ui/SectionCard";

type ChapterStatus = "weak" | "available" | "completed";

interface ChapterItem {
  id: string;
  name: string;
  questions: number;
  status: ChapterStatus;
  score?: number;
  maxScore?: number;
}

interface SubjectGroup {
  id: string;
  name: string;
  chapters: ChapterItem[];
}

const SUBJECTS: SubjectGroup[] = [
  {
    id: "polity",
    name: "Polity",
    chapters: [
      { id: "fr", name: "Fundamental Rights", questions: 30, status: "weak" },
      { id: "dpsp", name: "Directive Principles", questions: 25, status: "completed", score: 22, maxScore: 25 },
      { id: "parliament", name: "Parliament", questions: 28, status: "available" },
    ],
  },
  {
    id: "history",
    name: "History",
    chapters: [
      { id: "modern", name: "Modern India", questions: 30, status: "weak" },
      { id: "ancient", name: "Ancient India", questions: 25, status: "completed", score: 19, maxScore: 25 },
    ],
  },
  {
    id: "geography",
    name: "Geography",
    chapters: [
      { id: "climate", name: "Climate", questions: 25, status: "weak" },
      { id: "resources", name: "Natural Resources", questions: 22, status: "available" },
    ],
  },
];

const ALL_CHAPTERS = SUBJECTS.flatMap((s) => s.chapters.map((c) => ({ ...c, subject: s.name })));
const COMPLETED = ALL_CHAPTERS.filter((c) => c.status === "completed");
const WEAK = ALL_CHAPTERS.filter((c) => c.status === "weak");
const AVG_ACCURACY =
  COMPLETED.length > 0
    ? Math.round(
        COMPLETED.reduce((sum, c) => sum + ((c.score ?? 0) / (c.maxScore ?? 1)) * 100, 0) / COMPLETED.length,
      )
    : 0;

export function ChapterTestPage() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].id);

  const subject = SUBJECTS.find((s) => s.id === selectedSubject)!;
  const featuredWeak = useMemo(
    () => subject.chapters.find((c) => c.status === "weak") ?? subject.chapters[0],
    [subject],
  );

  return (
    <PageContainer maxWidth={1100} compact>
      {/* Quick stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          gap: 1,
          mb: 1.75,
        }}
      >
        <StatTile icon={<TopicRoundedIcon />} label="Chapters done" value={`${COMPLETED.length}`} tone="primary" />
        <StatTile icon={<PriorityHighRoundedIcon />} label="Weak areas" value={`${WEAK.length}`} tone="warning" />
        <StatTile icon={<TrendingUpRoundedIcon />} label="Avg accuracy" value={`${AVG_ACCURACY}%`} tone="success" />
        <StatTile icon={<EmojiEventsRoundedIcon />} label="Best chapter" value="88%" tone="secondary" />
      </Box>

      {/* Hero + pulse */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
          gap: 1.5,
          mb: 1.75,
          alignItems: "stretch",
        }}
      >
        <SectionCard
          pad="sm"
          sx={{
            position: "relative",
            overflow: "hidden",
            borderColor: "warning.main",
            bgcolor: (t) =>
              t.palette.mode === "dark" ? `${t.palette.warning.main}18` : `${t.palette.warning.main}08`,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 4,
              bgcolor: "warning.main",
            }}
          />
          <Stack spacing={1.25} sx={{ pl: 0.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label="Priority"
                size="small"
                color="warning"
                sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700 }}
              />
              <Typography variant="caption" color="text.secondary">
                {subject.name} · weak from mock analysis
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  background: (t) =>
                    `linear-gradient(135deg, ${t.palette.warning.main}, ${t.palette.error.main})`,
                }}
              >
                <PriorityHighRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {featuredWeak.name}
                </Typography>
                <Stack direction="row" spacing={1.25} sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
                  <MetaPill icon={<QuizRoundedIcon />} text={`${featuredWeak.questions} Qs`} />
                  <MetaPill
                    icon={<AccessTimeRoundedIcon />}
                    text={`~${Math.round(featuredWeak.questions * 0.8)} min`}
                  />
                </Stack>
              </Box>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45, maxWidth: "48ch" }}>
              Targeted chapter tests repair weak recall from mocks — results flow straight into your revision queue.
            </Typography>

            <Button
              variant="contained"
              color="warning"
              size="small"
              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 18 }} />}
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate("/practice")}
              sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, fontSize: "0.8rem", mt: 0.25 }}
            >
              Start {featuredWeak.name}
            </Button>
          </Stack>
        </SectionCard>

        <SectionCard pad="sm">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                bgcolor: (t) => `${t.palette.primary.main}14`,
                "& svg": { fontSize: 17 },
              }}
            >
              <AnalyticsRoundedIcon />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Chapter pulse
            </Typography>
          </Stack>

          <Stack spacing={1.1}>
            <PulseRow label="Revision due" value={`${WEAK.length} chapters`} hint="from last mock" />
            <PulseRow label="Last completed" value="Directive Principles" hint="88% accuracy" positive />
            <PulseRow label="Queue updated" value="Today" hint="after Mock #8" />

            <Box sx={{ pt: 0.5 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.35 }}>
                <Typography variant="caption" color="text.secondary">
                  {subject.name} coverage
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {subjectCoverage(subject)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={subjectCoverage(subject)}
                color="primary"
                sx={{ height: 5, borderRadius: 999 }}
              />
            </Box>

            <Button
              size="small"
              variant="outlined"
              fullWidth
              onClick={() => navigate("/analysis")}
              sx={{ fontSize: "0.76rem", mt: 0.25 }}
            >
              View weak-area breakdown
            </Button>
          </Stack>
        </SectionCard>
      </Box>

      {/* Subject filter */}
      <Stack direction="row" spacing={0.75} sx={{ mb: 1.25, flexWrap: "wrap", gap: 0.75 }}>
        {SUBJECTS.map((s) => {
          const active = selectedSubject === s.id;
          const done = s.chapters.filter((c) => c.status === "completed").length;
          return (
            <Chip
              key={s.id}
              label={`${s.name} · ${done}/${s.chapters.length}`}
              onClick={() => setSelectedSubject(s.id)}
              color={active ? "primary" : "default"}
              variant={active ? "filled" : "outlined"}
              sx={{ height: 28, fontSize: "0.76rem", fontWeight: 700 }}
            />
          );
        })}
      </Stack>

      {/* Chapter list */}
      <SectionCard pad="sm">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {subject.name} chapters
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subject.chapters.filter((c) => c.status === "completed").length} of {subject.chapters.length} done
          </Typography>
        </Stack>

        <Stack divider={<Box sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }} />}>
          {subject.chapters.map((chapter, index) => (
            <ChapterRow
              key={chapter.id}
              index={index + 1}
              chapter={chapter}
              onStart={() => navigate("/practice")}
              onAnalysis={() => navigate("/analysis")}
            />
          ))}
        </Stack>
      </SectionCard>
    </PageContainer>
  );
}

function subjectCoverage(subject: SubjectGroup): number {
  const completed = subject.chapters.filter((c) => c.status === "completed").length;
  return Math.round((completed / subject.chapters.length) * 100);
}

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "warning" | "success" | "secondary";
}) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Stack direction="row" spacing={0.85} alignItems="center" sx={{ mb: 0.35 }}>
        <Box sx={{ color: `${tone}.main`, display: "grid", "& svg": { fontSize: 15 } }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2, pl: 0.15 }}>
        {value}
      </Typography>
    </Box>
  );
}

function MetaPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Stack
      direction="row"
      spacing={0.4}
      alignItems="center"
      sx={{
        px: 0.75,
        py: 0.2,
        borderRadius: 1,
        bgcolor: (t) => t.palette.surface.subtle,
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Box sx={{ color: "text.secondary", display: "grid", "& svg": { fontSize: 13 } }}>{icon}</Box>
      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.68rem" }}>
        {text}
      </Typography>
    </Stack>
  );
}

function PulseRow({
  label,
  value,
  hint,
  positive,
}: {
  label: string;
  value: string;
  hint: string;
  positive?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.68rem" }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
          {hint}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, color: positive ? "success.main" : "text.primary", flexShrink: 0 }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function ChapterRow({
  index,
  chapter,
  onStart,
  onAnalysis,
}: {
  index: number;
  chapter: ChapterItem;
  onStart: () => void;
  onAnalysis: () => void;
}) {
  const isCompleted = chapter.status === "completed";
  const isWeak = chapter.status === "weak";
  const pct =
    chapter.score && chapter.maxScore ? Math.round((chapter.score / chapter.maxScore) * 100) : 0;
  const scoreTone = pct >= 80 ? "success" : pct >= 60 ? "warning" : "error";

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.25}
      alignItems={{ sm: "center" }}
      justifyContent="space-between"
      sx={{
        py: 1.1,
        borderLeft: (t) =>
          isWeak ? `3px solid ${t.palette.warning.main}` : isCompleted ? `3px solid ${t.palette.success.main}` : undefined,
        pl: isWeak || isCompleted ? 1 : 0,
        ml: isWeak || isCompleted ? -0.25 : 0,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: "0.72rem",
            bgcolor: isCompleted ? "success.main" : (t) => t.palette.surface.subtle,
            border: (t) => `1px solid ${isCompleted ? t.palette.success.main : t.palette.divider}`,
            color: isCompleted ? "#fff" : "text.secondary",
          }}
        >
          {isCompleted ? <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> : index}
        </Box>

        {isCompleted && chapter.score != null && chapter.maxScore != null && (
          <ScoreRing score={chapter.score} max={chapter.maxScore} tone={scoreTone} />
        )}

        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexWrap: "wrap", gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
              {chapter.name}
            </Typography>
            {isCompleted && (
              <Chip
                label="Complete"
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.62rem", fontWeight: 600 }}
              />
            )}
            {isWeak && (
              <Chip label="Weak area" size="small" color="warning" sx={{ height: 20, fontSize: "0.62rem", fontWeight: 600 }} />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", mt: 0.25, display: "block" }}>
            {chapter.questions} Qs · ~{Math.round(chapter.questions * 0.8)} min
          </Typography>
        </Box>
      </Stack>

      {isCompleted ? (
        <Button
          size="small"
          variant="outlined"
          onClick={onAnalysis}
          sx={{ flexShrink: 0, fontSize: "0.74rem", alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          View analysis
        </Button>
      ) : (
        <Button
          size="small"
          variant={isWeak ? "contained" : "outlined"}
          color={isWeak ? "warning" : "primary"}
          startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={onStart}
          sx={{ flexShrink: 0, fontSize: "0.74rem", alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          Start test
        </Button>
      )}
    </Stack>
  );
}

function ScoreRing({
  score,
  max,
  tone,
}: {
  score: number;
  max: number;
  tone: "success" | "warning" | "error";
}) {
  const pct = Math.round((score / max) * 100);
  return (
    <Stack alignItems="center" spacing={0} sx={{ flexShrink: 0, width: 44 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: "2.5px solid",
          borderColor: `${tone}.main`,
          color: `${tone}.main`,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: "0.62rem", lineHeight: 1 }}>
          {score}/{max}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ fontSize: "0.58rem", color: "text.secondary", mt: 0.15 }}>
        {pct}%
      </Typography>
    </Stack>
  );
}
