/** Target prelims dates per batch — update when official notification drops. */
export const EXAM_DATES = {
  "BPSC 2027": new Date("2027-06-15T09:00:00+05:30"),
  "BPSC 2028": new Date("2028-06-10T09:00:00+05:30"),
} as const;

export type ExamBatch = keyof typeof EXAM_DATES;
