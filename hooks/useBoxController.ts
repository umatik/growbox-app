import { useCallback, useEffect } from "react";
import { EspResponse } from "@/shared/interfaces/esp.interface";
import useEsp from "@/shared/hooks/useEsp";
import { useBoxStore } from "@/store";

export default function useBoxController() {
  const syncStore = useCallback((response: EspResponse) => {
    const store = useBoxStore.getState();

    store.setMode(response.status.mode);
    store.setState(response.status.state);

    store.setSensor({
      temperature: response.sensor.temperature,
      humidity: response.sensor.humidity,
      ts: response.sensor.ts,
    });

    store.setLight(response.config.relayLight.state);
    store.setFan(response.config.relayFan.state);
    store.setDisplay(response.config.display.enabled);
    store.setDimmerEnabled(response.config.dimmer.enabled);

    store.setFanSpeed(response.config.dimmer.day.level);
    store.setNightFanSpeed(response.config.dimmer.night.level);

    store.setFlowering({
      startDate: response.config.auto.floweringStartDate,
    });

    const schedule = response.config.lightSchedule[0];

    if (schedule) {
      store.setScheduler({
        on: schedule.on,
        off: schedule.off,
      });
    }
  }, []);

  const esp = useEsp({
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
    apiToken: process.env.EXPO_PUBLIC_API_TOKEN ?? "",
    onResponse: syncStore,
  });

  useEffect(() => {
    console.log("[BOX] fetching config...");
    console.log(esp.data);
    esp
      .fetchConfig()
      .then(() => {
        console.log("[BOX] config loaded");
      })
      .catch((error) => {
        console.log("[BOX] config error:", error);
      });
  }, [esp.fetchConfig]);

  return esp;
}
