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

// Flowering, early to mid weeks. Temperature a bit lower than veg (LED-lit
// canopy, 22-26 °C), lights off a few degrees cooler. Humidity from VPD
// ~1.0-1.5 kPa: 40-55 %, late flower should drift towards 40-45 %.
export const FLOWER_TARGETS: {
  lightsOn: PhaseTargets;
  lightsOff: PhaseTargets;
} = {
  lightsOn: {
    temperature: { min: 22, max: 26, ideal: 24 },
    humidity: { min: 40, max: 55, ideal: 48 },
  },
  lightsOff: {
    temperature: { min: 18, max: 22, ideal: 20 },
    humidity: { min: 40, max: 55, ideal: 48 },
  },
};
