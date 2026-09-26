import { useEffect, useRef, useState } from "react";
import { EnvironmentRow } from "@box-controller/shared/interfaces/esp.interface";
import { useBoxControllerContext } from "@/context/BoxControllerContext";

// the ESP logs every 2 min and returns max 500 rows per request (~7 s),
// so a week is fetched as every 10th row: 500 points, one per 20 min
const HISTORY_LIMIT = 500;
const HISTORY_STEP = 10;
const POINT_MS = 20 * 60 * 1000;
const RANGE_MS = 7 * 24 * 60 * 60 * 1000;

// afterwards only the newest raw rows are pulled and thinned to POINT_MS
const REFRESH_LIMIT = 15;
const REFRESH_MS = POINT_MS;
const PAGE_PAUSE_MS = 1000;

export type EnvironmentStatus = "loading" | "ok" | "offline" | "error";

// "YYYY-MM-DD HH:MM:SS" in ESP local time, parsed by hand so no engine
// guesses the timezone
export function parseEspDate(value: string) {
  const [date, time] = value.split(" ");
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes, seconds] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
}

function appendThinned(current: EnvironmentRow[], incoming: EnvironmentRow[]) {
  const next = [...current];

  for (const row of incoming) {
    const last = next[next.length - 1];

    if (
      !last ||
      parseEspDate(row.datetime) - parseEspDate(last.datetime) >= POINT_MS
    ) {
      next.push(row);
    }
  }

  if (!next.length) return next;

  const cutoff = parseEspDate(next[next.length - 1].datetime) - RANGE_MS;

  return next.filter((row) => parseEspDate(row.datetime) >= cutoff);
}

export function useEnvironmentHistory() {
  const { fetchEnvironment } = useBoxControllerContext();

  const [rows, setRows] = useState<EnvironmentRow[]>([]);
  const [status, setStatus] = useState<EnvironmentStatus>("loading");
  const hasRows = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadWeek = async () => {
      let response = await fetchEnvironment(
        HISTORY_LIMIT,
        undefined,
        HISTORY_STEP,
      );

      if (cancelled) return;

      if (response.status === "offline") {
        setStatus("offline");
        return;
      }

      let collected = response.data;

      const publish = () => {
        const next = appendThinned([], collected);

        hasRows.current = next.length > 0;
        setRows(next);
        setStatus("ok");
      };

      publish();

      if (!collected.length) return;

      // firmware without `step` sends raw 2-min rows: page back through
      // the log until a week is covered, pausing so control calls get through
      const spacing =
        collected.length > 1
          ? parseEspDate(collected[1].datetime) -
            parseEspDate(collected[0].datetime)
          : POINT_MS;
      const newest = parseEspDate(collected[collected.length - 1].datetime);

      while (
        spacing < POINT_MS / 2 &&
        response.has_more &&
        response.next_before &&
        newest - parseEspDate(collected[0].datetime) < RANGE_MS
      ) {
        await new Promise((resolve) => setTimeout(resolve, PAGE_PAUSE_MS));

        if (cancelled) return;

        response = await fetchEnvironment(HISTORY_LIMIT, response.next_before);

        if (cancelled || response.status !== "ok") return;

        collected = [...response.data, ...collected];
        publish();
      }
    };

    const loadLatest = async () => {
      const response = await fetchEnvironment(REFRESH_LIMIT);

      if (cancelled || response.status !== "ok") return;

      setRows((current) => appendThinned(current, response.data));
    };

    const load = async (full: boolean) => {
      try {
        await (full ? loadWeek() : loadLatest());
      } catch {
        if (!cancelled) {
          // keep showing what we already have
          setStatus((current) => (current === "ok" ? current : "error"));
        }
      }
    };

    void load(true);

    const interval = setInterval(() => {
      // until the first full load succeeds, keep asking for the whole week
      void load(!hasRows.current);
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchEnvironment]);

  return { rows, status };
}
