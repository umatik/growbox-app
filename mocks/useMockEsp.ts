import { useCallback, useRef, useState } from "react";
import {
  EnvironmentResponse,
  EnvironmentRow,
  EspResponse,
} from "@box-controller/shared/interfaces/esp.interface";
import { VEG_TARGETS } from "@/data/growTargets";

const MOCK_FLOWERING_START_DATE = "2026-09-23";
const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const MOCK_DAYS = 21;

// deterministic 0..1 "random" per number, so every render sees the same data
const hash = (value: number) => {
  const x = Math.sin(value * 12.9898) * 43758.5453;

  return x - Math.floor(x);
};

// scenario: "today is Thursday, last watering Tuesday" - the last feeding
// was 2 days ago, the one before it 3 days ago (Mon + Tue), and before that
// the usual feed, feed, break rhythm; each around 19:00
const LAST_FED_DAYS_AGO = 2;

const createFeedingTimes = () => {
  const today = new Date().setHours(0, 0, 0, 0);
  const times: number[] = [];

  for (
    let daysAgo = MOCK_DAYS - 1;
    daysAgo >= LAST_FED_DAYS_AGO;
    daysAgo -= 1
  ) {
    const dayStart = today - daysAgo * DAY_MS;
    const dayNumber = Math.round(dayStart / DAY_MS);

    // counting back from the last feeding: feed, feed, break, feed, feed...
    if ((daysAgo - LAST_FED_DAYS_AGO) % 3 === 2) continue; // break day

    const time =
      dayStart + 19 * HOUR_MS + Math.round(hash(dayNumber) * 90) * 60000;

    if (time < Date.now()) times.push(time);
  }

  return times;
};

const MOCK_FEED_TIMES = createFeedingTimes();
const MOCK_FEEDING_HISTORY = MOCK_FEED_TIMES.map((time) =>
  new Date(time).toISOString(),
);

const createInitialResponse = (): EspResponse =>
  ({
    status: {
      mode: "MANUAL",
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
      feeding: {
        lastFedAt: MOCK_FEEDING_HISTORY[MOCK_FEEDING_HISTORY.length - 1],
        count: MOCK_FEEDING_HISTORY.length,
        history: MOCK_FEEDING_HISTORY,
      },
    },
  }) as EspResponse;

const MOCK_LOG_INTERVAL_MS = 2 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

// same "YYYY-MM-DD HH:MM:SS" local-time format the ESP writes to the SD card
const formatEspDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

// Readings are generated as a deviation from the veg ideal, in units of the
// optimal range's half-width (0 = ideal, ±1 = edge of the optimal block):
// - ~70 % of days are calm, within ±0.3
// - the other days wobble more, still mostly inside the block
// - after some waterings humidity spikes well above the block
// - once, ~2 days ago, it gets 0–30 % too warm for a few hours

// calm days stay within ±0.3; restless days (about 30 %) swing ~2.3× more
const baseDeviation = (time: number, seed: number) => {
  const dayNumber = Math.floor(time / DAY_MS);
  const restless = hash(dayNumber * 7 + seed) < 0.3;
  const wave =
    Math.sin(time / (5 * HOUR_MS) + seed) * 0.17 +
    Math.sin(time / (1.7 * HOUR_MS) + seed * 2) * 0.07 +
    (hash(time / MOCK_LOG_INTERVAL_MS + seed) - 0.5) * 0.1;

  return restless ? wave * 2.3 : wave;
};

// sharp rise within ~15 min after watering, then drying out over a few hours
const humiditySpike = (time: number) =>
  MOCK_FEED_TIMES.reduce((sum, fedAt) => {
    const since = time - fedAt;

    // only some waterings end in a spike, each of its own size
    if (since < 0 || since > 10 * HOUR_MS || hash(fedAt) < 0.4) return sum;

    const peak = 1.5 + hash(fedAt + 1) * 0.5;

    return (
      sum +
      peak *
        (1 - Math.exp(-since / (10 * 60000))) *
        Math.exp(-since / (1.8 * HOUR_MS))
    );
  }, 0);

// the single "too warm" afternoon: peaks just past the block edge (+1.25)
const HEAT_EPISODE_AT = new Date(Date.now() - 2 * DAY_MS).setHours(15, 0, 0, 0);

const heatEpisode = (time: number) =>
  1.2 * Math.exp(-(((time - HEAT_EPISODE_AT) / (2 * HOUR_MS)) ** 2));

const createMockRow = (time: number): EnvironmentRow => {
  const date = new Date(time);
  const hour = date.getHours() + date.getMinutes() / 60;
  // lights on 18:00-06:00, like the mock light schedule
  const isDay = hour >= 18 || hour < 6;
  const targets = isDay ? VEG_TARGETS.lightsOn : VEG_TARGETS.lightsOff;

  const halfWidth = (range: { min: number; max: number }) =>
    (range.max - range.min) / 2;

  const temperatureDeviation = baseDeviation(time, 1) + heatEpisode(time);
  const humidityDeviation = baseDeviation(time, 2) + humiditySpike(time);

  return {
    datetime: formatEspDate(date),
    day_night: isDay ? "DAY" : "NIGHT",
    temperature:
      Math.round(
        (targets.temperature.ideal +
          temperatureDeviation * halfWidth(targets.temperature)) *
          10,
      ) / 10,
    humidity:
      Math.round(
        (targets.humidity.ideal +
          humidityDeviation * halfWidth(targets.humidity)) *
          10,
      ) / 10,
  };
};

// the fake SD log covers the last 3 weeks, one row every 2 min
const MOCK_LOG_ROWS = MOCK_DAYS * 24 * 30;

const createMockEnvironment = (limit: number, before?: string, step = 1) => {
  const end =
    Math.floor(Date.now() / MOCK_LOG_INTERVAL_MS) * MOCK_LOG_INTERVAL_MS;
  const rows: EnvironmentRow[] = [];

  // every step-th row counted back from the newest, like the ESP would
  for (let i = MOCK_LOG_ROWS - 1; i >= 0; i -= 1) {
    if (i % step === 0) {
      rows.push(createMockRow(end - i * MOCK_LOG_INTERVAL_MS));
    }
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
        const history = response.config.feeding?.history ?? [];

        response.config.feeding = {
          lastFedAt: date,
          count: count + 1,
          history: [...history, date],
        };
      });
    },
    [update],
  );

  const fetchEnvironment = useCallback(
    async (
      limit: number,
      before?: string,
      step?: number,
    ): Promise<EnvironmentResponse> => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return createMockEnvironment(limit, before, step);
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
