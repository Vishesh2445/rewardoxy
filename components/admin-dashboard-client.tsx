"use client";

import { Box, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Users, Coins, Wallet, CheckCircle, ShieldOff, ExternalLink } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import Link from "next/link";

interface RecentCompletion {
  id: string;
  player_id: string;
  program_id: string;
  offer_name: string | null;
  payout_decimal: number;
  coins_awarded: number;
  source: string;
  status: string;
  created_at: string;
}

interface AdminDashboardClientProps {
  totalUsers: number;
  totalCoins: number;
  pendingWithdrawals: number;
  totalCompletions: number;
  bannedUsers: number;
  totalChargebacks: number;
  totalChargebackCoins: number;
  netCoins: number;
  recentCompletions: RecentCompletion[];
  userMap: Record<string, { email: string; display_name: string | null }>;
}

const STAT_CARD_STYLE = {
  borderRadius: 4,
  border: `1px solid ${colors.divider}`,
  bgcolor: colors.background.primary,
  p: 3,
  transition: "all 0.2s",
  "&:hover": { borderColor: "rgba(16,185,129,0.4)" },
} as const;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function sourceLabel(source: string): string {
  const labels: Record<string, string> = {
    klink: "Klink", notik: "Notik", cpx: "CPX", gemiad: "GemiAd",
    theoremreach: "TheoremReach", revtoo: "RevToo", taskwall: "TaskWall",
    vortex: "Vortex", adgem: "AdGem", mylead: "MyLead",
    timewall: "TimeWall", adswedmedia: "AdsWedMedia",
  };
  return labels[source] || source;
}

export default function AdminDashboardClient({
  totalUsers,
  totalCoins,
  pendingWithdrawals,
  totalCompletions,
  bannedUsers,
  totalChargebacks,
  totalChargebackCoins,
  netCoins,
  recentCompletions,
  userMap,
}: AdminDashboardClientProps) {
  const netCompletions = totalCompletions - totalChargebacks;

  const stats = [
    { icon: <Users size={22} />, label: "Total Users", value: totalUsers.toLocaleString(), color: "#10B981" },
    { icon: <Coins size={22} />, label: "Total Coins Earned", value: totalCoins.toLocaleString(), color: "#10B981" },
    { icon: <Wallet size={22} />, label: "Coins After Chargebacks", value: netCoins.toLocaleString(), color: "#14b8a6", highlight: true },
    { icon: <CheckCircle size={22} />, label: "Total Completions", value: totalCompletions.toLocaleString(), color: "#10B981" },
    { icon: <ShieldOff size={22} />, label: "Total Chargebacks", value: `${totalChargebacks.toLocaleString()} (${Math.round(totalChargebackCoins).toLocaleString()} coins)`, color: totalChargebacks > 0 ? "#f87171" : "#10B981" },
    { icon: <CheckCircle size={22} />, label: "Net Completions", value: netCompletions.toLocaleString(), color: "#14b8a6" },
    { icon: <Wallet size={22} />, label: "Pending Withdrawals", value: String(pendingWithdrawals), color: pendingWithdrawals > 0 ? "#facc15" : "#10B981" },
    { icon: <ShieldOff size={22} />, label: "Banned Users", value: String(bannedUsers), color: bannedUsers > 0 ? "#f87171" : "#10B981" },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: { xs: 12, lg: 4 } }}>
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
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={s.label}>
            <Paper sx={{
              ...STAT_CARD_STYLE,
              ...(('highlight' in s && s.highlight) && {
                border: `2px solid ${s.color}`,
                boxShadow: `0 0 20px ${s.color}33`,
              })
            }}>
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
                  minHeight: "24px",
                }}
              >
                {s.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  fontWeight: 700,
                  color: s.color,
                  mt: 0.25,
                  wordBreak: "break-word",
                }}
              >
                {s.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Completions */}
      <Paper sx={{ mt: 4, borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.background.primary, overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${colors.divider}`, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10B981" }} />
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>Recent Completions</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>(last 5)</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {["Offer", "Offerwall", "User", "Coins", "Date", ""].map((h) => (
                  <TableCell key={h} sx={{ color: colors.text.secondary, fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", borderColor: colors.divider, bgcolor: colors.background.secondary, whiteSpace: "nowrap" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {recentCompletions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ borderColor: colors.divider, textAlign: "center", py: 4 }}>
                    <Typography sx={{ fontSize: "0.8rem", color: colors.text.secondary }}>No completions yet</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                recentCompletions.map((c) => {
                  const user = userMap[c.player_id];
                  const displayName = user?.display_name || user?.email || c.player_id.slice(0, 8) + "...";
                  return (
                    <TableRow key={c.id} sx={{ "&:hover": { bgcolor: colors.background.ternary } }}>
                      <TableCell sx={{ borderColor: colors.divider, color: "#fff", fontSize: "0.8rem", maxWidth: 250 }}>
                        <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.offer_name || c.program_id || "Unknown Offer"}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.divider }}>
                        <Box sx={{ display: "inline-block", borderRadius: 50, px: 1.25, py: 0.25, fontSize: "0.7rem", fontWeight: 600, bgcolor: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.25)" }}>
                          {sourceLabel(c.source)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.divider, fontSize: "0.8rem", color: colors.text.secondary }}>{displayName}</TableCell>
                      <TableCell sx={{ borderColor: colors.divider, color: "#10B981", fontWeight: 600, fontSize: "0.85rem" }}>
                        {c.coins_awarded > 0 ? "+" : ""}{Math.round(c.coins_awarded).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.divider, color: colors.text.secondary, fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                        {formatDate(c.created_at)}
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.divider }}>
                        <Box
                          component={Link}
                          href={`/admin/users`}
                          sx={{
                            display: "inline-flex", alignItems: "center", gap: 0.5,
                            fontSize: "0.75rem", fontWeight: 600, color: "#06B6D4",
                            textDecoration: "none", cursor: "pointer",
                            "&:hover": { color: "#10B981" },
                          }}
                        >
                          <ExternalLink size={14} />
                          View User
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
