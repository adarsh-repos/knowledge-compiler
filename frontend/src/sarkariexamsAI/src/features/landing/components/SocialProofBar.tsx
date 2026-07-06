import { Box, Stack, Typography } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { motion } from "framer-motion";
import { palette } from "@/theme/tokens";

const METRICS = [
  { value: "12,000+", label: "Aspirants" },
  { value: "4.8", label: "Rating", showStar: true },
  { value: "Free", label: "To start" },
];

export function SocialProofBar() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      sx={{
        py: { xs: 2, md: 2.5 },
        mb: { xs: 1, md: 2 },
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          textAlign: "center",
        }}
      >
        {METRICS.map((m) => (
          <Box key={m.label}>
            <Stack direction="row" spacing={0.4} justifyContent="center" alignItems="center">
              <Typography sx={{ fontWeight: 800, fontSize: { xs: "0.95rem", md: "1.1rem" }, letterSpacing: "-0.02em" }}>
                {m.value}
              </Typography>
              {m.showStar && (
                <StarRoundedIcon sx={{ fontSize: 16, color: palette.amber[500] }} />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.72rem" }}>
              {m.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
