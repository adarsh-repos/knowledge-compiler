import { Box, type BoxProps } from "@mui/material";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

interface ScrollRevealProps extends BoxProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  /** Slight horizontal slide for alternating layouts */
  direction?: "up" | "left" | "right";
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  ...rest
}: ScrollRevealProps) {
  const offset = direction === "left" ? -24 : direction === "right" ? 24 : 28;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: direction === "up" ? offset : 0, x: direction !== "up" ? offset : 0 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-10% 0px -8% 0px", amount: 0.2 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Box>
  );
}

export function StaggerReveal({
  children,
  stagger = 0.08,
}: {
  children: ReactNode;
  stagger?: number;
}) {
  return (
    <Box
      component={motion.div}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-8% 0px", amount: 0.15 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </Box>
  );
}

export function StaggerItem({ children }: { children: ReactNode }) {
  return (
    <Box component={motion.div} variants={fadeUp} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </Box>
  );
}

/** Shared vertical rhythm for landing sections */
export const landingSectionSx = {
  py: { xs: 7, md: 10 },
} as const;
