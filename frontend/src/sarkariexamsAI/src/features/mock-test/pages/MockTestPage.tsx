import { Box, Button, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionCard } from "@/components/ui/SectionCard";

interface MockItem {
  id: string;
  number: number;
  title: string;
  questions: number;
  duration: number;
  status: "upcoming" | "completed";
  date?: string;
  score?: number;
  maxScore?: number;
  weak?: string;
}

const MOCKS: MockItem[] = [
  {
    id: "m9",
    number: 9,
    title: "BPSC Prelims · Full Mock #9",
    questions: 150,
    duration: 120,
    status: "upcoming",
    date: "Sun, 10:00 AM",
  },
  {
    id: "m8",
    number: 8,
    title: "BPSC Prelims · Full Mock #8",
    questions: 150,
    duration: 120,
    status: "completed",
    score: 104,
    maxScore: 200,
    weak: "Polity · Fundamental Rights",
  },
  {
    id: "m7",
    number: 7,
    title: "BPSC Prelims · Full Mock #7",
    questions: 150,
    duration: 120,
    status: "completed",
    score: 98,
    maxScore: 200,
    weak: "History · Modern India",
  },
  {
    id: "m6",
    number: 6,
    title: "BPSC Prelims · Full Mock #6",
    questions: 150,
    duration: 120,
    status: "completed",
    score: 91,
    maxScore: 200,
    weak: "Geography · Climate",
  },
];

const COMPLETED = MOCKS.filter((m) => m.status === "completed");
const UPCOMING = MOCKS.find((m) => m.status === "upcoming");
const BEST_SCORE = Math.max(...COMPLETED.map((m) => m.score ?? 0));
const AVG_SCORE = Math.round(COMPLETED.reduce((sum, m) => sum + (m.score ?? 0), 0) / COMPLETED.length);

export function MockTestPage() {
  const navigate = useNavigate();

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
        <StatTile icon={<QuizRoundedIcon />} label="Mocks taken" value={`${COMPLETED.length}`} tone="primary" />
        <StatTile icon={<EmojiEventsRoundedIcon />} label="Best score" value={`${BEST_SCORE}/200`} tone="warning" />
        <StatTile icon={<TrendingUpRoundedIcon />} label="Avg score" value={`${AVG_SCORE}/200`} tone="success" />
        <StatTile icon={<CalendarMonthRoundedIcon />} label="Next mock" value="Sun" tone="secondary" />
      </Box>

      {/* Hero + insight */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
          gap: 1.5,
          mb: 1.75,
          alignItems: "stretch",
        }}
      >
        {UPCOMING && (
          <SectionCard
            pad="sm"
            sx={{
              position: "relative",
              overflow: "hidden",
              borderColor: "primary.main",
              bgcolor: (t) =>
                t.palette.mode === "dark" ? `${t.palette.primary.main}18` : `${t.palette.primary.main}08`,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: 4,
                bgcolor: "primary.main",
              }}
            />
            <Stack spacing={1.25} sx={{ pl: 0.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Up next" size="small" color="primary" sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700 }} />
                <Typography variant="caption" color="text.secondary">
                  Scheduled · {UPCOMING.date}
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
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    color: "#fff",
                    background: (t) =>
                      `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                  }}
                >
                  #{UPCOMING.number}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                    {UPCOMING.title}
                  </Typography>
                  <Stack direction="row" spacing={1.25} sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
                    <MetaPill icon={<QuizRoundedIcon />} text={`${UPCOMING.questions} Qs`} />
                    <MetaPill icon={<AccessTimeRoundedIcon />} text={`${UPCOMING.duration} min`} />
                  </Stack>
                </Box>
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45, maxWidth: "48ch" }}>
                Full-length mock feeds your root cause profile — topic, subtopic, and error patterns update your
                dashboard plan after submit.
              </Typography>

              <Button
                variant="contained"
                size="small"
                startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 18 }} />}
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate("/practice")}
                sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, fontSize: "0.8rem", mt: 0.25 }}
              >
                Start Mock #{UPCOMING.number}
              </Button>
            </Stack>
          </SectionCard>
        )}

        <SectionCard pad="sm">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                color: "warning.main",
                bgcolor: (t) => `${t.palette.warning.main}14`,
                "& svg": { fontSize: 17 },
              }}
            >
              <AnalyticsRoundedIcon />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Mock pulse
            </Typography>
          </Stack>

          <Stack spacing={1.1}>
            <PulseRow label="Score trend" value="+6 pts" hint="vs last mock" positive />
            <PulseRow label="Top weak area" value="Polity" hint="Fundamental Rights" />
            <PulseRow label="Accuracy" value="52%" hint="Mock #8" />

            <Box sx={{ pt: 0.5 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.35 }}>
                <Typography variant="caption" color="text.secondary">
                  Readiness for next mock
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  68%
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={68} color="primary" sx={{ height: 5, borderRadius: 999 }} />
            </Box>

            <Button
              size="small"
              variant="outlined"
              fullWidth
              onClick={() => navigate("/analysis")}
              sx={{ fontSize: "0.76rem", mt: 0.25 }}
            >
              Open full analysis
            </Button>
          </Stack>
        </SectionCard>
      </Box>

      {/* History */}
      <SectionCard pad="sm">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.25 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Mock history
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {COMPLETED.length} completed
          </Typography>
        </Stack>

        <Stack divider={<Box sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }} />}>
          {COMPLETED.map((mock) => (
            <MockHistoryRow key={mock.id} mock={mock} onAnalysis={() => navigate("/analysis")} />
          ))}
        </Stack>
      </SectionCard>
    </PageContainer>
  );
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

function MockHistoryRow({ mock, onAnalysis }: { mock: MockItem; onAnalysis: () => void }) {
  const pct = mock.score && mock.maxScore ? Math.round((mock.score / mock.maxScore) * 100) : 0;
  const scoreTone = pct >= 55 ? "success" : pct >= 45 ? "warning" : "error";

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.25}
      alignItems={{ sm: "center" }}
      justifyContent="space-between"
      sx={{ py: 1.1 }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: "0.78rem",
            bgcolor: (t) => t.palette.surface.subtle,
            border: (t) => `1px solid ${t.palette.divider}`,
            color: "text.secondary",
          }}
        >
          #{mock.number}
        </Box>

        <ScoreRing score={mock.score ?? 0} max={mock.maxScore ?? 200} tone={scoreTone} />

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
            {mock.title}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.35, flexWrap: "wrap", gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
              {mock.questions} Qs · {mock.duration} min
            </Typography>
            {mock.weak && (
              <Chip
                label={mock.weak}
                size="small"
                variant="outlined"
                color="warning"
                sx={{ height: 20, fontSize: "0.62rem", fontWeight: 600, maxWidth: 200 }}
              />
            )}
          </Stack>
        </Box>
      </Stack>

      <Button
        size="small"
        variant="outlined"
        onClick={onAnalysis}
        sx={{ flexShrink: 0, fontSize: "0.74rem", alignSelf: { xs: "flex-start", sm: "center" } }}
      >
        View analysis
      </Button>
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
          {score}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ fontSize: "0.58rem", color: "text.secondary", mt: 0.15 }}>
        {pct}%
      </Typography>
    </Stack>
  );
}
