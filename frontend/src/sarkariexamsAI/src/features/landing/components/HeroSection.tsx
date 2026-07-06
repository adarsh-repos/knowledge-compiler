import { useState } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { motion } from "framer-motion";
import type { ExamBatch } from "@/constants/examDates";
import { DashboardPreview } from "./DashboardPreview";
import { DashboardPreviewMobile } from "./DashboardPreviewMobile";
import { ExamCountdownBadge } from "./ExamCountdownBadge";
import { palette } from "@/theme/tokens";
import { useIsMobile } from "@/hooks/useIsMobile";

const TRUST_ITEMS = [
  "Foundation phase from day 1",
  "Aaj ka Plan — 4 daily tasks",
  "NCERT step-by-step reading",
  "5 phases to Seat Selection",
  "Hindi-medium friendly",
  "Mocks refine your gaps later",
];

const BATCHES: ExamBatch[] = ["BPSC 2027", "BPSC 2028"];

interface HeroSectionProps {
  onSignup: () => void;
}

export function HeroSection({ onSignup }: HeroSectionProps) {
  const [batch, setBatch] = useState<ExamBatch>("BPSC 2027");
  const isMobile = useIsMobile();

  return (
    <Box
      component="section"
      aria-label="Hero"
      sx={{
        position: "relative",
        width: "100%",
        pt: { xs: 10, md: 13 },
        pb: { xs: 3, md: 6 },
        overflow: "hidden",
        bgcolor: (t) =>
          t.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : palette.orange[50],
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: (t) =>
            t.palette.mode === "dark"
              ? `linear-gradient(${t.palette.divider} 1px, transparent 1px), linear-gradient(90deg, ${t.palette.divider} 1px, transparent 1px)`
              : `linear-gradient(${paletteGrid(t)} 1px, transparent 1px), linear-gradient(90deg, ${paletteGrid(t)} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1.05fr" },
            gap: { xs: 4, lg: 6 },
            alignItems: "center",
          }}
        >
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            sx={{ pr: { lg: 2 } }}
          >
            <ExamCountdownBadge batch={batch} />

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "1.75rem", sm: "2.55rem", md: "3rem" },
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-0.035em",
                color: "text.primary",
                mb: { xs: 1.25, md: 2 },
              }}
            >
              Aaj kya padhein —{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                yeh clear ho jayega.
              </Box>
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.92rem", md: "1.08rem" },
                maxWidth: "50ch",
                mb: 2,
                lineHeight: 1.65,
              }}
            >
              {isMobile ? (
                <>
                  Foundation se NCERT, roz ke 4 kaam, aur weak areas ka fix — sab ek dashboard pe.
                </>
              ) : (
                <>
                  <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
                    Kal kya padhein? Aaj pata chal jayega.
                  </Box>{" "}
                  Foundation se NCERT, targeted practice, aur roz ke 4 kaam — mock ke baad jo gap
                  niklega, woh seedha Aaj ka Plan mein. Ek dashboard, poori journey.
                </>
              )}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 1,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "text.secondary",
                fontSize: "0.68rem",
              }}
            >
              SELECT YOUR BATCH
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
              {BATCHES.map((b) => (
                <Box
                  key={b}
                  component="button"
                  onClick={() => setBatch(b)}
                  sx={{
                    border: batch === b ? "none" : (t) => `1px solid ${t.palette.divider}`,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    px: 2,
                    py: 0.85,
                    borderRadius: 10,
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    transition: "all 0.2s",
                    bgcolor: batch === b ? "text.primary" : (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#fff"),
                    color: batch === b ? "background.default" : "text.secondary",
                    boxShadow: batch === b ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {b}
                </Box>
              ))}
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mb: { xs: 2, md: 2.5 } }}>
              <Button
                variant="contained"
                size="large"
                fullWidth={isMobile}
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={onSignup}
                sx={{
                  px: 3,
                  py: 1.35,
                  borderRadius: 10,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  boxShadow: (t) => `0 8px 28px ${t.palette.primary.main}45`,
                }}
              >
                Start {batch} — Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth={isMobile}
                startIcon={<PlayCircleOutlineRoundedIcon />}
                href="#how-it-works"
                sx={{
                  px: 2.5,
                  py: 1.35,
                  borderRadius: 10,
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                See how it works
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ gap: 1, display: { xs: "none", sm: "flex" } }}
            >
              <Stack direction="row" spacing={-0.5}>
                {["A", "R", "P", "S"].map((l) => (
                  <Box
                    key={l}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "2px solid",
                      borderColor: "background.default",
                      bgcolor: "primary.main",
                      color: "#fff",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {l}
                  </Box>
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.84rem" }}>
                <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
                  12,000+ aspirants
                </Box>{" "}
                preparing · No credit card
              </Typography>
            </Stack>
          </Box>

          {isMobile ? <DashboardPreviewMobile /> : <DashboardPreview />}
        </Box>

        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <TrustMarquee items={TRUST_ITEMS} />
        </Box>
      </Container>
    </Box>
  );
}

function paletteGrid(t: { palette: { mode: string; divider: string } }) {
  return t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.05)";
}

function TrustMarquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];

  return (
    <Box
      sx={{
        mt: { xs: 4, md: 5 },
        overflow: "hidden",
        py: 1.75,
        maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <Box
        component={motion.div}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        sx={{ display: "flex", width: "max-content", gap: 3.5 }}
      >
        {doubled.map((item, i) => (
          <Stack key={`${item}-${i}`} direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "primary.main" }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, whiteSpace: "nowrap", fontSize: "0.78rem" }}>
              {item}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}
