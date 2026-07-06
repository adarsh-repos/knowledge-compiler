import { useEffect } from "react";
import { Box, IconButton, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { loadDashboard } from "@/features/dashboard/state/dashboardSlice";
import { loadProfile } from "@/features/profile/state/profileSlice";
import { getNavMeta } from "./navConfig";

interface TopBarProps {
  onMenuClick: () => void;
}

type Tone = "primary" | "warning" | "secondary";

/** Sticky header for the content area: page title, dashboard metrics, actions. */
export function TopBar({ onMenuClick }: TopBarProps) {
  const { pathname } = useLocation();
  const meta = getNavMeta(pathname);
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector((s) => s.dashboard);
  const profile = useAppSelector((s) => s.profile.profile);
  const profileStatus = useAppSelector((s) => s.profile.status);
  const isDashboard = pathname === "/dashboard";

  useEffect(() => {
    if (status === "idle") dispatch(loadDashboard());
    if (profileStatus === "idle") dispatch(loadProfile());
  }, [dispatch, profileStatus, status]);

  const metrics = data?.metrics;
  const dailyTarget = `${Math.round((profile?.dailyCommitmentHours ?? 3) * 60)}m`;

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        px: { xs: 1.5, sm: 2, md: 4 },
        py: { xs: 1.25, md: 1.75 },
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(11,14,20,0.8)"
            : "rgba(246,247,249,0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
        <IconButton
          onClick={onMenuClick}
          sx={{
            display: { xs: "inline-flex", lg: "none" },
            color: "text.primary",
            ml: -0.5,
            p: 0.75,
          }}
          aria-label="Open menu"
        >
          <MenuRoundedIcon fontSize="small" />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h5"
            noWrap
            sx={{ lineHeight: 1.2, fontSize: { xs: "1.05rem", sm: "1.25rem", md: "1.5rem" } }}
          >
            {meta?.label ?? "Dashboard"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {meta?.subtitle ?? ""}
          </Typography>
        </Box>

        {isDashboard && metrics && (
          <Box
            aria-label="Study planner summary"
            sx={{
              display: { xs: "none", lg: "grid" },
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              width: { lg: 540, xl: 620 },
            }}
          >
            <HeaderMetric
              icon={<TaskAltRoundedIcon />}
              label="Daily Target"
              value={dailyTarget}
              progress={metrics.todayProgressPercent}
              tone="primary"
            />
            <HeaderMetric
              icon={<LocalFireDepartmentRoundedIcon />}
              label="Current Streak"
              value={`${metrics.streakDays} days`}
              progress={72}
              tone="warning"
            />
            <HeaderMetric
              icon={<EmojiEventsRoundedIcon />}
              label="Completion"
              value={`${metrics.overallMastery}%`}
              progress={metrics.overallMastery}
              tone="secondary"
            />
          </Box>
        )}

        <ModeToggle />

        <Tooltip title="Notifications">
          <IconButton
            sx={{ color: "text.secondary", p: { xs: 0.75, sm: 1 } }}
            aria-label="Notifications"
          >
            <Box sx={{ position: "relative", display: "grid", placeItems: "center" }}>
              <NotificationsNoneRoundedIcon />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "error.main",
                  border: (t) => `2px solid ${t.palette.background.default}`,
                }}
              />
            </Box>
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

function HeaderMetric({
  icon,
  label,
  value,
  progress,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  progress: number;
  tone: Tone;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: { lg: 1.25, xl: 1.75 },
        py: 0.65,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Stack direction="row" spacing={0.9} alignItems="center">
        <Box sx={{ color: `${tone}.main`, display: "grid", placeItems: "center", "& svg": { fontSize: { lg: 19, xl: 21 } } }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ lineHeight: 1.15 }}>
            {label}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 800, lineHeight: 1.1 }} noWrap>
            {value}
          </Typography>
        </Box>
      </Stack>
      <LinearProgress variant="determinate" value={progress} color={tone} sx={{ mt: 0.7, height: 4 }} />
    </Box>
  );
}
