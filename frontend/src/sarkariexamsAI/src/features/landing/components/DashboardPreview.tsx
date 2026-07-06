import { Box, Button, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import TopicRoundedIcon from "@mui/icons-material/TopicRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { motion } from "framer-motion";
import { TiltVisual } from "@/components/motion/TiltVisual";
import { useIsMobile } from "@/hooks/useIsMobile";
import { palette } from "@/theme/tokens";

const PLAN_TASKS = [
  {
    title: "Polity padho — Samvidhan ka Itihas",
    subtitle: "NCERT Class 11, Ch. 2",
    done: true,
    tag: "Concept samjhein",
    tagColor: palette.rose[500],
    time: "20m",
  },
  {
    title: "15 sawal practice karo",
    subtitle: "Article 14–18 · FR",
    done: false,
    tag: "Facts yaad karein",
    tagColor: palette.amber[500],
    time: "15m",
  },
  {
    title: "8 sawal — Rights aur DPSP",
    subtitle: "Topics jod kar samjho",
    done: false,
    tag: "Topics jodein",
    tagColor: palette.orange[600],
    time: "12m",
  },
  {
    title: "Dobara padho — Reasonable Classification",
    subtitle: "Mock mein weak topic",
    done: false,
    tag: "Concept samjhein",
    tagColor: palette.rose[500],
    time: "10m",
  },
];

const REVISION = [
  { title: "Reasonable Classification", done: false, color: palette.rose[500] },
  { title: "Art. 14–18 fact recall", done: false, color: palette.amber[500] },
  { title: "FR ↔ DPSP linkage", done: true, color: palette.emerald[500] },
];

const QUICK_ACTIONS = [
  { label: "Courses", icon: <MenuBookRoundedIcon sx={{ fontSize: 11 }} />, tone: palette.amber[600] },
  { label: "Chapter Test", icon: <TopicRoundedIcon sx={{ fontSize: 11 }} />, tone: palette.sky[600] },
  { label: "Current Affairs", icon: <NewspaperRoundedIcon sx={{ fontSize: 11 }} />, tone: palette.emerald[600] },
  { label: "Mock Test", icon: <QuizRoundedIcon sx={{ fontSize: 11 }} />, tone: palette.orange[600] },
];

/** Landing hero — miniature replica of the real dashboard (Aaj ka Plan + insights). */
export function DashboardPreview() {
  const isMobile = useIsMobile();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      sx={{ position: "relative", pt: { xs: 0, lg: 1 } }}
    >
      {/* Floating — streak */}
      <Box
        component={motion.div}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          top: { xs: -6, lg: 0 },
          left: { xs: 0, lg: -8 },
          zIndex: 2,
          px: 1.1,
          py: 0.55,
          borderRadius: 8,
          bgcolor: "#fff",
          border: (t) => `1px solid ${t.palette.divider}`,
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <LocalFireDepartmentRoundedIcon sx={{ fontSize: 13, color: palette.amber[500] }} />
        <Typography sx={{ fontWeight: 700, fontSize: "0.65rem", whiteSpace: "nowrap" }}>
          11-day streak · 57/60 Qs today
        </Typography>
      </Box>

      {/* Floating — weak topic insight */}
      <Box
        component={motion.div}
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        sx={{
          position: "absolute",
          bottom: { xs: -10, lg: 16 },
          right: { xs: 0, lg: -12 },
          zIndex: 2,
          px: 1.1,
          py: 0.55,
          borderRadius: 8,
          bgcolor: "#fff",
          border: (t) => `1px solid ${t.palette.divider}`,
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <TrendingUpRoundedIcon sx={{ fontSize: 13, color: palette.emerald[500] }} />
        <Typography sx={{ fontWeight: 700, fontSize: "0.65rem", whiteSpace: "nowrap" }}>
          Weak: Art. 14–18 · Fix mapped
        </Typography>
      </Box>

      {/* App window */}
      <TiltVisual maxTilt={isMobile ? 0 : 4}>
      <Box
        component={motion.div}
        whileInView={{ boxShadow: "0 28px 72px rgba(15,23,42,0.16), 0 10px 28px rgba(15,23,42,0.08)" }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        sx={{
          borderRadius: 2.5,
          overflow: "hidden",
          bgcolor: (t) => t.palette.background.default,
          border: (t) => `1px solid ${t.palette.divider}`,
          boxShadow: "0 24px 64px rgba(15,23,42,0.14), 0 8px 24px rgba(15,23,42,0.06)",
        }}
      >
        {/* Chrome */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 1.5,
            py: 0.85,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: "#fff",
          }}
        >
          <Stack direction="row" spacing={0.5}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <Box key={c} sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c }} />
            ))}
          </Stack>
          <Typography sx={{ fontWeight: 700, fontSize: "0.62rem", color: "text.secondary" }}>
            Your Dashboard · BPSC 2027
          </Typography>
          <Box sx={{ width: 40 }} />
        </Stack>

        <Box sx={{ p: 1.25, bgcolor: (t) => t.palette.background.default }}>
          {/* Quick actions */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.5, mb: 1 }}>
            {QUICK_ACTIONS.map((a) => (
              <Box
                key={a.label}
                sx={{
                  px: 0.5,
                  py: 0.55,
                  borderRadius: 1.25,
                  bgcolor: "#fff",
                  border: (t) => `1px solid ${t.palette.divider}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.4,
                }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    color: a.tone,
                    bgcolor: `${a.tone}14`,
                  }}
                >
                  {a.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.58rem", display: { xs: "none", md: "block" } }}>
                  {a.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Main grid — plan + sidebar */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 0.75, alignItems: "start" }}>
            {/* Aaj ka Plan + CA */}
            <Box
              sx={{
                borderRadius: 1.5,
                bgcolor: "#fff",
                border: (t) => `1px solid ${t.palette.divider}`,
                borderLeft: (t) => `3px solid ${t.palette.primary.main}`,
                p: 1,
              }}
            >
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.35 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.58rem", color: "primary.main", letterSpacing: "0.06em" }}>
                    AAJ KA PLAN
                  </Typography>
                  <Typography sx={{ fontSize: "0.52rem", color: "text.secondary" }}>
                    Aaj ye 4 kaam complete karein
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.58rem", color: "primary.main" }}>
                  1/4 · 25%
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={25} sx={{ height: 3, mb: 0.75, borderRadius: 1 }} />

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.45, mb: 0.75 }}>
                {PLAN_TASKS.map((task) => (
                  <Box
                    key={task.title}
                    sx={{
                      px: 0.65,
                      py: 0.5,
                      borderRadius: 1,
                      border: (t) => `1px solid ${t.palette.divider}`,
                      bgcolor: task.done ? `${palette.emerald[500]}06` : "background.paper",
                      opacity: task.done ? 0.85 : 1,
                    }}
                  >
                    <Stack direction="row" spacing={0.35} alignItems="flex-start">
                      {task.done ? (
                        <CheckCircleRoundedIcon sx={{ fontSize: 11, color: "success.main", mt: 0.1 }} />
                      ) : (
                        <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 11, color: "text.disabled", mt: 0.1 }} />
                      )}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.54rem",
                            lineHeight: 1.3,
                            textDecoration: task.done ? "line-through" : "none",
                            color: task.done ? "text.secondary" : "text.primary",
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Stack direction="row" spacing={0.3} alignItems="center" sx={{ mt: 0.2, flexWrap: "wrap" }}>
                          <Typography sx={{ fontSize: "0.48rem", color: "text.secondary" }}>{task.time}</Typography>
                          <Chip
                            label={task.tag}
                            size="small"
                            sx={{
                              height: 14,
                              fontSize: "0.44rem",
                              fontWeight: 700,
                              bgcolor: `${task.tagColor}14`,
                              color: task.tagColor,
                              "& .MuiChip-label": { px: 0.5 },
                            }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Box>

              {/* Mini CA strip */}
              <Box sx={{ pt: 0.65, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
                <Stack direction="row" spacing={0.4} alignItems="center" sx={{ mb: 0.35 }}>
                  <NewspaperRoundedIcon sx={{ fontSize: 10, color: "secondary.main" }} />
                  <Typography sx={{ fontWeight: 700, fontSize: "0.52rem", color: "secondary.main", letterSpacing: "0.05em" }}>
                    TODAY&apos;S CURRENT AFFAIRS
                  </Typography>
                </Stack>
                <Typography sx={{ fontWeight: 700, fontSize: "0.54rem", lineHeight: 1.3, mb: 0.35 }}>
                  SC on Article 370 — BPSC takeaways
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 0.65,
                    py: 0.45,
                    borderRadius: 1,
                    border: (t) => `1px dashed ${t.palette.primary.main}44`,
                    bgcolor: (t) => `${t.palette.primary.main}06`,
                  }}
                >
                  <Stack direction="row" spacing={0.4} alignItems="center">
                    <QuizRoundedIcon sx={{ fontSize: 11, color: "primary.main" }} />
                    <Typography sx={{ fontSize: "0.5rem", fontWeight: 600 }}>15 MCQs · ~12 min</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: "0.5rem", fontWeight: 700, color: "primary.main" }}>
                    Start quiz →
                  </Typography>
                </Stack>
              </Box>
            </Box>

            {/* Sidebar */}
            <Stack spacing={0.75}>
              {/* Revision */}
              <Box sx={{ borderRadius: 1.5, bgcolor: "#fff", border: (t) => `1px solid ${t.palette.divider}`, p: 0.85 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Stack direction="row" spacing={0.35} alignItems="center">
                    <ReplayRoundedIcon sx={{ fontSize: 10, color: "warning.main" }} />
                    <Typography sx={{ fontWeight: 700, fontSize: "0.55rem", color: "warning.dark" }}>
                      REVISION
                    </Typography>
                  </Stack>
                  <Chip label="2 pending" size="small" sx={{ height: 16, fontSize: "0.45rem", fontWeight: 600 }} />
                </Stack>
                <Stack spacing={0.35}>
                  {REVISION.map((item) => (
                    <Stack
                      key={item.title}
                      direction="row"
                      spacing={0.4}
                      alignItems="center"
                      sx={{ px: 0.5, py: 0.35, borderRadius: 1, border: (t) => `1px solid ${t.palette.divider}` }}
                    >
                      {item.done ? (
                        <CheckCircleRoundedIcon sx={{ fontSize: 10, color: "success.main" }} />
                      ) : (
                        <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: item.color, flexShrink: 0 }} />
                      )}
                      <Typography
                        sx={{
                          flex: 1,
                          fontSize: "0.5rem",
                          fontWeight: 600,
                          textDecoration: item.done ? "line-through" : "none",
                          color: item.done ? "text.secondary" : "text.primary",
                        }}
                        noWrap
                      >
                        {item.title}
                      </Typography>
                      {!item.done && (
                        <Typography sx={{ fontSize: "0.48rem", fontWeight: 700, color: "primary.main" }}>Go</Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Box>

              {/* AI Recommendations */}
              <Box
                sx={{
                  borderRadius: 1.5,
                  bgcolor: (t) => `${t.palette.primary.main}04`,
                  border: (t) => `1px solid ${t.palette.primary.main}20`,
                  p: 0.85,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: "0.55rem", color: "primary.main", mb: 0.5 }}>
                  AI RECOMMENDATIONS
                </Typography>
                <Box sx={{ px: 0.55, py: 0.45, mb: 0.4, borderRadius: 1, bgcolor: "#fff", border: (t) => `1px solid ${t.palette.divider}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.52rem" }}>Fix conceptual gap first</Typography>
                  <Typography sx={{ fontSize: "0.48rem", color: "text.secondary", lineHeight: 1.35, mt: 0.15 }}>
                    Read NCERT XI Polity pp. 28–34
                  </Typography>
                  <Typography sx={{ fontSize: "0.48rem", fontWeight: 700, color: "primary.main", mt: 0.15 }}>
                    Open NCERT →
                  </Typography>
                </Box>
                <Box sx={{ px: 0.55, py: 0.45, borderRadius: 1, bgcolor: "#fff", border: (t) => `1px solid ${t.palette.divider}` }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.52rem" }}>Take Mock #9 Sunday</Typography>
                  <Typography sx={{ fontSize: "0.48rem", color: "text.secondary", mt: 0.15 }}>
                    Foundation phase on track
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 10 }} />}
                  sx={{ mt: 0.45, py: 0.25, fontSize: "0.5rem", fontWeight: 700, minHeight: 0 }}
                >
                  AI Mentor
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
      </TiltVisual>
    </Box>
  );
}
