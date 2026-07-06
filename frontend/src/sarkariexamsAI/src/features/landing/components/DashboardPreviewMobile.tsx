import { Box, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import { motion } from "framer-motion";

const TASKS = [
  { title: "Polity padho — NCERT Ch. 2", done: true, time: "20m" },
  { title: "15 sawal practice karo", done: false, time: "15m" },
];

/** Compact hero preview for mobile — less visual noise. */
export function DashboardPreviewMobile() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: (t) => `1px solid ${t.palette.divider}`,
        boxShadow: "0 12px 40px rgba(15,23,42,0.08)",
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.25, py: 0.75, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "text.secondary" }}>
          Dashboard · BPSC 2027
        </Typography>
        <Chip label="Foundation" size="small" sx={{ height: 18, fontSize: "0.6rem", fontWeight: 800, color: "primary.main", bgcolor: (t) => `${t.palette.primary.main}12` }} />
      </Stack>
      <Box sx={{ p: 1.25, borderLeft: (t) => `3px solid ${t.palette.primary.main}` }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.68rem", color: "primary.main", letterSpacing: "0.06em" }}>
            AAJ KA PLAN
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: "0.68rem", color: "primary.main" }}>1/4</Typography>
        </Stack>
        <LinearProgress variant="determinate" value={25} sx={{ height: 3, mb: 1, borderRadius: 1 }} />
        <Stack spacing={0.6}>
          {TASKS.map((task) => (
            <Stack key={task.title} direction="row" spacing={0.6} alignItems="center">
              {task.done ? (
                <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "success.main" }} />
              ) : (
                <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
              )}
              <Typography
                sx={{
                  flex: 1,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  textDecoration: task.done ? "line-through" : "none",
                  color: task.done ? "text.secondary" : "text.primary",
                }}
              >
                {task.title}
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>{task.time}</Typography>
            </Stack>
          ))}
        </Stack>
        <Typography sx={{ mt: 0.75, fontSize: "0.68rem", color: "text.secondary", textAlign: "center" }}>
          +2 aur tasks aaj ke liye
        </Typography>
      </Box>
    </Box>
  );
}
