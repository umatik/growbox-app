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
  fanSpeed: number;
  nightFanSpeed: number;
}

export interface AutoState {
  nightFanEnabled: boolean;
}

export interface FloweringState {
  startDate: string | null;
  currentWeek: number;
  progress: number;
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

  setMode: (mode: BoxMode) => void;
  setLastConnectedMode: (mode: BoxMode) => void;
  setState: (state: BoxState) => void;
  setSensor: (sensor: Partial<SensorState>) => void;

  setLight: (enabled: boolean) => void;
  setFan: (enabled: boolean) => void;
  setDisplay: (enabled: boolean) => void;
  setDimmerEnabled: (enabled: boolean) => void;
  setFanSpeed: (speed: number) => void;
  setNightFanSpeed: (speed: number) => void;

  setNightFanEnabled: (enabled: boolean) => void;

  setFlowering: (flowering: Partial<FloweringState>) => void;
  setScheduler: (scheduler: Partial<SchedulerState>) => void;

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
    display: true,
    dimmerEnabled: false,
    fanSpeed: 50,
    nightFanSpeed: 30,
  },

  auto: {
    nightFanEnabled: false,
  },

  flowering: {
    startDate: null,
    currentWeek: 1,
    progress: 0,
  },

  scheduler: {
    on: "18:00",
    off: "06:00",
  },
};

export const useBoxStore = create<BoxStore>((set) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),
  setLastConnectedMode: (mode) => set({ lastConnectedMode: mode }),

  setState: (state) => set({ state }),

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

  setFanSpeed: (speed) =>
    set((current) => ({
      devices: {
        ...current.devices,
        fanSpeed: speed,
      },
    })),

  setNightFanSpeed: (speed) =>
    set((current) => ({
      devices: {
        ...current.devices,
        nightFanSpeed: speed,
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

  reset: () => set(initialState),
}));
