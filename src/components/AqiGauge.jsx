import React from 'react'
import { Gauge } from "@mui/x-charts";
import { Typography } from "@mui/material";
function AqiGauge({ value }) {
     if (value === null || value === undefined) return null;

  return (
   <div style={{ width: 300, margin: "20px auto", textAlign: "center" }}>
      <Gauge
        value={value}
        valueMin={0}
        valueMax={500}
        startAngle={-120}
        endAngle={120}
        size={300}
        thickness={15}
        segments={[
          { value: 50, color: "#55A84F" },    // Good
          { value: 100, color: "#A3C853" },   // Moderate
          { value: 150, color: "#FFF833" },   // Unhealthy for sensitive
          { value: 200, color: "#F29C33" },   // Unhealthy
          { value: 300, color: "#E93F33" },   // Very Unhealthy
          { value: 500, color: "#AF2D24" },   // Hazardous
        ]}
      />
      <Typography variant="h6" style={{ marginTop: 10 }}>
        AQI: {value}
      </Typography>
    </div>
  )
}

export default AqiGauge
