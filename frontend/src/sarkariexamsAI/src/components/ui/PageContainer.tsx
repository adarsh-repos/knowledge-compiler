import { Box } from "@mui/material";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  /** Max content width in px. Defaults to a comfortable dashboard width. */
  maxWidth?: number;
  /** Tighter padding for dense dashboards. */
  compact?: boolean;
}

/**
 * Wraps a routed page's content: applies generous web padding, caps the line
 * length on ultra-wide monitors, and runs a subtle fade/slide on mount so screen
 * changes feel smooth.
 */
export function PageContainer({ children, maxWidth = 1240, compact }: PageContainerProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
      sx={{
        px: { xs: 1.5, sm: 2, md: compact ? 3 : 4 },
        py: { xs: compact ? 1.5 : 2, md: compact ? 2 : 4 },
      }}
    >
      <Box sx={{ maxWidth, mx: "auto", width: "100%" }}>{children}</Box>
    </Box>
  );
}
