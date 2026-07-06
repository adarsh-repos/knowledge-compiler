import { IconButton, Tooltip } from "@mui/material";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import { useColorMode } from "@/theme/ColorModeProvider";

export function ModeToggle() {
  const { mode, toggleMode } = useColorMode();
  return (
    <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
      <IconButton
        onClick={toggleMode}
        size="small"
        aria-label="Toggle color mode"
        sx={{ color: "text.secondary" }}
      >
        {mode === "dark" ? (
          <LightModeRoundedIcon fontSize="small" />
        ) : (
          <DarkModeRoundedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
