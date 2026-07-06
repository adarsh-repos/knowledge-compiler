import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  PracticeQuestion,
  PracticeResult,
  PracticeSession,
} from "@/data/types";

interface PracticeState {
  title: string;
  questions: PracticeQuestion[];
  durationSeconds: number;
  secondsLeft: number;
  currentIndex: number;
  answers: Record<string, string | null>; // questionId -> selected option id
  marked: Record<string, boolean>; // questionId -> flagged for review
  visited: Record<string, boolean>; // questionId -> has been viewed
  submitted: boolean;
  result: PracticeResult | null;
  status: "idle" | "loading" | "ready" | "error";
}

const initialState: PracticeState = {
  title: "",
  questions: [],
  durationSeconds: 0,
  secondsLeft: 0,
  currentIndex: 0,
  answers: {},
  marked: {},
  visited: {},
  submitted: false,
  result: null,
  status: "idle",
};

function currentId(state: PracticeState): string | undefined {
  return state.questions[state.currentIndex]?.id;
}

function computeResult(state: PracticeState): PracticeResult {
  let correct = 0;
  let wrong = 0;
  let unattempted = 0;
  let score = 0;
  let maxScore = 0;

  for (const q of state.questions) {
    maxScore += q.marks;
    const ans = state.answers[q.id];
    if (!ans) {
      unattempted += 1;
    } else if (ans === q.correctOptionId) {
      correct += 1;
      score += q.marks;
    } else {
      wrong += 1;
      score -= q.negativeMarks;
    }
  }

  const attempted = correct + wrong;
  return {
    correct,
    wrong,
    unattempted,
    score: Math.round(score * 100) / 100,
    maxScore,
    accuracyPercent: attempted ? Math.round((correct / attempted) * 100) : 0,
    timeTakenSeconds: state.durationSeconds - state.secondsLeft,
  };
}

const practiceSlice = createSlice({
  name: "practice",
  initialState,
  reducers: {
    loadQuestions(state) {
      state.status = "loading";
    },
    loadSessionSuccess(state, action: PayloadAction<PracticeSession>) {
      const { title, durationSeconds, questions } = action.payload;
      state.status = "ready";
      state.title = title;
      state.questions = questions;
      state.durationSeconds = durationSeconds;
      state.secondsLeft = durationSeconds;
      state.currentIndex = 0;
      state.answers = {};
      state.marked = {};
      state.visited = questions[0] ? { [questions[0].id]: true } : {};
      state.submitted = false;
      state.result = null;
    },
    loadQuestionsError(state) {
      state.status = "error";
    },
    selectOption(state, action: PayloadAction<string>) {
      const id = currentId(state);
      if (id && !state.submitted) state.answers[id] = action.payload;
    },
    clearAnswer(state) {
      const id = currentId(state);
      if (id && !state.submitted) state.answers[id] = null;
    },
    toggleMark(state) {
      const id = currentId(state);
      if (id && !state.submitted) state.marked[id] = !state.marked[id];
    },
    goToQuestion(state, action: PayloadAction<number>) {
      const i = action.payload;
      if (i >= 0 && i < state.questions.length) {
        state.currentIndex = i;
        const id = state.questions[i].id;
        state.visited[id] = true;
      }
    },
    nextQuestion(state) {
      if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex += 1;
        state.visited[state.questions[state.currentIndex].id] = true;
      }
    },
    prevQuestion(state) {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        state.visited[state.questions[state.currentIndex].id] = true;
      }
    },
    tick(state) {
      if (state.submitted || state.status !== "ready") return;
      if (state.secondsLeft > 0) {
        state.secondsLeft -= 1;
        if (state.secondsLeft === 0) {
          state.result = computeResult(state);
          state.submitted = true;
        }
      }
    },
    submitTest(state) {
      if (state.submitted) return;
      state.result = computeResult(state);
      state.submitted = true;
    },
  },
});

export const {
  loadQuestions,
  loadSessionSuccess,
  loadQuestionsError,
  selectOption,
  clearAnswer,
  toggleMark,
  goToQuestion,
  nextQuestion,
  prevQuestion,
  tick,
  submitTest,
} = practiceSlice.actions;
export default practiceSlice.reducer;
