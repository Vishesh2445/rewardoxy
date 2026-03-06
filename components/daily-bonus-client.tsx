"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, CircularProgress } from "@mui/material";
import {
  CalendarCheck,
  Flame,
  Gift,
  CheckCircle,
  Coins,
  Star,
} from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

const STREAK_REWARDS = [0, 10, 20, 30, 40, 50, 75, 100];

interface Claim {
  id: string;
  streak_day: number;
  coins_awarded: number;
  claimed_at: string;
}

interface DailyBonusClientProps {
  streakCount: number;
  alreadyClaimed: boolean;
  todayReward: number | null;
  todayStreak: number | null;
  recentClaims: Claim[];
}

export default function DailyBonusClient({
  streakCount,
  alreadyClaimed: initialClaimed,
  todayReward: initialReward,
  todayStreak: initialStreak,
  recentClaims,
}: DailyBonusClientProps) {
  const router = useRouter();
  const [claimed, setClaimed] = useState(initialClaimed);
  const [reward, setReward] = useState(initialReward);
  const [streak, setStreak] = useState(initialStreak ?? streakCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/daily-bonus", { method: "POST" });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(body.error || "Failed to claim bonus");
      return;
    }
    setClaimed(true);
    setReward(body.reward);
    setStreak(body.streakDay);
    router.refresh();
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarCheck size={24} color="#01D676" />
          Daily Bonus
        </Typography>
        <Typography variant="body2" color="textSecondary">Claim your daily reward and build your streak</Typography>
      </Box>

      {/* Streak progress */}
      <Paper sx={{ mb: 4, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 3 }}>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" isBold sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Flame size={20} color="#01D676" />
            7-Day Streak
          </Typography>
          <Box sx={{ borderRadius: 50, bgcolor: colors.background.secondary, border: "1px solid rgba(1,214,118,0.2)", px: 1.5, py: 0.5, fontSize: "0.75rem", fontWeight: 600, color: "#01D676" }}>
            Day {claimed ? streak : Math.max(streakCount, 0)}
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(7, 1fr)" }, gap: 1 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const currentDay = claimed ? (streak ?? 0) : streakCount;
            const isCompleted = day <= currentDay;
            const isCurrent = day === currentDay;
            const dayReward = STREAK_REWARDS[day];
            return (
              <Box key={day} sx={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5,
                  borderRadius: 3, p: { xs: 1, sm: 1.5 }, transition: "all 0.2s",
                  border: `1px solid ${isCompleted || (isCurrent && !claimed) ? "rgba(1,214,118,0.4)" : colors.divider}`,
                  bgcolor: isCompleted ? "rgba(1,214,118,0.1)" : isCurrent && !claimed ? "rgba(1,214,118,0.05)" : colors.background.ternary,
                }}>
                  <Typography sx={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", color: colors.text.secondary }}>Day {day}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", bgcolor: isCompleted ? "rgba(1,214,118,0.2)" : colors.background.ternary }}>
                    {isCompleted ? <CheckCircle size={16} color="#01D676" /> : <Star size={16} color="rgba(169,169,202,0.4)" />}
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: isCompleted ? "#01D676" : colors.text.secondary }}>+{dayReward}</Typography>
                </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Claim card */}
      <Paper sx={{ mb: 4, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 3, textAlign: "center" }}>
        {claimed ? (
          <Box>
            <Box sx={{ mx: "auto", mb: 2, display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)" }}>
              <CheckCircle size={32} color="#01D676" />
            </Box>
            <Typography variant="h6" isBold>Bonus Claimed!</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              You earned <Box component="span" sx={{ fontWeight: 600, color: "#01D676" }}>+{reward}</Box> coins today
            </Typography>
            <Typography sx={{ mt: 1, fontSize: "0.75rem", color: "rgba(169,169,202,0.6)" }}>Come back tomorrow to continue your streak</Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ mx: "auto", mb: 2, display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)", animation: "pulse-glow 3s ease-in-out infinite" }}>
              <Gift size={32} color="#01D676" />
            </Box>
            <Typography variant="h6" isBold>Daily Bonus Ready!</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Claim your Day {Math.min(streakCount + 1, 7)} reward of <Box component="span" sx={{ fontWeight: 600, color: "#01D676" }}>+{STREAK_REWARDS[Math.min(streakCount + 1, 7)]}</Box> coins
            </Typography>
            {error && (
              <Box sx={{ mt: 1.5, borderRadius: 3, bgcolor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", px: 2, py: 1, fontSize: "0.875rem", color: "#f87171" }}>{error}</Box>
            )}
            <Button variant="contained" onClick={handleClaim} disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Gift size={16} />}
              sx={{ mt: 2, background: colors.background.gradient, borderRadius: 3, px: 4, py: 1.5, fontWeight: 600, boxShadow: "0 4px 12px rgba(1,214,118,0.2)", "&:hover": { filter: "brightness(1.1)" } }}>
              Claim Bonus
            </Button>
          </Box>
        )}
      </Paper>

      {/* Recent claims */}
      {recentClaims.length > 0 && (
        <Box>
          <Typography variant="subtitle1" isBold sx={{ mb: 2 }}>Recent Claims</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {recentClaims.map((c) => (
              <Box key={c.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, px: 2.5, py: 1.5, transition: "all 0.2s", "&:hover": { bgcolor: colors.background.ternary } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)" }}>
                    <CalendarCheck size={16} color="#01D676" />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Day {c.streak_day} Bonus</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                      {new Date(c.claimed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, borderRadius: 50, bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)", px: 1.25, py: 0.25, fontSize: "0.875rem", fontWeight: 600, color: "#01D676" }}>
                  <Coins size={14} />+{c.coins_awarded}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
