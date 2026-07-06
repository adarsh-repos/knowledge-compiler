import { call, put, takeLatest } from "redux-saga/effects";
import { fetchConcepts } from "@/data/mockApi";
import type { Concept } from "@/data/types";
import { loadConcepts, loadConceptsSuccess, loadConceptsError } from "./learnSlice";

function* handleLoadConcepts() {
  try {
    const concepts: Concept[] = yield call(fetchConcepts);
    yield put(loadConceptsSuccess(concepts));
  } catch {
    yield put(loadConceptsError());
  }
}

export function* learnSaga() {
  yield takeLatest(loadConcepts.type, handleLoadConcepts);
}
