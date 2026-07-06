import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import OutlinedFlagRoundedIcon from "@mui/icons-material/OutlinedFlagRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import type { PracticeQuestion } from "@/data/types";
import {
  loadQuestions,
  selectOption,
  clearAnswer,
  toggleMark,
  goToQuestion,
  nextQuestion,
  prevQuestion,
  tick,
  submitTest,
} from "../state/practiceSlice";

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function PracticePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const state = useAppSelector((s) => s.practice);
  const {
    questions,
    currentIndex,
    answers,
    marked,
    secondsLeft,
    submitted,
    result,
    status,
    title,
  } = state;

  const [reviewMode, setReviewMode] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (status === "idle") dispatch(loadQuestions());
  }, [dispatch, status]);

  // Countdown timer.
  useEffect(() => {
    if (status !== "ready" || submitted) return;
    const id = setInterval(() => dispatch(tick()), 1000);
    return () => clearInterval(id);
  }, [dispatch, status, submitted]);

  const loading = status !== "ready" || questions.length === 0;
  const q = questions[currentIndex];

  const answeredCount = questions.filter((x) => answers[x.id]).length;
  const markedCount = questions.filter((x) => marked[x.id]).length;
  const unansweredCount = questions.length - answeredCount;

  // Results screen (after submit, when not actively reviewing).
  if (submitted && result && !reviewMode) {
    return (
      <PageContainer maxWidth={760}>
        <ResultsView
          result={result}
          total={questions.length}
          onReview={() => {
            dispatch(goToQuestion(0));
            setReviewMode(true);
          }}
          onAnalysis={() => navigate("/analysis")}
        />
      </PageContainer>
    );
  }

  if (loading || !q) {
    return (
      <PageContainer maxWidth={1180}>
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: 3, mb: 2.5 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 260px" }, gap: 2.5 }}>
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: 4 }} />
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: 4 }} />
        </Box>
      </PageContainer>
    );
  }

  const selected = answers[q.id] ?? null;
  const isMarked = !!marked[q.id];
  const isLast = currentIndex >= questions.length - 1;
  const lowTime = secondsLeft <= 300;

  const optionState = (id: string): "idle" | "selected" | "correct" | "wrong" => {
    if (reviewMode) {
      if (id === q.correctOptionId) return "correct";
      if (id === selected) return "wrong";
      return "idle";
    }
    return selected === id ? "selected" : "idle";
  };

  return (
    <PageContainer maxWidth={1180}>
      {/* Header — title, progress strip, timer */}
      <SectionCard pad="md" sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1.5}
          sx={{ mb: 1.5 }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              }}
            >
              <EditNoteRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {reviewMode ? "Review · " : ""}{title || "MCQ Practice"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Practice. Analyze. Improve.
              </Typography>
            </Box>
          </Stack>
          {!reviewMode && (
            <HeaderStat
              icon={<AccessTimeRoundedIcon />}
              label="Time Left"
              value={fmtTime(secondsLeft)}
              tone={lowTime ? "error" : "secondary"}
            />
          )}
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.25}
          sx={{
            pt: 1.25,
            borderTop: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip
              size="small"
              label={q.subject}
              sx={{
                height: 24,
                fontWeight: 600,
                fontSize: "0.75rem",
                bgcolor: (t) => `${t.palette.primary.main}10`,
                color: "primary.main",
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
              {answeredCount}/{questions.length} attempted
            </Typography>
            <LegendRow color="success.main" label="Answered" value={answeredCount} compact />
            <LegendRow color="warning.main" label="Marked" value={markedCount} compact />
            <LegendRow color="text.disabled" label="Unanswered" value={unansweredCount} compact />
          </Stack>
          <Button
            size="small"
            variant="outlined"
            startIcon={<InsightsRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate("/analysis")}
            sx={{ flexShrink: 0, fontSize: "0.78rem" }}
          >
            View Analysis
          </Button>
        </Stack>
      </SectionCard>

      {/* Two-column workspace: question + palette */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 260px" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        {/* Question */}
        <SectionCard pad="lg">
          {/* Question header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 1.5, borderBottom: (t) => `2px solid ${t.palette.divider}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
              Question {q.index}{" "}
              <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
                of {q.total}
              </Box>
            </Typography>
            {!reviewMode && (
              <Stack direction="row" spacing={1.5}>
                <ActionText
                  active={isMarked}
                  icon={isMarked ? <BookmarkRoundedIcon sx={{ fontSize: 18 }} /> : <BookmarkBorderRoundedIcon sx={{ fontSize: 18 }} />}
                  label={isMarked ? "Marked" : "Mark"}
                  tone="warning"
                  onClick={() => dispatch(toggleMark())}
                />
                <ActionText
                  icon={<OutlinedFlagRoundedIcon sx={{ fontSize: 18 }} />}
                  label="Report"
                  tone="error"
                  onClick={() => {}}
                />
              </Stack>
            )}
          </Stack>

          {/* Meta row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Chip
              size="small"
              label={q.subject}
              sx={{
                bgcolor: (t) => `${t.palette.primary.main}12`,
                color: "primary.main",
                fontWeight: 600,
              }}
            />
            <Typography variant="caption" sx={{ color: "warning.dark", fontWeight: 700 }}>
              {q.marks} Marks
            </Typography>
          </Stack>

          <AnimatePresence mode="wait">
            <Box
              key={q.id}
              component={motion.div}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
            >
              {/* Prompt */}
              <Typography variant="h6" sx={{ fontWeight: 600, mt: 2, mb: q.statements ? 1.5 : 2.5, lineHeight: 1.5 }}>
                {q.prompt}
              </Typography>

              {/* Statements */}
              {q.statements && (
                <Stack spacing={1} sx={{ mb: 2.5, pl: 0.5 }}>
                  {q.statements.map((s, i) => (
                    <Stack key={i} direction="row" spacing={1.25}>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, minWidth: 16 }}>
                        {i + 1}.
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.primary" }}>
                        {s}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}

              {/* Options */}
              <Stack spacing={1.25}>
                {q.options.map((opt) => {
                  const st = optionState(opt.id);
                  return (
                    <OptionRow
                      key={opt.id}
                      id={opt.id}
                      text={opt.text}
                      state={st}
                      yourAnswer={!reviewMode && selected === opt.id}
                      disabled={reviewMode}
                      onClick={() => !reviewMode && dispatch(selectOption(opt.id))}
                    />
                  );
                })}
              </Stack>

              {/* Explanation (review) */}
              {reviewMode && (
                <SectionCard pad="md" flat sx={{ mt: 2.5, bgcolor: (t) => t.palette.surface.subtle }}>
                  <Chip
                    size="small"
                    label={selected === q.correctOptionId ? "Correct" : selected ? "Incorrect" : "Skipped"}
                    sx={{
                      mb: 1.5,
                      fontWeight: 700,
                      bgcolor: (t) =>
                        `${(selected === q.correctOptionId ? t.palette.success : selected ? t.palette.error : t.palette.warning).main}22`,
                      color: selected === q.correctOptionId ? "success.main" : selected ? "error.main" : "warning.dark",
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "text.primary", mb: 1.5 }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </Typography>
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: "text.secondary" }}>
                    <DescriptionRoundedIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption">Source: {q.source}</Typography>
                  </Stack>
                </SectionCard>
              )}
            </Box>
          </AnimatePresence>

          {/* Footer */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 3.5, pt: 2.5, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              disabled={currentIndex === 0}
              onClick={() => dispatch(prevQuestion())}
            >
              Previous
            </Button>

            {!reviewMode && (
              <Button
                variant="text"
                color="inherit"
                startIcon={<RestartAltRoundedIcon />}
                disabled={!selected}
                onClick={() => dispatch(clearAnswer())}
                sx={{ color: "text.secondary" }}
              >
                Clear Answer
              </Button>
            )}

            {reviewMode ? (
              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                disabled={isLast}
                onClick={() => dispatch(nextQuestion())}
              >
                Next
              </Button>
            ) : isLast ? (
              <Button variant="contained" color="success" onClick={() => setConfirmOpen(true)}>
                Submit Test
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => dispatch(nextQuestion())}
              >
                Save &amp; Next
              </Button>
            )}
          </Stack>
        </SectionCard>

        {/* RIGHT — palette */}
        <SectionCard pad="md">
          <PanelTitle>Question Palette</PanelTitle>
          <Stack spacing={0.75} sx={{ mt: 1.5, mb: 2 }}>
            {reviewMode ? (
              <>
                <LegendDot color="success.main" label="Correct" />
                <LegendDot color="error.main" label="Incorrect" />
                <LegendDot color="warning.main" label="Skipped" />
              </>
            ) : (
              <>
                <LegendDot color="success.main" label="Answered" />
                <LegendDot color="warning.main" label="Marked" />
                <LegendDot color="text.disabled" label="Unanswered" />
              </>
            )}
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
            {questions.map((item, i) => (
              <PaletteCell
                key={item.id}
                n={i + 1}
                current={i === currentIndex}
                status={cellStatus(item, { answers, marked, reviewMode })}
                onClick={() => dispatch(goToQuestion(i))}
              />
            ))}
          </Box>

          {reviewMode ? (
            <Button fullWidth variant="contained" sx={{ mt: 2.5 }} onClick={() => navigate("/analysis")}>
              View Full Analysis
            </Button>
          ) : (
            <Stack spacing={1.25} sx={{ mt: 2.5 }}>
              <Button fullWidth variant="outlined" startIcon={<BookmarkRoundedIcon />} onClick={jumpToMarked(questions, marked, dispatch)} disabled={markedCount === 0}>
                Review Marked
              </Button>
              <Button fullWidth variant="contained" color="success" onClick={() => setConfirmOpen(true)}>
                Submit Test
              </Button>
            </Stack>
          )}
        </SectionCard>
      </Box>

      {/* Submit confirmation */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4, maxWidth: 420 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Submit test?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You've answered <strong>{answeredCount}</strong> of {questions.length} questions
            {unansweredCount > 0 && ` · ${unansweredCount} left unattempted`}
            {markedCount > 0 && ` · ${markedCount} marked for review`}.
          </Typography>
          <Stack direction="row" spacing={1}>
            <MiniSummary tone="success" label="Answered" value={answeredCount} />
            <MiniSummary tone="warning" label="Marked" value={markedCount} />
            <MiniSummary tone="error" label="Skipped" value={unansweredCount} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={() => setConfirmOpen(false)}>
            Keep Solving
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setConfirmOpen(false);
              dispatch(submitTest());
            }}
          >
            Submit Now
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

/* ----------------------------- helpers ----------------------------- */

type CellStatus = "answered" | "marked" | "answered-marked" | "unanswered" | "correct" | "wrong" | "skipped";

function cellStatus(
  q: PracticeQuestion,
  ctx: { answers: Record<string, string | null>; marked: Record<string, boolean>; reviewMode: boolean },
): CellStatus {
  const ans = ctx.answers[q.id];
  if (ctx.reviewMode) {
    if (!ans) return "skipped";
    return ans === q.correctOptionId ? "correct" : "wrong";
  }
  const a = !!ans;
  const m = !!ctx.marked[q.id];
  if (a && m) return "answered-marked";
  if (m) return "marked";
  if (a) return "answered";
  return "unanswered";
}

function jumpToMarked(
  questions: PracticeQuestion[],
  marked: Record<string, boolean>,
  dispatch: ReturnType<typeof useAppDispatch>,
) {
  return () => {
    const idx = questions.findIndex((x) => marked[x.id]);
    if (idx >= 0) dispatch(goToQuestion(idx));
  };
}

function HeaderStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "warning" | "secondary" | "error";
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        px: 1.5,
        py: 0.9,
        borderRadius: 2.5,
        border: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          color: `${tone}.main`,
          bgcolor: (t) => `${t.palette[tone].main}16`,
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: `${tone}.main` }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function PanelTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {icon && <Box sx={{ color: "primary.main", display: "grid", placeItems: "center" }}>{icon}</Box>}
      <Typography sx={{ fontWeight: 700 }}>{children}</Typography>
    </Stack>
  );
}

function LegendRow({
  color,
  label,
  value,
  compact,
}: {
  color: string;
  label: string;
  value: number;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color }} />
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
          {value}
        </Typography>
      </Stack>
    );
  }
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: color }} />
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: color }} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

