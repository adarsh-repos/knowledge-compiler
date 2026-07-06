import { useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { AnimatePresence, motion } from "framer-motion";
import type { PrepPhase } from "@/data/types";
import { SectionCard } from "@/components/ui/SectionCard";
import { ScrollReveal, StaggerReveal, StaggerItem } from "./ScrollReveal";
import { PHASES } from "@/features/dashboard/components/journeyConstants";
import { useIsMobile } from "@/hooks/useIsMobile";
import { palette } from "@/theme/tokens";

interface PhaseRow {
  aspect: string;
  others: string;
  ours: string;
}

interface PhaseDetail {
  id: PrepPhase;
  tagline: string;
  goal: string;
  rows: PhaseRow[];
  flow: string[];
}

/** Trimmed copy — one line per side, max 3 points per phase. */
const PHASE_DETAILS: PhaseDetail[] = [
  {
    id: "foundation",
    tagline: "Foundation · NCERT se shuru",
    goal: "Topic samjho aur patterns ek saath build karo — fact, concept, linkage.",
    rows: [
      { aspect: "NCERT reading", others: "PDF dump, no structure", ours: "Step-by-step reader + checks" },
      { aspect: "Topic path", others: "\"Polity padho\" — vague", ours: "Topic → subtopic map" },
      { aspect: "Practice", others: "Random MCQs", ours: "Jo padha, wahi PYQs + chapter set" },
    ],
    flow: ["Foundation", "NCERT Ch. 2", "Fundamental Rights", "15 PYQs"],
  },
  {
    id: "advanced",
    tagline: "Advanced · Weak pattern fix",
    goal: "Weak area se exact landing — kal ka plan auto-regenerate.",
    rows: [
      { aspect: "Weak detection", others: "Chapter % only", ours: "Pattern-level % breakdown" },
      { aspect: "Where to land", others: "\"Revise Polity\"", ours: "NCERT pp. 28–34 · exact topic" },
      { aspect: "Next day", others: "You plan tomorrow", ours: "Aaj ka Plan auto-updated" },
    ],
    flow: ["Gap found", "NCERT fix", "Revision queue", "Tomorrow's plan"],
  },
  {
    id: "practice",
    tagline: "Practice · Mocks & chapter tests",
    goal: "Mock ke baad pattern tags — gaps wapas plan mein.",
    rows: [
      { aspect: "Chapter practice", others: "Random question bank", ours: "Weak chapter targeted sets" },
      { aspect: "Mock analysis", others: "Score + rank only", ours: "Topic → pattern drill-down" },
      { aspect: "Feedback loop", others: "Mock khatam, move on", ours: "Weak areas → Aaj ka Plan" },
    ],
    flow: ["Chapter test", "Full mock", "Pattern profile", "Plan updated"],
  },
  {
    id: "revision",
    tagline: "Revision · Spaced recall",
    goal: "Jo bhool rahe ho — system batata hai kab dubara padhna hai.",
    rows: [
      { aspect: "When to revise", others: "You decide", ours: "Auto revision queue" },
      { aspect: "What to revise", others: "Full chapter re-read", ours: "Exact weak points only" },
      { aspect: "Spaced plan", others: "No schedule", ours: "Daily revision in Aaj ka Plan" },
    ],
    flow: ["Queue pending", "Flash recall", "Pattern recap", "Done ✓"],
  },
  {
    id: "selection",
    tagline: "Seat Selection · Final sprint",
    goal: "Full mocks, rank trend, aur last gaps close — exam ready.",
    rows: [
      { aspect: "Full mocks", others: "Random timing", ours: "Scheduled + rank predictor" },
      { aspect: "Rank tracking", others: "Score only", ours: "Rank trend + gap areas" },
      { aspect: "Exam readiness", others: "No metric", ours: "Mastery % + sprint plan" },
    ],
    flow: ["Full mock #12", "Rank 1240→920", "7-day sprint", "Exam ready"],
  },
];

export function ProblemSection() {
  const isMobile = useIsMobile();
  const [activePhase, setActivePhase] = useState<PrepPhase>("foundation");
  const detail = PHASE_DETAILS.find((p) => p.id === activePhase)!;
  const activeIndex = PHASES.findIndex((p) => p.id === activePhase);
  const rows = isMobile ? detail.rows.slice(0, 2) : detail.rows;

  return (
    <Box id="problem" component="section" sx={{ py: { xs: 4, md: 10 } }}>
      <ScrollReveal>
        <Stack alignItems="center" sx={{ mb: { xs: 2.5, md: 4 }, textAlign: "center", px: 0.5 }}>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "1.4rem", md: "2.2rem" },
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              maxWidth: "24ch",
            }}
          >
            Doosre apps vs{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              hum — phase by phase
            </Box>
          </Typography>
          {!isMobile && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 1.25, maxWidth: "46ch", lineHeight: 1.65, fontSize: "0.95rem" }}
            >
              Har phase mein dekho kya alag hai — yahi real dashboard journey hai.
            </Typography>
          )}
        </Stack>
      </ScrollReveal>

      {/* Phase pills — horizontal scroll */}
      <ScrollReveal delay={0.04}>
        <Box
          sx={{
            display: "flex",
            gap: 0.75,
            mb: 2,
            overflowX: "auto",
            pb: 0.5,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            WebkitOverflowScrolling: "touch",
          }}
        >
          {PHASES.map((phase, i) => {
            const active = phase.id === activePhase;
            return (
              <Box
                key={phase.id}
                component="button"
                onClick={() => setActivePhase(phase.id)}
                sx={{
                  flexShrink: 0,
                  px: { xs: 1.25, md: 1.75 },
                  py: 0.85,
                  borderRadius: 2,
                  border: (t) =>
                    active ? `2px solid ${t.palette.primary.main}` : `1px solid ${t.palette.divider}`,
                  bgcolor: active ? (t) => `${t.palette.primary.main}08` : "background.paper",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: active ? 800 : 600,
                    fontSize: { xs: "0.78rem", md: "0.85rem" },
                    color: active ? "primary.main" : "text.secondary",
                    whiteSpace: "nowrap",
                  }}
                >
                  {phase.label}
                </Typography>
                {active && (
                  <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "primary.main", mt: 0.15 }}>
                    Phase {i + 1}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </ScrollReveal>

      <AnimatePresence mode="wait">
        <Box
          key={activePhase}
          component={motion.div}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          <SectionCard pad="md" sx={{ p: { xs: 1.75, md: 2.5 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: "0.95rem", md: "1.05rem" }, color: "primary.main", mb: 0.35 }}>
                  {detail.tagline}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, fontSize: { xs: "0.82rem", md: "0.9rem" }, maxWidth: "52ch" }}>
                  {detail.goal}
                </Typography>
              </Box>
              <Chip
                label={`Phase ${activeIndex + 1} of 5`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 24, fontWeight: 700, fontSize: "0.68rem", flexShrink: 0 }}
              />
            </Stack>

            <StaggerReveal stagger={0.1}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: { xs: 1, md: 1.25 },
                mb: 2,
              }}
            >
              {rows.map((row) => (
                <StaggerItem key={row.aspect}>
                  <CompareCard {...row} />
                </StaggerItem>
              ))}
            </Box>
            </StaggerReveal>

            <Box
              sx={{
                pt: 1.5,
                borderTop: (t) => `1px solid ${t.palette.divider}`,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  color: "text.secondary",
                  mb: 1,
                }}
              >
                {PHASES[activeIndex].label.toUpperCase()} FLOW
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.75,
                  overflowX: "auto",
                  pb: 0.25,
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {detail.flow.map((step, i) => (
                  <Chip
                    key={step}
                    label={step}
                    size="small"
                    sx={{
                      flexShrink: 0,
                      height: 26,
                      fontWeight: i === detail.flow.length - 1 ? 800 : 600,
                      fontSize: "0.72rem",
                      bgcolor: i === detail.flow.length - 1 ? (t) => `${t.palette.primary.main}12` : undefined,
                      color: i === detail.flow.length - 1 ? "primary.main" : "text.secondary",
                      border: (t) => `1px solid ${t.palette.divider}`,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </SectionCard>
        </Box>
      </AnimatePresence>
    </Box>
  );
}

function CompareCard({ aspect, others, ours }: PhaseRow) {
  return (
    <Box
      component={motion.div}
      whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(15,23,42,0.08)" }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        p: { xs: 1.25, md: 1.5 },
        borderRadius: 2,
        border: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: "background.paper",
        height: "100%",
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "0.72rem",
          color: "text.secondary",
          mb: 1,
          letterSpacing: "0.02em",
        }}
      >
        {aspect}
      </Typography>

      <Stack spacing={0.75}>
        <Box sx={{ px: 1, py: 0.75, borderRadius: 1.5, bgcolor: `${palette.rose[500]}06`, border: `1px solid ${palette.rose[500]}15` }}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.35 }}>
            <CloseRoundedIcon sx={{ fontSize: 13, color: palette.rose[500] }} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.65rem", color: palette.rose[600] }}>Others</Typography>
          </Stack>
          <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", lineHeight: 1.4 }}>{others}</Typography>
        </Box>

        <Box sx={{ px: 1, py: 0.75, borderRadius: 1.5, bgcolor: (t) => `${t.palette.primary.main}06`, border: (t) => `1px solid ${t.palette.primary.main}20` }}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.35 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 13, color: palette.emerald[600] }} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.65rem", color: "primary.main" }}>Us</Typography>
          </Stack>
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.4 }}>{ours}</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
