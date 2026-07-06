import { Box, LinearProgress, Typography } from "@mui/material";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import type { DashboardMetrics } from "@/data/types";

interface DashboardStatsRowProps {
  metrics: DashboardMetrics;
}

/** Mobile stat strip — horizontal scroll pills + today progress. */
export function DashboardStatsRow({ metrics }: DashboardStatsRowProps) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box
        sx={{
          display: "flex",
          gap: 0.75,
          overflowX: "auto",
          pb: 0.5,
          mb: 1,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          WebkitOverflowScrolling: "touch",
        }}
      >
        <StatPill
          icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 14 }} />}
          label={`${metrics.streakDays}d streak`}
          tone="warning"
        />
        <StatPill
          icon={<TaskAltRoundedIcon sx={{ fontSize: 14 }} />}
          label={`${metrics.questionsSolvedToday}/${metrics.questionsTargetToday} Qs`}
          tone="primary"
        />
        <StatPill label={`${metrics.todayProgressPercent}% today`} tone="secondary" />
      </Box>
      <LinearProgress
        variant="determinate"
        value={metrics.todayProgressPercent}
        sx={{ height: 4, borderRadius: 2 }}
      />
    </Box>
  );
}

function StatPill({
  icon,
  label,
  tone,
}: {
  icon?: React.ReactNode;
  label: string;
  tone: "primary" | "secondary" | "warning";
}) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 1.5,
        border: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: "background.paper",
        flexShrink: 0,
      }}
    >
      {icon && (
        <Box sx={{ color: `${tone}.main`, display: "flex", lineHeight: 0 }}>{icon}</Box>
      )}
      <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", whiteSpace: "nowrap" }}>
        {label}
      </Typography>
    </Box>
  );
}
