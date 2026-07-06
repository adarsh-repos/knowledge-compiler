import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Concept } from "@/data/types";

type LearnMode = "read" | "listen" | "ai";

interface LearnState {
  concepts: Concept[];
  currentIndex: number;
  mode: LearnMode;
  status: "idle" | "loading" | "ready" | "error";
}

const initialState: LearnState = {
  concepts: [],
  currentIndex: 0,
  mode: "read",
  status: "idle",
};

const learnSlice = createSlice({
  name: "learn",
  initialState,
  reducers: {
    loadConcepts(state) {
      state.status = "loading";
    },
    loadConceptsSuccess(state, action: PayloadAction<Concept[]>) {
      state.status = "ready";
      state.concepts = action.payload;
      state.currentIndex = 0;
    },
    loadConceptsError(state) {
      state.status = "error";
    },
    setMode(state, action: PayloadAction<LearnMode>) {
      state.mode = action.payload;
    },
    nextConcept(state) {
      if (state.currentIndex < state.concepts.length - 1) state.currentIndex += 1;
    },
  },
});

export const {
  loadConcepts,
  loadConceptsSuccess,
  loadConceptsError,
  setMode,
  nextConcept,
} = learnSlice.actions;
export default learnSlice.reducer;
