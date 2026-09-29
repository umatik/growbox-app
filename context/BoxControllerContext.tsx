import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import useEsp from "@/shared/hooks/useEsp";
import useMockEsp from "@/mocks/useMockEsp";
import { EspResponse } from "@/shared/interfaces/esp.interface";
import { useBoxStore } from "@/store";

type BoxController = ReturnType<typeof useEsp>;

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

  useEffect(() => {
    const loadInitialConfig = async () => {
      try {
        await controller.fetchConfig();
      } catch {
        // Error is available through controller.error.
      } finally {
        setInitialLoading(false);
      }
    };

    void loadInitialConfig();
  }, [controller.fetchConfig]);

  const reloadConnection = useCallback(async () => {
    setConnectionDismissed(false);
    setInitialLoading(true);

    try {
      await controller.fetchConfig();
    } catch {
      // Error is available through controller.error.
    } finally {
      setInitialLoading(false);
    }
  }, [controller.fetchConfig]);

  useEffect(() => {
    if (initialLoading || connectionDismissed || controller.error) {
      return;
    }

    const interval = setInterval(() => {
      void controller.fetchConfig().catch(() => {
        // Error is available through controller.error.
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [
    controller.fetchConfig,
    controller.error,
    initialLoading,
    connectionDismissed,
  ]);

  const dismissConnectionError = useCallback(() => {
    setConnectionDismissed(true);
  }, []);

  const tabsDisabled =
    initialLoading || Boolean(controller.error) || connectionDismissed;

  const setFloweringStartDate = useCallback(
    async (date: string | null) => {
      await controller.setFloweringStartDate(date);
    },
    [controller.setFloweringStartDate],
  );

  const contextValue: BoxControllerContextValue = {
    ...controller,
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