import type { ReactNode } from "react";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import TopicRoundedIcon from "@mui/icons-material/TopicRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  subtitle: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Home",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: <SpaceDashboardRoundedIcon />,
        subtitle: "Today's plan, revision queue, and AI recommendations.",
      },
    ],
  },
  {
    title: "Tests",
    items: [
      {
        label: "Mock Test",
        path: "/mock-test",
        icon: <QuizRoundedIcon />,
        subtitle: "Full-length BPSC mocks with post-test root cause analysis.",
      },
      {
        label: "Chapter Test",
        path: "/chapter-test",
        icon: <TopicRoundedIcon />,
        subtitle: "Subject-wise chapter tests targeted to your weak areas.",
      },
      {
        label: "Mock Schedule",
        path: "/mock-schedule",
        icon: <CalendarMonthRoundedIcon />,
        subtitle: "Upcoming mocks and your test calendar.",
      },
    ],
  },
  {
    title: "Study",
    items: [
      {
        label: "Courses",
        path: "/courses",
        icon: <MenuBookRoundedIcon />,
        subtitle: "NCERT subject tracks and reading paths.",
      },
      {
        label: "Current Affairs",
        path: "/current-affairs",
        icon: <NewspaperRoundedIcon />,
        subtitle: "Daily editorials and exam-focused news.",
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        label: "Progress",
        path: "/analysis",
        icon: <InsightsRoundedIcon />,
        subtitle: "Subject analytics, mock trends, and pattern breakdown.",
      },
      {
        label: "AI Mentor",
        path: "/navigator",
        icon: <AutoAwesomeRoundedIcon />,
        subtitle: "Personal coach for plans, doubts, and next steps.",
      },
    ],
  },
];

/** Flat list for lookups */
export const navItems: NavItem[] = navSections.flatMap((s) => s.items);

const ROUTE_META: Record<string, NavItem> = {
  "/learn": {
    label: "NCERT Reading",
    path: "/learn",
    icon: <MenuBookRoundedIcon />,
    subtitle: "Read concepts linked to your weak areas.",
  },
  "/practice": {
    label: "Test Session",
    path: "/practice",
    icon: <QuizRoundedIcon />,
    subtitle: "Active test — answer, review, and submit.",
  },
};

export function getNavMeta(pathname: string): NavItem | undefined {
  const exact = navItems.find((i) => pathname === i.path || pathname.startsWith(`${i.path}/`));
  if (exact) return exact;
  for (const [prefix, meta] of Object.entries(ROUTE_META)) {
    if (pathname.startsWith(prefix)) return meta;
  }
  return navItems.find((i) => pathname.startsWith(i.path));
}
