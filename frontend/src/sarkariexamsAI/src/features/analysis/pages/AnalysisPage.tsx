import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { PageContainer } from "@/components/ui/PageContainer";
import { loadDashboard } from "@/features/dashboard/state/dashboardSlice";
import { loadAnalysis } from "../state/analysisSlice";
import { SubjectTrackingCard } from "@/features/dashboard/components/SubjectTrackingCard";
import { MockHistoryCard } from "@/features/dashboard/components/MockHistoryCard";
import { RootCauseCard } from "@/features/dashboard/components/RootCauseCard";

export function AnalysisPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { result, status: analysisStatus } = useAppSelector((s) => s.analysis);
  const { data: dashboard, status: dashStatus } = useAppSelector((s) => s.dashboard);

  useEffect(() => {
    if (analysisStatus === "idle") dispatch(loadAnalysis());
    if (dashStatus === "idle") dispatch(loadDashboard());
  }, [dispatch, analysisStatus, dashStatus]);

  const loading = analysisStatus !== "ready" || dashStatus !== "ready" || !dashboard;

  if (loading) {
    return (
      <PageContainer maxWidth={1200}>
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mt: 2 }}>
          <Skeleton variant="rounded" height={360} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={360} sx={{ borderRadius: 3 }} />
        </Box>
      </PageContainer>
    );
  }

  const { subjects, recentMocks, upcomingMock, rootCause } = dashboard;

  return (
    <PageContainer maxWidth={1200}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: "58ch", lineHeight: 1.7 }}>
        Analytics from your mocks and practice. Subject mastery, pattern breakdown, and mock
        trends — use this to understand where you stand beyond today&apos;s plan.
      </Typography>

      {/* Subject tracking — primary analytics */}
      <Box sx={{ mb: 3 }}>
        <SubjectTrackingCard subjects={subjects} />
      </Box>

      {/* Root cause + mock history */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.05fr 0.95fr" },
          gap: 2.5,
          mb: 3,
        }}
      >
        <RootCauseCard rootCause={rootCause} />
        <MockHistoryCard mocks={recentMocks} upcoming={upcomingMock} />
      </Box>

      {/* Topic mastery from last practice */}
      {result && (
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Latest practice insight
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {result.topicLabel} · {result.masteryPercent}% mastery
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {result.strongAreas.map((a) => (
              <Typography key={a} variant="caption" sx={{ fontWeight: 600, color: "success.main" }}>
                ✓ {a}
              </Typography>
            ))}
            {result.needsWork.map((a) => (
              <Typography key={a} variant="caption" sx={{ fontWeight: 600, color: "warning.main" }}>
                ⚠ {a}
              </Typography>
            ))}
          </Stack>
          <Button
            variant="outlined"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => navigate("/chapter-test")}
          >
            Practice weak chapter
          </Button>
        </Box>
      )}
    </PageContainer>
  );
}
