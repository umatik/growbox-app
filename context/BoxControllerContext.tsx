import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useEsp from "@/shared/hooks/useEsp";
import useMockEsp from "@/mocks/useMockEsp";
import { EspResponse } from "@/shared/interfaces/esp.interface";
import { useBoxStore } from "@/store";

type BoxController = ReturnType<typeof useEsp>;

// The ESP sits on a weak WiFi link (~-85 dBm) and single requests get lost
// now and then; only this many failed polls in a row count as disconnected
const FAILURES_BEFORE_LOST = 3;
const POLL_MS = 5000;
const INITIAL_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1000;

const CONNECTION_LOST = new Error("Connection lost");

interface BoxControllerContextValue extends BoxController {
  initialLoading: boolean;
  connectionDismissed: boolean;
  dismissConnectionError: () => void;
  reloadConnection: () => Promise<void>;
  tabsDisabled: boolean;
}

const BoxControllerContext = createContext<BoxControllerContextValue | null>(
  null,
);

interface BoxControllerProviderProps {
  children: ReactNode;
}

export function BoxControllerProvider({
  children,
}: BoxControllerProviderProps) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [connectionDismissed, setConnectionDismissed] = useState(false);
  const [connectionLost, setConnectionLost] = useState(false);
  const [reloading, setReloading] = useState(false);
  const failures = useRef(0);

  const setMode = useBoxStore((state) => state.setMode);
  const setLastConnectedMode = useBoxStore(
    (state) => state.setLastConnectedMode,
  );
  const setState = useBoxStore((state) => state.setState);
  const setSensor = useBoxStore((state) => state.setSensor);
  const setDisplay = useBoxStore((state) => state.setDisplay);
  const setLight = useBoxStore((state) => state.setLight);
  const setFan = useBoxStore((state) => state.setFan);
  const setDayLevel = useBoxStore((state) => state.setDayLevel);
  const setFanLevel = useBoxStore((state) => state.setFanLevel);
  const setFanAuto = useBoxStore((state) => state.setFanAuto);
  const setNightFanEnabled = useBoxStore((state) => state.setNightFanEnabled);

  const setFlowering = useBoxStore((state) => state.setFlowering);
  const setFeeding = useBoxStore((state) => state.setFeeding);

  const handleResponse = useCallback(
    (response: EspResponse) => {
      setConnectionDismissed(false);

      setLastConnectedMode(response.status.mode);
      setMode(response.status.mode);
      setState(response.status.state);

      setSensor({
        temperature: response.sensor.temperature,
        humidity: response.sensor.humidity,
        ts: response.sensor.ts,
      });

      setDisplay(Boolean(response.config.display.enabled));
      setLight(Boolean(response.config.relayLight.state));
      setFan(Boolean(response.config.relayFan.state));

      setDayLevel(response.config.dimmer.day.level);
      // older firmware has no fanLevel - the day level is what runs then
      setFanLevel(
        response.status.fanLevel ?? response.config.dimmer.day.level,
      );
      setFanAuto(Boolean(response.config.fanAuto?.enabled));

      setNightFanEnabled(Boolean(response.config.auto.nightFan.enabled));

      setFlowering({
        startDate: response.config.auto.floweringStartDate,
      });

      if (response.config.feeding) {
        setFeeding({
          lastFedAt: response.config.feeding.lastFedAt,
          count: response.config.feeding.count,
          history: response.config.feeding.history ?? [],
        });
      }
    },
    [
      setLastConnectedMode,
      setMode,
      setState,
      setSensor,
      setDisplay,
      setLight,
      setFan,
      setDayLevel,
      setFanLevel,
      setFanAuto,
      setNightFanEnabled,
      setFlowering,
      setFeeding,
    ],
  );

  const realController = useEsp({
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
    apiToken: process.env.EXPO_PUBLIC_API_TOKEN ?? "",
    onResponse: handleResponse,
  });

  const mockController = useMockEsp(handleResponse);

  const offlineMode = process.env.EXPO_PUBLIC_OFFLINE_MODE === "true";
  const controller = offlineMode ? mockController : realController;

  // one poll; the connection only counts as lost after several misses
  const poll = useCallback(async () => {
    try {
      await controller.fetchConfig();
      failures.current = 0;
      setConnectionLost(false);
      return true;
    } catch {
      failures.current += 1;

      if (failures.current >= FAILURES_BEFORE_LOST) {
        setConnectionLost(true);
      }

      return false;
    }
  }, [controller.fetchConfig]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialConfig = async () => {
      for (let attempt = 1; attempt <= INITIAL_ATTEMPTS; attempt += 1) {
        try {
          await controller.fetchConfig();
          failures.current = 0;
          setConnectionLost(false);
          break;
        } catch {
          if (attempt === INITIAL_ATTEMPTS) {
            failures.current = FAILURES_BEFORE_LOST;
            setConnectionLost(true);
          } else {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          }
        }

        if (cancelled) return;
      }

      if (!cancelled) setInitialLoading(false);
    };

    void loadInitialConfig();

    return () => {
      cancelled = true;
    };
  }, [controller.fetchConfig]);

  const reloadConnection = useCallback(async () => {
    setConnectionDismissed(false);
    setReloading(true);

    try {
      await controller.fetchConfig();
      failures.current = 0;
      setConnectionLost(false);
    } catch {
      setConnectionLost(true);
    } finally {
      setReloading(false);
    }
  }, [controller.fetchConfig]);

  // keeps polling while disconnected too, so the app comes back by itself
  useEffect(() => {
    if (initialLoading || connectionDismissed) {
      return;
    }

    const interval = setInterval(() => {
      void poll();
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [poll, initialLoading, connectionDismissed]);

  const dismissConnectionError = useCallback(() => {
    setConnectionDismissed(true);
  }, []);

  const tabsDisabled = initialLoading || connectionLost || connectionDismissed;

  const setFloweringStartDate = useCallback(
    async (date: string | null) => {
      await controller.setFloweringStartDate(date);
    },
    [controller.setFloweringStartDate],
  );

  const contextValue: BoxControllerContextValue = {
    ...controller,
    // single lost requests are not an error for the UI; loading is the
    // manual reload, background polls don't flash the overlay
    error: connectionLost ? CONNECTION_LOST : null,
    loading: reloading,
    setFloweringStartDate,
    initialLoading,
    connectionDismissed,
    dismissConnectionError,
    reloadConnection,
    tabsDisabled,
  };

  return (
    <BoxControllerContext.Provider value={contextValue}>
      {children}
    </BoxControllerContext.Provider>
  );
}

export function useBoxControllerContext() {
  const context = useContext(BoxControllerContext);

  if (!context) {
    throw new Error(
      "useBoxControllerContext must be used inside BoxControllerProvider",
    );
  }

  return context;
}
