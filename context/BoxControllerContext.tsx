import { createContext, ReactNode, useCallback, useContext } from "react";
import useEsp from "@box-controller/shared/hooks/useEsp";
import { EspResponse } from "@box-controller/shared/interfaces/esp.interface";
import { useBoxStore } from "@/store";

type BoxController = ReturnType<typeof useEsp>;

const BoxControllerContext = createContext<BoxController | null>(null);

interface BoxControllerProviderProps {
  children: ReactNode;
}

export function BoxControllerProvider({
  children,
}: BoxControllerProviderProps) {
  const setMode = useBoxStore((state) => state.setMode);
  const setState = useBoxStore((state) => state.setState);
  const setSensor = useBoxStore((state) => state.setSensor);
  const setDisplay = useBoxStore((state) => state.setDisplay);
  const setLight = useBoxStore((state) => state.setLight);
  const setFan = useBoxStore((state) => state.setFan);
  const setNightFanEnabled = useBoxStore((state) => state.setNightFanEnabled);

  const handleResponse = useCallback(
    (response: EspResponse) => {
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

      setNightFanEnabled(Boolean(response.config.auto.nightFan.enabled));
    },
    [
      setMode,
      setState,
      setSensor,
      setDisplay,
      setLight,
      setFan,
      setNightFanEnabled,
    ],
  );

  const controller = useEsp({
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
    apiToken: process.env.EXPO_PUBLIC_API_TOKEN ?? "",
    onResponse: handleResponse,
  });

  return (
    <BoxControllerContext.Provider value={controller}>
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
