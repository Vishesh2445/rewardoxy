"use client";

import { Box } from "@mui/material";

const LOGOS = [
  { src: "/mylead_logo.svg", alt: "MyLead" },
  { src: "/cpx.png", alt: "CPX Research" },
  { src: "/mobivortex-icon.png", alt: "Vortex" },
  { src: "/taskwall.svg", alt: "Taskwall" },
  { src: "/notik.webp", alt: "Notik" },
  { src: "/gemiad-logo.png", alt: "Gemiad" },
  { src: "/revtoo.svg", alt: "Revtoo" },
  { src: "/klink-icon.png", alt: "Klink" },
  { src: "/theoremreach.svg", alt: "TheoremReach" },
];

const colors = {
  bgPage: "#141523",
  bgCard: "#1d1e30",
  divider: "#2a2b43",
};

export default function ProviderCarousel() {
  const items = [...LOGOS, ...LOGOS];

  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      {/* Left fade */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: { xs: 20, sm: 60, md: 100 },
          height: "100%",
          background: `linear-gradient(90deg, ${colors.bgPage}, transparent)`,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      {/* Right fade */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: { xs: 20, sm: 60, md: 100 },
          height: "100%",
          background: `linear-gradient(270deg, ${colors.bgPage}, transparent)`,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      <Box
        sx={{
          display: "flex",
          width: "max-content",
          animation: "carousel-scroll 30s linear infinite",
          "&:hover": { animationPlayState: { md: "paused" } },
          "@keyframes carousel-scroll": {
            "0%": { transform: "translateX(0)" },
            "100%": { transform: "translateX(-50%)" },
          },
        }}
      >
        {items.map((logo, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: { xs: 140, sm: 180, md: 200 },
              height: { xs: 80, sm: 90, md: 100 },
              mx: { xs: 1, sm: 1.5, md: 2 },
              borderRadius: 2,
              border: `1px solid ${colors.divider}`,
              bgcolor: colors.bgCard,
              flexShrink: 0,
              transition: "border-color 0.3s, background-color 0.3s",
              "&:hover": {
                borderColor: "rgba(16,185,129,0.5)",
                bgcolor: "rgba(16,185,129,0.05)",
              },
            }}
          >
            <Box
              component="img"
              src={logo.src}
              alt={logo.alt}
              sx={{ maxWidth: "85%", maxHeight: "85%", objectFit: "contain" }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
