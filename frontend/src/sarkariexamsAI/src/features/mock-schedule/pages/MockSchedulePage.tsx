import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { palette } from "@/theme/tokens";

type TestType = "all" | "full-mock" | "chapter" | "ca";

interface ScheduleItem {
  id: string;
  title: string;
  day: string;
  dateNum: string;
  month: string;
  time: string;
  duration: string;
  questions: number;
  type: Exclude<TestType, "all">;
  weekGroup: "This week" | "Next week";
  status: "next" | "upcoming";
  actionPath: string;
  prepareLabel?: string;
}

const SCHEDULE: ScheduleItem[] = [
  {
    id: "s1",
    title: "BPSC Prelims · Full Mock #9",
    day: "Sun",
    dateNum: "6",
    month: "Jul",
    time: "10:00 AM",
    duration: "2h",
    questions: 150,
    type: "full-mock",
    weekGroup: "This week",
    status: "next",
    actionPath: "/mock-test",
    prepareLabel: "Revise Polity Ch. 2 before mock",
  },
  {
    id: "s2",
    title: "Polity · Fundamental Rights",
    day: "Wed",
    dateNum: "9",
    month: "Jul",
    time: "6:00 PM",
    duration: "45m",
    questions: 30,
    type: "chapter",
    weekGroup: "This week",
    status: "upcoming",
    actionPath: "/chapter-test",
  },
  {
    id: "s3",
    title: "Today's CA · BPSC Quiz",
    day: "Fri",
    dateNum: "11",
    month: "Jul",
    time: "7:00 PM",
    duration: "20m",
    questions: 15,
    type: "ca",
    weekGroup: "This week",
    status: "upcoming",
    actionPath: "/current-affairs",
  },
  {
    id: "s4",
    title: "BPSC Prelims · Full Mock #10",
    day: "Sun",
    dateNum: "13",
    month: "Jul",
    time: "10:00 AM",
    duration: "2h",
    questions: 150,
    type: "full-mock",
    weekGroup: "Next week",
    status: "upcoming",
    actionPath: "/mock-test",
  },
  {
    id: "s5",
    title: "History · Modern India",
    day: "Tue",
    dateNum: "15",
    month: "Jul",
    time: "6:00 PM",
    duration: "45m",
    questions: 28,
    type: "chapter",
    weekGroup: "Next week",
    status: "upcoming",
    actionPath: "/chapter-test",
  },
];

const TYPE_META: Record<
  Exclude<TestType, "all">,
  { label: string; color: string }
> = {
  "full-mock": {
    label: "Full mock",
    color: palette.orange[600],
  },
  chapter: {
    label: "Chapter",
    color: palette.amber[600],
  },
  ca: {
    label: "Current Affairs",
    color: palette.emerald[600],
  },
};

const FILTER_TABS: { id: TestType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "full-mock", label: "Full mocks" },
  { id: "chapter", label: "Chapter" },
  { id: "ca", label: "CA" },
];

export function MockSchedulePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TestType>("all");

  const next = SCHEDULE.find((s) => s.status === "next")!;
  const filtered = useMemo(
    () => (filter === "all" ? SCHEDULE : SCHEDULE.filter((s) => s.type === filter)),
    [filter],
  );

  const thisWeek = filtered.filter((s) => s.weekGroup === "This week");
  const nextWeek = filtered.filter((s) => s.weekGroup === "Next week");
  const fullMockCount = SCHEDULE.filter((s) => s.type === "full-mock").length;

  return (
    <PageContainer maxWidth={1100} compact>
      {/* Stats strip — matches Mock / Chapter Test pages */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          gap: 1,
          mb: 1.75,
        }}
      >
        <StatTile icon={<CalendarMonthRoundedIcon />} label="This week" value={`${SCHEDULE.filter((s) => s.weekGroup === "This week").length} tests`} tone="primary" />
        <StatTile icon={<QuizRoundedIcon />} label="Full mocks" value={`${fullMockCount} scheduled`} tone="warning" />
        <StatTile icon={<EventAvailableRoundedIcon />} label="Next test" value={`${next.day} ${next.time}`} tone="success" />
        <StatTile icon={<TrendingUpRoundedIcon />} label="Phase" value="Foundation" tone="secondary" />
      </Box>

      {/* Next up hero */}
      <SectionCard
        pad="sm"
        sx={{
          mb: 1.75,
          borderColor: "primary.main",
          bgcolor: (t) =>
            t.palette.mode === "dark" ? `${t.palette.primary.main}14` : `${t.palette.primary.main}06`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip
                label="NEXT UP"
                size="small"
                color="primary"
                sx={{ height: 22, fontWeight: 800, fontSize: "0.65rem" }}
              />
              <Chip
                label={TYPE_META[next.type].label}
                size="small"
                sx={{
                  height: 22,
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  bgcolor: `${TYPE_META[next.type].color}14`,
                  color: TYPE_META[next.type].color,
                }}
              />
            </Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 0.35 }}>
              {next.title}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
              <MetaPill icon={<CalendarMonthRoundedIcon />} text={`${next.day}, ${next.month} ${next.dateNum}`} />
              <MetaPill icon={<AccessTimeRoundedIcon />} text={`${next.time} · ${next.duration}`} />
              <MetaPill icon={<QuizRoundedIcon />} text={`${next.questions} Qs`} />
            </Stack>
            {next.prepareLabel && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, fontSize: "0.75rem" }}>
                💡 {next.prepareLabel}
              </Typography>
            )}
          </Box>
          <Stack direction={{ xs: "row", sm: "column" }} spacing={0.75} sx={{ flexShrink: 0 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<PlayArrowRoundedIcon />}
              onClick={() => navigate(next.actionPath)}
              sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
            >
              Prepare
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<NotificationsActiveRoundedIcon />}
              sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
            >
              Remind me
            </Button>
          </Stack>
        </Stack>
      </SectionCard>

      {/* Filter tabs */}
      <Box sx={{ mb: 1.5, borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={filter}
          onChange={(_, v) => setFilter(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            "& .MuiTab-root": { minHeight: 40, py: 0.75, fontWeight: 600, fontSize: "0.82rem", textTransform: "none" },
          }}
        >
          {FILTER_TABS.map((tab) => (
            <Tab key={tab.id} value={tab.id} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Timeline groups */}
      <Stack spacing={2}>
        {thisWeek.length > 0 && (
          <ScheduleGroup label="This week" items={thisWeek} onAction={navigate} />
        )}
        {nextWeek.length > 0 && (
          <ScheduleGroup label="Next week" items={nextWeek} onAction={navigate} />
        )}
        {filtered.length === 0 && (
          <SectionCard pad="lg" sx={{ textAlign: "center" }}>
            <Typography color="text.secondary">No tests in this category.</Typography>
          </SectionCard>
        )}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, textAlign: "center", fontSize: "0.72rem" }}>
        Schedule auto-adjusts with your Foundation phase plan · Mocks refine after Practice phase
      </Typography>
    </PageContainer>
  );
}

