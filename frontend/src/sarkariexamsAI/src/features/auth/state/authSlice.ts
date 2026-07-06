import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "sxai-auth";

interface AuthState {
  isAuthenticated: boolean;
  phone: string | null;
}

function loadAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthState;
  } catch {
    /* ignore */
  }
  return { isAuthenticated: false, phone: null };
}

function persistAuth(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initialState: AuthState = loadAuth();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<string>) {
      state.isAuthenticated = true;
      state.phone = action.payload;
      persistAuth(state);
    },
    signOut(state) {
      state.isAuthenticated = false;
      state.phone = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
