import { Box, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

interface PillProps {
  children: ReactNode;
  /** Accent color key. Defaults to the violet brand accent. */
  tone?: "violet" | "emerald" | "amber" | "neutral";
  sx?: SxProps<Theme>;
}

const toneColor: Record<NonNullable<PillProps["tone"]>, string> = {
  violet: "primary.light",
  emerald: "success.light",
  amber: "warning.light",
  neutral: "text.secondary",
};

/** Small uppercase, letter-spaced label used for section eyebrows. */
export function Pill({ children, tone = "violet", sx }: PillProps) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        typography: "overline",
        color: toneColor[tone],
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
