import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import TopicRoundedIcon from "@mui/icons-material/TopicRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import type { ReactNode } from "react";

const ACTIONS = [
  {
    label: "Courses",
    shortLabel: "Courses",
    path: "/courses",
    icon: <MenuBookRoundedIcon sx={{ fontSize: 20 }} />,
    tone: "warning" as const,
  },
  {
    label: "Chapter Test",
    shortLabel: "Chapter",
    path: "/chapter-test",
    icon: <TopicRoundedIcon sx={{ fontSize: 20 }} />,
    tone: "secondary" as const,
  },
  {
    label: "Current Affairs",
    shortLabel: "CA",
    path: "/current-affairs",
    icon: <NewspaperRoundedIcon sx={{ fontSize: 20 }} />,
    tone: "success" as const,
  },
  {
    label: "Mock Test",
    shortLabel: "Mock",
    path: "/mock-test",
    icon: <QuizRoundedIcon sx={{ fontSize: 20 }} />,
    tone: "primary" as const,
  },
];

export function QuickActionsRow() {
  const navigate = useNavigate();

  return (
    <Box
      role="navigation"
      aria-label="Quick actions"
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: { xs: 0.75, sm: 1 },
      }}
    >
      {ACTIONS.map((action) => (
        <QuickAction key={action.path} {...action} onClick={() => navigate(action.path)} />
      ))}
    </Box>
  );
}

function QuickAction({
  label,
  shortLabel,
  icon,
  tone,
  onClick,
}: {
  label: string;
  shortLabel: string;
  icon: ReactNode;
  tone: "primary" | "secondary" | "success" | "warning";
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 2,
        bgcolor: "background.paper",
        cursor: "pointer",
        fontFamily: "inherit",
        p: { xs: 1, sm: 1.25 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        minHeight: { xs: 72, sm: 80 },
        transition: "border-color 0.15s, background-color 0.15s",
        "&:hover": {
          borderColor: `${tone}.main`,
          bgcolor: (t) => `${t.palette[tone].main}06`,
        },
        "&:active": {
          transform: "scale(0.98)",
        },
      }}
    >
      <Box
        sx={{
          width: { xs: 36, sm: 40 },
          height: { xs: 36, sm: 40 },
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          color: `${tone}.main`,
          bgcolor: (t) => `${t.palette[tone].main}12`,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: { xs: "0.68rem", sm: "0.78rem" },
          lineHeight: 1.2,
          textAlign: "center",
          color: "text.primary",
        }}
      >
        <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
          {shortLabel}
        </Box>
        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
          {label}
        </Box>
      </Typography>
    </Box>
  );
}
