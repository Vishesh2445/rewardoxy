"use client";

import { Box } from "@mui/material";
import { keyframes } from "@mui/system";

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

export function SurveySkeleton() {
  const barSx = {
    borderRadius: "4px",
    backgroundColor: "#151B26",
    backgroundImage: "linear-gradient(90deg, #151B26 25%, #1C2433 37%, #151B26 63%)",
    backgroundSize: "400px 100%",
    animation: `${shimmer} 1.4s ease-in-out infinite, ${pulse} 2s ease-in-out infinite`,
  };

  return (
    <Box sx={{ minWidth: { xs: 90, sm: 100, md: 140 }, maxWidth: { xs: 90, sm: 100, md: 140 } }}>
      <Box sx={{ bgcolor: "#0F1219", border: "1px solid rgba(16,185,129,0.06)", p: { xs: 1, md: 1.25 }, borderRadius: "10px", display: "flex", flexDirection: "column", gap: 0.75 }}>
        <Box sx={{ width: "100%", aspectRatio: "1", ...barSx, borderRadius: "8px" }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ height: 10, ...barSx }} />
          <Box sx={{ height: 10, width: "75%", ...barSx }} />
        </Box>
        <Box sx={{ height: 9, width: "55%", ...barSx }} />
        <Box sx={{ height: 12, width: "65%", ...barSx, mt: "auto" }} />
      </Box>
    </Box>
  );
}
