import { useEffect, useState } from "react";
import { EnvironmentRow } from "@box-controller/shared/interfaces/esp.interface";
import { useBoxControllerContext } from "@/context/BoxControllerContext";
import {
  getNewestDatetime,
  getRowsSince,
  insertRows,
} from "@/store/environmentDb";

// history lives in a local SQLite copy of the ESP log; the ESP is only asked
// for rows newer than the newest stored one (max 500 per request)
const PAGE_LIMIT = 500;
const PAGE_PAUSE_MS = 1000;
const SYNC_MS = 5 * 60 * 1000;

// the chart shows a week, one point per 20 min
const POINT_MS = 20 * 60 * 1000;
const RANGE_MS = 7 * 24 * 60 * 60 * 1000;

export type EnvironmentStatus = "loading" | "ok" | "offline" | "error";

// "YYYY-MM-DD HH:MM:SS" in ESP local time, parsed by hand so no engine
// guesses the timezone
export function parseEspDate(value: string) {
  const [date, time] = value.split(" ");
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes, seconds] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
}

const pad = (value: number) => String(value).padStart(2, "0");

export function formatEspDate(time: number) {
  const date = new Date(time);

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

function thin(rows: EnvironmentRow[]) {
  const next: EnvironmentRow[] = [];
  let lastTime = -Infinity;

  for (const row of rows) {
    const time = parseEspDate(row.datetime);

    if (time - lastTime >= POINT_MS) {
      next.push(row);
      lastTime = time;
    }
  }

  return next;
}

export function useEnvironmentHistory() {
  const { fetchEnvironmentSince } = useBoxControllerContext();

  const [rows, setRows] = useState<EnvironmentRow[]>([]);
  const [status, setStatus] = useState<EnvironmentStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    let syncing = false;

    // the week before the newest stored reading
    const publish = async () => {
      const newest = await getNewestDatetime();

      if (cancelled || !newest) return false;

      const stored = await getRowsSince(
        formatEspDate(parseEspDate(newest) - RANGE_MS),
      );

      if (cancelled) return false;

      setRows(thin(stored));
      setStatus("ok");

      return true;
    };

    const sync = async () => {
      if (syncing) return;

      syncing = true;

      let hasRows = false;

      try {
        hasRows = await publish();

        // an empty store starts a week back, not at the start of the SD log
        let since =
          (await getNewestDatetime()) ?? formatEspDate(Date.now() - RANGE_MS);

        while (!cancelled) {
          const response = await fetchEnvironmentSince(since, PAGE_LIMIT);

          if (cancelled) return;

          if (response.status === "offline") {
            if (!hasRows) setStatus("offline");
            return;
          }

          await insertRows(response.data);

          if (response.data.length) {
            hasRows = await publish();
          } else if (!hasRows) {
            // ESP works, nothing logged in the last week yet
            setStatus("ok");
          }

          const next =
            response.next_since ??
            response.data[response.data.length - 1]?.datetime;

          // firmware without `since` keeps sending the newest rows
          if (!response.has_more || !next || next <= since) return;

          since = next;

          // leave room for control calls between pages
          await new Promise((resolve) => setTimeout(resolve, PAGE_PAUSE_MS));
        }
      } catch {
        // keep showing what is stored
        if (!cancelled && !hasRows) setStatus("error");
      } finally {
        syncing = false;
      }
    };

    void sync();

    const interval = setInterval(() => void sync(), SYNC_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchEnvironmentSince]);

  return { rows, status };
}
