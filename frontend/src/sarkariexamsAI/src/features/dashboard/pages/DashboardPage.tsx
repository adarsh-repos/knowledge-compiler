import { useEffect } from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { PageContainer } from "@/components/ui/PageContainer";
import { loadProfile } from "@/features/profile/state/profileSlice";
import { loadDashboard, toggleEvent } from "../state/dashboardSlice";
import { QuickActionsRow } from "../components/QuickActionsRow";
import { DashboardStatsRow } from "../components/DashboardStatsRow";
import { TodayWorkCard } from "../components/TodayWorkCard";
import { InsightsPanel } from "../components/InsightsPanel";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector((s) => s.dashboard);
  const profile = useAppSelector((s) => s.profile.profile);
  const phone = useAppSelector((s) => s.auth.phone);

  useEffect(() => {
    dispatch(loadDashboard());
    dispatch(loadProfile());
  }, [dispatch]);

  const loading = status !== "ready" || !data;

  if (loading) {
    return (
      <PageContainer maxWidth={1280} compact>
        <Skeleton variant="rounded" height={36} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2, mt: 1.5 }} />
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2, mt: 1.5 }} />
      </PageContainer>
    );
  }

  const { todayEvents, revisionQueue, aiRecommendations, metrics, todayCurrentAffair } = data;
  const displayName = profile?.name ?? (phone ? `+91 ${phone}` : "Aspirant");

  return (
    <PageContainer maxWidth={1280} compact>
      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: { xs: "1rem", sm: "1.05rem" } }}
        >
          {greeting()}, {displayName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {profile?.targetExam ?? "BPSC"} {profile?.targetYear ?? 2027}
        </Typography>
      </Box>

      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <DashboardStatsRow metrics={metrics} />
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <QuickActionsRow />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.8fr" },
          gap: { xs: 1.25, lg: 1.5 },
          alignItems: "start",
        }}
      >
        <TodayWorkCard
          events={todayEvents}
          revisionItems={revisionQueue}
          onToggleEvent={(id) => dispatch(toggleEvent(id))}
        />

        <InsightsPanel
          currentAffair={todayCurrentAffair}
          recommendations={aiRecommendations}
        />
      </Box>
    </PageContainer>
  );
}
