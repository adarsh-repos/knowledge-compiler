import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

interface CircularMasteryProps {
  value: number; // 0-100
  size?: number;
  label?: string;
}

/** Large circular percentage indicator with a thin track. */
export function CircularMastery({
  value,
  size = 180,
  label,
}: CircularMasteryProps) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(value, 0), 100) / 100) * c;

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box
        component="svg"
        width={size}
        height={size}
        sx={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="currentColor"
          opacity={0.12}
        />
        <Box
          component={motion.circle}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeLinecap="round"
          strokeWidth={stroke}
          sx={{ color: "success.main", stroke: "currentColor" }}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </Box>
      <Box sx={{ position: "absolute", textAlign: "center" }}>
        <Typography
          variant="h2"
          sx={{ color: "success.main", fontWeight: 700, fontSize: "2.6rem" }}
        >
          {Math.round(value)}%
        </Typography>
        {label && (
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
