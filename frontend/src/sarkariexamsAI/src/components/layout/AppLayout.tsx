import { useState } from "react";
import { Box, Drawer } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Sidebar, SIDEBAR_WIDTH } from "./Sidebar";
import { TopBar } from "./TopBar";

/**
 * Web app shell: a persistent left sidebar (collapsing into a drawer on small
 * screens) plus a sticky top bar, with the routed screen rendered in a scroll
 * area. Built for desktop-first clarity.
 */
export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      {/* Permanent sidebar on large screens */}
      <Box
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          display: { xs: "none", lg: "block" },
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 30,
        }}
      >
        <Sidebar />
      </Box>

      {/* Drawer sidebar on small screens */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            border: "none",
            backgroundImage: "none",
          },
        }}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      {/* Content column */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          ml: { lg: `${SIDEBAR_WIDTH}px` },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <Box component="main" sx={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
