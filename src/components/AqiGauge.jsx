
import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";

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

// Helper to darken colors for gradients
function adjustBrightness(hex, percent) {
  let num = parseInt(hex.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
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

  // 1. Math Constants
  const MAX_AQI = 500;
  const clampedValue = Math.min(Math.max(value, 0), MAX_AQI);
  
  // Calculate Angle: Map 0-500 to -90deg (Left) -> +90deg (Right)
  const angle = -90 + (clampedValue / MAX_AQI) * 180;

  // 2. Find Current Color Range
  const currentRange =
    AQI_RANGES.find((r) => clampedValue >= r.min && clampedValue <= r.max) ||
    AQI_RANGES[AQI_RANGES.length - 1];

  const textColor = currentRange.darkText ? "#1a1a1a" : "#ffffff";
  const subTextColor = currentRange.darkText ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)";

  return (
    <Box
      width="100%"
      maxWidth={600}
      mx="auto"
      mt={4}
      p={3}
      borderRadius={5}
      sx={{
        background: `linear-gradient(135deg, ${currentRange.color} 0%, ${adjustBrightness(
          currentRange.color,
          -30
        )} 100%)`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        transition: "background 0.8s ease",
        position: "relative",
        overflow: "hidden",
        color: textColor,
      }}
    >
      {/* "Breathing" Background Animation */}
      <Box
        sx={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: 300,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.1)",
          zIndex: 0,
          animation: "pulse 3s infinite ease-in-out",
          "@keyframes pulse": {
            "0%": { transform: "translate(-50%, -50%) scale(0.9)", opacity: 0.1 },
            "50%": { transform: "translate(-50%, -50%) scale(1.1)", opacity: 0.3 },
            "100%": { transform: "translate(-50%, -50%) scale(0.9)", opacity: 0.1 },
          },
        }}
      />



        <Typography
          variant="h4"
          fontWeight="800"
          sx={{ 
            textTransform: "capitalize", 
            letterSpacing: -1,
            mb: 0,
            textShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}
        >
          {locationName || "Unknown Location"}
        </Typography>




      <Typography
        variant="h6"
        align="center"
        fontWeight="bold"
        sx={{ position: "relative", zIndex: 1, mb: 2, letterSpacing: 1, textTransform: "uppercase" }}
      >
        Real-time Air Quality
      </Typography>

      {/* --- Gauge Container --- */}
      <Box
        position="relative"
        zIndex={1}
        height={160} // Half of the 300px width + padding
        display="flex"
        justifyContent="center"
        overflow="hidden" // Hides the bottom half of the circle
      >
        {/* The Semi-Circle Track */}
        <Box
          sx={{
            position: "relative",
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: "20px solid rgba(255,255,255,0.2)",
            borderBottomColor: "transparent", // Makes it a semi-circle visually
            borderRightColor: "transparent", // Only helps if rotated, but we use overflow hidden on parent
            boxSizing: "border-box",
            mt: 0 // Align to top of container
          }}
        >
          {/* SCALE TICKS */}
          {[0, 100, 200, 300, 400, 500].map((tick) => {
             // Map tick value to angle: 0 -> -90, 500 -> +90
             const tickAngle = -90 + (tick / MAX_AQI) * 180;
             
             return (
              <Box
                key={tick}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  // We position at center, then rotate, then push outward with translateY
                  height: 10, // Length of tick mark
                  width: 2,
                  bgcolor: subTextColor,
                  transformOrigin: "top center",
                  // 130px is roughly radius (150) minus border (20) minus padding
                  transform: `rotate(${tickAngle}deg) translateY(-125px)`, 
                }}
              >
                 {/* Text Label for the Tick */}
                 <Typography
                    variant="caption"
                    sx={{
                        position: 'absolute',
                        top: -20, 
                        left: -10,
                        width: 20,
                        textAlign: 'center',
                        transform: `rotate(${-tickAngle}deg)`, // Keep text upright
                        fontWeight: 'bold',
                        color: subTextColor
                    }}
                 >
                     {tick}
                 </Typography>
              </Box>
             );
          })}
        </Box>

        {/* POINTER NEEDLE */}
        <Box
            sx={{
                position: "absolute",
                bottom: 10, // Align with the bottom of the semi-circle
                left: "50%",
                width: 6,
                height: 140, // Needle Length
                bgcolor: textColor,
                borderRadius: "4px",
                transformOrigin: "bottom center",
                transform: `translateX(-50%) rotate(${angle}deg)`,
                transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: 5,
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
            }}
        >
             <Box 
               sx={{
                 position: 'absolute',
                 top: 0,
                 left: '50%',
                 transform: 'translateX(-50%)',
                 width: 0, 
                 height: 0, 
                 borderLeft: '6px solid transparent',
                 borderRight: '6px solid transparent',
                 borderBottom: `10px solid ${textColor}`,
               }} 
             />
        </Box>
        
        {/* Center Pivot Dot */}
        <Box 
            sx={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translate(-50%, 50%)', // Center it on the bottom line
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: textColor,
                zIndex: 6,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
        />
      </Box>

      {/* --- Main Value Display --- */}
      <Box textAlign="center" mt={-2} position="relative" zIndex={2}>

    
        <Typography variant="h2" fontWeight="800" sx={{ lineHeight: 1 }}>
            {Math.round(clampedValue)}
        </Typography>
        <Box 
            display="inline-block"
            sx={{ 
                bgcolor: "rgba(0,0,0,0.1)", 
                px: 2, 
                py: 0.5, 
                borderRadius: 2, 
                mt: 1,
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.2)"
            }}
        >
            <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                {currentRange.label}
            </Typography>
        </Box>
      </Box>

      {/* --- Pollutants Grid --- */}
      <Box mt={4} sx={{ position: "relative", zIndex: 1 }}>
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 1.5, fontWeight: 'bold', borderBottom: `1px solid ${subTextColor}`, pb: 1 }}>
          PRIMARY POLLUTANTS (µg/m³)
        </Typography>
        
        <Grid container spacing={1.5}>
          {components &&
            Object.keys(POLLUTANT_LABELS).map((key) => {
              const val = components[key];
              if (val === undefined) return null;

              return (
                <Grid item xs={4} sm={2} key={key}>
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(10px)",
                      color: textColor,
                      p: 1.5,
                      borderRadius: 3,
                      textAlign: "center",
                      border: `1px solid rgba(255,255,255,0.15)`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        bgcolor: "rgba(255,255,255,0.3)",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                      }
                    }}
                  >
                    <Typography variant="caption" display="block" sx={{ opacity: 0.8, fontWeight: 'bold', fontSize: '0.7rem' }}>
                      {POLLUTANT_LABELS[key].label}
                      <sub>{POLLUTANT_LABELS[key].sub}</sub>
                    </Typography>
                    <Typography variant="body1" fontWeight="900" sx={{ mt: 0.5 }}>
                      {Math.round(val)}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
        </Grid>
      </Box>
    </Box>
  );
}

export default AqiGauge;