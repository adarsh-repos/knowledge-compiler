import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Fab, Zoom } from "@mui/material";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";
import { useScrollTrigger } from "@mui/material";
import { useAppSelector } from "@/app/hooks";
import { LandingNav } from "../components/LandingNav";
import { HeroSection } from "../components/HeroSection";
import { SocialProofBar } from "../components/SocialProofBar";
import { ProblemSection } from "../components/ProblemSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { RootCauseSection } from "../components/RootCauseSection";
import { PrepJourneySection } from "../components/PrepJourneySection";
import { DifferentiationSection } from "../components/DifferentiationSection";
import { AssistantDemoSection } from "../components/AssistantDemoSection";
import { FeaturesShowcase } from "../components/FeaturesShowcase";
import { StatsSection } from "../components/StatsSection";
import { SignupCTA } from "../components/SignupCTA";
import { FAQSection } from "../components/FAQSection";
import { LandingFooter } from "../components/LandingFooter";
import { SignupModal } from "../components/SignupModal";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

/**
 * Landing page — conversion-optimised funnel:
 * Hero → Social proof → Problem → How it works → Features → Deep dives → CTA → FAQ
 */
export function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [signupOpen, setSignupOpen] = useState(false);

  const showFab = useScrollTrigger({ disableHysteresis: true, threshold: 500 });

  const openSignup = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
      return;
    }
    setSignupOpen(true);
  };

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      setSignupOpen(true);
    }
  };

  return (
    <SmoothScroll>
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default", overflowX: "hidden" }}>
      {/* Ambient gradients */}
      <Box
        aria-hidden
        sx={{
          position: "fixed",
          top: -180,
          left: "25%",
          width: 720,
          height: 720,
          borderRadius: "50%",
          background: (t) => `radial-gradient(circle, ${t.palette.primary.main}12 0%, transparent 68%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "fixed",
          bottom: -280,
          right: "-8%",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: (t) => `radial-gradient(circle, ${t.palette.secondary.main}0c 0%, transparent 68%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <LandingNav onSignup={openSignup} onLogin={handleLogin} />

      <HeroSection onSignup={openSignup} />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 3 } }}>
        <SocialProofBar />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesShowcase />

        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <RootCauseSection />
          <StatsSection />
          <PrepJourneySection />
          <DifferentiationSection />
          <AssistantDemoSection />
        </Box>

        <SignupCTA onSignup={openSignup} />
        <FAQSection />
        <LandingFooter />
      </Container>

      <SignupModal open={signupOpen} onClose={() => setSignupOpen(false)} />

      <Zoom in={showFab}>
        <Fab
          color="primary"
          aria-label="Sign up free"
          onClick={openSignup}
          sx={{
            position: "fixed",
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 10,
            boxShadow: (t) => `0 8px 24px ${t.palette.primary.main}50`,
          }}
        >
          <PhoneAndroidRoundedIcon />
        </Fab>
      </Zoom>
    </Box>
    </SmoothScroll>
  );
}
