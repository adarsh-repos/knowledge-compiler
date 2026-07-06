import { Paper, type PaperProps } from "@mui/material";
import { forwardRef } from "react";
import { cardShadow } from "@/theme/theme";
import { palette } from "@/theme/tokens";

interface SectionCardProps extends PaperProps {
  /** Highlights the card as a "recommended action" with a subtle accent ring. */
  glow?: boolean;
  /** Inner padding scale. Defaults to comfortable. */
  pad?: "sm" | "md" | "lg";
  /** Drop the soft elevation shadow (flat card). */
  flat?: boolean;
}

const padMap = { sm: 2, md: 2.5, lg: 3.5 } as const;

/** The core container — a single clean card with a soft hairline + gentle shadow. */
export const SectionCard = forwardRef<HTMLDivElement, SectionCardProps>(
  ({ glow, flat, pad = "md", sx, children, ...rest }, ref) => (
    <Paper
      ref={ref}
      sx={{
        p: padMap[pad],
        position: "relative",
        boxShadow: flat ? "none" : cardShadow,
        ...(glow && {
          borderColor: "primary.main",
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? `${t.palette.primary.main}14`
              : palette.orange[50],
          boxShadow: (t) => `0 0 0 1px ${t.palette.primary.main}, ${cardShadow(t)}`,
        }),
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Paper>
  ),
);

SectionCard.displayName = "SectionCard";
