import { call, put, takeLatest } from "redux-saga/effects";
import { fetchAnalysis } from "@/data/mockApi";
import type { AnalysisResult } from "@/data/types";
import {
  loadAnalysis,
  loadAnalysisSuccess,
  loadAnalysisError,
} from "./analysisSlice";

function* handleLoadAnalysis() {
  try {
    const result: AnalysisResult = yield call(fetchAnalysis);
    yield put(loadAnalysisSuccess(result));
  } catch {
    yield put(loadAnalysisError());
  }
}

export function* analysisSaga() {
  yield takeLatest(loadAnalysis.type, handleLoadAnalysis);
}
