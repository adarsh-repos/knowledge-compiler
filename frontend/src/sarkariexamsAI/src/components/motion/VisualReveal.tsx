import { useRef, type ReactNode } from "react";
import { Box, type BoxProps } from "@mui/material";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

interface VisualRevealProps extends BoxProps {
  children: ReactNode;
  /** Subtle parallax on scroll (desktop visual panels) */
  parallax?: boolean;
  /** Slide direction on enter */
  direction?: "up" | "left" | "right";
  delay?: number;
  /** Glow accent behind mockup containers */
  glow?: string;
}

/**
 * Scroll-triggered reveal for visual/mockup containers.
 * Adds parallax depth + soft glow — Linear / Stripe style.
 */
export function VisualReveal({
  children,
  parallax = true,
  direction = "up",
  delay = 0,
  glow,
  sx,
  ...rest
}: VisualRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], parallax && !reduced ? [32, -24] : [0, 0]);
  const y = useSpring(rawY, { stiffness: 90, damping: 22, mass: 0.4 });

  const offsetX = direction === "left" ? -36 : direction === "right" ? 36 : 0;
  const offsetY = direction === "up" ? 40 : 0;

  return (
    <Box ref={ref} sx={{ position: "relative", ...sx }} {...rest}>
      {glow && !reduced && (
        <Box
          aria-hidden
          component={motion.div}
          style={{ y }}
          sx={{
            position: "absolute",
            inset: "-8%",
            borderRadius: 4,
            background: `radial-gradient(ellipse at 50% 40%, ${glow}22 0%, transparent 68%)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      <Box
        component={motion.div}
        style={parallax && !reduced ? { y } : undefined}
        initial={reduced ? false : { opacity: 0, x: offsetX, y: offsetY, scale: 0.96 }}
        whileInView={reduced ? undefined : { opacity: 1, x: 0, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px", amount: 0.25 }}
        transition={{ duration: 0.75, delay, ease: EASE }}
        sx={{ position: "relative", zIndex: 1 }}
      >
        {children}
      </Box>
    </Box>
  );
}
