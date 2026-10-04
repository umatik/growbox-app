import { create } from "zustand";

export type BoxMode = "AUTO" | "MANUAL";
export type BoxState = "DAY" | "NIGHT";

export interface SensorState {
  temperature: number | null;
  humidity: number | null;
  ts: number | null;
}

export interface DeviceState {
  light: boolean;
  fan: boolean;
  display: boolean;
  dimmerEnabled: boolean;
  dayLevel: number;
  nightLevel: number;
  fanSpeed: number;
  // what the fan actually runs at (fanAuto overrides dayLevel)
  fanLevel: number;
  fanAuto: boolean;
}

export interface HumidifierState {
  online: boolean;
  on: boolean;
  // band of the current mode; disabled = the ESP never turns it on
  enabled: boolean;
  min: number;
  max: number;
}

export interface AutoState {
  nightFanEnabled: boolean;
}

export interface FloweringState {
  startDate: string | null;
  // exact start time from the ESP, null when unknown
  startedAt: string | null;
  currentWeek: number;
  progress: number;
}

export interface FeedingState {
  lastFedAt: string | null;
  count: number;
  history: string[];
}

export interface SchedulerState {
  on: string;
  off: string;
}

interface BoxStore {
  mode: BoxMode;
  lastConnectedMode: BoxMode | null;
  state: BoxState;
  sensor: SensorState;
  devices: DeviceState;
  auto: AutoState;
  flowering: FloweringState;
  scheduler: SchedulerState;
  feeding: FeedingState;
  // ESP WiFi signal in dBm, null = unknown
  rssi: number | null;
  // null = firmware without a humidifier
  humidifier: HumidifierState | null;

  setMode: (mode: BoxMode) => void;
  setLastConnectedMode: (mode: BoxMode) => void;
  setState: (state: BoxState) => void;
  setSensor: (sensor: Partial<SensorState>) => void;

  setLight: (enabled: boolean) => void;
  setFan: (enabled: boolean) => void;
  setDisplay: (enabled: boolean) => void;
  setDimmerEnabled: (enabled: boolean) => void;
  setDayLevel: (level: number) => void;
  setNightLevel: (level: number) => void;
  setFanSpeed: (speed: number) => void;
  setFanLevel: (level: number) => void;
  setFanAuto: (enabled: boolean) => void;

  setNightFanEnabled: (enabled: boolean) => void;

  setFlowering: (flowering: Partial<FloweringState>) => void;
  setScheduler: (scheduler: Partial<SchedulerState>) => void;
  setFeeding: (feeding: Partial<FeedingState>) => void;
  setRssi: (rssi: number | null) => void;
  setHumidifier: (humidifier: HumidifierState | null) => void;

  reset: () => void;
}

const initialState = {
  mode: "MANUAL" as BoxMode,
  lastConnectedMode: null,

  state: "DAY" as BoxState,

  sensor: {
    temperature: null,
    humidity: null,
    ts: null,
  },

  devices: {
    light: false,
    fan: false,
    display: false,
    dimmerEnabled: false,
    dayLevel: 50,
    nightLevel: 30,
    fanSpeed: 50,
    fanLevel: 50,
    fanAuto: false,
  },

  auto: {
    nightFanEnabled: false,
  },

  flowering: {
    startDate: null,
    startedAt: null,
    currentWeek: 1,
    progress: 0,
  },

  scheduler: {
    on: "18:00",
    off: "06:00",
  },

  feeding: {
    lastFedAt: null,
    count: 0,
    history: [],
  },

  rssi: null as number | null,
  humidifier: null as HumidifierState | null,
};

export const useBoxStore = create<BoxStore>((set) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),

  setLastConnectedMode: (mode) => set({ lastConnectedMode: mode }),

  setState: (state) => set({ state }),

  setRssi: (rssi) => set({ rssi }),
  setHumidifier: (humidifier) => set({ humidifier }),

  setSensor: (sensor) =>
    set((current) => ({
      sensor: {
        ...current.sensor,
        ...sensor,
      },
    })),

  setLight: (enabled) =>
    set((current) => ({
      devices: {
        ...current.devices,
        light: enabled,
      },
    })),

  setFan: (enabled) =>
    set((current) => ({
      devices: {
        ...current.devices,
        fan: enabled,
      },
    })),

  setDisplay: (enabled) =>
    set((current) => ({
      devices: {
        ...current.devices,
        display: enabled,
      },
    })),

  setDimmerEnabled: (enabled) =>
    set((current) => ({
      devices: {
        ...current.devices,
        dimmerEnabled: enabled,
      },
    })),

  setDayLevel: (level) =>
    set((current) => ({
      devices: {
        ...current.devices,
        dayLevel: level,
      },
    })),

  setNightLevel: (level) =>
    set((current) => ({
      devices: {
        ...current.devices,
        nightLevel: level,
      },
    })),

  setFanSpeed: (speed) =>
    set((current) => ({
      devices: {
        ...current.devices,
        fanSpeed: speed,
      },
    })),

  setFanLevel: (level) =>
    set((current) => ({
      devices: {
        ...current.devices,
        fanLevel: level,
      },
    })),

  setFanAuto: (enabled) =>
    set((current) => ({
      devices: {
        ...current.devices,
        fanAuto: enabled,
      },
    })),

  setNightFanEnabled: (enabled) =>
    set((current) => ({
      auto: {
        ...current.auto,
        nightFanEnabled: enabled,
      },
    })),

  setFlowering: (flowering) =>
    set((current) => ({
      flowering: {
        ...current.flowering,
        ...flowering,
      },
    })),

  setScheduler: (scheduler) =>
    set((current) => ({
      scheduler: {
        ...current.scheduler,
        ...scheduler,
      },
    })),

  setFeeding: (feeding) =>
    set((current) => ({
      feeding: {
        ...current.feeding,
        ...feeding,
      },
    })),

  reset: () => set(initialState),
}));
