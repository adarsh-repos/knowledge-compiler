import { useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { SectionCard } from "@/components/ui/SectionCard";
import { VisualReveal } from "@/components/motion/VisualReveal";
import { palette } from "@/theme/tokens";

const DRILL_DOWN = {
  subject: "Indian Polity",
  chapter: "Fundamental Rights",
  topic: "Right to Equality (Art. 14–18)",
  subtopic: "Reasonable Classification test",
  patterns: [
    { type: "Conceptual", pct: 38, color: palette.rose[500], desc: "Misunderstanding the two-part test" },
    { type: "Fact-based", pct: 22, color: palette.amber[500], desc: "Article numbers & exceptions" },
    { type: "Application", pct: 28, color: palette.sky[600], desc: "Case-law linkage questions" },
    { type: "Linkage", pct: 12, color: palette.violet[600], desc: "Connecting DPSP ↔ FR" },
  ],
  ncert: { cls: "Class XI", chap: "Ch. 2 — Rights in the Indian Constitution", pages: "pp. 28–34" },
};

const PATTERN_LEGEND = [
  { label: "Fact-based", desc: "Dates, articles, names — pure recall gaps", color: palette.amber[500] },
  { label: "Conceptual", desc: "You read it but didn't understand the logic", color: palette.rose[500] },
  { label: "Application", desc: "Can't apply concept to a new scenario", color: palette.sky[600] },
  { label: "Linkage", desc: "Missing connections across topics/chapters", color: palette.violet[600] },
];

export function RootCauseSection() {
  const [level, setLevel] = useState<"chapter" | "topic" | "subtopic" | "pattern">("pattern");

  return (
    <Box id="root-cause" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack alignItems="center" sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.12em" }}
        >
          Root cause engine
        </Typography>
        <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: "1.8rem", md: "2.5rem" }, maxWidth: "26ch" }}>
          We drill down to the{" "}
          <Box component="span" sx={{ fontStyle: "italic", color: "primary.main" }}>
            exact pattern
          </Box>{" "}
          you&apos;re missing.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: "56ch", lineHeight: 1.75 }}>
          Every mock, every practice session feeds one connected profile. We track your subjects,
          your mocks, and your error patterns — then map the root cause to specific NCERT topics
          with highlighted fix suggestions.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1.1fr" },
          gap: 4,
          alignItems: "start",
        }}
      >
        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>
            DRILL-DOWN HIERARCHY
          </Typography>

          {[
            { key: "chapter" as const, label: "Chapter", value: DRILL_DOWN.chapter, indent: 0 },
            { key: "topic" as const, label: "Topic", value: DRILL_DOWN.topic, indent: 1 },
            { key: "subtopic" as const, label: "Subtopic", value: DRILL_DOWN.subtopic, indent: 2 },
            { key: "pattern" as const, label: "Pattern", value: "4 error types identified", indent: 3 },
          ].map((row) => (
            <Box
              key={row.key}
              component={motion.button}
              onClick={() => setLevel(row.key)}
              whileHover={{ x: 4 }}
              sx={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                pl: row.indent * 2.5,
              }}
            >
              <SectionCard
                flat
                pad="sm"
                sx={{
                  borderLeft: level === row.key ? `3px solid ${palette.orange[600]}` : "3px solid transparent",
                  bgcolor: level === row.key ? `${palette.orange[500]}10` : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {row.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: level === row.key ? 700 : 500 }}>
                  {row.value}
                </Typography>
              </SectionCard>
            </Box>
          ))}

          <SectionCard pad="sm" sx={{ bgcolor: `${palette.emerald[500]}08`, border: `1px solid ${palette.emerald[400]}30` }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: palette.emerald[600] }}>
              NCERT FIX SUGGESTION
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              {DRILL_DOWN.ncert.cls} · {DRILL_DOWN.ncert.chap}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Read {DRILL_DOWN.ncert.pages} — focus on classification test logic
            </Typography>
          </SectionCard>
        </Stack>

        <VisualReveal direction="left" parallax glow={palette.orange[500]}>
        <SectionCard pad="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Pattern breakdown · {DRILL_DOWN.subtopic}
            </Typography>
            <Chip label={DRILL_DOWN.subject} size="small" color="primary" variant="outlined" />
          </Stack>

          <AnimatePresence mode="wait">
            <Box
              key={level}
              component={motion.div}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Stack spacing={1.5} sx={{ mb: 3 }}>
                {DRILL_DOWN.patterns.map((p, i) => (
                  <Box key={p.type}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {p.type}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: p.color }}>
                        {p.pct}% of errors
                      </Typography>
                    </Stack>
                    <Box sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover", overflow: "hidden" }}>
                      <Box
                        component={motion.div}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${p.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        sx={{ height: "100%", borderRadius: 4, bgcolor: p.color }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {p.desc}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </AnimatePresence>

          <Box sx={{ pt: 2, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", mb: 1.5, display: "block" }}>
              YOUR IMPROVEMENT PLAN (auto-generated)
            </Typography>
            <Stack spacing={1}>
              {[
                "📖 Read NCERT XI Polity pp. 28–34 (Conceptual gap)",
                "🎯 Practice 15 fact-recall MCQs on Art. 14–18",
                "🔗 8 linkage questions: FR ↔ DPSP comparison",
              ].map((action) => (
                <Box
                  key={action}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    bgcolor: (t) => `${t.palette.primary.main}08`,
                    border: (t) => `1px solid ${t.palette.divider}`,
                  }}
                >
                  {action}
                </Box>
              ))}
            </Stack>
          </Box>
        </SectionCard>
        </VisualReveal>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mt: 5,
        }}
      >
        {PATTERN_LEGEND.map((p, i) => (
          <Box
            key={p.label}
            component={motion.div}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <SectionCard flat pad="sm" sx={{ height: "100%" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: p.color }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {p.label}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                {p.desc}
              </Typography>
            </SectionCard>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
