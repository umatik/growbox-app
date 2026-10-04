export interface EspResponse {
  config: EspConfig;
  sensor: EspSensor;
  status: EspStatus;
}

export interface EspStatus {
  mode: "AUTO" | "MANUAL";
  state: "DAY" | "NIGHT";
  // actual dimmer level; differs from dimmer.day while fanAuto drives it
  fanLevel?: number;
  // WiFi signal of the ESP in dBm; missing on older firmware
  rssi?: number | null;
  // humidifier on the mini ESP; missing on firmware without it
  humidifier?: EspHumidifierStatus;
}

export interface EspHumidifierStatus {
  // the mini ESP answered recently
  online: boolean;
  // what the main ESP asks for
  want: boolean;
  // relay state reported back by the mini ESP
  on: boolean;
}

export interface HumidifierBand {
  enabled: boolean;
  min: number;
  max: number;
}

export interface HumidifierConfig {
  manual: HumidifierBand;
  auto: HumidifierBand;
}

export interface EspSensor {
  temperature: number | null;
  humidity: number | null;
  ts: number;
}

export interface EspConfig {
  relayLight: RelayConfig;
  relayFan: RelayConfig;
  relayHumidifier: RelayConfig;

  dimmer: DimmerConfig;
  auto: AutoConfig;
  sensor: SensorConfig;
  display: DisplayConfig;

  lightSchedule: LightScheduleItem[];

  // optional until every firmware build exposes it
  feeding?: FeedingConfig;
  fanAuto?: FanAutoConfig;
  humidifier?: HumidifierConfig;
}

// MANUAL (veg) mode: the ESP sets the fan level from the temperature
export interface FanAutoConfig {
  enabled: boolean;
  minLevel: number;
  maxLevel: number;
  day: { min: number; max: number };
  night: { min: number; max: number };
}

export interface DisplayConfig {
  enabled: boolean;
}

export interface RelayConfig {
  state: boolean;
}

export interface DimmerConfig {
  enabled: boolean;
  day: FanLevel;
  night: FanLevel;
}

export interface FanLevel {
  level: number;
}

export interface AutoConfig {
  enabled: boolean;
  floweringStartDate: string | null;
  // exact start, "YYYY-MM-DD HH:MM:SS" local; missing on older firmware
  floweringStartedAt?: string | null;
  nightFan: FanWhenLightOffConfig;
}

export interface FanWhenLightOffConfig {
  enabled: boolean;
}

export interface SensorConfig {
  enabled: boolean;
  interval: number;
}

export interface FeedingConfig {
  lastFedAt: string | null;
  count: number;
  // ISO timestamps of recent feedings, oldest first
  history?: string[];
}

// one row of the SD-card log, logged every ~5 min
export interface EnvironmentRow {
  datetime: string; // ESP local time, "YYYY-MM-DD HH:MM:SS"
  day_night: "DAY" | "NIGHT";
  temperature: number;
  humidity: number;
}

export interface EnvironmentResponse {
  status: "ok" | "offline";
  has_more: boolean;
  // continue a `before` page walk / a `since` sync with these
  next_before: string | null;
  next_since?: string | null;
  data: EnvironmentRow[];
}

export interface LightScheduleItem {
  on: string;
  off: string;
}
