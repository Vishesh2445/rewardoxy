import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Clock, Trophy, Medal, Coins } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

export const dynamic = "force-dynamic";

const PODIUM_STYLES = [
  {
    rank: 1,
    emoji: "🥇",
    label: "CHAMPION",
    cardBg: "linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(180,130,0,0.1) 100%)",
    border: "rgba(251,191,36,0.4)",
    namePillBg: "rgba(251,191,36,0.12)",
    namePillBorder: "rgba(251,191,36,0.3)",
    namePillColor: "#fbbf24",
    avatarBg: "linear-gradient(135deg,#fbbf24,#b45309)",
    glow: "0 0 40px rgba(251,191,36,0.2)",
    rankColor: "#fbbf24",
    order: 2, // middle
    height: { xs: "auto", sm: 200 },
  },
  {
    rank: 2,
    emoji: "🥈",
    label: "2nd",
    cardBg: "linear-gradient(135deg, rgba(148,163,184,0.1) 0%, rgba(100,116,139,0.06) 100%)",
    border: "rgba(148,163,184,0.3)",
    namePillBg: "rgba(148,163,184,0.08)",
    namePillBorder: "rgba(148,163,184,0.2)",
    namePillColor: "#94a3b8",
    avatarBg: "linear-gradient(135deg,#94a3b8,#475569)",
    glow: "none",
    rankColor: "#94a3b8",
    order: 1, // left
    height: { xs: "auto", sm: 170 },
  },
  {
    rank: 3,
    emoji: "🥉",
    label: "3rd",
    cardBg: "linear-gradient(135deg, rgba(180,83,9,0.12) 0%, rgba(120,53,15,0.07) 100%)",
    border: "rgba(180,83,9,0.35)",
    namePillBg: "rgba(180,83,9,0.1)",
    namePillBorder: "rgba(180,83,9,0.25)",
    namePillColor: "#c2855f",
    avatarBg: "linear-gradient(135deg,#cd7f32,#92400e)",
    glow: "none",
    rankColor: "#cd7f32",
    order: 3, // right
    height: { xs: "auto", sm: 155 },
  },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const st = PODIUM_STYLES.find((s) => s.rank === rank)!;
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: st.cardBg,
          border: `1px solid ${st.border}`,
          fontSize: "1rem",
        }}
        role="img"
        aria-label={`${rank}${rank === 1 ? "st" : rank === 2 ? "nd" : "rd"} place`}
      >
        {st.emoji}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        fontSize: "0.875rem",
        fontWeight: 600,
        color: rank <= 10 ? "#01D676" : colors.text.secondary,
      }}
    >
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
  const top3 = leaderboard.filter((r) => r.rank <= 3);
  const rest = leaderboard.filter((r) => r.rank > 3);
  const myRank = leaderboard.find((r) => r.user_id === user?.id);

  return (
    <AppShell coins={user ? coins : undefined}>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 5, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Trophy size={26} color="#f59e0b" />
              Leaderboard
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary, mt: 0.5 }}>
              Top earners this month. Compete for exclusive rewards!
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              borderRadius: 50,
              border: `1px solid ${colors.divider}`,
              bgcolor: colors.background.secondary,
              px: 1.75,
              py: 0.875,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: colors.text.secondary,
            }}
          >
            <Clock size={13} />
            Updated every 6 hours
          </Box>
        </Box>

        {leaderboard.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: `1px solid ${colors.divider}`,
              bgcolor: colors.background.secondary,
              p: 6,
              textAlign: "center",
            }}
          >
            <Medal size={40} color="rgba(169,169,202,0.35)" style={{ margin: "0 auto" }} />
            <Typography variant="body2" sx={{ mt: 2, color: colors.text.secondary }}>
              No leaderboard data yet. Check back soon.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* ── TOP 3 PODIUM ── */}
            {top3.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: colors.text.secondary, fontSize: "0.7rem" }}>
                  🏆 Top Earners This Month
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                    gap: 2,
                    // On desktop, visually reorder so rank 2 is left, 1 is center, 3 is right
                    "& > *:nth-of-type(1)": { order: { xs: 1, sm: PODIUM_STYLES.find((s) => s.rank === top3[0]?.rank)?.order } },
                    "& > *:nth-of-type(2)": { order: { xs: 2, sm: PODIUM_STYLES.find((s) => s.rank === top3[1]?.rank)?.order } },
                    "& > *:nth-of-type(3)": { order: { xs: 3, sm: PODIUM_STYLES.find((s) => s.rank === top3[2]?.rank)?.order } },
                  }}
                >
                  {top3.map((row) => {
                    const st = PODIUM_STYLES.find((s) => s.rank === row.rank)!;
                    const isMe = user?.id === row.user_id;
                    const initials = row.display_name.slice(0, 2).toUpperCase();
                    return (
                      <Paper
                        key={row.user_id}
                        elevation={0}
                        sx={{
                          borderRadius: 4,
                          border: `1px solid ${isMe ? "rgba(1,214,118,0.5)" : st.border}`,
                          background: isMe ? "linear-gradient(135deg, rgba(1,214,118,0.1) 0%, rgba(0,126,69,0.06) 100%)" : st.cardBg,
                          p: 3,
                          textAlign: "center",
                          boxShadow: row.rank === 1 ? st.glow : "none",
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: st.height,
                          transition: "all 0.2s",
                        }}
                      >
                        {isMe && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              borderRadius: 50,
                              bgcolor: "rgba(1,214,118,0.15)",
                              border: "1px solid rgba(1,214,118,0.3)",
                              px: 1,
                              py: 0.15,
                              fontSize: "9px",
                              fontWeight: 700,
                              color: "#01D676",
                            }}
                          >
                            YOU
                          </Box>
                        )}
                        <Box sx={{ mb: 1, fontSize: { xs: "1.5rem", sm: row.rank === 1 ? "2rem" : "1.5rem" } }}>{st.emoji}</Box>
                        {/* Avatar */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: row.rank === 1 ? 60 : 48,
                            height: row.rank === 1 ? 60 : 48,
                            borderRadius: "50%",
                            background: isMe ? "linear-gradient(135deg,#01D676,#007e45)" : st.avatarBg,
                            fontWeight: 800,
                            fontSize: row.rank === 1 ? "1.2rem" : "1rem",
                            color: "#fff",
                            mb: 1.5,
                            boxShadow: row.rank === 1 ? "0 4px 16px rgba(251,191,36,0.3)" : "none",
                          }}
                        >
                          {initials}
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: row.rank === 1 ? "0.95rem" : "0.85rem",
                            color: isMe ? "#01D676" : "#fff",
                            mb: 0.75,
                            maxWidth: 120,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.display_name}
                        </Typography>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            borderRadius: 50,
                            bgcolor: st.namePillBg,
                            border: `1px solid ${st.namePillBorder}`,
                            px: 1.5,
                            py: 0.35,
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            color: isMe ? "#01D676" : st.namePillColor,
                          }}
                        >
                          <Coins size={13} />
                          {row.weekly_coins.toLocaleString()}
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* ── YOUR RANK CARD (if not in top 3) ── */}
            {myRank && myRank.rank > 3 && (
              <Paper
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  border: "1px solid rgba(1,214,118,0.35)",
                  bgcolor: "rgba(1,214,118,0.06)",
                  px: 3,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 2, bgcolor: "rgba(1,214,118,0.15)", border: "1px solid rgba(1,214,118,0.25)", fontWeight: 800, fontSize: "0.9rem", color: "#01D676" }}>
                    #{myRank.rank}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#01D676", fontSize: "0.9rem" }}>Your Current Rank</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: colors.text.secondary }}>{myRank.display_name}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, borderRadius: 50, bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)", px: 1.75, py: 0.5, fontSize: "0.875rem", fontWeight: 700, color: "#01D676" }}>
                  <Coins size={14} />
                  {myRank.weekly_coins.toLocaleString()} coins this month
                </Box>
              </Paper>
            )}

            {/* ── REST OF LEADERBOARD TABLE ── */}
            {rest.length > 0 && (
              <>
                {/* Mobile cards */}
                <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
                  {leaderboard.map((row) => {
                    const isMe = user?.id === row.user_id;
                    return (
                      <Box
                        key={row.user_id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          borderRadius: 3,
                          px: 2,
                          py: 1.5,
                          transition: "all 0.2s",
                          border: `1px solid ${isMe ? "rgba(1,214,118,0.4)" : colors.divider}`,
                          bgcolor: isMe ? "rgba(1,214,118,0.05)" : colors.background.secondary,
                          ...(isMe
                            ? { boxShadow: "0 4px 20px rgba(1,214,118,0.05)" }
                            : { "&:hover": { bgcolor: colors.background.ternary } }),
                        }}
                      >
                        <RankBadge rank={row.rank} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: isMe ? "#01D676" : "#fff" }} truncate>
                            {row.display_name}
                            {isMe && (
                              <Box
                                component="span"
                                sx={{
                                  ml: 1,
                                  borderRadius: 50,
                                  bgcolor: colors.background.ternary,
                                  border: "1px solid rgba(1,214,118,0.2)",
                                  px: 0.75,
                                  py: 0.15,
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  color: "#01D676",
                                }}
                              >
                                You
                              </Box>
                            )}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            borderRadius: 50,
                            bgcolor: "rgba(1,214,118,0.08)",
                            border: "1px solid rgba(1,214,118,0.15)",
                            px: 1.25,
                            py: 0.35,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#01D676",
                          }}
                        >
                          <Coins size={12} />
                          {row.weekly_coins.toLocaleString()}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {/* Desktop table */}
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    display: { xs: "none", sm: "block" },
                    borderRadius: 4,
                    border: `1px solid ${colors.divider}`,
                    bgcolor: "transparent",
                    overflow: "hidden",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "rgba(29,30,48,0.9)" }}>
                        <TableCell align="center" sx={{ width: 72, color: colors.text.secondary, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, borderColor: colors.divider }}>
                          Rank
                        </TableCell>
                        <TableCell sx={{ color: colors.text.secondary, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, borderColor: colors.divider }}>
                          Player
                        </TableCell>
                        <TableCell align="right" sx={{ color: colors.text.secondary, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, borderColor: colors.divider }}>
                          Monthly Coins
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rest.map((row, i) => {
                        const isMe = user?.id === row.user_id;
                        return (
                          <TableRow
                            key={row.user_id}
                            sx={{
                              bgcolor: isMe
                                ? "rgba(1,214,118,0.05)"
                                : i % 2 === 0
                                ? "rgba(29,30,48,0.4)"
                                : "rgba(29,30,48,0.25)",
                              ...(!isMe && { "&:hover": { bgcolor: colors.background.ternary } }),
                            }}
                          >
                            <TableCell align="center" sx={{ borderColor: colors.divider }}>
                              <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <RankBadge rank={row.rank} />
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: isMe ? "#01D676" : "#fff", borderColor: colors.divider }}>
                              {row.display_name}
                              {isMe && (
                                <Box
                                  component="span"
                                  sx={{
                                    ml: 1,
                                    borderRadius: 50,
                                    bgcolor: "rgba(1,214,118,0.1)",
                                    border: "1px solid rgba(1,214,118,0.2)",
                                    px: 0.75,
                                    py: 0.15,
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    color: "#01D676",
                                  }}
                                >
                                  You
                                </Box>
                              )}
                            </TableCell>
                            <TableCell align="right" sx={{ borderColor: colors.divider }}>
                              <Box
                                component="span"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  borderRadius: 50,
                                  bgcolor: "rgba(1,214,118,0.08)",
                                  border: "1px solid rgba(1,214,118,0.15)",
                                  px: 1.25,
                                  py: 0.35,
                                  fontSize: "0.82rem",
                                  fontWeight: 700,
                                  color: "#01D676",
                                }}
                              >
                                {row.weekly_coins.toLocaleString()}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
      </Box>
    </AppShell>
  );
}
