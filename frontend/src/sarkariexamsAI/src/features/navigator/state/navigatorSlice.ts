import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { NavigatorMessage } from "@/data/types";

interface NavigatorState {
  messages: NavigatorMessage[];
  status: "idle" | "loading" | "ready" | "error";
  replying: boolean;
}

const initialState: NavigatorState = {
  messages: [],
  status: "idle",
  replying: false,
};

const navigatorSlice = createSlice({
  name: "navigator",
  initialState,
  reducers: {
    loadThread(state) {
      state.status = "loading";
    },
    loadThreadSuccess(state, action: PayloadAction<NavigatorMessage[]>) {
      state.status = "ready";
      state.messages = action.payload;
    },
    loadThreadError(state) {
      state.status = "error";
    },
    sendMessage: {
      reducer(state, action: PayloadAction<NavigatorMessage>) {
        state.messages.push(action.payload);
        state.replying = true;
      },
      prepare(text: string) {
        return {
          payload: {
            id: `u-${Date.now()}`,
            author: "user" as const,
            text,
          },
        };
      },
    },
    receiveReply(state, action: PayloadAction<NavigatorMessage>) {
      state.messages.push(action.payload);
      state.replying = false;
    },
  },
});

export const {
  loadThread,
  loadThreadSuccess,
  loadThreadError,
  sendMessage,
  receiveReply,
} = navigatorSlice.actions;
export default navigatorSlice.reducer;
