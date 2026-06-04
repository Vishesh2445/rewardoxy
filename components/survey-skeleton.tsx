"use client";

import { Box } from "@mui/material";

export function SurveySkeleton() {
  return (
    <Box sx={{ minWidth: { xs: 100, sm: 140 }, maxWidth: { xs: 100, sm: 140 } }}>
      <Box sx={{ bgcolor: "#151B26", p: { xs: 0.75, sm: 1.5 }, borderRadius: { xs: 1.5, sm: 2.5 } }}>
        <Box sx={{
          width: "100%",
          aspectRatio: "1",
          borderRadius: { xs: 1, sm: 1.5 },
          bgcolor: "#0F1219",
          mb: { xs: 1, sm: 1.5 },
          position: "relative",
          overflow: "hidden",
          animation: "pulse 2s ease-in-out infinite",
          "@keyframes pulse": { "0%,100%": { opacity: 0.6 }, "50%": { opacity: 1 } },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.04), transparent)",
            animation: "shimmer 1.4s ease-in-out infinite",
          },
          "@keyframes shimmer": {
            "0%": { left: "-100%" },
            "100%": { left: "100%" },
          },
        }} />
        <Box sx={{ height: { xs: 10, sm: 11 }, bgcolor: "#0F1219", borderRadius: 1, width: "80%", mb: { xs: 0.5, sm: 1 }, animation: "pulse 2s ease-in-out infinite 0.1s" }} />
        <Box sx={{ height: { xs: 12, sm: 14 }, bgcolor: "#0F1219", borderRadius: 1, width: "45%", animation: "pulse 2s ease-in-out infinite 0.2s" }} />
      </Box>
    </Box>
  );
}
