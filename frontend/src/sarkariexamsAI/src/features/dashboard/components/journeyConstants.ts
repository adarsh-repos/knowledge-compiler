import type { ErrorPattern, PrepPhase } from "@/data/types";
import { palette } from "@/theme/tokens";

export const PHASES: { id: PrepPhase; label: string }[] = [
  { id: "foundation", label: "Foundation" },
  { id: "advanced", label: "Advanced" },
  { id: "practice", label: "Practice" },
  { id: "revision", label: "Revision" },
  { id: "selection", label: "Seat Selection" },
];

export const PATTERN_META: Record<
  ErrorPattern,
  { label: string; color: string }
> = {
  fact: { label: "Fact-based", color: palette.amber[500] },
  conceptual: { label: "Conceptual", color: palette.rose[500] },
  application: { label: "Application", color: palette.sky[600] },
  linkage: { label: "Linkage", color: palette.violet[600] },
};

/** Plain Hinglish labels for Today's Plan — easy for Hindi-medium students */
export const PLAN_PATTERN_META: Record<
  ErrorPattern,
  { label: string; color: string }
> = {
  fact: { label: "Facts yaad karein", color: palette.amber[500] },
  conceptual: { label: "Concept samjhein", color: palette.rose[500] },
  application: { label: "Apply karein", color: palette.sky[600] },
  linkage: { label: "Topics jodein", color: palette.violet[600] },
};
