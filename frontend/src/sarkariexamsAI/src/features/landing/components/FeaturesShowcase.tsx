import { useEffect, useState } from "react";
import { Box, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PatternRoundedIcon from "@mui/icons-material/PatternRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import { motion, AnimatePresence } from "framer-motion";
import { SectionCard } from "@/components/ui/SectionCard";
import { VisualReveal } from "@/components/motion/VisualReveal";
import { palette } from "@/theme/tokens";
import { useIsMobile } from "@/hooks/useIsMobile";

const MOBILE_FEATURE_IDS = ["events", "drilldown", "ncert"];

interface FeatureInsight {
  label: string;
  value: string;
}

interface Feature {
  id: string;
  tag: string;
  icon: React.ReactNode;
  title: string;
  headline: string;
  desc: string;
  bullets: string[];
  preview: React.ReactNode;
  insights: FeatureInsight[];
  dashboardCta: string;
  color: string;
}

function ChipRow({ label, color }: { label: string; color: string }) {
  return (
    <Box
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.25,
        borderRadius: 1,
        fontSize: "0.7rem",
        fontWeight: 700,
        bgcolor: `${color}18`,
        color,
      }}
    >
      {label}
    </Box>
  );
}

function PreviewShell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Box
      component={motion.div}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        p: 2,
        borderRadius: 2.5,
        height: "100%",
        minHeight: { xs: 200, sm: 280 },
        display: "flex",
        flexDirection: "column",
        bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : palette.slate[50]),
        border: (t) => `1px solid ${t.palette.divider}`,
        boxShadow: "0 4px 24px rgba(15,23,42,0.06)",
      }}
    >
      <Box sx={{ flex: 1 }}>{children}</Box>
      {footer && (
        <Box sx={{ mt: 2, pt: 1.5, borderTop: (t) => `1px solid ${t.palette.divider}` }}>{footer}</Box>
      )}
    </Box>
  );
}

