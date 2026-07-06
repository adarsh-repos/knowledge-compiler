import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import type { ReactNode } from "react";

export interface TaskRowProps {
  title: string;
  subtitle?: string;
  completed: boolean;
  actionLabel?: string;
  onAction?: () => void;
  onToggle?: () => void;
  /** Colored dot when no checkbox toggle */
  statusColor?: string;
  meta?: ReactNode;
}

/** Shared task row — plan, revision, and insight actions use the same shell. */
export function TaskRow({
  title,
  subtitle,
  completed,
  actionLabel = "Shuru",
  onAction,
  onToggle,
  statusColor,
  meta,
}: TaskRowProps) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 1.5,
        border: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: completed ? (t) => `${t.palette.success.main}05` : "background.paper",
        opacity: completed ? 0.82 : 1,
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="flex-start">
        <StatusIndicator
          completed={completed}
          onToggle={onToggle}
          statusColor={statusColor}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.8rem",
              lineHeight: 1.4,
              display: "block",
              textDecoration: completed ? "line-through" : "none",
              color: completed ? "text.secondary" : "text.primary",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              color="text.secondary"
              sx={{
                fontSize: "0.72rem",
                lineHeight: 1.4,
                display: "block",
                mt: 0.25,
                textDecoration: completed ? "line-through" : "none",
              }}
            >
              {subtitle}
            </Typography>
          )}
          {meta && (
            <Box sx={{ mt: 0.5, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.35 }}>
              {meta}
            </Box>
          )}
        </Box>

        {!completed && onAction && (
          <Button
            size="small"
            variant="contained"
            onClick={onAction}
            sx={{
              flexShrink: 0,
              minWidth: 0,
              px: 1.25,
              py: 0.35,
              fontSize: "0.72rem",
              fontWeight: 700,
              borderRadius: 1.5,
              boxShadow: "none",
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

function StatusIndicator({
  completed,
  onToggle,
  statusColor,
}: {
  completed: boolean;
  onToggle?: () => void;
  statusColor?: string;
}) {
  if (onToggle) {
    return (
      <Box
        component="button"
        type="button"
        onClick={onToggle}
        sx={{
          border: "none",
          bgcolor: "transparent",
          cursor: "pointer",
          p: 0,
          mt: 0.1,
          color: completed ? "success.main" : "text.disabled",
          display: "flex",
          lineHeight: 0,
          flexShrink: 0,
        }}
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
      >
        {completed ? (
          <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
        ) : (
          <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 18 }} />
        )}
      </Box>
    );
  }

  if (completed) {
    return <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "success.main", mt: 0.1, flexShrink: 0 }} />;
  }

  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: statusColor ?? "text.disabled",
        flexShrink: 0,
        mt: 0.55,
      }}
    />
  );
}

export function TaskMetaTime({ minutes }: { minutes: number }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
      {minutes}m
    </Typography>
  );
}

export function TaskMetaChip({ label, color }: { label: string; color: string }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 20,
        fontSize: "0.65rem",
        fontWeight: 700,
        bgcolor: `${color}14`,
        color,
        "& .MuiChip-label": { px: 0.75 },
      }}
    />
  );
}