function ScheduleGroup({
  label,
  items,
  onAction,
}: {
  label: string;
  items: ScheduleItem[];
  onAction: (path: string) => void;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 800,
          letterSpacing: "0.08em",
          color: "text.secondary",
          display: "block",
          mb: 1,
          px: 0.25,
        }}
      >
        {label.toUpperCase()}
      </Typography>
      <SectionCard pad="sm">
        <Stack spacing={0}>
        {items.map((item, i) => {
          const meta = TYPE_META[item.type];
          const isNext = item.status === "next";
          return (
            <Stack
              key={item.id}
              direction="row"
              spacing={1.25}
              sx={{
                position: "relative",
                py: 1.25,
                borderBottom: i < items.length - 1 ? (t) => `1px solid ${t.palette.divider}` : undefined,
              }}
            >
              {/* Timeline line */}
              {i < items.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 23,
                    top: 52,
                    bottom: 0,
                    width: 2,
                    bgcolor: "divider",
                  }}
                />
              )}

              {/* Date block — calendar style */}
              <Box
                sx={{
                  width: 48,
                  flexShrink: 0,
                  textAlign: "center",
                  pt: 0.25,
                }}
              >
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "text.secondary", lineHeight: 1 }}>
                  {item.day}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: isNext ? "primary.main" : "text.primary",
                  }}
                >
                  {item.dateNum}
                </Typography>
                <Typography sx={{ fontSize: "0.62rem", color: "text.secondary", fontWeight: 600 }}>
                  {item.month}
                </Typography>
              </Box>

              {/* Timeline dot */}
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: isNext ? "primary.main" : meta.color,
                  mt: 1.1,
                  flexShrink: 0,
                  boxShadow: isNext ? (t) => `0 0 0 3px ${t.palette.primary.main}30` : "none",
                }}
              />

              {/* Content */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  py: 0.25,
                  pr: { xs: 0, sm: 1 },
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ gap: 0.5, mb: 0.35 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {item.title}
                      </Typography>
                      <Chip
                        label={meta.label}
                        size="small"
                        sx={{
                          height: 22,
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          bgcolor: `${meta.color}12`,
                          color: meta.color,
                        }}
                      />
                      {isNext && (
                        <Chip label="Next" size="small" color="primary" sx={{ height: 22, fontWeight: 700, fontSize: "0.62rem" }} />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.35 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                        {item.time} · {item.duration} · {item.questions} Qs
                      </Typography>
                    </Stack>
                  </Box>
                  <Button
                    size="small"
                    variant={isNext ? "contained" : "outlined"}
                    onClick={() => onAction(item.actionPath)}
                    sx={{ flexShrink: 0, fontWeight: 700, fontSize: "0.75rem", alignSelf: { xs: "flex-start", sm: "center" } }}
                  >
                    {isNext ? "Prepare" : "View"}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          );
        })}
        </Stack>
      </SectionCard>
    </Box>
  );
}

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "warning" | "success" | "secondary";
}) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Stack direction="row" spacing={0.85} alignItems="center" sx={{ mb: 0.35 }}>
        <Box sx={{ color: `${tone}.main`, display: "grid", "& svg": { fontSize: 15 } }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2, pl: 0.15 }}>
        {value}
      </Typography>
    </Box>
  );
}

function MetaPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Stack
      direction="row"
      spacing={0.4}
      alignItems="center"
      sx={{
        px: 0.75,
        py: 0.3,
        borderRadius: 1,
        bgcolor: (t) => t.palette.surface.subtle,
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Box sx={{ color: "text.secondary", display: "grid", "& svg": { fontSize: 12 } }}>{icon}</Box>
      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.72rem", color: "text.secondary" }}>
        {text}
      </Typography>
    </Stack>
  );
}
