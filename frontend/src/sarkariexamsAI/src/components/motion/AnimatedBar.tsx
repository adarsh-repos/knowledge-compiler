import { Box } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface AnimatedBarProps {
  value: number;
  color: string;
  height?: number;
  delay?: number;
}

/** Progress bar that fills on scroll-into-view — dashboard preview polish. */
export function AnimatedBar({ value, color, height = 5, delay = 0 }: AnimatedBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = usePrefersReducedMotion();

  return (
    <Box
      ref={ref}
      sx={{
        height,
        borderRadius: 2,
        bgcolor: `${color}18`,
        overflow: "hidden",
      }}
    >
      <Box
        component={motion.div}
        initial={{ width: reduced ? `${value}%` : "0%" }}
        animate={{ width: inView || reduced ? `${value}%` : "0%" }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        sx={{
          height: "100%",
          borderRadius: 2,
          bgcolor: color,
        }}
      />
    </Box>
  );
}
