import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";
import { motion } from "framer-motion";
import { SectionCard } from "@/components/ui/SectionCard";
import { palette } from "@/theme/tokens";

interface SignupCTAProps {
  onSignup: () => void;
}

export function SignupCTA({ onSignup }: SignupCTAProps) {
  return (
    <Box id="signup" component="section" sx={{ py: { xs: 5, md: 8 } }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <SectionCard
          glow
          pad="sm"
          sx={{
            textAlign: "center",
            py: { xs: 4, md: 5 },
            background: (t) =>
              t.palette.mode === "dark"
                ? `linear-gradient(135deg, ${t.palette.primary.main}18, transparent)`
                : `linear-gradient(135deg, ${palette.orange[50]}, #fff)`,
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "1.4rem", md: "1.85rem" },
              fontWeight: 800,
              maxWidth: "20ch",
              mx: "auto",
              lineHeight: 1.2,
              mb: 1,
            }}
          >
            Aaj se shuru karo —{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              free.
            </Box>
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2.5, maxWidth: "36ch", mx: "auto", lineHeight: 1.6, fontSize: "0.9rem" }}
          >
            Signup → dashboard → Aaj ka Plan. 30 second mein ready.
          </Typography>

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<PhoneAndroidRoundedIcon />}
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={onSignup}
            sx={{
              maxWidth: 320,
              mx: "auto",
              display: "flex",
              px: 3,
              py: 1.25,
              borderRadius: 10,
              fontSize: "0.92rem",
              fontWeight: 700,
              boxShadow: (t) => `0 8px 28px ${t.palette.primary.main}45`,
            }}
          >
            Sign Up — Free
          </Button>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
            {["No payment", "OTP in 30 sec"].map((item) => (
              <Typography key={item} variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                · {item}
              </Typography>
            ))}
          </Stack>
        </SectionCard>
      </Box>
    </Box>
  );
}
