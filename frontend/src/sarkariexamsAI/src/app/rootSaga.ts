import { all, fork } from "redux-saga/effects";
import { dashboardSaga } from "@/features/dashboard/state/dashboardSaga";
import { learnSaga } from "@/features/learn/state/learnSaga";
import { practiceSaga } from "@/features/practice/state/practiceSaga";
import { analysisSaga } from "@/features/analysis/state/analysisSaga";
import { navigatorSaga } from "@/features/navigator/state/navigatorSaga";
import { profileSaga } from "@/features/profile/state/profileSaga";

/**
 * Root saga — composes every feature's saga. Each feature exposes a single
 * watcher saga; we fork them all so side-effects stay isolated per module.
 */
export function* rootSaga() {
  yield all([
    fork(dashboardSaga),
    fork(learnSaga),
    fork(practiceSaga),
    fork(analysisSaga),
    fork(navigatorSaga),
    fork(profileSaga),
  ]);
}
