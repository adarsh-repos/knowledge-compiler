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
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionCard } from "@/components/ui/SectionCard";

interface ArticleItem {
  id: string;
  title: string;
  topic: string;
  date: string;
  readMin: number;
  isLatest?: boolean;
  takeaways?: string[];
}

const FEATURED: ArticleItem = {
  id: "2",
  title: "Supreme Court on Article 370 — Key Takeaways for BPSC",
  topic: "Polity",
  date: "Today",
  readMin: 6,
  isLatest: true,
  takeaways: [
    "SC upheld abrogation process; focused on constitutional procedure, not merits of integration.",
    "President's rule + Parliament's role under Art. 370(3) — expect fact-based MCQs on timeline.",
    "Link to federalism: compare with other special-status states for linkage questions.",
  ],
};

const ARTICLES: ArticleItem[] = [
  {
    id: "1",
    title: "BPSC 70th Notification — Key Highlights",
    topic: "Exam updates",
    date: "Today",
    readMin: 8,
  },
  FEATURED,
  {
    id: "3",
    title: "India–EU Trade Deal: Economic Impact",
    topic: "Economy",
    date: "Yesterday",
    readMin: 7,
  },
  {
    id: "4",
    title: "Monsoon 2026 Forecast & Agriculture",
    topic: "Geography",
    date: "Yesterday",
    readMin: 5,
  },
];

const ARCHIVE = ARTICLES.filter((a) => !a.isLatest);
const QUIZ = { questions: 15, minutes: 12, label: "Today's CA quiz" };

export function CurrentAffairsPage() {
  const navigate = useNavigate();
  const [topicFilter, setTopicFilter] = useState<string | null>(null);

  const topics = useMemo(() => [...new Set(ARTICLES.map((a) => a.topic))], []);
  const filteredArchive = topicFilter ? ARCHIVE.filter((a) => a.topic === topicFilter) : ARCHIVE;

  return (
    <PageContainer maxWidth={1100} compact>
      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          gap: 1,
          mb: 1.75,
        }}
      >
        <StatTile icon={<NewspaperRoundedIcon />} label="Read this week" value="12" tone="primary" />
        <StatTile icon={<QuizRoundedIcon />} label="CA quizzes done" value="8" tone="secondary" />
        <StatTile icon={<TrendingUpRoundedIcon />} label="Avg accuracy" value="74%" tone="success" />
        <StatTile icon={<EmojiEventsRoundedIcon />} label="Streak" value="5 days" tone="warning" />
      </Box>

      {/* Featured article + pulse */}
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
            borderColor: "secondary.main",
            bgcolor: (t) =>
              t.palette.mode === "dark" ? `${t.palette.secondary.main}18` : `${t.palette.secondary.main}08`,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 4,
              bgcolor: "secondary.main",
            }}
          />
          <Stack spacing={1.25} sx={{ pl: 0.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={0.75} alignItems="center">
                <NewspaperRoundedIcon sx={{ fontSize: 16, color: "secondary.main" }} />
                <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 700, letterSpacing: "0.06em" }}>
                  TODAY&apos;S ARTICLE
                </Typography>
              </Stack>
              <Chip label="Latest" size="small" color="secondary" sx={{ height: 20, fontSize: "0.62rem", fontWeight: 700 }} />
            </Stack>

            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexWrap: "wrap", gap: 0.5 }}>
              <Chip label={FEATURED.topic} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.62rem", fontWeight: 600 }} />
              <MetaPill icon={<AccessTimeRoundedIcon />} text={`${FEATURED.readMin} min read`} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
                {FEATURED.date}
              </Typography>
            </Stack>

            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
              {FEATURED.title}
            </Typography>

            <Box>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.65 }}>
                <TipsAndUpdatesRoundedIcon sx={{ fontSize: 15, color: "warning.main" }} />
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>
                  Takeaway points
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                {(FEATURED.takeaways ?? []).map((point) => (
                  <TakeawayBullet key={point} text={point} />
                ))}
              </Stack>
            </Box>

            <Button
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, fontSize: "0.76rem" }}
            >
              Read full article
            </Button>
          </Stack>
        </SectionCard>

        <Stack spacing={1.5}>
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
                CA pulse
              </Typography>
            </Stack>

            <Stack spacing={1.1}>
              <PulseRow label="This week" value="4 articles" hint="2 pending read" />
              <PulseRow label="Quiz accuracy" value="74%" hint="last set: 11/15" positive />
              <PulseRow label="Exam relevance" value="High" hint="Polity + Economy" />

              <Box sx={{ pt: 0.5 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.35 }}>
                  <Typography variant="caption" color="text.secondary">
                    Weekly CA coverage
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    68%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={68} color="secondary" sx={{ height: 5, borderRadius: 999 }} />
              </Box>
            </Stack>
          </SectionCard>

          <SectionCard
            pad="sm"
            sx={{
              border: (t) => `1px dashed ${t.palette.primary.main}55`,
              bgcolor: (t) => `${t.palette.primary.main}06`,
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
              <QuizRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.3 }}>
                  {QUIZ.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
                  {QUIZ.questions} MCQs from this week&apos;s editorials · ~{QUIZ.minutes} min
                </Typography>
              </Box>
            </Stack>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate("/practice")}
              sx={{ fontSize: "0.76rem" }}
            >
              Start CA quiz
            </Button>
          </SectionCard>
        </Stack>
      </Box>

      {/* Archive */}
      <Stack direction="row" spacing={0.75} sx={{ mb: 1.25, flexWrap: "wrap", gap: 0.75 }}>
        <Chip
          label="All topics"
          onClick={() => setTopicFilter(null)}
          color={topicFilter === null ? "primary" : "default"}
          variant={topicFilter === null ? "filled" : "outlined"}
          sx={{ height: 28, fontSize: "0.76rem", fontWeight: 700 }}
        />
        {topics.map((topic) => (
          <Chip
            key={topic}
            label={topic}
            onClick={() => setTopicFilter(topic)}
            color={topicFilter === topic ? "primary" : "default"}
            variant={topicFilter === topic ? "filled" : "outlined"}
            sx={{ height: 28, fontSize: "0.76rem", fontWeight: 700 }}
          />
        ))}
      </Stack>

      <SectionCard pad="sm">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Article archive
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {filteredArchive.length} articles
          </Typography>
        </Stack>

        <Stack divider={<Box sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }} />}>
          {filteredArchive.map((article) => (
            <ArticleRow key={article.id} article={article} />
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

function TakeawayBullet({ text }: { text: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="flex-start">
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: "warning.main",
          flexShrink: 0,
          mt: 0.55,
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45, fontSize: "0.72rem" }}>
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

function ArticleRow({ article }: { article: ArticleItem }) {
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
            width: 32,
            height: 32,
            borderRadius: 1.5,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: (t) => `${t.palette.secondary.main}12`,
            color: "secondary.main",
            "& svg": { fontSize: 16 },
          }}
        >
          <NewspaperRoundedIcon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25, flexWrap: "wrap", gap: 0.5 }}>
            <Chip label={article.topic} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.62rem", fontWeight: 600 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
              {article.date} · {article.readMin} min
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {article.title}
          </Typography>
        </Box>
      </Stack>
      <Button
        size="small"
        variant="outlined"
        sx={{ flexShrink: 0, fontSize: "0.74rem", alignSelf: { xs: "flex-start", sm: "center" } }}
      >
        Read
      </Button>
    </Stack>
  );
}
