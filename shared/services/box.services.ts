import {
  EnvironmentResponse,
  EspResponse,
} from "../interfaces/esp.interface";

export function createBoxService(apiUrl: string, apiToken: string) {
  const API_TIMEOUT = 10000;
  // reading 500 rows from the SD card takes ~7 s on the ESP
  const ENVIRONMENT_TIMEOUT = 30000;

  async function apiFetch(
    path: string,
    init?: RequestInit,
    timeoutMs = API_TIMEOUT,
  ): Promise<Response> {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      return await fetch(`${apiUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          ...init?.headers,
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  async function getConfig(): Promise<EspResponse> {
    const response = await apiFetch("/config");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async function toggleMode(): Promise<void> {
    const response = await apiFetch("/mode/toggle", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async function toggleDisplay(): Promise<void> {
    const response = await apiFetch("/display/toggle", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async function toggleLight(): Promise<void> {
    const response = await apiFetch("/light/toggle", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async function toggleFan(): Promise<void> {
    const response = await apiFetch("/fan/toggle", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async function toggleNightFan(): Promise<void> {
    const response = await apiFetch("/auto/night-fan/toggle", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async function toggleFanAuto(): Promise<void> {
    const response = await apiFetch("/fan/auto/toggle", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async function setFanLevel(level: number): Promise<void> {
    const response = await apiFetch("/fan/level", {
      method: "POST",
      body: JSON.stringify({ level }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async function setNightFanLevel(level: number): Promise<void> {
    const response = await apiFetch("/fan/night-level", {
      method: "POST",
      body: JSON.stringify({ level }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async function setLightSchedule(
    schedule: { on: string; off: string }[],
  ): Promise<void> {
    const response = await apiFetch("/light-schedule", {
      method: "POST",
      body: JSON.stringify(schedule),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async function setFloweringStartDate(date: string | null): Promise<void> {
    const response = await apiFetch("/flowering/start-date", {
      method: "POST",
      body: JSON.stringify({ date }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  // step = return every n-th logged row, so a long range fits in one request
  async function getEnvironment(
    limit: number,
    before?: string,
    step = 1,
  ): Promise<EnvironmentResponse> {
    // built by hand: URLSearchParams is only partly implemented in React Native
    let query = `limit=${limit}`;

    if (before) {
      query += `&before=${encodeURIComponent(before)}`;
    }

    if (step > 1) {
      query += `&step=${step}`;
    }

    const response = await apiFetch(
      `/environment?${query}`,
      undefined,
      ENVIRONMENT_TIMEOUT,
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  // rows logged after `since`, oldest first - incremental sync
  async function getEnvironmentSince(
    since: string,
    limit: number,
  ): Promise<EnvironmentResponse> {
    const response = await apiFetch(
      `/environment?limit=${limit}&since=${encodeURIComponent(since)}`,
      undefined,
      ENVIRONMENT_TIMEOUT,
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  // erases the whole sensor log on the SD card
  async function eraseEnvironment(): Promise<void> {
    const response = await apiFetch("/environment/erase", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  async function logFeeding(date: string): Promise<void> {
    const response = await apiFetch("/feeding", {
      method: "POST",
      body: JSON.stringify({ date }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  return {
    getConfig,
    toggleMode,
    toggleDisplay,
    toggleLight,
    toggleFan,
    toggleNightFan,
    toggleFanAuto,
    setFanLevel,
    setNightFanLevel,
    setLightSchedule,
    setFloweringStartDate,
    logFeeding,
    getEnvironment,
    getEnvironmentSince,
    eraseEnvironment,
  };
}
