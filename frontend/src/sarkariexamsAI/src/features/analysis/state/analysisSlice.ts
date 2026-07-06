import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AnalysisResult } from "@/data/types";

interface AnalysisState {
  result: AnalysisResult | null;
  status: "idle" | "loading" | "ready" | "error";
}

const initialState: AnalysisState = { result: null, status: "idle" };

const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    loadAnalysis(state) {
      state.status = "loading";
    },
    loadAnalysisSuccess(state, action: PayloadAction<AnalysisResult>) {
      state.status = "ready";
      state.result = action.payload;
    },
    loadAnalysisError(state) {
      state.status = "error";
    },
  },
});

export const { loadAnalysis, loadAnalysisSuccess, loadAnalysisError } =
  analysisSlice.actions;
export default analysisSlice.reducer;
