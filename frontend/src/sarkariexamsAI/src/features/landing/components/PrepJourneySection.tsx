import { Box, Stack, Typography } from "@mui/material";
import FoundationRoundedIcon from "@mui/icons-material/FoundationRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { motion } from "framer-motion";
import { SectionCard } from "@/components/ui/SectionCard";
import { palette } from "@/theme/tokens";

const PHASES = [
  {
    id: "foundation",
    label: "Foundation",
    icon: <FoundationRoundedIcon />,
    color: palette.orange[600],
    desc: "NCERT-first concept building. One topic at a time, mapped to your syllabus.",
    events: ["Complete Ch. 2 — Rights", "Concept check: 10 Qs", "Pattern baseline set"],
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: <SchoolRoundedIcon />,
    color: palette.amber[600],
    desc: "Go deeper where your pattern analysis shows conceptual or linkage gaps.",
    events: ["Linkage drill: FR ↔ DPSP", "Case-law application set", "Advanced notes review"],
  },
  {
    id: "practice",
    label: "Practice",
    icon: <QuizRoundedIcon />,
    color: palette.emerald[600],
    desc: "Targeted MCQs and mocks — not random dumps. Every set tied to your weak patterns.",
    events: ["Topic mock: Polity 30 Qs", "PYQ set: 2019–2024", "Timed sectional test"],
  },
  {
    id: "revision",
    label: "Revision",
    icon: <ReplayRoundedIcon />,
    color: palette.amber[600],
    desc: "Spaced revision queue for facts you're forgetting and concepts that decay.",
    events: ["Revision queue: 24 items", "Flash recall: Art. 14–18", "Weak pattern recap"],
  },
  {
    id: "selection",
    label: "Seat Selection",
    icon: <WorkspacePremiumRoundedIcon />,
    color: palette.rose[500],
    desc: "Full-syllabus mocks, rank tracking, and final-gap closure before exam day.",
    events: ["Full mock #12", "Rank predictor update", "Final 7-day sprint plan"],
  },
];

export function PrepJourneySection() {
  return (
    <Box id="journey" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack alignItems="center" sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.12em" }}
        >
          Your prep journey
        </Typography>
        <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: "1.8rem", md: "2.5rem" }, maxWidth: "24ch" }}>
          Five phases.{" "}
          <Box component="span" sx={{ fontStyle: "italic", color: "primary.main" }}>
            One connected path
          </Box>{" "}
          to selection.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: "54ch", lineHeight: 1.75 }}>
          No random MCQs. No disconnected course completion. Every event — read, practice,
          mock, revise — is tracked, completed, and feeds the next step in your journey.
        </Typography>
      </Stack>

      <Box sx={{ position: "relative", mb: 4 }}>
        <Box
          aria-hidden
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            top: 36,
            left: "10%",
            right: "10%",
            height: 3,
            bgcolor: "divider",
            borderRadius: 2,
            zIndex: 0,
          }}
        />
        <Box
          component={motion.div}
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            top: 36,
            left: "10%",
            right: "10%",
            height: 3,
            bgcolor: "primary.main",
            borderRadius: 2,
            zIndex: 0,
            transformOrigin: "left",
          }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(5, 1fr)" },
            gap: 2.5,
            position: "relative",
            zIndex: 1,
          }}
        >
          {PHASES.map((phase, i) => (
            <Box
              key={phase.id}
              component={motion.div}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.02 }}
              viewport={{ once: true, margin: "-8% 0px", amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <SectionCard pad="lg" sx={{ height: "100%" }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    bgcolor: phase.color,
                    mb: 2,
                    mx: { xs: 0, md: "auto" },
                  }}
                >
                  {phase.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, textAlign: { md: "center" } }}>
                  {phase.label}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.65, textAlign: { md: "center" }, fontSize: "0.85rem" }}
                >
                  {phase.desc}
                </Typography>
                <Stack spacing={0.75}>
                  {phase.events.map((ev) => (
                    <Stack key={ev} direction="row" spacing={0.75} alignItems="center">
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: 0.5,
                          border: (t) => `1.5px solid ${t.palette.divider}`,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                        {ev}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </SectionCard>
            </Box>
          ))}
        </Box>
      </Box>

      <SectionCard
        glow
        pad="lg"
        sx={{
          textAlign: "center",
          bgcolor: (t) =>
            t.palette.mode === "dark" ? `${palette.orange[600]}12` : palette.orange[50],
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, maxWidth: "52ch", mx: "auto", lineHeight: 1.7 }}>
          Complete events. Track every aspect. The system knows where you are in the journey
          and plans the next event — not a random MCQ from a disconnected question bank.
        </Typography>
      </SectionCard>
    </Box>
  );
}
