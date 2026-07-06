import { useMediaQuery, useTheme } from "@mui/material";

/** True below md breakpoint — landing mobile layouts. */
export function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("md"));
}
