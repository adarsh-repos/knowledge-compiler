import { useEffect, useRef, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import type { NavigatorMessage } from "@/data/types";
import { loadThread, sendMessage } from "../state/navigatorSlice";

const SUGGESTIONS = [
  "Explain Article 19 exceptions",
  "Plan my week",
  "Quiz me on Polity",
];

export function NavigatorPage() {
  const dispatch = useAppDispatch();
  const { messages, status, replying } = useAppSelector((s) => s.navigator);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "idle") dispatch(loadThread());
  }, [dispatch, status]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, replying]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    dispatch(sendMessage(t));
    setDraft("");
  };

  return (
    <PageContainer maxWidth={860}>
      <SectionCard
        pad="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100dvh - 170px)",
          minHeight: 480,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pb: 1.5, borderBottom: (t) => `1px solid ${t.palette.divider}` }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: (t) =>
                  `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700 }}>AI Mentor</Typography>
              <Typography variant="caption" color="text.secondary">
                Always here, always proactive
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            variant="outlined"
            label="Context: Polity Study Block"
            sx={{ color: "text.secondary", display: { xs: "none", sm: "inline-flex" } }}
          />
        </Stack>

        {/* Thread */}
        <Box sx={{ flex: 1, overflowY: "auto", py: 2.5, px: { xs: 0, sm: 1 } }}>
          <Stack spacing={2.5}>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onAction={(a) => send(a)} />
            ))}
            {replying && (
              <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                Mentor is typing…
              </Typography>
            )}
            <div ref={endRef} />
          </Stack>
        </Box>

        {/* Suggestions */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 1.5 }}>
          {SUGGESTIONS.map((s) => (
            <Chip
              key={s}
              label={s}
              variant="outlined"
              onClick={() => send(s)}
              sx={{ cursor: "pointer", "&:hover": { borderColor: "primary.main", color: "primary.main" } }}
            />
          ))}
        </Stack>

        {/* Input */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: (t) => t.palette.surface.subtle,
            "&:focus-within": { borderColor: "primary.main" },
          }}
        >
          <InputBase
            fullWidth
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(draft)}
            placeholder="Ask your mentor to explain, plan, or quiz you…"
            sx={{ py: 1, fontSize: "0.95rem" }}
          />
          <IconButton
            color="primary"
            onClick={() => send(draft)}
            disabled={!draft.trim()}
            aria-label="Send"
            sx={{
              bgcolor: "primary.main",
              color: "#fff",
              "&:hover": { bgcolor: "primary.dark" },
              "&.Mui-disabled": { bgcolor: (t) => t.palette.surface.border, color: "text.secondary" },
            }}
          >
            <ArrowUpwardRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </SectionCard>
    </PageContainer>
  );
}

function MessageBubble({
  message,
  onAction,
}: {
  message: NavigatorMessage;
  onAction: (label: string) => void;
}) {
  const isNavigator = message.author === "navigator";
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      sx={{
        display: "flex",
        justifyContent: isNavigator ? "flex-start" : "flex-end",
      }}
    >
      <Box sx={{ maxWidth: "82%" }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 3,
            border: (t) => (isNavigator ? `1px solid ${t.palette.divider}` : "none"),
            bgcolor: (t) => (isNavigator ? t.palette.surface.subtle : t.palette.primary.main),
            color: isNavigator ? "text.primary" : "primary.contrastText",
            borderTopLeftRadius: isNavigator ? 6 : undefined,
            borderTopRightRadius: isNavigator ? undefined : 6,
          }}
        >
          <Typography variant="body2" sx={{ color: "inherit", lineHeight: 1.6 }}>
            {message.text}
          </Typography>
        </Box>

        {message.prompt && (
          <SectionCard sx={{ mt: 1.5 }} pad="sm">
            <Typography variant="body2" sx={{ mb: 1.5, color: "text.primary" }}>
              {message.prompt}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              {message.actions?.map((a) => (
                <Chip
                  key={a.id}
                  label={a.label}
                  onClick={() => onAction(a.label)}
                  color={a.variant === "primary" ? "primary" : "default"}
                  variant={a.variant === "primary" ? "filled" : "outlined"}
                  sx={{ cursor: "pointer" }}
                />
              ))}
            </Stack>
          </SectionCard>
        )}

        {!message.prompt && message.actions && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
            {message.actions.map((a) => (
              <Chip
                key={a.id}
                label={a.label}
                onClick={() => onAction(a.label)}
                color={a.variant === "primary" ? "primary" : "default"}
                variant={a.variant === "primary" ? "filled" : "outlined"}
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
