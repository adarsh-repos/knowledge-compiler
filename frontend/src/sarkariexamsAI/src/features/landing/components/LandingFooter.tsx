import { Box, Stack, Typography } from "@mui/material";

const EXAM_LINKS = [
  { label: "BPSC Syllabus", href: "#features" },
  { label: "BPSC Previous Papers", href: "#features" },
  { label: "NCERT Books", href: "#how-it-works" },
  { label: "State PCS", href: "#features" },
];

const FEATURE_LINKS = [
  { label: "Daily Plan", href: "#how-it-works" },
  { label: "Mock Tests", href: "#features" },
  { label: "NCERT Reading", href: "#features" },
  { label: "Progress Analysis", href: "#features" },
];

export function LandingFooter() {
  return (
    <Box
      component="footer"
      sx={{
        pt: 6,
        pb: 4,
        borderTop: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr" },
          gap: 4,
          mb: 5,
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: "-0.02em", mb: 1.5 }}>
            SarkariExams
            <Box component="span" sx={{ color: "primary.main" }}>
              AI
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: "38ch", lineHeight: 1.7, fontSize: "0.88rem" }}>
            AI-powered BPSC preparation — mocks, NCERT reading, root cause analysis, and a clear daily plan for serious aspirants.
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: "0.85rem" }}>
            Exam Resources
          </Typography>
          <Stack spacing={1}>
            {EXAM_LINKS.map((link) => (
              <Typography
                key={link.label}
                component="a"
                href={link.href}
                variant="body2"
                color="text.secondary"
                sx={{
                  textDecoration: "none",
                  fontSize: "0.84rem",
                  "&:hover": { color: "primary.main" },
                }}
              >
                {link.label}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: "0.85rem" }}>
            Platform
          </Typography>
          <Stack spacing={1}>
            {FEATURE_LINKS.map((link) => (
              <Typography
                key={link.label}
                component="a"
                href={link.href}
                variant="body2"
                color="text.secondary"
                sx={{
                  textDecoration: "none",
                  fontSize: "0.84rem",
                  "&:hover": { color: "primary.main" },
                }}
              >
                {link.label}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ pt: 3, borderTop: (t) => `1px solid ${t.palette.divider}` }}
      >
        <Typography variant="caption" color="text.secondary">
          © 2026 SarkariExamsAI · Made in India 🇮🇳
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: { xs: "center", sm: "right" } }}>
          Independent AI study coach · Not affiliated with any government body
        </Typography>
      </Stack>
    </Box>
  );
}
