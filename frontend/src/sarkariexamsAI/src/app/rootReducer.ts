import { combineReducers } from "@reduxjs/toolkit";
import dashboardReducer from "@/features/dashboard/state/dashboardSlice";
import learnReducer from "@/features/learn/state/learnSlice";
import practiceReducer from "@/features/practice/state/practiceSlice";
import analysisReducer from "@/features/analysis/state/analysisSlice";
import navigatorReducer from "@/features/navigator/state/navigatorSlice";
import profileReducer from "@/features/profile/state/profileSlice";
import authReducer from "@/features/auth/state/authSlice";

/**
 * Root reducer — each feature module owns its own slice and registers it here.
 * Keeping registration in one place keeps the modular boundaries explicit.
 */
export const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  learn: learnReducer,
  practice: practiceReducer,
  analysis: analysisReducer,
  navigator: navigatorReducer,
  profile: profileReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
