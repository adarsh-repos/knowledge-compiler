import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchNavigatorThread,
  generateNavigatorReply,
} from "@/data/mockApi";
import type { NavigatorMessage } from "@/data/types";
import {
  loadThread,
  loadThreadSuccess,
  loadThreadError,
  sendMessage,
  receiveReply,
} from "./navigatorSlice";

function* handleLoadThread() {
  try {
    const messages: NavigatorMessage[] = yield call(fetchNavigatorThread);
    yield put(loadThreadSuccess(messages));
  } catch {
    yield put(loadThreadError());
  }
}

function* handleSendMessage(action: PayloadAction<NavigatorMessage>) {
  const reply: NavigatorMessage = yield call(
    generateNavigatorReply,
    action.payload.text,
  );
  yield put(receiveReply(reply));
}

export function* navigatorSaga() {
  yield takeLatest(loadThread.type, handleLoadThread);
  yield takeLatest(sendMessage.type, handleSendMessage);
}
