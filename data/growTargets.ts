export interface TargetRange {
  min: number;
  max: number;
  // the "golden point" in the middle of the comfortable range
  ideal: number;
}

export interface PhaseTargets {
  temperature: TargetRange;
  humidity: TargetRange;
}

// Vegetative stage, small LED tent. Lights off runs a few degrees cooler and
// a bit more humid. Sources: Spider Farmer, Mars Hydro, Trimleaf, Gorilla
// Grow Tent guides (lights on 21-29 °C / 55-70 % RH, lights off 18-24 °C,
// VPD 0.8-1.1 kPa).
export const VEG_TARGETS: { lightsOn: PhaseTargets; lightsOff: PhaseTargets } =
  {
    lightsOn: {
      temperature: { min: 24, max: 26, ideal: 25 },
      humidity: { min: 55, max: 65, ideal: 60 },
    },
    lightsOff: {
      temperature: { min: 20, max: 22, ideal: 21 },
      humidity: { min: 60, max: 70, ideal: 65 },
    },
  };
