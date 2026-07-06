import { Box, Chip, Divider, LinearProgress, Stack, Typography } from "@mui/material";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { useNavigate } from "react-router-dom";
import type { JourneyEvent, RevisionItem } from "@/data/types";
import { SectionCard } from "@/components/ui/SectionCard";
import { PLAN_PATTERN_META, PATTERN_META } from "./journeyConstants";
import { TaskMetaChip, TaskMetaTime, TaskRow } from "./TaskRow";

interface TodayWorkCardProps {
  events: JourneyEvent[];
  revisionItems: RevisionItem[];
  onToggleEvent: (id: string) => void;
}

export function TodayWorkCard({ events, revisionItems, onToggleEvent }: TodayWorkCardProps) {
  const navigate = useNavigate();
  const done = events.filter((e) => e.completed).length;
  const progress = events.length ? Math.round((done / events.length) * 100) : 0;
  const revisionPending = revisionItems.filter((i) => !i.completed).length;

  return (
    <SectionCard
      pad="md"
      sx={{
        borderLeft: (t) => `3px solid ${t.palette.primary.main}`,
        p: { xs: 1.75, sm: 2.5 },
      }}
    >
      <SectionHeader
        label="AAJ KA PLAN"
        hint={`Aaj ye ${events.length} kaam complete karein`}
        badge={`${done}/${events.length} · ${progress}%`}
        badgeColor="primary.main"
      />

      <LinearProgress variant="determinate" value={progress} sx={{ height: 4, mb: 1.25, borderRadius: 2 }} />

      <Stack spacing={0.75}>
        {events.map((ev) => {
          const pattern = ev.patternTag ? PLAN_PATTERN_META[ev.patternTag] : null;
          return (
            <TaskRow
              key={ev.id}
              title={ev.title}
              subtitle={ev.subtitle}
              completed={ev.completed}
              onToggle={() => onToggleEvent(ev.id)}
              onAction={() => navigate(ev.actionPath)}
              meta={
                <>
                  <TaskMetaTime minutes={ev.estimatedMinutes} />
                  {pattern && <TaskMetaChip label={pattern.label} color={pattern.color} />}
                </>
              }
            />
          );
        })}
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <SectionHeader
        icon={<ReplayRoundedIcon sx={{ fontSize: 15, color: "warning.main" }} />}
        label="REVISION"
        badge={`${revisionPending} pending`}
        badgeVariant="outlined"
      />

      <Stack spacing={0.75}>
        {revisionItems.map((item) => {
          const pattern = PATTERN_META[item.patternType];
          return (
            <TaskRow
              key={item.id}
              title={item.title}
              subtitle={item.reason}
              completed={item.completed}
              statusColor={pattern.color}
              actionLabel="Go"
              onAction={() => navigate(item.actionPath)}
              meta={
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                    {item.questionCount} Qs
                  </Typography>
                  <TaskMetaChip label={pattern.label} color={pattern.color} />
                </>
              }
            />
          );
        })}
      </Stack>
    </SectionCard>
  );
}

function SectionHeader({
  icon,
  label,
  hint,
  badge,
  badgeColor = "text.primary",
  badgeVariant = "filled",
}: {
  icon?: React.ReactNode;
  label: string;
  hint?: string;
  badge: string;
  badgeColor?: string;
  badgeVariant?: "filled" | "outlined";
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
        {icon}
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: label === "REVISION" ? "warning.dark" : "primary.main",
              display: "block",
            }}
          >
            {label}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", display: "block", mt: 0.1 }}>
              {hint}
            </Typography>
          )}
        </Box>
      </Stack>
      {badgeVariant === "outlined" ? (
        <Chip
          label={badge}
          size="small"
          variant="outlined"
          sx={{ height: 22, fontSize: "0.68rem", fontWeight: 600, flexShrink: 0 }}
        />
      ) : (
        <Typography variant="caption" sx={{ fontWeight: 700, color: badgeColor, flexShrink: 0 }}>
          {badge}
        </Typography>
      )}
    </Stack>
  );
}
