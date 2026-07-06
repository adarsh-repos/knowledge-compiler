import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { OnboardingOptions, UserProfile } from "@/data/types";

interface ProfileState {
  profile: UserProfile | null;
  options: OnboardingOptions | null;
  status: "idle" | "loading" | "ready" | "error";
  onboardingComplete: boolean;
}

const initialState: ProfileState = {
  profile: null,
  options: null,
  status: "idle",
  onboardingComplete: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    loadProfile(state) {
      state.status = "loading";
    },
    loadProfileSuccess(
      state,
      action: PayloadAction<{ profile: UserProfile; options: OnboardingOptions }>,
    ) {
      state.status = "ready";
      state.profile = action.payload.profile;
      state.options = action.payload.options;
    },
    loadProfileError(state) {
      state.status = "error";
    },
    saveProfile(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
      state.onboardingComplete = true;
    },
  },
});

export const {
  loadProfile,
  loadProfileSuccess,
  loadProfileError,
  saveProfile,
} = profileSlice.actions;
export default profileSlice.reducer;
