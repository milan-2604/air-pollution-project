import React from "react";
import "./AqiGauge.css";

// --- Configuration ---
const AQI_RANGES = [
  { min: 0, max: 50, color: "#55A84F", label: "Good", darkText: false },
  { min: 50, max: 100, color: "#A3C853", label: "Satisfactory", darkText: true },
  { min: 100, max: 150, color: "#FFF833", label: "Moderate", darkText: true },
  { min: 150, max: 200, color: "#F29C33", label: "Poor", darkText: false },
  { min: 200, max: 300, color: "#E93F33", label: "Very Poor", darkText: false },
  { min: 300, max: 500, color: "#AF2D24", label: "Severe", darkText: false },
];

const POLLUTANT_LABELS = {
  pm2_5: { label: "PM2.5", sub: "" },
  pm10: { label: "PM10", sub: "" },
  no2: { label: "NO", sub: "2" },
  so2: { label: "SO", sub: "2" },
  o3: { label: "O", sub: "3" },
  co: { label: "CO", sub: "" },
};

function adjustBrightness(hex, percent) {
  let num = parseInt(hex.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

function AqiGauge({ value, components, locationName }) {
  if (value == null) return null;

  const MAX_AQI = 500;
  const clampedValue = Math.min(Math.max(value, 0), MAX_AQI);
  // -90deg is Left, 0deg is Top, +90deg is Right
  const angle = -90 + (clampedValue / MAX_AQI) * 180;

  const currentRange =
    AQI_RANGES.find((r) => clampedValue >= r.min && clampedValue <= r.max) ||
    AQI_RANGES[AQI_RANGES.length - 1];

  const containerStyle = {
    background: `linear-gradient(135deg, ${currentRange.color} 0%, ${adjustBrightness(
      currentRange.color,
      -30
    )} 100%)`,
    color: currentRange.darkText ? "#1a1a1a" : "#ffffff",
  };

  const subTextColor = currentRange.darkText ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)";

  return (
    <div className="aqi-card" style={containerStyle}>
      {/* Pulse Animation Background */}
      <div className="pulse-bg"></div>

      <header className="aqi-header">
        <h1 className="location-name">{locationName || "Unknown Location"}</h1>
        <p className="realtime-label">Real-time Air Quality</p>
      </header>

      {/* --- Gauge Section --- */}
      <div className="gauge-container">
        {/* The Semi-Circle Border Track */}
        <div className="gauge-track"></div>

        {/* Ticks */}
        { [0, 100, 200, 300, 400, 500].map((tick) => {
          const tickAngle = -90 + (tick / MAX_AQI) * 180;
          return (
            <div
              key={tick}
              className="gauge-tick"
              style={{
                // Rotate from center, then push OUT (translateY) to the rim
                transform: `translateX(-50%) rotate(${tickAngle}deg) translateY(var(--tick-offset))`,
                backgroundColor: subTextColor,
              }}
            >
              <span
                className="tick-label"
                style={{
                  // Counter-rotate text so it stays upright
                  transform: `rotate(${-tickAngle}deg)`,
                  color: subTextColor,
                }}
              >
                {tick}
              </span>
            </div>
          );
        })}

        {/* Needle */}
        <div
          className="gauge-needle"
          style={{
            transform: `translateX(-50%) rotate(${angle}deg)`,
            backgroundColor: containerStyle.color, // Usually white or dark based on theme
          }}
        >
          <div
            className="needle-tip"
            style={{ borderBottomColor: containerStyle.color }}
          ></div>
        </div>

        {/* Pivot Dot */}
        <div className="gauge-pivot" style={{ backgroundColor: containerStyle.color }}></div>
      </div>

      {/* Main Value Display */}
      <div className="aqi-value-display">
        <h2 className="aqi-number">{Math.round(clampedValue)}</h2>
        <div className="aqi-status-badge">
          <span>{currentRange.label}</span>
        </div>
      </div>

      {/* Pollutants Grid */}
      <div className="pollutants-section">
        <p className="pollutants-title" style={{ borderBottomColor: subTextColor }}>
          PRIMARY POLLUTANTS (µg/m³)
        </p>
        <div className="pollutants-grid">
          {components &&
            Object.keys(POLLUTANT_LABELS).map((key) => {
              const val = components[key];
              if (val === undefined) return null;
              return (
                <div key={key} className="pollutant-card">
                  <span className="pollutant-label">
                    {POLLUTANT_LABELS[key].label}
                    <sub>{POLLUTANT_LABELS[key].sub}</sub>
                  </span>
                  <span className="pollutant-value">{Math.round(val)}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default AqiGauge;