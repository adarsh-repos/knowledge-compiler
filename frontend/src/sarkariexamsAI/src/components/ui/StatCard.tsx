import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import { SectionCard } from "./SectionCard";

type Tone = "primary" | "success" | "warning" | "secondary" | "error";

interface StatCardProps {
  label: string;
  value: ReactNode;
  caption?: string;
  icon: ReactNode;
  tone?: Tone;
  trend?: { value: string; up: boolean };
}

/** Compact KPI tile used across the dashboard top row. */
export function StatCard({ label, value, caption, icon, tone = "primary", trend }: StatCardProps) {
  return (
    <SectionCard pad="md" sx={{ height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            color: `${tone}.main`,
            bgcolor: (t) => `${t.palette[tone].main}16`,
            "& svg": { fontSize: 22 },
          }}
        >
          {icon}
        </Box>
        {trend && (
          <Stack
            direction="row"
            spacing={0.25}
            alignItems="center"
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 1.5,
              color: trend.up ? "success.main" : "error.main",
              bgcolor: (t) => `${(trend.up ? t.palette.success : t.palette.error).main}14`,
              fontWeight: 700,
              fontSize: "0.72rem",
            }}
          >
            {trend.up ? (
              <ArrowUpwardRoundedIcon sx={{ fontSize: 13 }} />
            ) : (
              <ArrowDownwardRoundedIcon sx={{ fontSize: 13 }} />
            )}
            {trend.value}
          </Stack>
        )}
      </Stack>
      <Typography variant="h4" sx={{ mt: 2, fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
        {label}
      </Typography>
      {caption && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", opacity: 0.8 }}>
          {caption}
        </Typography>
      )}
    </SectionCard>
  );
}
