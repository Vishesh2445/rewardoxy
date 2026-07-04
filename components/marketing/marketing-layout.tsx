"use client";

import { Box } from "@mui/material";
import PublicNav from "./public-nav";
import PublicFooter from "@/components/public-footer";
import colors from "@/theme/colors";

type MarketingLayoutProps = {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
};

export default function MarketingLayout({
  children,
  maxWidth = "md",
}: MarketingLayoutProps) {
  return (
    <Box
      className="glow-bg"
      sx={{ minHeight: "100vh", bgcolor: colors.bgPage, color: colors.textPrimary }}
    >
      <PublicNav />
      {children}
      <PublicFooter />
    </Box>
  );
}

export { colors as marketingColors };