const FEATURES: Feature[] = [
  {
    id: "drilldown",
    tag: "Drill-down",
    icon: <InsightsRoundedIcon />,
    title: "Topic & Subtopic Analysis",
    headline: "Chapter weak? We find the exact topic and subtopic.",
    desc: "After every mock, we go beyond chapter scores — drilling into the specific topic and subtopic where you're losing marks.",
    bullets: ["Subject → chapter → topic → subtopic", "Mock history tracked over time", "Weak nodes highlighted automatically"],
    color: palette.orange[600],
    dashboardCta: "See weak topic in Analysis",
    insights: [
      { label: "Source", value: "Mock #8" },
      { label: "Depth", value: "4 levels" },
      { label: "Weak node", value: "Art. 14–18" },
    ],
    preview: (
      <PreviewShell
        footer={
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip label="Weak · Reasonable Classification" size="small" sx={{ height: 22, fontWeight: 700, fontSize: "0.65rem", bgcolor: `${palette.rose[500]}14`, color: palette.rose[600] }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "primary.main" }}>Fix mapped →</Typography>
          </Stack>
        }
      >
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "text.secondary", letterSpacing: "0.06em", mb: 1.5 }}>
          DRILL PATH · POLITY 52%
        </Typography>
        {[
          { level: "Chapter", val: "Fundamental Rights", color: palette.orange[500], w: 100 },
          { level: "Topic", val: "Right to Equality (Art. 14–18)", color: palette.orange[600], w: 78 },
          { level: "Subtopic", val: "Reasonable Classification test", color: palette.rose[500], w: 52 },
        ].map((row) => (
          <Box key={row.val} sx={{ mb: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {row.level}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: row.color }}>
                {row.w}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={row.w}
              sx={{ height: 5, borderRadius: 2, mb: 0.5, bgcolor: `${row.color}18`, "& .MuiLinearProgress-bar": { bgcolor: row.color, borderRadius: 2 } }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
              {row.val}
            </Typography>
          </Box>
        ))}
      </PreviewShell>
    ),
  },
  {
    id: "patterns",
    tag: "Patterns",
    icon: <PatternRoundedIcon />,
    title: "Error Pattern Detection",
    headline: "Fact, concept, application, or linkage — know what's really wrong.",
    desc: "Within each subtopic, we classify every mistake by thinking pattern so you fix the root cause, not just re-read the chapter.",
    bullets: ["Fact-based recall gaps", "Conceptual misunderstanding", "Application & linkage errors"],
    color: palette.rose[500],
    dashboardCta: "View pattern profile",
    insights: [
      { label: "Top gap", value: "Conceptual 38%" },
      { label: "Tagged", value: "24 wrong Qs" },
      { label: "Feeds", value: "NCERT fix" },
    ],
    preview: (
      <PreviewShell
        footer={
          <Box sx={{ px: 1.25, py: 1, borderRadius: 1.5, bgcolor: `${palette.rose[500]}08`, border: `1px solid ${palette.rose[500]}30` }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: palette.rose[600] }}>Fix first · Conceptual gap</Typography>
            <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", mt: 0.25 }}>NCERT XI Polity pp. 28–34 added to plan</Typography>
          </Box>
        }
      >
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "text.secondary", letterSpacing: "0.06em", mb: 1.5 }}>
          ERROR PATTERN · ART. 14–18
        </Typography>
        {[
          { type: "Conceptual", pct: 38, color: palette.rose[500] },
          { type: "Application", pct: 28, color: palette.sky[600] },
          { type: "Fact-based", pct: 22, color: palette.amber[500] },
          { type: "Linkage", pct: 12, color: palette.orange[600] },
        ].map((p) => (
          <Box key={p.type} sx={{ mb: 1.25 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.35 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, flex: 1 }}>
                {p.type}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: p.color }}>
                {p.pct}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={p.pct}
              sx={{ height: 6, borderRadius: 2, bgcolor: `${p.color}15`, "& .MuiLinearProgress-bar": { bgcolor: p.color, borderRadius: 2 } }}
            />
          </Box>
        ))}
      </PreviewShell>
    ),
  },
  {
    id: "ncert",
    tag: "NCERT",
    icon: <MapRoundedIcon />,
    title: "Pattern-Tagged NCERT Fixes",
    headline: "Exact NCERT pages — with the gap type highlighted.",
    desc: "We don't just say 'read Polity.' We point to Class XI, Chapter 2, pages 28–34 and tell you it's a conceptual gap on classification logic.",
    bullets: ["Subject-wise NCERT mapping", "Page-level references", "Pattern type on every suggestion"],
    color: palette.amber[600],
    dashboardCta: "Open in Learn →",
    insights: [
      { label: "Class", value: "NCERT XI" },
      { label: "Pages", value: "pp. 28–34" },
      { label: "Pattern", value: "Conceptual" },
    ],
    preview: (
      <PreviewShell
        footer={
          <Stack spacing={0.75}>
            {["Intro — Rights framework", "Art. 14 · Equality before law", "Reasonable Classification"].map((step, i) => (
              <Stack key={step} direction="row" spacing={0.75} alignItems="center">
                <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: i === 0 ? "primary.main" : "action.hover", color: i === 0 ? "#fff" : "text.secondary", fontSize: "0.6rem", fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {i + 1}
                </Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "primary.main" : "text.secondary" }}>
                  {step}
                </Typography>
              </Stack>
            ))}
          </Stack>
        }
      >
        <ChipRow label="Conceptual gap" color={palette.rose[500]} />
        <Typography variant="body2" sx={{ fontWeight: 700, mt: 1.25, fontSize: "0.9rem" }}>
          NCERT XI · Polity Ch. 2
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
          Rights in the Indian Constitution
        </Typography>
        <Box sx={{ px: 1.25, py: 1, borderRadius: 1.5, bgcolor: (t) => `${t.palette.primary.main}06`, border: (t) => `1px dashed ${t.palette.primary.main}40` }}>
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 700 }}>pp. 28–34</Typography>
          <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", mt: 0.25 }}>Reasonable Classification test · ~20 min read</Typography>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ mt: 1.25, flexWrap: "wrap", gap: 0.5 }}>
          {["Fact", "Concept", "PYQ"].map((tag) => (
            <Chip key={tag} label={tag} size="small" sx={{ height: 20, fontSize: "0.62rem", fontWeight: 700 }} />
          ))}
        </Stack>
      </PreviewShell>
    ),
  },
  {
    id: "tracking",
    tag: "Tracking",
    icon: <TrackChangesRoundedIcon />,
    title: "Connected Mock & Subject Profile",
    headline: "Subjects, mocks, and practice — one living profile.",
    desc: "Every mock feeds your subject map. Every practice session updates your pattern data. Nothing is siloed.",
    bullets: ["Mock performance history", "Subject mastery over time", "Practice ↔ mock correlation"],
    color: palette.sky[600],
    dashboardCta: "View subject profile",
    insights: [
      { label: "Mastery", value: "72% overall" },
      { label: "This week", value: "86 Qs" },
      { label: "Streak", value: "12 days" },
    ],
    preview: (
      <PreviewShell
        footer={
          <Stack direction="row" spacing={1}>
            {[
              { label: "Mock #8", val: "Polity 52%", color: palette.rose[500] },
              { label: "Practice", val: "+14 Qs", color: palette.emerald[600] },
              { label: "Trend", val: "Conceptual ↓8%", color: palette.sky[600] },
            ].map((item) => (
              <Box key={item.label} sx={{ flex: 1, px: 0.75, py: 0.65, borderRadius: 1.25, bgcolor: `${item.color}08`, border: `1px solid ${item.color}25`, textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.58rem", color: "text.secondary", fontWeight: 600 }}>{item.label}</Typography>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: item.color }}>{item.val}</Typography>
              </Box>
            ))}
          </Stack>
        }
      >
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "text.secondary", letterSpacing: "0.06em", mb: 1.5 }}>
          SUBJECT MASTERY
        </Typography>
        {[
          { name: "Polity", pct: 82, color: palette.orange[600] },
          { name: "History", pct: 68, color: palette.sky[600] },
          { name: "Geography", pct: 74, color: palette.emerald[600] },
          { name: "Economy", pct: 54, color: palette.amber[600] },
        ].map((s) => (
          <Box key={s.name} sx={{ mb: 1.15 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.3 }}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 600 }}>{s.name}</Typography>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: s.color }}>{s.pct}%</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={s.pct}
              sx={{ height: 5, borderRadius: 2, bgcolor: `${s.color}15`, "& .MuiLinearProgress-bar": { bgcolor: s.color, borderRadius: 2 } }}
            />
          </Box>
        ))}
      </PreviewShell>
    ),
  },
  {
    id: "events",
    tag: "Events",
    icon: <EventNoteRoundedIcon />,
    title: "Event-Based Completion",
    headline: "Complete events — not random MCQ dumps.",
    desc: "Every task is an event in your journey: read this NCERT section, practice these 15 Qs, take this sectional mock. Track completion, not course %.",
    bullets: ["Checklist-style events", "Phase-aware tasks", "Completion feeds next plan"],
    color: palette.emerald[600],
    dashboardCta: "Open Aaj ka Plan",
    insights: [
      { label: "Today", value: "1/4 done" },
      { label: "Phase", value: "Foundation" },
      { label: "Next", value: "15 sawal" },
    ],
    preview: (
      <PreviewShell
        footer={
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontWeight: 600 }}>Foundation phase · 4 events</Typography>
            <Chip label="Shuru →" size="small" color="primary" sx={{ height: 22, fontWeight: 700, fontSize: "0.65rem" }} />
          </Stack>
        }
      >
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "primary.main", letterSpacing: "0.06em" }}>AAJ KA PLAN</Typography>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "primary.main" }}>1/4 · 25%</Typography>
        </Stack>
        <LinearProgress variant="determinate" value={25} sx={{ height: 4, borderRadius: 2, mb: 1.5 }} />
        {[
          { done: true, text: "Polity padho — NCERT Ch. 2", tag: "Concept", time: "20m" },
          { done: false, text: "15 sawal practice karo", tag: "Facts", time: "15m" },
          { done: false, text: "Rights ↔ DPSP linkage", tag: "Linkage", time: "12m" },
          { done: false, text: "Dobara padho — Art. 14", tag: "Concept", time: "10m" },
        ].map((ev) => (
          <Stack key={ev.text} direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.85, opacity: ev.done ? 0.75 : 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                border: `1.5px solid ${ev.done ? palette.emerald[500] : palette.slate[300]}`,
                bgcolor: ev.done ? `${palette.emerald[500]}20` : "transparent",
                display: "grid",
                placeItems: "center",
                fontSize: "0.6rem",
                color: palette.emerald[600],
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {ev.done ? "✓" : ""}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, textDecoration: ev.done ? "line-through" : "none", color: ev.done ? "text.secondary" : "text.primary", lineHeight: 1.3 }}>
                {ev.text}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.62rem", color: "text.secondary", flexShrink: 0 }}>{ev.time}</Typography>
          </Stack>
        ))}
      </PreviewShell>
    ),
  },
  {
    id: "journey",
    tag: "Journey",
    icon: <RouteRoundedIcon />,
    title: "Foundation → Seat Selection",
    headline: "Five phases. Root cause plans each step.",
    desc: "Your journey moves through Foundation, Advanced, Practice, Revision, and Seat Selection — with the system deciding what event comes next based on your gaps.",
    bullets: ["Phase-aware planning", "Auto-advance on completion", "Milestone to exam day"],
    color: palette.orange[600],
    dashboardCta: "View your journey",
    insights: [
      { label: "Current", value: "Foundation" },
      { label: "Progress", value: "Phase 1/5" },
      { label: "Events", value: "1/4 today" },
    ],
    preview: (
      <PreviewShell
        footer={
          <Box sx={{ px: 1.25, py: 1, borderRadius: 1.5, bgcolor: (t) => `${t.palette.primary.main}08`, border: (t) => `1px solid ${t.palette.primary.main}25` }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "primary.main" }}>Next milestone · Advanced phase</Typography>
            <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", mt: 0.25 }}>Complete 4 Foundation events to unlock</Typography>
          </Box>
        }
      >
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "text.secondary", letterSpacing: "0.06em", mb: 1.5 }}>
          YOUR JOURNEY
        </Typography>
        {[
          { phase: "Foundation", status: "active", events: "1/4 today" },
          { phase: "Advanced", status: "locked", events: "Weak pattern fixes" },
          { phase: "Practice", status: "locked", events: "Mocks + chapter tests" },
          { phase: "Revision", status: "locked", events: "Spaced recall queue" },
          { phase: "Seat Selection", status: "locked", events: "Full mocks + rank" },
        ].map((p, i) => (
          <Stack key={p.phase} direction="row" spacing={1} alignItems="flex-start" sx={{ mb: i < 4 ? 1 : 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 14, pt: 0.4 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: p.status === "active" ? "primary.main" : "action.hover",
                  border: p.status === "active" ? "none" : (t) => `2px solid ${t.palette.divider}`,
                  flexShrink: 0,
                }}
              />
              {i < 4 && <Box sx={{ width: 2, flex: 1, minHeight: 18, bgcolor: "divider", mt: 0.25 }} />}
            </Box>
            <Box sx={{ flex: 1, pb: i < 4 ? 0.5 : 0 }}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: p.status === "active" ? 800 : 600, color: p.status === "active" ? "primary.main" : "text.secondary" }}>
                {p.phase}
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>{p.events}</Typography>
            </Box>
          </Stack>
        ))}
      </PreviewShell>
    ),
  },
];

