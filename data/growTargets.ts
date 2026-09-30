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

// Vegetative stage sweet spot. Temperature: Trimleaf 24-27 °C, Mars Hydro
// 24-28 °C. Humidity from VPD 0.8-1.2 kPa (all guides) with an LED-lit leaf
// ~2 °C below 25 °C air: 52-62 % RH, ideal 1.0 kPa at 57 %. Lights off has
// no sweet spot in the guides - Royal Queen Seeds 20-24 °C.
export const VEG_TARGETS: { lightsOn: PhaseTargets; lightsOff: PhaseTargets } =
  {
    lightsOn: {
      temperature: { min: 24, max: 27, ideal: 25 },
      humidity: { min: 52, max: 62, ideal: 57 },
    },
    lightsOff: {
      temperature: { min: 20, max: 24, ideal: 22 },
      humidity: { min: 52, max: 62, ideal: 57 },
    },
  };
