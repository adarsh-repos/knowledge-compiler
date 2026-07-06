import { Box, Stack, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LinkOffRoundedIcon from "@mui/icons-material/LinkOffRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import { motion } from "framer-motion";
import { SectionCard } from "@/components/ui/SectionCard";
import { palette } from "@/theme/tokens";

const OTHERS = [
  "AI chat box — you ask, it answers (generic)",
  "MCQ generator by subject — disconnected sets",
  "Course completion % — no link to your mocks",
  "Chapter scores — no topic or pattern drill-down",
  "You decide what to study — no root cause plan",
];

const US = [
  "Connected profile — mocks, practice, subjects in one system",
  "Root cause engine — topic → subtopic → pattern",
  "NCERT fix with highlighted pattern type",
  "Event-based journey — Foundation to Seat Selection",
  "Auto-planned next step based on your actual gaps",
];

export function DifferentiationSection() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Stack alignItems="center" sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.12em" }}
        >
          Why we&apos;re different
        </Typography>
        <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: "1.8rem", md: "2.5rem" }, maxWidth: "28ch" }}>
          Chat + MCQs exist everywhere.{" "}
          <Box component="span" sx={{ fontStyle: "italic", color: "primary.main" }}>
            Connection
          </Box>{" "}
          doesn&apos;t.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: "56ch", lineHeight: 1.75 }}>
          Other platforms give you tools — a chat option, subject-wise MCQ generation — but
          nothing connects them to <em>your</em> mock performance, <em>your</em> patterns, and
          <em> your</em> individual journey. We built one system where every piece talks to every other.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionCard pad="lg" sx={{ height: "100%" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <LinkOffRoundedIcon sx={{ color: palette.slate[400] }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.secondary" }}>
                Typical platforms
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {OTHERS.map((item) => (
                <Stack key={item} direction="row" spacing={1.25} alignItems="flex-start">
                  <CloseRoundedIcon sx={{ fontSize: 18, color: palette.rose[400], mt: 0.2, flexShrink: 0 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Box>

        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
        >
          <SectionCard
            pad="lg"
            glow
            sx={{
              height: "100%",
              border: (t) => `1px solid ${t.palette.primary.main}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <HubRoundedIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                SarkariExamsAI
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {US.map((item) => (
                <Stack key={item} direction="row" spacing={1.25} alignItems="flex-start">
                  <CheckCircleRoundedIcon
                    sx={{ fontSize: 18, color: palette.emerald[500], mt: 0.2, flexShrink: 0 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Box>
      </Box>

      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        sx={{ mt: 4, textAlign: "center" }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", maxWidth: "48ch", mx: "auto" }}>
          Simple goal: complete your events, track every aspect, and let the system plan your
          journey from foundation to seat selection — not random MCQ completion.
        </Typography>
      </Box>
    </Box>
  );
}
