import { useBoxStore } from "@/store";

const DAY_MS = 24 * 60 * 60 * 1000;
// rhythm is feed, feed, break: after two day-to-day feedings the next one
// is due on day 2; this many days without one is late / overdue
export interface FeedingThresholds {
  lateAfterDays: number;
  overdueAfterDays: number;
}

export const AUTO_THRESHOLDS: FeedingThresholds = {
  lateAfterDays: 2,
  overdueAfterDays: 4,
};

// Manual runs a weaker light and less airflow, so the pot dries out slower
// and a watering may come two days later before it counts as late
export const MANUAL_THRESHOLDS: FeedingThresholds = {
  lateAfterDays: 4,
  overdueAfterDays: 6,
};

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
  thresholds: FeedingThresholds,
  now = Date.now(),
): FeedingStatus {
  if (history.length < 2) return "ok";

  const last = dayIndex(Date.parse(history[history.length - 1]));
  const previous = dayIndex(Date.parse(history[history.length - 2]));

  if (last - previous !== 1) return "ok";

  const days = dayIndex(now) - last;

  if (days >= thresholds.overdueAfterDays) return "overdue";
  if (days >= thresholds.lateAfterDays) return "late";

  return "ok";
}

export function useFeedingStatus() {
  const history = useBoxStore((state) => state.feeding.history);
  const mode = useBoxStore((state) => state.mode);
  const thresholds = mode === "MANUAL" ? MANUAL_THRESHOLDS : AUTO_THRESHOLDS;

  return {
    status: feedingStatus(history, thresholds),
    daysSince: daysSinceFeeding(history),
  };
}
