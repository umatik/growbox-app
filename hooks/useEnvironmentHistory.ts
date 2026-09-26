import { useEffect, useRef, useState } from "react";
import { EnvironmentRow } from "@box-controller/shared/interfaces/esp.interface";
import { useBoxControllerContext } from "@/context/BoxControllerContext";

// ESP caps a request at 500 rows (~7 s to read from the SD card),
// so load that once and afterwards only pull the newest rows
const HISTORY_LIMIT = 500;
const REFRESH_LIMIT = 10;
const REFRESH_MS = 2 * 60 * 1000;

export type EnvironmentStatus = "loading" | "ok" | "offline" | "error";

export function useEnvironmentHistory() {
  const { fetchEnvironment } = useBoxControllerContext();

  const [rows, setRows] = useState<EnvironmentRow[]>([]);
  const [status, setStatus] = useState<EnvironmentStatus>("loading");
  const hasRows = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const load = async (limit: number) => {
      try {
        const response = await fetchEnvironment(limit);

        if (cancelled) return;

        if (response.status === "offline") {
          setStatus("offline");
          return;
        }

        setRows((current) => {
          const last = current[current.length - 1]?.datetime;
          // datetimes are zero-padded, so string order is time order
          const fresh = last
            ? response.data.filter((row) => row.datetime > last)
            : response.data;

          const next = fresh.length
            ? [...current, ...fresh].slice(-HISTORY_LIMIT)
            : current;

          hasRows.current = next.length > 0;

          return next;
        });

        setStatus("ok");
      } catch {
        if (!cancelled) {
          // keep showing what we already have
          setStatus((current) => (current === "ok" ? current : "error"));
        }
      }
    };

    void load(HISTORY_LIMIT);

    const interval = setInterval(() => {
      // until the first full load succeeds, keep asking for the whole history
      void load(hasRows.current ? REFRESH_LIMIT : HISTORY_LIMIT);
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchEnvironment]);

  return { rows, status };
}
