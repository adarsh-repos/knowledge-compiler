import { Box, Stack, Typography } from "@mui/material";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";
import FoundationRoundedIcon from "@mui/icons-material/FoundationRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { motion } from "framer-motion";
import { SectionCard } from "@/components/ui/SectionCard";
import { palette } from "@/theme/tokens";
import { useIsMobile } from "@/hooks/useIsMobile";

/** Matches real dashboard flow: signup → Foundation → daily events → phased growth */
const STEPS = [
  {
    step: "01",
    icon: <PhoneAndroidRoundedIcon />,
    title: "Sign up with mobile",
    desc: "Free OTP. Land on your dashboard in under a minute — Foundation phase already active.",
    mobileDesc: "Mobile OTP. Dashboard pe seedha land.",
    color: palette.orange[600],
  },
  {
    step: "02",
    icon: <FoundationRoundedIcon />,
    title: "Start Foundation phase",
    desc: "Aaj ka Plan ready with 4 tasks: NCERT padho, practice karo, topics jodein — guided from day 1.",
    mobileDesc: "Aaj ka Plan — 4 tasks ready.",
    color: palette.sky[600],
  },
  {
    step: "03",
    icon: <TaskAltRoundedIcon />,
    title: "Complete daily events",
    desc: "Each task links to Learn or Practice. Check off events, track progress — same as the real app.",
    mobileDesc: "Har task check karo, progress track karo.",
    color: palette.emerald[600],
  },
  {
    step: "04",
    icon: <TrendingUpRoundedIcon />,
    title: "Advance through phases",
    desc: "Foundation → Advanced → Practice → Revision → Seat Selection. Mocks refine gaps; system plans what's next.",
    mobileDesc: "Foundation se Selection tak ek raasta.",
    color: palette.amber[600],
  },
];

export function HowItWorksSection() {
  const isMobile = useIsMobile();

  return (
    <Box id="how-it-works" sx={{ py: { xs: 4, md: 12 } }}>
      <Stack alignItems="center" sx={{ mb: { xs: 3, md: 6 }, textAlign: "center", px: 0.5 }}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.12em", fontSize: { xs: "0.7rem", md: "inherit" } }}
        >
          How it works
        </Typography>
        <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: "1.4rem", md: "2.4rem" }, maxWidth: "28ch", lineHeight: 1.2 }}>
          Foundation se shuru.{" "}
          <Box component="span" sx={{ fontStyle: "italic", color: "primary.main" }}>
            Selection tak ek raasta.
          </Box>
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: { xs: 1, md: 2 }, maxWidth: "50ch", lineHeight: 1.65, fontSize: { xs: "0.88rem", md: "1rem" }, display: { xs: "none", sm: "block" } }}
        >
          Mock pehle nahi — pehle NCERT, practice, aur Aaj ka Plan. Yahi woh journey hai jo
          dashboard pe dikhti hai.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
          gap: { xs: 1.25, md: 2.5 },
          alignItems: "stretch",
        }}
      >
        {STEPS.map((s, i) => (
          <Box
            key={s.step}
            component={motion.div}
            initial={{ opacity: 0, y: isMobile ? 8 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={isMobile ? undefined : { y: -6, scale: 1.02 }}
            viewport={{ once: true, margin: "-8% 0px", amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            sx={{ height: "100%" }}
          >
            <SectionCard
              pad={isMobile ? "sm" : "lg"}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                p: isMobile ? 1.75 : undefined,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: s.color,
                },
              }}
            >
              {isMobile ? (
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      color: s.color,
                      bgcolor: `${s.color}18`,
                      flexShrink: 0,
                    }}
                  >
                    {s.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: s.color, mb: 0.25 }}>
                      Step {s.step}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", mb: 0.35, lineHeight: 1.3 }}>
                      {s.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, fontSize: "0.82rem" }}>
                      {s.mobileDesc}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <>
              {/* Icon + step — same row, aligned */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    color: s.color,
                    bgcolor: `${s.color}18`,
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.65rem", md: "1.85rem" },
                    lineHeight: 1,
                    color: s.color,
                    opacity: 0.35,
                    letterSpacing: "-0.04em",
                    userSelect: "none",
                  }}
                >
                  {s.step}
                </Typography>
              </Stack>

              <Typography
                variant="h6"
                sx={{
                  mb: 1.25,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  minHeight: { xs: "auto", lg: "2.7em" },
                }}
              >
                {s.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.7,
                  flex: 1,
                  fontSize: "0.88rem",
                  minHeight: { xs: "auto", lg: "6.8em" },
                }}
              >
                {s.desc}
              </Typography>
                </>
              )}
            </SectionCard>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
