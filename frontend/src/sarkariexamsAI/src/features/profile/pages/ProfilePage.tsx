import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { Pill } from "@/components/ui/Pill";
import { loadProfile, saveProfile } from "../state/profileSlice";

const STEPS = ["Goal Selection", "Diagnostic Test", "Custom Path"];

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { options, profile } = useAppSelector((s) => s.profile);

  const [exam, setExam] = useState("BPSC");
  const [post, setPost] = useState("DSP");
  const [commitment, setCommitment] = useState("3 Hours");

  useEffect(() => {
    dispatch(loadProfile());
  }, [dispatch]);

  const begin = () => {
    dispatch(
      saveProfile({
        name: profile?.name ?? "Adarsh",
        targetExam: exam,
        targetPost: post,
        dailyCommitmentHours: parseInt(commitment, 10) || 3,
        targetYear: profile?.targetYear ?? 2027,
      }),
    );
    navigate("/practice");
  };

  return (
    <PageContainer maxWidth={620}>
      {/* Brand */}
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 4 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            background: (t) =>
              `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
            color: "#fff",
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
          SarkariExams<Box component="span" sx={{ color: "primary.main" }}>AI</Box>
        </Typography>
      </Stack>

      {/* Stepper */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 4, flexWrap: "wrap" }}>
        {STEPS.map((label, i) => {
          const active = i === 1;
          const done = i === 0;
          return (
            <Stack key={label} direction="row" spacing={0.75} alignItems="center">
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: active ? "primary.main" : done ? "success.main" : "transparent",
                  color: active || done ? "#fff" : "text.secondary",
                  border: (t) =>
                    active || done ? "none" : `1px solid ${t.palette.divider}`,
                }}
              >
                {i + 1}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: active ? "text.primary" : "text.secondary",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>

      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Set up your target
      </Typography>
      <Typography variant="subtitle2" sx={{ mb: 4 }}>
        We use this once to build your roadmap, then keep it out of your way.
      </Typography>

      <Stack spacing={3.5}>
        <SelectBlock
          label="Target Exam"
          options={options?.exams ?? ["BPSC", "UPSC", "State PCS"]}
          value={exam}
          onChange={setExam}
        />
        <SelectBlock
          label="Target Post"
          options={options?.posts ?? ["DSP", "SDM", "IAS"]}
          value={post}
          onChange={setPost}
        />
        <SelectBlock
          label="Daily Commitment"
          options={options?.commitments ?? ["2 Hours", "3 Hours", "5+ Hours"]}
          value={commitment}
          onChange={setCommitment}
        />
      </Stack>

      {/* Diagnostic prompt */}
      <SectionCard glow pad="lg" sx={{ mt: 4, textAlign: "center" }}>
        <Pill>Build your base roadmap</Pill>
        <Typography variant="h6" sx={{ mt: 1.5, mb: 1 }}>
          Diagnostic Assessment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: "42ch", mx: "auto" }}>
          A 40-question curated assessment to map your current knowledge graph
          and eliminate subjects you already know.
        </Typography>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={begin}
        >
          Begin Assessment (40 Questions)
        </Button>
      </SectionCard>
    </PageContainer>
  );
}

function SelectBlock({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <Box
              key={opt}
              role="button"
              onClick={() => onChange(opt)}
              sx={{
                flex: { xs: "1 1 30%", sm: "0 0 auto" },
                minWidth: 92,
                textAlign: "center",
                px: 2.5,
                py: 1.5,
                borderRadius: 3,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.92rem",
                border: (t) =>
                  `1px solid ${selected ? t.palette.primary.main : t.palette.divider}`,
                bgcolor: (t) =>
                  selected ? `${t.palette.primary.main}1f` : "transparent",
                color: selected ? "primary.light" : "text.secondary",
                transition: "all .18s ease",
                "&:hover": { borderColor: "primary.main", color: "text.primary" },
              }}
            >
              {opt}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
