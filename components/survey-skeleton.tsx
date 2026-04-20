"use client";

import { Box } from "@mui/material";
import { keyframes } from "@mui/system";

const shimmer = keyframes`
  0% {
    backgroundPosition: -1000px 0;
  }
  100% {
    backgroundPosition: 1000px 0;
  }
`;

export function SurveySkeleton() {
  return (
    <Box
      sx={{
        cursor: "pointer",
        minWidth: { xs: 90, sm: 100, md: 140 },
        maxWidth: { xs: 90, sm: 100, md: 140 },
      }}
    >
      <Box
        sx={{
          bgcolor: "#12131c",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          p: { xs: 1, md: 1.25 },
          borderRadius: { xs: 2, md: 2.5 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: { xs: 0.75, md: 1 },
        }}
      >
        {/* Image Skeleton */}
        <Box
          sx={{
            width: "100%",
            aspectRatio: "1",
            borderRadius: { xs: 1, md: 1.5 },
            backgroundColor: "#1a1b2e",
            backgroundImage: "linear-gradient(90deg, #1a1b2e 25%, #222339 50%, #1a1b2e 75%)",
            backgroundSize: "1000px 100%",
            animation: `${shimmer} 2s infinite`,
            mb: { xs: 0.5, md: 0.75 },
          }}
        />

        {/* Title Skeleton - 2 lines */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            mb: { xs: 0.5, md: 0.75 },
            flex: 1,
          }}
        >
          <Box
            sx={{
              height: 10,
              borderRadius: 1,
              backgroundColor: "#1a1b2e",
              backgroundImage: "linear-gradient(90deg, #1a1b2e 25%, #222339 50%, #1a1b2e 75%)",
              backgroundSize: "1000px 100%",
              animation: `${shimmer} 2s infinite`,
            }}
          />
          <Box
            sx={{
              height: 10,
              borderRadius: 1,
              width: "80%",
              backgroundColor: "#1a1b2e",
              backgroundImage: "linear-gradient(90deg, #1a1b2e 25%, #222339 50%, #1a1b2e 75%)",
              backgroundSize: "1000px 100%",
              animation: `${shimmer} 2s infinite`,
            }}
          />
        </Box>

        {/* LOI Skeleton */}
        <Box
          sx={{
            height: 10,
            width: "60%",
            borderRadius: 1,
            backgroundColor: "#1a1b2e",
            backgroundImage: "linear-gradient(90deg, #1a1b2e 25%, #222339 50%, #1a1b2e 75%)",
            backgroundSize: "1000px 100%",
            animation: `${shimmer} 2s infinite`,
            mb: { xs: 0.5, md: 0.75 },
          }}
        />

        {/* Reward Skeleton */}
        <Box
          sx={{
            height: 12,
            width: "70%",
            borderRadius: 1,
            backgroundColor: "#1a1b2e",
            backgroundImage: "linear-gradient(90deg, #1a1b2e 25%, #222339 50%, #1a1b2e 75%)",
            backgroundSize: "1000px 100%",
            animation: `${shimmer} 2s infinite`,
            mt: "auto",
          }}
        />
      </Box>
    </Box>
  );
}
