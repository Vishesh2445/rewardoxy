"use client";

import { Box } from "@mui/material";

export default function GlowBackground({ children }: { children: React.ReactNode }) {
  return (
    <Box className="glow-bg" sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {children}
    </Box>
  );
}
