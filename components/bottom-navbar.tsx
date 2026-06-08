"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Box, Paper } from "@mui/material";
import { Gift, Wallet, Gamepad2, Target } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

const NAV_ITEMS = [
  { label: "Earn", href: "/earn", Icon: Gift },
  { label: "Offers", href: "/offers/all", Icon: Gamepad2 },
  { label: "My Offers", href: "/my-offers", Icon: Target },
  { label: "Cashout", href: "/cashout", Icon: Wallet },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <Paper elevation={0} sx={{ position: "fixed", bottom: 0, left: 0, right: 0, display: { xs: "block", md: "none" }, zIndex: 1200, bgcolor: "rgba(8,11,18,0.95)", backdropFilter: "blur(20px)", borderTop: `1px solid ${colors.glass.border}`, borderRadius: 0, pb: "env(safe-area-inset-bottom, 0px)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: 64, px: 1 }}>
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const isActive = pathname === href;
          return (
            <Box key={href} component={Link} href={href} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5, flex: 1, py: 1, textDecoration: "none", color: isActive ? colors.primary : colors.text.secondary, transition: "all 0.2s ease", "&:active": { transform: "scale(0.95)" } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "10px", bgcolor: isActive ? "rgba(16,185,129,0.12)" : "transparent", transition: "all 0.2s ease" }}>
                <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
              </Box>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: isActive ? 700 : 500, letterSpacing: "0.02em" }}>{label}</Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
