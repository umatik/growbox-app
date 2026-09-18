export interface FloweringProgress {
  currentWeek: number;
  progress: number;
}

const HOURS_PER_WEEK = 7 * 24;
const TOTAL_WEEKS = 10;
const HOUR_MS = 3_600_000;

export function calculateFloweringProgress(
  startDate: string | null,
  now = new Date(),
): FloweringProgress {
  if (!startDate) {
    return {
      currentWeek: 1,
      progress: 0,
    };
  }

  const [year, month, day] = startDate.split("-").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return {
      currentWeek: 1,
      progress: 0,
    };
  }

  const start = new Date(year, month - 1, day);
  start.setHours(0, 0, 0, 0);

  const elapsedHours = Math.max(0, (now.getTime() - start.getTime()) / HOUR_MS);

  const currentWeek = Math.min(
    Math.floor(elapsedHours / HOURS_PER_WEEK) + 1,
    TOTAL_WEEKS,
  );

  const hoursInCurrentWeek = elapsedHours % HOURS_PER_WEEK;

  const progress =
    currentWeek === TOTAL_WEEKS && elapsedHours >= TOTAL_WEEKS * HOURS_PER_WEEK
      ? 100
      : Math.round((hoursInCurrentWeek / HOURS_PER_WEEK) * 100);

  return {
    currentWeek,
    progress,
  };
}
