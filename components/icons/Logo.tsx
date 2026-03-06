"use client";

import { Box } from "@mui/material";
import Link from "next/link";

const Logo = ({ href = "/" }: { href?: string }) => {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 33,
          height: 28,
          borderRadius: "8px",
          background: "linear-gradient(135deg, #01D676 0%, #007e45 100%)",
          boxShadow: "0 4px 12px rgba(1, 214, 118, 0.2)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"
            fill="white"
          />
        </svg>
      </Box>
      <Box sx={{ display: { xs: "none", md: "inline-flex" }, alignItems: "center" }}>
        <Box
          component="span"
          sx={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#01D676",
            lineHeight: 1,
          }}
        >
          Reward
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          oxy
        </Box>
      </Box>
    </Link>
  );
};

export default Logo;
