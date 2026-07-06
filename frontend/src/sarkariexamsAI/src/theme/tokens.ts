/**
 * Design tokens — single source of truth for SarkariExamsAI.
 *
 * White + warm orange brand. Light-first with dark mode. Semantic pattern
 * colors (rose, amber, sky, violet) stay distinct from the orange brand accent.
 */

export const palette = {
  // Brand accent — warm orange (primary UI, CTAs, links).
  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
  },
  // Mastery / success.
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
  },
  // Warm secondary / highlights.
  amber: {
    50: "#fffbeb",
    100: "#fef3c7",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
  },
  // Errors / needs work.
  rose: {
    50: "#fff1f2",
    100: "#ffe4e6",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
  },
  // Application-style pattern (distinct from brand orange).
  sky: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    500: "#0ea5e9",
    600: "#0284c7",
  },
  // Linkage pattern (distinct from brand orange).
  violet: {
    50: "#f5f3ff",
    100: "#ede9fe",
    500: "#8b5cf6",
    600: "#7c3aed",
  },
  // Neutral ramp — surfaces + typography.
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
} as const;

/** Shorthand for brand-colored UI (maps to orange). */
export const brand = palette.orange;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const spacingUnit = 8;

export const fontFamily =
  '"Inter", "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const transitions = {
  fast: "0.15s cubic-bezier(0.4, 0, 0.2, 1)",
  base: "0.22s cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export type ColorMode = "light" | "dark";