function ActionText({
  icon,
  label,
  tone,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "warning" | "error";
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      role="button"
      onClick={onClick}
      sx={{
        cursor: "pointer",
        px: 1,
        py: 0.5,
        borderRadius: 2,
        color: active ? `${tone}.main` : "text.secondary",
        fontWeight: 600,
        fontSize: "0.82rem",
        transition: "color .15s ease, background-color .15s ease",
        "&:hover": { color: `${tone}.main`, bgcolor: (t) => `${t.palette[tone].main}10` },
      }}
    >
      {icon}
      <Typography variant="caption" sx={{ fontWeight: 700, color: "inherit" }}>
        {label}
      </Typography>
    </Stack>
  );
}

function OptionRow({
  id,
  text,
  state,
  yourAnswer,
  disabled,
  onClick,
}: {
  id: string;
  text: string;
  state: "idle" | "selected" | "correct" | "wrong";
  yourAnswer: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const borderColor =
    state === "selected" ? "primary.main" : state === "correct" ? "success.main" : state === "wrong" ? "error.main" : "divider";
  const bg =
    state === "selected"
      ? (t: import("@mui/material").Theme) => `${t.palette.primary.main}0d`
      : state === "correct"
        ? (t: import("@mui/material").Theme) => `${t.palette.success.main}12`
        : state === "wrong"
          ? (t: import("@mui/material").Theme) => `${t.palette.error.main}12`
          : "transparent";

  return (
    <Stack
      direction="row"
      spacing={1.75}
      alignItems="center"
      onClick={onClick}
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2.5,
        cursor: disabled ? "default" : "pointer",
        border: "1.5px solid",
        borderColor,
        bgcolor: bg,
        transition: "border-color .15s ease, background-color .15s ease",
        "&:hover": disabled ? {} : { borderColor: state === "idle" ? "primary.light" : borderColor },
      }}
    >
      {/* radio / letter */}
      <Box
        sx={{
          width: 26,
          height: 26,
          flexShrink: 0,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 700,
          border: "2px solid",
          borderColor:
            state === "selected" ? "primary.main" : state === "correct" ? "success.main" : state === "wrong" ? "error.main" : "divider",
          color:
            state === "selected" ? "primary.main" : state === "correct" ? "success.main" : state === "wrong" ? "error.main" : "text.secondary",
          bgcolor: (t) =>
            state === "idle"
              ? "transparent"
              : `${(state === "selected" ? t.palette.primary : state === "correct" ? t.palette.success : t.palette.error).main}1a`,
        }}
      >
        {id}
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 500, flex: 1, color: "text.primary" }}>
        {text}
      </Typography>
      {state === "correct" && <CheckCircleRoundedIcon sx={{ color: "success.main" }} />}
      {state === "wrong" && <CancelRoundedIcon sx={{ color: "error.main" }} />}
      {yourAnswer && (
        <Chip
          size="small"
          label="Your Answer"
          sx={{ bgcolor: (t) => `${t.palette.success.main}1f`, color: "success.dark", fontWeight: 700 }}
        />
      )}
    </Stack>
  );
}

