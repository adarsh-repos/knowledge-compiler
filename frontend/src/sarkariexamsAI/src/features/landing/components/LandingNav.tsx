import { Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { ModeToggle } from "@/components/ui/ModeToggle";

const NAV_LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
];

interface LandingNavProps {
  onSignup: () => void;
  onLogin: () => void;
}

export function LandingNav({ onSignup, onLogin }: LandingNavProps) {
  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        bgcolor: (t) =>
          t.palette.mode === "dark" ? "rgba(11,14,20,0.96)" : "rgba(255,255,255,0.96)",
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 0.75, minHeight: { xs: 56, md: 64 } }}>
          <Typography
            component="a"
            href="#"
            variant="subtitle1"
            sx={{
              flexGrow: 1,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              textDecoration: "none",
              color: "text.primary",
            }}
          >
            SarkariExams
            <Box component="span" sx={{ color: "primary.main" }}>
              AI
            </Box>
          </Typography>

          <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center">
            {NAV_LINKS.map((link) => (
              <Button
                key={link.href}
                size="small"
                href={link.href}
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  color: "text.secondary",
                  fontWeight: 600,
                  fontSize: "0.84rem",
                  "&:hover": { color: "text.primary", bgcolor: "transparent" },
                }}
              >
                {link.label}
              </Button>
            ))}
            <ModeToggle />
            <Button
              variant="outlined"
              size="small"
              onClick={onLogin}
              sx={{ display: { xs: "none", sm: "inline-flex" }, fontWeight: 600 }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={onSignup}
              sx={{
                fontWeight: 700,
                px: { xs: 1.5, sm: 2 },
              }}
            >
              Start Free
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </Box>
  );
}
