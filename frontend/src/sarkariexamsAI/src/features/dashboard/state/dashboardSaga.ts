import { call, put, takeLatest } from "redux-saga/effects";
import { fetchDashboard } from "@/data/mockApi";
import type { DashboardData } from "@/data/types";
import {
  loadDashboard,
  loadDashboardSuccess,
  loadDashboardError,
} from "./dashboardSlice";

function* handleLoadDashboard() {
  try {
    const data: DashboardData = yield call(fetchDashboard);
    yield put(loadDashboardSuccess(data));
  } catch {
    yield put(loadDashboardError());
  }
}

export function* dashboardSaga() {
  yield takeLatest(loadDashboard.type, handleLoadDashboard);
}
