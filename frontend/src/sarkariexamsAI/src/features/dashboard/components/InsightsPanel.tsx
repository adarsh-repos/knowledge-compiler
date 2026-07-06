import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import { useNavigate } from "react-router-dom";
import type { AiRecommendation, TodayCurrentAffair } from "@/data/types";
import { SectionCard } from "@/components/ui/SectionCard";
import { TaskRow } from "./TaskRow";

interface InsightsPanelProps {
  currentAffair: TodayCurrentAffair;
  recommendations: AiRecommendation[];
}

/** Sidebar column — current affairs + AI recommendations in one panel. */
export function InsightsPanel({ currentAffair, recommendations }: InsightsPanelProps) {
  const navigate = useNavigate();
  const shown = recommendations.slice(0, 2);

  return (
    <SectionCard pad="md" sx={{ p: { xs: 1.75, sm: 2.5 }, height: "100%" }}>
      <PanelSection
        icon={<NewspaperRoundedIcon sx={{ fontSize: 16, color: "secondary.main" }} />}
        label="CURRENT AFFAIRS"
        badge="Latest"
        badgeColor="secondary"
      />

      <Box
        sx={{
          p: 1.25,
          mb: 1,
          borderRadius: 1.5,
          border: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: (t) => `${t.palette.secondary.main}06`,
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5, flexWrap: "wrap", gap: 0.5 }}>
          <Chip label={currentAffair.topic} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.62rem", fontWeight: 600 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
            {currentAffair.readMinutes} min read
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.35, mb: 0.75 }}>
          {currentAffair.articleTitle}
        </Typography>
        <Stack spacing={0.4} sx={{ mb: 1 }}>
          {currentAffair.takeaways.slice(0, 2).map((point) => (
            <Typography key={point} variant="caption" color="text.secondary" sx={{ lineHeight: 1.45, fontSize: "0.72rem" }}>
              · {point}
            </Typography>
          ))}
        </Stack>
        <Stack spacing={0.75}>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={() => navigate(currentAffair.articlePath)}
            sx={{ fontSize: "0.75rem", fontWeight: 700, py: 0.5 }}
          >
            Read article
          </Button>
          <Button
            size="small"
            variant="contained"
            fullWidth
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate(currentAffair.quizPath)}
            sx={{ fontSize: "0.75rem", fontWeight: 700, py: 0.6, boxShadow: "none" }}
          >
            {currentAffair.quizLabel} · {currentAffair.quizQuestions} Qs
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 1.25 }} />

      <PanelSection
        icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />}
        label="AI RECOMMENDATIONS"
      />

      <Stack spacing={0.75} sx={{ mb: 1 }}>
        {shown.map((rec) => (
          <TaskRow
            key={rec.id}
            title={rec.title}
            subtitle={rec.description}
            completed={false}
            actionLabel={rec.actionLabel}
            onAction={() => navigate(rec.actionPath)}
          />
        ))}
      </Stack>

      <Button
        fullWidth
        size="small"
        variant="outlined"
        endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
        onClick={() => navigate("/navigator")}
        sx={{ fontSize: "0.75rem", py: 0.65, fontWeight: 700 }}
      >
        Open AI Mentor
      </Button>
    </SectionCard>
  );
}

function PanelSection({
  icon,
  label,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeColor?: "primary" | "secondary";
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
      <Stack direction="row" spacing={0.75} alignItems="center">
        {icon}
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.06em" }}>
          {label}
        </Typography>
      </Stack>
      {badge && (
        <Chip
          label={badge}
          size="small"
          color={badgeColor}
          sx={{ height: 20, fontSize: "0.62rem", fontWeight: 700 }}
        />
      )}
    </Stack>
  );
}
