import { Box, Button, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { GRAPH, SUBJECTS } from "@/features/learn/data/courseGraph";

export function CoursesPage() {
  const navigate = useNavigate();

  const totalChapters = SUBJECTS.reduce((sum, s) => sum + (GRAPH[s.id]?.length ?? 0), 0);
  const totalDone = SUBJECTS.reduce((sum, s) => {
    const chapters = GRAPH[s.id] ?? [];
    return sum + chapters.filter((ch) => ch.concepts.every((c) => c.status === "mastered")).length;
  }, 0);

  return (
    <PageContainer maxWidth={1100} compact>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
          gap: 1,
          mb: 1.75,
        }}
      >
        <StatTile label="Subjects" value={`${SUBJECTS.length}`} />
        <StatTile label="Chapters read" value={`${totalDone}/${totalChapters}`} />
        <StatTile label="Continue" value="Polity Ch.1" highlight />
      </Box>

      <SectionCard pad="sm" sx={{ mb: 1.75, borderColor: "primary.main", bgcolor: (t) => `${t.palette.primary.main}06` }}>
        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, letterSpacing: "0.06em", display: "block", mb: 0.75 }}>
          HOW IT WORKS
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1 }}>
          <Step n={1} title="Pick a subject" detail="Choose Polity, History, or another track below." />
          <Step n={2} title="Read the chapter" detail="Step-by-step NCERT reading with key takeaways." />
          <Step n={3} title="Practice & mark done" detail="Attempt PYQs, then mark the chapter complete." />
        </Box>
      </SectionCard>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.8fr" }, gap: 1.5, alignItems: "start" }}>
        <SectionCard pad="sm">
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.25 }}>
            Choose a subject
          </Typography>
          <Stack spacing={1} divider={<Box sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }} />}>
            {SUBJECTS.map((subject) => {
              const chapters = GRAPH[subject.id] ?? [];
              const done = chapters.filter((ch) => ch.concepts.every((c) => c.status === "mastered")).length;
              const pct = chapters.length ? Math.round((done / chapters.length) * 100) : 0;
              return (
                <Stack
                  key={subject.id}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                  sx={{ py: 1.1 }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {subject.name}
                      </Typography>
                      <Chip
                        label={`${done}/${chapters.length} ch`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.62rem", fontWeight: 600 }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.68rem" }}>
                      {subject.ncertBook} · {subject.classLabel}
                    </Typography>
                    <LinearProgress variant="determinate" value={pct} color={subject.tone} sx={{ mt: 0.75, height: 4, borderRadius: 999 }} />
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => navigate(`/learn?subject=${subject.id}`)}
                    sx={{ flexShrink: 0, fontSize: "0.74rem" }}
                  >
                    View chapters
                  </Button>
                </Stack>
              );
            })}
          </Stack>
        </SectionCard>

        <Stack spacing={1.5}>
          <SectionCard pad="sm" glow>
            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, letterSpacing: "0.06em", display: "block", mb: 0.75 }}>
              CONTINUE READING
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.35 }}>
              Making of the Constitution
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontSize: "0.72rem" }}>
              Polity · Ch. 01 · NCERT pp. 19–28 · ~15 min left
            </Typography>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate("/learn?subject=polity&topic=making")}
              sx={{ fontSize: "0.76rem" }}
            >
              Resume reading
            </Button>
          </SectionCard>

          <SectionCard pad="sm">
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
              Reading tips
            </Typography>
            <Stack spacing={0.75}>
              <Tip text="One chapter at a time — finish reading before jumping to PYQs." />
              <Tip text="Use takeaway boxes at the end of each section for revision." />
              <Tip text="Mark complete only after you can explain the topic in 5 lines." />
            </Stack>
          </SectionCard>
        </Stack>
      </Box>
    </PageContainer>
  );
}

function StatTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 2,
        bgcolor: highlight ? (t) => `${t.palette.primary.main}08` : "background.paper",
        border: (t) => `1px solid ${highlight ? t.palette.primary.main : t.palette.divider}`,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", display: "block", mb: 0.35 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800, color: highlight ? "primary.main" : "text.primary" }}>
        {value}
      </Typography>
    </Box>
  );
}

function Step({ n, title, detail }: { n: number; title: string; detail: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.main",
          color: "#fff",
          fontSize: "0.68rem",
          fontWeight: 800,
        }}
      >
        {n}
      </Box>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 700, display: "block", lineHeight: 1.3 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", lineHeight: 1.4 }}>
          {detail}
        </Typography>
      </Box>
    </Stack>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="flex-start">
      <CheckCircleRoundedIcon sx={{ fontSize: 14, color: "success.main", mt: 0.15, flexShrink: 0 }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", lineHeight: 1.4 }}>
        {text}
      </Typography>
    </Stack>
  );
}
