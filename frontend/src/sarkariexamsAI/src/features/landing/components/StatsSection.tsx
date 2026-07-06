import { useEffect, useRef, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { palette } from "@/theme/tokens";

const STATS = [
  { value: 12000, suffix: "+", label: "Active aspirants", color: palette.orange[600] },
  { value: 85000, suffix: "+", label: "MCQs practiced", color: palette.amber[600] },
  { value: 42, suffix: "", label: "NCERT chapters mapped", color: palette.emerald[600] },
  { value: 94, suffix: "%", label: "Feel more focused", color: palette.amber[600] },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <Typography
      ref={ref}
      component="span"
      variant="h3"
      sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}
    >
      {display.toLocaleString("en-IN")}
      {suffix}
    </Typography>
  );
}

export function StatsSection() {
  return (
    <Box sx={{ py: { xs: 8, md: 10 } }}>
      <Stack alignItems="center" sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.12em" }}
        >
          Built for serious aspirants
        </Typography>
        <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: "1.8rem", md: "2.4rem" } }}>
          Proven system,{" "}
          <Box component="span" sx={{ fontStyle: "italic", color: "primary.main" }}>
            personalised
          </Box>{" "}
          for you.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 3,
        }}
      >
        {STATS.map((stat, i) => (
          <Box
            key={stat.label}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            sx={{ textAlign: "center" }}
          >
            <Box sx={{ color: stat.color }}>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
