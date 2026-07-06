import { Box, Stack, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { motion } from "framer-motion";
import { SectionCard } from "@/components/ui/SectionCard";
import { VisualReveal } from "@/components/motion/VisualReveal";
import { palette } from "@/theme/tokens";

const MESSAGES = [
  {
    role: "assistant",
    text: "Mock #8 analysed. Polity chapter score is 52% — but the root cause is deeper.",
  },
  {
    role: "assistant",
    text: "Subtopic: Reasonable Classification test. 38% of your errors are conceptual — you're mixing up the two-part test logic.",
  },
  {
    role: "user",
    text: "What should I do?",
  },
  {
    role: "assistant",
    text: "📖 NCERT XI Polity pp. 28–34 (Conceptual fix)\n🎯 15 fact-recall MCQs on Art. 14–18\n✅ Event added to your Foundation phase",
  },
];

export function AssistantDemoSection() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: { xs: 5, lg: 8 },
          alignItems: "center",
        }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.12em" }}
          >
            Connected system
          </Typography>
          <Typography variant="h3" sx={{ mt: 1, mb: 2, fontSize: { xs: "1.8rem", md: "2.4rem" } }}>
            Not a chat box. A system that{" "}
            <Box component="span" sx={{ fontStyle: "italic", color: "primary.main" }}>
              plans from your data.
            </Box>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.75, maxWidth: "46ch" }}>
            Other apps let you chat or generate MCQs by subject — but those never connect to
            your mock results or error patterns. We track subjects, mocks, and patterns in one
            profile, then auto-generate NCERT fixes and journey events for you.
          </Typography>

          <Stack spacing={1.5}>
            {[
              "Mock result → topic → subtopic → pattern in one flow",
              "NCERT suggestions tagged by gap type (fact / concept / application)",
              "Events added to your Foundation → Selection journey",
              "Complete & track — no disconnected random practice",
            ].map((item, i) => (
              <Stack key={item} direction="row" spacing={1.25} alignItems="center">
                <Box
                  component={motion.div}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: `${palette.emerald[500]}18`,
                    color: palette.emerald[600],
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <VisualReveal direction="right" parallax glow={palette.orange[500]} delay={0.1}>
          <SectionCard pad="lg" sx={{ position: "relative" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  background: (t) =>
                    `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                  color: "#fff",
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  SarkariAI · Post-Mock Analysis
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mock #8 · Polity drill-down complete
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1.5}>
              {MESSAGES.map((msg, i) => (
                <Box
                  key={i}
                  component={motion.div}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  sx={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "92%",
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      bgcolor:
                        msg.role === "user"
                          ? (t) => t.palette.primary.main
                          : (t) =>
                              t.palette.mode === "dark"
                                ? "rgba(255,255,255,0.06)"
                                : palette.slate[100],
                      color: msg.role === "user" ? "#fff" : "text.primary",
                      fontSize: "0.85rem",
                      lineHeight: 1.55,
                      fontWeight: msg.role === "user" ? 500 : 400,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.text}
                  </Box>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </VisualReveal>
      </Box>
    </Box>
  );
}
