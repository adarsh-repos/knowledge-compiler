import { Box, Stack, Typography } from "@mui/material";
import type { SubjectProgress } from "@/data/types";
import { SectionCard } from "@/components/ui/SectionCard";

interface SubjectTrackingCardProps {
  subjects: SubjectProgress[];
}

export function SubjectTrackingCard({ subjects }: SubjectTrackingCardProps) {
  return (
    <SectionCard pad="lg">
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        Subject tracking
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Connected to mocks &amp; pattern profile
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: 1.5,
        }}
      >
        {subjects.map((s) => (
          <Box
            key={s.id}
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: 2,
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {s.name}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: `${s.tone}.main` }}>
                {s.masteryPercent}%
              </Typography>
            </Stack>
            <Box sx={{ height: 5, borderRadius: 3, bgcolor: "action.hover", mb: 0.5 }}>
              <Box
                sx={{
                  width: `${s.masteryPercent}%`,
                  height: "100%",
                  borderRadius: 3,
                  bgcolor: `${s.tone}.main`,
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {s.questionsAttempted} Qs · {s.accuracyPercent}% accuracy
            </Typography>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}
