"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Box, Paper } from "@mui/material";
import { Gift, Wallet, CalendarCheck, ShoppingBag, Target } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

const NAV_ITEMS = [
  { label: "Earn", href: "/earn", Icon: Gift },
  { label: "Offers", href: "/offers/all", Icon: ShoppingBag },
  { label: "My Offers", href: "/my-offers", Icon: Target },
  { label: "Cashout", href: "/cashout", Icon: Wallet },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: "block", md: "none" },
        zIndex: 1200,
        bgcolor: "#12131c",
        borderTop: `1px solid rgba(255, 255, 255, 0.05)`,
        borderRadius: 0,
        pb: "env(safe-area-inset-bottom, 0px)", // Safe area for iOS devices
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: 64,
          px: 1,
        }}
      >
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const isActive = pathname === href;
          return (
            <Box
              key={href}
              component={Link}
              href={href}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                flex: 1,
                py: 1,
                textDecoration: "none",
                color: isActive ? "#01D676" : colors.text.secondary,
                transition: "all 0.2s ease",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: isActive ? "rgba(1, 214, 118, 0.15)" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
