import { useCallback, useMemo, useState } from "react";
import { EspResponse } from "../interfaces/esp.interface";
import { createBoxService } from "../services/box.services";

interface BoxHookProps {
  apiUrl: string;
  apiToken: string;
  onResponse?: (response: EspResponse) => void;
}

const useEsp = ({ apiUrl, apiToken, onResponse }: BoxHookProps) => {
  const [data, setData] = useState<EspResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const boxService = useMemo(
    () => createBoxService(apiUrl, apiToken),
    [apiToken, apiUrl],
  );

  const fetchConfig = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await boxService.getConfig();

      setData(response);
      onResponse?.(response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Connection error");

      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [boxService, onResponse]);

  const toggleMode = useCallback(async () => {
    await boxService.toggleMode();
    await fetchConfig();
  }, [boxService, fetchConfig]);

  const toggleDisplay = useCallback(async () => {
    await boxService.toggleDisplay();
    await fetchConfig();
  }, [boxService, fetchConfig]);

  const toggleLight = useCallback(async () => {
    await boxService.toggleLight();
    await fetchConfig();
  }, [boxService, fetchConfig]);

  const toggleFan = useCallback(async () => {
    await boxService.toggleFan();
    await fetchConfig();
  }, [boxService, fetchConfig]);

  const toggleFanAuto = useCallback(async () => {
    await boxService.toggleFanAuto();
    await fetchConfig();
  }, [boxService, fetchConfig]);

  const setFanLevel = useCallback(
    async (level: number) => {
      await boxService.setFanLevel(level);
      await fetchConfig();
    },
    [boxService, fetchConfig],
  );

  const setNightFanLevel = useCallback(
    async (level: number) => {
      await boxService.setNightFanLevel(level);
      await fetchConfig();
    },
    [boxService, fetchConfig],
  );

  const setLightSchedule = useCallback(
    async (schedule: { on: string; off: string }[]) => {
      await boxService.setLightSchedule(schedule);
      await fetchConfig();
    },
    [boxService, fetchConfig],
  );

  const toggleNightFan = useCallback(async () => {
    await boxService.toggleNightFan();
    await fetchConfig();
  }, [boxService, fetchConfig]);

  const setFloweringStartDate = useCallback(
    async (date: string | null) => {
      await boxService.setFloweringStartDate(date);
      await fetchConfig();
    },
    [boxService, fetchConfig],
  );

  // history is not synced into the store; callers keep it themselves
  const fetchEnvironment = useCallback(
    (limit: number, before?: string, step?: number) =>
      boxService.getEnvironment(limit, before, step),
    [boxService],
  );

  const fetchEnvironmentSince = useCallback(
    (since: string, limit: number) =>
      boxService.getEnvironmentSince(since, limit),
    [boxService],
  );

  const eraseEnvironment = useCallback(
    () => boxService.eraseEnvironment(),
    [boxService],
  );

  const logFeeding = useCallback(
    async (date: string) => {
      await boxService.logFeeding(date);
      await fetchConfig();
    },
    [boxService, fetchConfig],
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
    toggleFanAuto,
    setFanLevel,
    setNightFanLevel,
    setLightSchedule,
    setFloweringStartDate,
    logFeeding,
    fetchEnvironment,
    fetchEnvironmentSince,
    eraseEnvironment,
  };
};

export default useEsp;
