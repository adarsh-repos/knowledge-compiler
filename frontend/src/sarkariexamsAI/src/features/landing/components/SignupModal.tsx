import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "@/app/hooks";
import { signIn } from "@/features/auth/state/authSlice";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "phone" | "otp";

export function SignupModal({ open, onClose }: SignupModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSendOtp = () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setStep("otp");
  };

  const handleVerify = () => {
    if (otp.length < 4) {
      setError("Enter the OTP sent to your phone");
      return;
    }
    const cleaned = phone.replace(/\D/g, "");
    dispatch(signIn(cleaned));
    handleClose();
    navigate("/dashboard");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: "hidden" },
      }}
    >
      <Box
        sx={{
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.primary.main}18, ${t.palette.secondary.main}12)`,
          px: 3,
          pt: 3,
          pb: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {step === "phone" ? "Get Started" : "Verify OTP"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step === "phone"
                ? "Your personal AI study assistant awaits"
                : `Code sent to +91 ${phone.replace(/\D/g, "")}`}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} aria-label="Close">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ px: 3, pb: 3, pt: 2.5 }}>
        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <Box
              key="phone"
              component={motion.div}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.25 }}
            >
              <TextField
                fullWidth
                label="Mobile number"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError("");
                }}
                error={!!error}
                helperText={error}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <PhoneAndroidRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          +91
                        </Typography>
                      </Stack>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5 }}
              />
              <Button fullWidth variant="contained" size="large" onClick={handleSendOtp}>
                Send OTP
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, textAlign: "center" }}>
                By continuing, you agree to our Terms of Use and Privacy Policy
              </Typography>
            </Box>
          ) : (
            <Box
              key="otp"
              component={motion.div}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <TextField
                fullWidth
                label="Enter OTP"
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                error={!!error}
                helperText={error || "Demo: enter any 4+ digit code"}
                inputProps={{ style: { letterSpacing: "0.3em", fontSize: "1.2rem", textAlign: "center" } }}
                sx={{ mb: 2.5 }}
              />
              <Button fullWidth variant="contained" size="large" onClick={handleVerify}>
                Verify & Go to Dashboard
              </Button>
              <Button
                fullWidth
                size="small"
                sx={{ mt: 1.5 }}
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
              >
                Change number
              </Button>
            </Box>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
