import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import { useNavigate } from "react-router-dom";
import type { MockSummary, UpcomingMock } from "@/data/types";
import { SectionCard } from "@/components/ui/SectionCard";

interface MockHistoryCardProps {
  mocks: MockSummary[];
  upcoming: UpcomingMock;
}

export function MockHistoryCard({ mocks, upcoming }: MockHistoryCardProps) {
  const navigate = useNavigate();

  return (
    <SectionCard pad="lg" sx={{ height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Mock tracking
        </Typography>
        <QuizRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
      </Stack>

      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          mb: 2,
          border: (t) => `1px dashed ${t.palette.primary.main}50`,
          bgcolor: (t) => `${t.palette.primary.main}06`,
        }}
      >
        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
          UPCOMING
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>
          {upcoming.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {upcoming.date} · {upcoming.questions} Qs · {upcoming.durationMinutes} min
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: "block" }}>
        RECENT MOCKS → ROOT CAUSE LINKED
      </Typography>
      <Stack spacing={1}>
        {mocks.map((mock) => (
          <Box
            key={mock.id}
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 1.5,
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {mock.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Weak: {mock.weakSubject} · {mock.weakChapter}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.main" }}>
                  {mock.score}/{mock.maxScore}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {mock.date}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>

      <Button
        fullWidth
        variant="outlined"
        endIcon={<ArrowForwardRoundedIcon />}
        onClick={() => navigate("/practice")}
        sx={{ mt: 2 }}
      >
        Take Next Mock
      </Button>
    </SectionCard>
  );
}