const CELL_STYLES: Record<
  CellStatus,
  { bg: string; color: string; border?: string; ring?: boolean }
> = {
  answered: { bg: "success.main", color: "#fff" },
  "answered-marked": { bg: "success.main", color: "#fff", ring: true },
  marked: { bg: "warning.main", color: "#fff" },
  unanswered: { bg: "transparent", color: "text.secondary", border: "divider" },
  correct: { bg: "success.main", color: "#fff" },
  wrong: { bg: "error.main", color: "#fff" },
  skipped: { bg: "transparent", color: "text.secondary", border: "divider" },
};

function PaletteCell({
  n,
  status,
  current,
  onClick,
}: {
  n: number;
  status: CellStatus;
  current: boolean;
  onClick: () => void;
}) {
  const s = CELL_STYLES[status];
  return (
    <Tooltip title={status === "answered-marked" ? "Answered & marked" : status.charAt(0).toUpperCase() + status.slice(1)} arrow>
      <Box
        role="button"
        onClick={onClick}
        sx={{
          aspectRatio: "1 / 1",
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          fontWeight: 700,
          fontSize: "0.82rem",
          cursor: "pointer",
          bgcolor: s.bg === "transparent" ? (t) => t.palette.surface.subtle : s.bg,
          color: s.color,
          border: current
            ? (t) => `2px solid ${t.palette.primary.main}`
            : s.border
              ? (t) => `1px solid ${t.palette.divider}`
              : s.ring
                ? (t) => `2px solid ${t.palette.warning.main}`
                : "2px solid transparent",
          boxShadow: current ? (t) => `0 0 0 3px ${t.palette.primary.main}22` : "none",
          transition: "transform .12s ease",
          "&:hover": { transform: "translateY(-1px)" },
        }}
      >
        {n}
      </Box>
    </Tooltip>
  );
}

