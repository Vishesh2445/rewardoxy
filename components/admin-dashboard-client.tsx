"use client";

import { Box, Paper, Grid } from "@mui/material";
import { Users, Coins, Wallet, CheckCircle, ShieldOff } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

interface AdminDashboardClientProps {
  totalUsers: number;
  totalCoins: number;
  pendingWithdrawals: number;
  totalCompletions: number;
  bannedUsers: number;
}

const STAT_CARD_STYLE = {
  borderRadius: 4,
  border: `1px solid ${colors.divider}`,
  bgcolor: colors.primary,
  p: 3,
  transition: "all 0.2s",
  "&:hover": { borderColor: "rgba(1,214,118,0.4)" },
} as const;

export default function AdminDashboardClient({
  totalUsers,
  totalCoins,
  pendingWithdrawals,
  totalCompletions,
  bannedUsers,
}: AdminDashboardClientProps) {
  const stats = [
    { icon: <Users size={22} />, label: "Total Users", value: totalUsers.toLocaleString(), color: "#01D676" },
    { icon: <Coins size={22} />, label: "Coins in Circulation", value: totalCoins.toLocaleString(), color: "#01D676" },
    { icon: <Wallet size={22} />, label: "Pending Withdrawals", value: String(pendingWithdrawals), color: pendingWithdrawals > 0 ? "#facc15" : "#01D676" },
    { icon: <CheckCircle size={22} />, label: "Total Completions", value: totalCompletions.toLocaleString(), color: "#01D676" },
    { icon: <ShieldOff size={22} />, label: "Banned Users", value: String(bannedUsers), color: bannedUsers > 0 ? "#f87171" : "#01D676" },
  ];

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" isBold>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Overview of platform activity
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {stats.map((s) => (
          <Grid size={{ xs: 6, sm: 4, lg: 2.4 }} key={s.label}>
            <Paper sx={STAT_CARD_STYLE}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  bgcolor: `${s.color}15`,
                  border: `1px solid ${s.color}33`,
                  color: s.color,
                  mb: 1.5,
                }}
              >
                {s.icon}
              </Box>
              <Typography
                sx={{
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: colors.text.secondary,
                }}
              >
                {s.label}
              </Typography>
              <Typography
                sx={{ fontSize: "1.5rem", fontWeight: 700, color: s.color, mt: 0.25 }}
              >
                {s.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
