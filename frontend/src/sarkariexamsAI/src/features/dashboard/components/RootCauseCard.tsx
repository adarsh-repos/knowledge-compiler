import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import { useNavigate } from "react-router-dom";
import type { RootCauseGap } from "@/data/types";
import { SectionCard } from "@/components/ui/SectionCard";
import { PATTERN_META } from "./journeyConstants";

interface RootCauseCardProps {
  rootCause: RootCauseGap;
}

export function RootCauseCard({ rootCause }: RootCauseCardProps) {
  const navigate = useNavigate();
  const ncertPattern = PATTERN_META[rootCause.ncertFix.patternType];

  return (
    <SectionCard pad="lg" sx={{ height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
          Root cause · {rootCause.mockLabel}
        </Typography>
        <Chip
          label={`${rootCause.subject} ${rootCause.chapterScorePercent}%`}
          size="small"
          color="warning"
          variant="outlined"
          sx={{ fontWeight: 700, height: 24 }}
        />
      </Stack>

      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          DRILL-DOWN
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.25 }}>
          {rootCause.chapter} → {rootCause.topic}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Subtopic: {rootCause.subtopic}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 1, display: "block" }}>
        PATTERN BREAKDOWN
      </Typography>
      <Stack spacing={1.25} sx={{ mb: 2.5 }}>
        {rootCause.patterns.map((p) => {
          const meta = PATTERN_META[p.type];
          return (
            <Box key={p.type}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: meta.color }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {p.label}
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ fontWeight: 800, color: meta.color }}>
                  {p.percent}%
                </Typography>
              </Stack>
              <Box sx={{ height: 6, borderRadius: 3, bgcolor: "action.hover" }}>
                <Box sx={{ width: `${p.percent}%`, height: "100%", borderRadius: 3, bgcolor: meta.color }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
                {p.description}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          mb: 2,
          bgcolor: (t) => `${t.palette.primary.main}06`,
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <MenuBookRoundedIcon sx={{ fontSize: 18, color: "primary.main", mt: 0.2 }} />
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                NCERT FIX
              </Typography>
              <Chip
                label={ncertPattern.label}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  bgcolor: `${ncertPattern.color}18`,
                  color: ncertPattern.color,
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {rootCause.ncertFix.classLabel} · {rootCause.ncertFix.chapter}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {rootCause.ncertFix.pages} — {rootCause.ncertFix.focus}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Button
        fullWidth
        variant="contained"
        endIcon={<ArrowForwardRoundedIcon />}
        onClick={() => navigate("/learn")}
      >
        Open NCERT Fix
      </Button>
    </SectionCard>
  );
}
