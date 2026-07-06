import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import type { ExamBatch } from "@/constants/examDates";
import { useExamCountdown } from "@/hooks/useExamCountdown";
import { palette, radius } from "@/theme/tokens";

interface ExamCountdownBadgeProps {
  batch: ExamBatch;
}

export function ExamCountdownBadge({ batch }: ExamCountdownBadgeProps) {
  const { days, hours, minutes, seconds, isPast, urgencyLine } = useExamCountdown(batch);
  const urgent = days <= 30 && !isPast;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      sx={{ mb: 2 }}
    >
      <Box
        sx={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 0.75,
          maxWidth: "100%",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: { xs: 0.75, sm: 1 },
            px: { xs: 1.25, sm: 1.5 },
            py: { xs: 0.85, sm: 1 },
            borderRadius: `${radius.pill}px`,
            bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "#fff"),
            border: (t) =>
              `1px solid ${urgent ? palette.rose[400] : t.palette.divider}`,
            boxShadow: urgent
              ? `0 0 0 3px ${palette.rose[100]}, 0 4px 14px rgba(225,29,72,0.12)`
              : "0 2px 12px rgba(234,88,12,0.08), 0 1px 3px rgba(0,0,0,0.04)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background: urgent
                ? `linear-gradient(105deg, transparent 40%, ${palette.rose[50]} 50%, transparent 60%)`
                : `linear-gradient(105deg, transparent 40%, ${palette.orange[50]} 50%, transparent 60%)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 4s ease-in-out infinite",
              pointerEvents: "none",
              "@keyframes shimmer": {
                "0%": { backgroundPosition: "200% 0" },
                "100%": { backgroundPosition: "-200% 0" },
              },
            }}
          />

          <StackRow>
            <LiveDot urgent={urgent} />
            <Typography
              component="span"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "0.76rem", sm: "0.82rem" },
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              🎯 {batch}
            </Typography>
            <DividerDot />
            <Typography
              component="span"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "0.72rem", sm: "0.78rem" },
                color: "text.secondary",
                whiteSpace: "nowrap",
              }}
            >
              Prelims in
            </Typography>
          </StackRow>

          {isPast ? (
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.8rem",
                color: "primary.main",
                px: 0.5,
              }}
            >
              Exam season live — join next batch
            </Typography>
          ) : (
            <StackRow sx={{ pl: { xs: 0, sm: 0.25 } }}>
              <CountBlock value={days} label="days" highlight urgent={urgent} />
              <Colon />
              <CountBlock value={hours} label="hrs" urgent={urgent} />
              <Colon />
              <CountBlock value={minutes} label="min" urgent={urgent} />
              <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.5 }}>
                <Colon />
                <CountBlock value={seconds} label="sec" urgent={urgent} compact />
              </Box>
            </StackRow>
          )}

          <StackRow>
            <DividerDot />
            <Typography
              component="span"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "0.7rem", sm: "0.76rem" },
                color: urgent ? palette.rose[600] : "primary.main",
                whiteSpace: "nowrap",
              }}
            >
              {urgent ? "⚡ Limited seats" : "Admissions open"}
            </Typography>
          </StackRow>
        </Box>

        <Typography
          component={motion.p}
          key={urgencyLine}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          variant="caption"
          sx={{
            display: "block",
            pl: 0.5,
            fontWeight: 600,
            fontSize: { xs: "0.68rem", sm: "0.72rem" },
            color: urgent ? palette.rose[600] : "text.secondary",
            lineHeight: 1.4,
          }}
        >
          {urgencyLine}
        </Typography>
      </Box>
    </Box>
  );
}

function StackRow({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: object;
}) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: { xs: 0.5, sm: 0.65 },
        position: "relative",
        zIndex: 1,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function LiveDot({ urgent }: { urgent: boolean }) {
  return (
    <Box
      component={motion.span}
      animate={{ scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      sx={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        bgcolor: urgent ? palette.rose[500] : palette.emerald[500],
        boxShadow: urgent
          ? `0 0 0 3px ${palette.rose[100]}`
          : `0 0 0 3px ${palette.emerald[100]}`,
        flexShrink: 0,
      }}
    />
  );
}

function DividerDot() {
  return (
    <Box
      component="span"
      sx={{
        width: 3,
        height: 3,
        borderRadius: "50%",
        bgcolor: "text.disabled",
        flexShrink: 0,
      }}
    />
  );
}

function Colon() {
  return (
    <Typography
      component="span"
      sx={{
        fontWeight: 800,
        fontSize: "0.85rem",
        color: "text.disabled",
        lineHeight: 1,
        mx: -0.15,
      }}
    >
      :
    </Typography>
  );
}

function CountBlock({
  value,
  label,
  highlight,
  urgent,
  compact,
}: {
  value: number;
  label: string;
  highlight?: boolean;
  urgent?: boolean;
  compact?: boolean;
}) {
  const display = String(value).padStart(compact ? 2 : highlight ? 3 : 2, "0");

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0.35,
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: compact ? 0.5 : highlight ? 0.65 : 0.55,
          py: 0.25,
          minWidth: compact ? 28 : highlight ? 36 : 30,
          justifyContent: "center",
          borderRadius: 1.25,
          bgcolor: (t) =>
            urgent
              ? t.palette.mode === "dark"
                ? "rgba(244,63,94,0.15)"
                : palette.rose[50]
              : highlight
                ? t.palette.mode === "dark"
                  ? "rgba(249,115,22,0.15)"
                  : palette.orange[50]
                : t.palette.mode === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : palette.slate[50],
          border: (t) =>
            `1px solid ${
              urgent
                ? palette.rose[100]
                : highlight
                  ? palette.orange[200]
                  : t.palette.divider
            }`,
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <Typography
            key={display}
            component={motion.span}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              fontWeight: 800,
              fontSize: compact
                ? { xs: "0.78rem", sm: "0.82rem" }
                : highlight
                  ? { xs: "0.92rem", sm: "1rem" }
                  : { xs: "0.82rem", sm: "0.88rem" },
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.03em",
              color: urgent ? palette.rose[600] : highlight ? "primary.main" : "text.primary",
              lineHeight: 1,
            }}
          >
            {display}
          </Typography>
        </AnimatePresence>
      </Box>
      <Typography
        component="span"
        sx={{
          fontWeight: 600,
          fontSize: "0.62rem",
          color: "text.secondary",
          textTransform: "lowercase",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
