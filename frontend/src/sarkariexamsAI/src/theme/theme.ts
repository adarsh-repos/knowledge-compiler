import { createTheme, type Theme } from "@mui/material/styles";
import {
  palette,
  radius,
  spacingUnit,
  fontFamily,
  type ColorMode,
} from "./tokens";

declare module "@mui/material/styles" {
  interface Palette {
    accent: Palette["primary"];
    surface: {
      base: string;
      card: string;
      cardHover: string;
      subtle: string;
      border: string;
      borderStrong: string;
    };
  }
  interface PaletteOptions {
    accent?: PaletteOptions["primary"];
    surface?: {
      base: string;
      card: string;
      cardHover: string;
      subtle: string;
      border: string;
      borderStrong: string;
    };
  }
}

export function buildTheme(mode: ColorMode): Theme {
  const isDark = mode === "dark";

  const surface = isDark
    ? {
        base: "#0c0a09",
        card: "#1c1917",
        cardHover: "#292524",
        subtle: "#141110",
        border: "#292524",
        borderStrong: "#44403c",
      }
    : {
        base: "#fafaf9",
        card: "#ffffff",
        cardHover: "#fffbf7",
        subtle: palette.orange[50],
        border: "#f0ebe6",
        borderStrong: "#e7e0d8",
      };

  const textPrimary = isDark ? "#fafaf9" : palette.slate[900];
  const textSecondary = isDark ? "#a8a29e" : palette.slate[500];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: palette.orange[600],
        light: palette.orange[400],
        dark: palette.orange[700],
        contrastText: "#ffffff",
      },
      secondary: {
        main: palette.amber[500],
        light: palette.amber[400],
        dark: palette.amber[600],
      },
      success: { main: palette.emerald[500], light: palette.emerald[400], dark: palette.emerald[600] },
      warning: { main: palette.amber[500], light: palette.amber[400], dark: palette.amber[600] },
      error: { main: palette.rose[500], light: palette.rose[400], dark: palette.rose[600] },
      accent: {
        main: palette.orange[600],
        light: palette.orange[400],
        dark: palette.orange[700],
        contrastText: "#fff",
      },
      background: { default: surface.base, paper: surface.card },
      text: { primary: textPrimary, secondary: textSecondary },
      divider: surface.border,
      surface,
    },
    shape: { borderRadius: radius.md },
    spacing: spacingUnit,
    typography: {
      fontFamily,
      h1: { fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 },
      h2: { fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15 },
      h3: { fontWeight: 700, letterSpacing: "-0.02em" },
      h4: { fontWeight: 700, letterSpacing: "-0.02em" },
      h5: { fontWeight: 600, letterSpacing: "-0.01em" },
      h6: { fontWeight: 600, letterSpacing: "-0.01em" },
      subtitle1: { color: textSecondary },
      subtitle2: { color: textSecondary, fontWeight: 500 },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.6, color: textSecondary },
      button: { textTransform: "none", fontWeight: 600, letterSpacing: "0" },
      overline: { letterSpacing: "0.08em", fontWeight: 700, fontSize: "0.68rem" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "html, body, #root": {
            height: "100%",
            WebkitFontSmoothing: "antialiased",
          },
          html: {
            fontSize: "93.75%",
          },
          body: {
            backgroundColor: surface.base,
            overscrollBehaviorY: "none",
          },
          "*::-webkit-scrollbar": { width: 10, height: 10 },
          "*::-webkit-scrollbar-thumb": {
            background: surface.borderStrong,
            borderRadius: 8,
            border: `2px solid ${surface.base}`,
          },
          "*::-webkit-scrollbar-thumb:hover": { background: textSecondary },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${surface.border}`,
            borderRadius: radius.lg,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 18,
            paddingRight: 18,
            transition: "background-color .15s ease, border-color .15s ease, color .15s ease",
          },
          sizeLarge: { paddingTop: 12, paddingBottom: 12, fontSize: "0.975rem" },
          containedPrimary: {
            "&:hover": { backgroundColor: palette.orange[700] },
          },
          outlined: {
            borderColor: surface.borderStrong,
            color: textPrimary,
            "&:hover": { borderColor: textSecondary, backgroundColor: surface.subtle },
          },
          text: {
            "&:hover": { backgroundColor: surface.subtle },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: radius.sm, fontWeight: 600 },
          outlined: { borderColor: surface.border },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 8, borderRadius: 999, backgroundColor: isDark ? surface.border : palette.orange[50] },
          bar: { borderRadius: 999 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? palette.slate[700] : palette.slate[900],
            fontSize: "0.75rem",
            borderRadius: radius.sm,
            fontWeight: 500,
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: surface.border } },
      },
    },
  });
}

export function cardShadow(theme: Theme): string {
  return theme.palette.mode === "dark"
    ? "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -16px rgba(0,0,0,0.6)"
    : "0 1px 2px rgba(120,53,15,0.04), 0 4px 16px -8px rgba(120,53,15,0.08)";
}
