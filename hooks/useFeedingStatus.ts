import { useBoxStore } from "@/store";

const DAY_MS = 24 * 60 * 60 * 1000;

// whole days without a feeding before the status turns yellow / red; the
// same in Auto and Manual
export const LATE_AFTER_DAYS = 3;
export const OVERDUE_AFTER_DAYS = 4;

export type FeedingStatus = "ok" | "late" | "overdue";

const dayIndex = (time: number) =>
  Math.round(new Date(time).setHours(0, 0, 0, 0) / DAY_MS);

// whole days since the last feeding, null when there is none yet
export function daysSinceFeeding(history: string[], now = Date.now()) {
  if (!history.length) return null;

  return dayIndex(now) - dayIndex(Date.parse(history[history.length - 1]));
}

export function feedingStatus(
  history: string[],
  now = Date.now(),
): FeedingStatus {
  const days = daysSinceFeeding(history, now);

  // never fed at all counts as a missed watering
  if (days === null || days >= OVERDUE_AFTER_DAYS) return "overdue";
  if (days >= LATE_AFTER_DAYS) return "late";

  return "ok";
}

export function useFeedingStatus() {
  const history = useBoxStore((state) => state.feeding.history);

  return {
    status: feedingStatus(history),
    daysSince: daysSinceFeeding(history),
  };
}
