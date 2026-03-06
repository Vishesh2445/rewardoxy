import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Clock, Trophy, Medal } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

export const dynamic = "force-dynamic";

function RankCell({ rank }: { rank: number }) {
  if (rank <= 3) {
    const emoji = rank === 1 ? "\u{1F947}" : rank === 2 ? "\u{1F948}" : "\u{1F949}";
    return (
      <Box
        sx={{
          display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", fontSize: "1.125rem",
          bgcolor: rank === 1 ? colors.background.secondary : colors.primary,
          border: `1px solid ${rank === 1 ? "rgba(1,214,118,0.2)" : colors.divider}`,
        }}
        role="img"
        aria-label={`${rank}${rank === 1 ? "st" : rank === 2 ? "nd" : "rd"} place`}
      >
        {emoji}
      </Box>
    );
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, fontSize: "0.875rem", fontWeight: 500, color: colors.text.secondary }}>
      {rank}
    </Box>
  );
}

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [leaderboardResult, userResult] = await Promise.all([
    supabase
      .from("leaderboard_cache")
      .select("rank, user_id, display_name, weekly_coins")
      .order("rank", { ascending: true }),
    user
      ? supabase
          .from("users")
          .select("coins_balance")
          .eq("id", user.id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const leaderboard = leaderboardResult.data ?? [];
  const coins = userResult.data?.coins_balance ?? 0;

  return (
    <AppShell coins={user ? coins : undefined}>
      <Box sx={{ maxWidth: 768, mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Trophy size={24} color="#01D676" />
              Leaderboard
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary }}>Top earners this week</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, borderRadius: 50, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, px: 1.5, py: 0.75, fontSize: "11px", fontWeight: 500, color: colors.text.secondary }}>
            <Clock size={12} />
            Updated every 6 hours
          </Box>
        </Box>

        {leaderboard.length === 0 ? (
          <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 6, textAlign: "center" }}>
            <Medal size={40} color="rgba(169,169,202,0.4)" style={{ margin: "0 auto" }} />
            <Typography variant="body2" sx={{ mt: 1.5, color: colors.text.secondary }}>
              No leaderboard data yet. Check back soon.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Mobile cards */}
            <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
              {leaderboard.map((row) => {
                const isMe = user?.id === row.user_id;
                return (
                  <Box
                    key={row.user_id}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5, borderRadius: 3, px: 2, py: 1.5, transition: "all 0.2s",
                      border: `1px solid ${isMe ? "rgba(1,214,118,0.4)" : colors.divider}`,
                      bgcolor: isMe ? "rgba(1,214,118,0.05)" : colors.primary,
                      ...(isMe ? { boxShadow: "0 4px 20px rgba(1,214,118,0.05)" } : { "&:hover": { bgcolor: colors.background.ternary } }),
                    }}
                  >
                    <RankCell rank={row.rank} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isMe ? "#01D676" : "#fff" }} truncate>
                        {row.display_name}
                        {isMe && (
                          <Box component="span" sx={{ ml: 1, borderRadius: 50, bgcolor: colors.background.secondary, border: "1px solid rgba(1,214,118,0.2)", px: 1, py: 0.25, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", color: "#01D676" }}>
                            You
                          </Box>
                        )}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#01D676" }}>
                      {row.weekly_coins.toLocaleString()}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Desktop table */}
            <TableContainer component={Paper} sx={{ display: { xs: "none", sm: "block" }, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: "transparent", overflow: "hidden" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(29,30,48,0.8)" }}>
                    <TableCell align="center" sx={{ width: 64, color: colors.text.secondary, fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 500, borderColor: colors.divider }}>Rank</TableCell>
                    <TableCell sx={{ color: colors.text.secondary, fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 500, borderColor: colors.divider }}>Player</TableCell>
                    <TableCell align="right" sx={{ color: colors.text.secondary, fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 500, borderColor: colors.divider }}>Weekly Coins</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((row) => {
                    const isMe = user?.id === row.user_id;
                    return (
                      <TableRow
                        key={row.user_id}
                        sx={{
                          bgcolor: isMe ? "rgba(1,214,118,0.05)" : "rgba(29,30,48,0.4)",
                          ...(!isMe && { "&:hover": { bgcolor: colors.background.ternary } }),
                        }}
                      >
                        <TableCell align="center" sx={{ borderColor: colors.divider }}>
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <RankCell rank={row.rank} />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, color: isMe ? "#01D676" : "#fff", borderColor: colors.divider }}>
                          {row.display_name}
                          {isMe && (
                            <Box component="span" sx={{ ml: 1, borderRadius: 50, bgcolor: colors.background.secondary, border: "1px solid rgba(1,214,118,0.2)", px: 1, py: 0.25, fontSize: "10px", fontWeight: 600, textTransform: "uppercase", color: "#01D676" }}>
                              You
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: "#01D676", borderColor: colors.divider }}>
                          {row.weekly_coins.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </AppShell>
  );
}
