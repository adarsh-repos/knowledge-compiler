import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DashboardData } from "@/data/types";

interface DashboardState {
  data: DashboardData | null;
  status: "idle" | "loading" | "ready" | "error";
}

const initialState: DashboardState = {
  data: null,
  status: "idle",
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    loadDashboard(state) {
      state.status = "loading";
    },
    loadDashboardSuccess(state, action: PayloadAction<DashboardData>) {
      state.status = "ready";
      state.data = action.payload;
    },
    loadDashboardError(state) {
      state.status = "error";
    },
    toggleEvent(state, action: PayloadAction<string>) {
      if (!state.data) return;
      const ev = state.data.todayEvents.find((e) => e.id === action.payload);
      if (ev) ev.completed = !ev.completed;
      const done = state.data.todayEvents.filter((e) => e.completed).length;
      state.data.journey.eventsCompletedToday = done;
    },
  },
});

export const { loadDashboard, loadDashboardSuccess, loadDashboardError, toggleEvent } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