export function FeaturesShowcase() {
  const isMobile = useIsMobile();
  const mobileFeatures = FEATURES.filter((f) => MOBILE_FEATURE_IDS.includes(f.id));
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (isMobile) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % FEATURES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isMobile]);

  const list = isMobile ? mobileFeatures : FEATURES;
  const feature = list[active];

  if (isMobile) {
    return (
      <Box id="features" sx={{ py: { xs: 4, md: 12 } }}>
        <Stack alignItems="center" sx={{ mb: 2.5, textAlign: "center", px: 0.5 }}>
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.7rem" }}>
            Kya milega
          </Typography>
          <Typography component="h2" sx={{ mt: 0.75, fontSize: "1.4rem", fontWeight: 800, maxWidth: "22ch", lineHeight: 1.2 }}>
            Jo aapko{" "}
            <Box component="span" sx={{ color: "primary.main" }}>actually chahiye.</Box>
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "flex",
            gap: 0.75,
            mb: 1.5,
            overflowX: "auto",
            pb: 0.5,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {mobileFeatures.map((f, i) => (
            <Box
              key={f.id}
              component="button"
              onClick={() => setActive(i)}
              sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.25,
                py: 0.85,
                borderRadius: 2,
                border: (t) => (i === active ? `2px solid ${t.palette.primary.main}` : `1px solid ${t.palette.divider}`),
                bgcolor: i === active ? (t) => `${t.palette.primary.main}08` : "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Box sx={{ color: i === active ? "primary.main" : "text.secondary", display: "flex" }}>{f.icon}</Box>
              <Typography sx={{ fontWeight: i === active ? 700 : 500, fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                {f.title}
              </Typography>
            </Box>
          ))}
        </Box>

        <SectionCard pad="sm" sx={{ p: 2 }}>
          <AnimatePresence mode="wait">
            <Box
              key={feature.id}
              component={motion.div}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 0.75, lineHeight: 1.35 }}>
                {feature.headline}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: "0.88rem" }}>
                {feature.desc}
              </Typography>
            </Box>
          </AnimatePresence>
        </SectionCard>
      </Box>
    );
  }

  return (
    <Box id="features" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack alignItems="center" sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.12em" }}
        >
          The system
        </Typography>
        <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: "1.8rem", md: "2.4rem" }, maxWidth: "24ch" }}>
          Track. Analyse. Plan.{" "}
          <Box component="span" sx={{ fontStyle: "italic", color: "primary.main" }}>
            Improve.
          </Box>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: "54ch" }}>
          Everything connects — your mocks, subjects, error patterns, NCERT fixes, and
          journey events work as one system built around you.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        <Stack spacing={1}>
          {FEATURES.map((f, i) => (
            <Box
              key={f.id}
              component={motion.button}
              onClick={() => setActive(i)}
              whileHover={{ x: 4 }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                bgcolor: i === active ? (t) => `${t.palette.primary.main}12` : "transparent",
                borderLeft: i === active ? (t) => `3px solid ${t.palette.primary.main}` : "3px solid transparent",
                transition: "background-color 0.2s",
                fontFamily: "inherit",
              }}
            >
              <Box sx={{ color: i === active ? "primary.main" : "text.secondary", display: "flex" }}>
                {f.icon}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  {f.tag}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: i === active ? 700 : 500 }}>
                  {f.title}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        <SectionCard
          pad="lg"
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: { xs: "auto", md: 460 },
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            <Box
              key={feature.id}
              component={motion.div}
              initial={{ opacity: 0, x: 24, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              sx={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                  flex: 1,
                  alignItems: "stretch",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="overline" sx={{ color: feature.color, fontWeight: 700 }}>
                    {feature.tag}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.3 }}>
                    {feature.headline}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                    {feature.desc}
                  </Typography>
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    {feature.bullets.map((b) => (
                      <Stack key={b} direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: feature.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {b}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <VisualReveal parallax glow={feature.color} direction="right" delay={0.08}>
                  <Box sx={{ display: "flex", minHeight: { xs: 220, sm: "100%" } }}>{feature.preview}</Box>
                </VisualReveal>
              </Box>

              {/* Bottom insight strip — fills remaining space visually */}
              <Box
                sx={{
                  mt: 3,
                  pt: 2,
                  borderTop: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "text.secondary",
                    }}
                  >
                    LIVE IN YOUR DASHBOARD
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "primary.main" }}>
                      {feature.dashboardCta}
                    </Typography>
                    <ArrowForwardRoundedIcon sx={{ fontSize: 14, color: "primary.main" }} />
                  </Stack>
                </Stack>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 1,
                  }}
                >
                  {feature.insights.map((insight, i) => (
                    <Box
                      key={insight.label}
                      component={motion.div}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      sx={{
                        px: 1.25,
                        py: 1,
                        borderRadius: 1.5,
                        bgcolor: (t) => t.palette.surface.subtle,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        textAlign: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "0.62rem", color: "text.secondary", fontWeight: 600, display: "block" }}>
                        {insight.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: feature.color, mt: 0.2 }}>
                        {insight.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </AnimatePresence>
        </SectionCard>
      </Box>
    </Box>
  );
}
