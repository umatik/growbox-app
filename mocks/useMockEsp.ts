import { useCallback, useRef, useState } from "react";
import {
  EnvironmentResponse,
  EnvironmentRow,
  EspResponse,
} from "@box-controller/shared/interfaces/esp.interface";

const MOCK_FLOWERING_START_DATE = "2026-09-23";
const MOCK_LAST_FED_AT = new Date(Date.now() - 2 * 86400000).toISOString();

const createInitialResponse = (): EspResponse =>
  ({
    status: {
      mode: "AUTO",
      state: "DAY",
    },
    sensor: {
      temperature: 24.6,
      humidity: 58,
      ts: Date.now(),
    },
    config: {
      relayLight: { state: true },
      relayFan: { state: true },
      display: { enabled: true },
      dimmer: {
        enabled: true,
        day: { level: 60 },
        night: { level: 30 },
      },
      auto: {
        nightFan: { enabled: false },
        floweringStartDate: MOCK_FLOWERING_START_DATE,
      },
      lightSchedule: [{ on: "18:00", off: "06:00" }],
      feeding: { lastFedAt: MOCK_LAST_FED_AT, count: 5 },
    },
  }) as EspResponse;

const MOCK_LOG_INTERVAL_MS = 2 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

// same "YYYY-MM-DD HH:MM:SS" local-time format the ESP writes to the SD card
const formatEspDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

// lights on 18:00-06:00: warmer and drier while they're on
const createMockRow = (time: number): EnvironmentRow => {
  const date = new Date(time);
  const hour = date.getHours() + date.getMinutes() / 60;
  const isDay = hour >= 18 || hour < 6;
  const hoursIntoPhase = (hour - (isDay ? 18 : 6) + 24) % 24;
  const warmUp = Math.min(1, hoursIntoPhase / 2);
  const heat = isDay ? warmUp : 1 - warmUp;
  const noise = Math.sin(time / 1800000) * 0.25;

  return {
    datetime: formatEspDate(date),
    day_night: isDay ? "DAY" : "NIGHT",
    temperature: Math.round((20.8 + heat * 3.4 + noise) * 10) / 10,
    humidity: Math.round((56 - heat * 6 + noise * 4) * 10) / 10,
  };
};

const createMockEnvironment = (limit: number, before?: string) => {
  const end =
    Math.floor(Date.now() / MOCK_LOG_INTERVAL_MS) * MOCK_LOG_INTERVAL_MS;
  const rows: EnvironmentRow[] = [];

  for (let i = 499; i >= 0; i -= 1) {
    rows.push(createMockRow(end - i * MOCK_LOG_INTERVAL_MS));
  }

  const older = before ? rows.filter((row) => row.datetime < before) : rows;
  const page = older.slice(-limit);
  const hasMore = older.length > page.length;

  return {
    status: "ok",
    has_more: hasMore,
    next_before: hasMore ? page[0].datetime : null,
    data: page,
  } satisfies EnvironmentResponse;
};

export default function useMockEsp(
  onResponse?: (response: EspResponse) => void,
) {
  const responseRef = useRef<EspResponse>(createInitialResponse());
  const [data, setData] = useState<EspResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const publish = useCallback(() => {
    const current = responseRef.current;
    current.sensor.ts = Date.now();
    setData({ ...current });
    onResponse?.(current);
  }, [onResponse]);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 150));
    publish();
    setLoading(false);
  }, [publish]);

  const update = useCallback(
    (mutate: (response: EspResponse) => void) => {
      mutate(responseRef.current);
      publish();
    },
    [publish],
  );

  const toggleMode = useCallback(async () => {
    update((response) => {
      response.status.mode =
        response.status.mode === "AUTO" ? "MANUAL" : "AUTO";
    });
  }, [update]);

  const toggleDisplay = useCallback(async () => {
    update((response) => {
      response.config.display.enabled = !response.config.display.enabled;
    });
  }, [update]);

  const toggleLight = useCallback(async () => {
    update((response) => {
      response.config.relayLight.state = !response.config.relayLight.state;
    });
  }, [update]);

  const toggleFan = useCallback(async () => {
    update((response) => {
      response.config.relayFan.state = !response.config.relayFan.state;
    });
  }, [update]);

  const setFanLevel = useCallback(
    async (level: number) => {
      update((response) => {
        response.config.dimmer.day.level = level;
      });
    },
    [update],
  );

  const setNightFanLevel = useCallback(
    async (level: number) => {
      update((response) => {
        response.config.dimmer.night.level = level;
      });
    },
    [update],
  );

  const setLightSchedule = useCallback(
    async (schedule: { on: string; off: string }[]) => {
      update((response) => {
        response.config.lightSchedule = schedule;
      });
    },
    [update],
  );

  const toggleNightFan = useCallback(async () => {
    update((response) => {
      response.config.auto.nightFan.enabled =
        !response.config.auto.nightFan.enabled;
    });
  }, [update]);

  const setFloweringStartDate = useCallback(
    async (date: string | null) => {
      update((response) => {
        response.config.auto.floweringStartDate = date;
      });
    },
    [update],
  );

  const logFeeding = useCallback(
    async (date: string) => {
      update((response) => {
        const count = response.config.feeding?.count ?? 0;

        response.config.feeding = { lastFedAt: date, count: count + 1 };
      });
    },
    [update],
  );

  const fetchEnvironment = useCallback(
    async (limit: number, before?: string): Promise<EnvironmentResponse> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return createMockEnvironment(limit, before);
    },
    [],
  );

  return {
    loading,
    error,
    data,
    fetchConfig,
    toggleMode,
    toggleDisplay,
    toggleLight,
    toggleFan,
    toggleNightFan,
    setFanLevel,
    setNightFanLevel,
    setLightSchedule,
    setFloweringStartDate,
    logFeeding,
    fetchEnvironment,
  };
}
