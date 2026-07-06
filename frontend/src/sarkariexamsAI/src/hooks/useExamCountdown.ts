import { useEffect, useState } from "react";
import type { ExamBatch } from "@/constants/examDates";
import { EXAM_DATES } from "@/constants/examDates";

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isPast: boolean;
}

function getParts(target: Date, now: Date): CountdownParts {
  const totalMs = target.getTime() - now.getTime();
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isPast: true };
  }

  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);

  return { days, hours, minutes, seconds, totalMs, isPast: false };
}

/** Marketing urgency line — shifts tone as the exam approaches. */
export function getUrgencyLine(days: number): string {
  if (days > 365) return "Foundation ka golden window — pehle shuru, zyada cover";
  if (days > 180) return "6 mahine ka head start — top rankers yahi karte hain";
  if (days > 90) return "Har din count hota hai — aaj se plan lock karo";
  if (days > 30) return "Seats filling fast — late join = catch-up mode";
  if (days > 7) return "Final countdown — roz ka plan ab mandatory hai";
  return "Exam kareeb — abhi join karo, kal late feel hoga";
}

export function useExamCountdown(batch: ExamBatch) {
  const target = EXAM_DATES[batch];

  const [parts, setParts] = useState(() => getParts(target, new Date()));

  useEffect(() => {
    setParts(getParts(target, new Date()));
    const id = window.setInterval(() => {
      setParts(getParts(target, new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return {
    ...parts,
    urgencyLine: getUrgencyLine(parts.days),
    examLabel: batch,
  };
}
