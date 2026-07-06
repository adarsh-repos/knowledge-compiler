import { call, put, takeLatest } from "redux-saga/effects";
import { fetchPracticeSession } from "@/data/mockApi";
import type { PracticeSession } from "@/data/types";
import {
  loadQuestions,
  loadSessionSuccess,
  loadQuestionsError,
} from "./practiceSlice";

function* handleLoadQuestions() {
  try {
    const session: PracticeSession = yield call(fetchPracticeSession);
    yield put(loadSessionSuccess(session));
  } catch {
    yield put(loadQuestionsError());
  }
}

export function* practiceSaga() {
  yield takeLatest(loadQuestions.type, handleLoadQuestions);
}
