import { useRef, type ReactNode, type MouseEvent } from "react";
import { Box, type BoxProps } from "@mui/material";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface TiltVisualProps extends BoxProps {
  children: ReactNode;
  /** Max tilt in degrees */
  maxTilt?: number;
}

/**
 * Subtle 3D tilt on pointer move — product mockup polish (desktop).
 */
export function TiltVisual({ children, maxTilt = 5, sx, ...rest }: TiltVisualProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 180,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 180,
    damping: 22,
  });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  if (reduced) {
    return (
      <Box sx={sx} {...rest}>
        {children}
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      sx={{ perspective: 1200, ...sx }}
      {...rest}
    >
      <Box
        component={motion.div}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </Box>
    </Box>
  );
}