function MiniSummary({ tone, label, value }: { tone: "success" | "warning" | "error"; label: string; value: number }) {
  return (
    <Box sx={{ flex: 1, textAlign: "center", py: 1.25, borderRadius: 2, bgcolor: (t) => `${t.palette[tone].main}14` }}>
      <Typography sx={{ fontWeight: 800, color: `${tone}.main` }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function ResultsView({
  result,
  total,
  onReview,
  onAnalysis,
}: {
  result: import("@/data/types").PracticeResult;
  total: number;
  onReview: () => void;
  onAnalysis: () => void;
}) {
  const mins = Math.floor(result.timeTakenSeconds / 60);
  const secs = result.timeTakenSeconds % 60;
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionCard pad="lg" sx={{ textAlign: "center" }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: "auto",
            mb: 2,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: (t) => `linear-gradient(135deg, ${t.palette.success.main}, ${t.palette.primary.main})`,
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 34 }} />
        </Box>
        <Typography variant="h5">Test Submitted</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Here's how you performed on this set.
        </Typography>

        <Stack direction="row" alignItems="baseline" justifyContent="center" spacing={1} sx={{ my: 3 }}>
          <Typography variant="h2" sx={{ fontWeight: 800, color: "primary.main" }}>
            {result.score}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            / {result.maxScore}
          </Typography>
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5, mb: 3 }}>
          <ResultStat tone="success" label="Correct" value={result.correct} />
          <ResultStat tone="error" label="Wrong" value={result.wrong} />
          <ResultStat tone="warning" label="Skipped" value={result.unattempted} />
          <ResultStat tone="primary" label="Accuracy" value={`${result.accuracyPercent}%`} />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Attempted {result.correct + result.wrong} of {total} · Time taken {mins}m {secs}s
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
          <Button variant="outlined" startIcon={<DescriptionRoundedIcon />} onClick={onReview}>
            Review Answers
          </Button>
          <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={onAnalysis}>
            View Full Analysis
          </Button>
        </Stack>
      </SectionCard>
    </Box>
  );
}

function ResultStat({ tone, label, value }: { tone: "success" | "error" | "warning" | "primary"; label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ py: 1.75, borderRadius: 3, bgcolor: (t) => `${t.palette[tone].main}12` }}>
      <Typography variant="h5" sx={{ fontWeight: 800, color: `${tone}.main` }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
