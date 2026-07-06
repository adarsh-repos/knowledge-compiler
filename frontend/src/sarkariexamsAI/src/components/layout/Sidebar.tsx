import { Box, Button, Stack, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { navSections } from "./navConfig";
import { useAppSelector } from "@/app/hooks";

export const SIDEBAR_WIDTH = 264;

interface SidebarProps {
  onNavigate?: () => void;
}

/** Persistent left navigation rail — the spine of the web app. */
export function Sidebar({ onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const profile = useAppSelector((s) => s.profile.profile);

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <Stack
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        overflow: "hidden",
        bgcolor: "background.paper",
        borderRight: (t) => `1px solid ${t.palette.divider}`,
        px: 1.5,
        py: 1.75,
      }}
    >
      {/* Brand */}
      <Box
        sx={{ px: 0.75, mb: 1.75, flexShrink: 0, cursor: "pointer" }}
        onClick={() => go("/dashboard")}
      >
        <Typography sx={{ fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, fontSize: "0.88rem" }}>
          SarkariExams
          <Box component="span" sx={{ color: "primary.main" }}>
            AI
          </Box>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
          Study OS
        </Typography>
      </Box>

      {/* Nav sections */}
      <Stack spacing={1.1} sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {navSections.map((section) => (
          <Box key={section.title}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ px: 1.25, mb: 0.25, display: "block", fontSize: "0.62rem", lineHeight: 1.4 }}
            >
              {section.title}
            </Typography>
            <Stack spacing={0.25}>
              {section.items.map((item) => {
                const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
                return (
                  <Stack
                    key={item.path}
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    role="button"
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => go(item.path)}
                    sx={{
                      px: 1.25,
                      py: 0.65,
                      borderRadius: 2,
                      cursor: "pointer",
                      position: "relative",
                      color: active ? "primary.main" : "text.secondary",
                      bgcolor: (t) =>
                        active
                          ? t.palette.mode === "dark"
                            ? `${t.palette.primary.main}1f`
                            : t.palette.surface.subtle
                          : "transparent",
                      fontWeight: active ? 700 : 500,
                      transition: "background-color .15s ease, color .15s ease",
                      "&:hover": {
                        color: active ? "primary.main" : "text.primary",
                        bgcolor: (t) => (active ? undefined : t.palette.surface.subtle),
                      },
                      "& svg": { fontSize: 18 },
                    }}
                  >
                    {active && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: "22%",
                          bottom: "22%",
                          width: 3,
                          borderRadius: 999,
                          bgcolor: "primary.main",
                        }}
                      />
                    )}
                    {item.icon}
                    <Typography sx={{ fontWeight: "inherit", fontSize: "0.84rem" }}>
                      {item.label}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Stack>

      {/* Bottom — upgrade, footer, user */}
      <Stack spacing={1.25} sx={{ flexShrink: 0, mt: 1.25 }}>
        {/* Upgrade strip */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            px: 1.25,
            py: 0.85,
            borderRadius: 2.5,
            color: "#fff",
            background: (t) =>
              `linear-gradient(150deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
          }}
        >
          <WorkspacePremiumRoundedIcon sx={{ fontSize: 17, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.76rem", lineHeight: 1.2 }}>
              Upgrade to Pro
            </Typography>
            <Typography sx={{ opacity: 0.85, fontSize: "0.64rem", lineHeight: 1.2 }}>
              Unlimited mocks & analytics
            </Typography>
          </Box>
          <Button
            size="small"
            sx={{
              flexShrink: 0,
              minWidth: 0,
              px: 1.1,
              py: 0.25,
              fontSize: "0.7rem",
              lineHeight: 1.4,
              bgcolor: "#fff",
              color: "primary.dark",
              fontWeight: 700,
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
            }}
          >
            Upgrade
          </Button>
        </Stack>

        <Stack spacing={0}>
          <FooterLink icon={<SettingsRoundedIcon />} label="Settings" />
          <FooterLink icon={<HelpOutlineRoundedIcon />} label="Help & Support" />
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            pt: 1.25,
            borderTop: (t) => `1px solid ${t.palette.divider}`,
            px: 0.25,
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: (t) => t.palette.surface.subtle,
              color: "primary.main",
              fontWeight: 700,
              fontSize: "0.78rem",
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            {(profile?.name ?? "A").charAt(0).toUpperCase()}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.8rem", lineHeight: 1.2 }} noWrap>
              {profile?.name ?? "Aspirant"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: "0.68rem" }}>
              {profile ? `${profile.targetExam} • ${profile.targetPost}` : "Free plan"}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
}

function FooterLink({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      role="button"
      sx={{
        px: 1.25,
        py: 0.55,
        borderRadius: 2,
        cursor: "pointer",
        color: "text.secondary",
        "&:hover": { color: "text.primary", bgcolor: (t) => t.palette.surface.subtle },
        "& svg": { fontSize: 17 },
      }}
    >
      {icon}
      <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{label}</Typography>
    </Stack>
  );
}
