"use client";

import { Box } from "@mui/material";
import Link from "next/link";
import Image from "next/image";

const Logo = ({ href = "/" }: { href?: string }) => {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          width: 33,
          height: 28,
        }}
      >
        <Image
          src="/logo.png"
          alt="Rewardoxy"
          width={33}
          height={28}
          style={{ objectFit: "contain" }}
        />
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
