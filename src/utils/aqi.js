// constants.js or inside your utility file

// Standard US EPA Breakpoints (2024 aligned)
const BREAKPOINTS = {
  pm25: [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
  ],
  // Ozone 8-hour (ppm)
  o3: [
    { cLow: 0.0, cHigh: 0.054, iLow: 0, iHigh: 50 },
    { cLow: 0.055, cHigh: 0.07, iLow: 51, iHigh: 100 },
    { cLow: 0.071, cHigh: 0.085, iLow: 101, iHigh: 150 },
    { cLow: 0.086, cHigh: 0.105, iLow: 151, iHigh: 200 },
    { cLow: 0.106, cHigh: 0.2, iLow: 201, iHigh: 300 },
  ],
  // CO 8-hour (ppm)
  co: [
    { cLow: 0.0, cHigh: 4.4, iLow: 0, iHigh: 50 },
    { cLow: 4.5, cHigh: 9.4, iLow: 51, iHigh: 100 },
    { cLow: 9.5, cHigh: 12.4, iLow: 101, iHigh: 150 },
    { cLow: 12.5, cHigh: 15.4, iLow: 151, iHigh: 200 },
    { cLow: 15.5, cHigh: 30.4, iLow: 201, iHigh: 300 },
    { cLow: 30.5, cHigh: 50.4, iLow: 301, iHigh: 500 },
  ],
  // NO2 1-hour (ppm)
  no2: [
    { cLow: 0.0, cHigh: 0.053, iLow: 0, iHigh: 50 },
    { cLow: 0.054, cHigh: 0.1, iLow: 51, iHigh: 100 },
    { cLow: 0.101, cHigh: 0.36, iLow: 101, iHigh: 150 },
    { cLow: 0.361, cHigh: 0.649, iLow: 151, iHigh: 200 },
    { cLow: 0.65, cHigh: 1.249, iLow: 201, iHigh: 300 },
    { cLow: 1.25, cHigh: 2.049, iLow: 301, iHigh: 500 },
  ],
  // SO2 1-hour (ppm)
  so2: [
    { cLow: 0.0, cHigh: 0.035, iLow: 0, iHigh: 50 },
    { cLow: 0.036, cHigh: 0.075, iLow: 51, iHigh: 100 },
    { cLow: 0.076, cHigh: 0.185, iLow: 101, iHigh: 150 },
    { cLow: 0.186, cHigh: 0.304, iLow: 151, iHigh: 200 },
    { cLow: 0.305, cHigh: 0.604, iLow: 201, iHigh: 300 },
    { cLow: 0.605, cHigh: 1.004, iLow: 301, iHigh: 500 },
  ],
};

function calculateIndividualAQI(c, breakpoints) {
  for (const bp of breakpoints) {
    if (c >= bp.cLow && c <= bp.cHigh) {
      return Math.round(
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow
      );
    }
  }
  return 500; // Cap at 500
}

// Correct conversion from µg/m³ to PPM
function µgPerM3ToPPM(value, molarMass) {
  // Formula: (µg/m3 * 24.45) / (MW * 1000)
  return (value * 24.45) / (molarMass * 1000);
}

export function calculateUS_AQI(components) {
  // 1. Convert Units first (Clean and Explicit)
  // PM2.5 and PM10 use raw µg/m³ (Truncate to EPA standards)
  const pm25Val = Math.floor(components.pm2_5 * 10) / 10;
  const pm10Val = Math.floor(components.pm10);

  // Gases need conversion to PPM
  const coPPM = µgPerM3ToPPM(components.co, 28.01);
  const o3PPM = µgPerM3ToPPM(components.o3, 48.0);
  const no2PPM = µgPerM3ToPPM(components.no2, 46.0055);
  const so2PPM = µgPerM3ToPPM(components.so2, 64.066);

  // 2. Calculate individual AQIs
  // Note: We pass the direct PPM values now, no extra division needed inside
  const results = [
    calculateIndividualAQI(pm25Val, BREAKPOINTS.pm25),
    calculateIndividualAQI(pm10Val, BREAKPOINTS.pm10),
    calculateIndividualAQI(coPPM, BREAKPOINTS.co),
    calculateIndividualAQI(o3PPM, BREAKPOINTS.o3),
    calculateIndividualAQI(no2PPM, BREAKPOINTS.no2),
    calculateIndividualAQI(so2PPM, BREAKPOINTS.so2),
  ];

  // 3. The overall AQI is the maximum of the individual AQIs
  return Math.max(...results);
}