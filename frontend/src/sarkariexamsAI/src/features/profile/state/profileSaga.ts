import { call, put, takeLatest, all } from "redux-saga/effects";
import { fetchProfile, fetchOnboardingOptions } from "@/data/mockApi";
import type { OnboardingOptions, UserProfile } from "@/data/types";
import { loadProfile, loadProfileSuccess, loadProfileError } from "./profileSlice";

function* handleLoadProfile() {
  try {
    const [profile, options]: [UserProfile, OnboardingOptions] = yield all([
      call(fetchProfile),
      call(fetchOnboardingOptions),
    ]);
    yield put(loadProfileSuccess({ profile, options }));
  } catch {
    yield put(loadProfileError());
  }
}

export function* profileSaga() {
  yield takeLatest(loadProfile.type, handleLoadProfile);
}
