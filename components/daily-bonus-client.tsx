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
  Clock,
  TrendingUp,
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

  const nextDay = Math.min(streakCount + 1, 7);
  const nextReward = STREAK_REWARDS[nextDay];
  const currentDay = claimed ? (streak ?? 0) : streakCount;
  const totalCoinsEarned = recentClaims.reduce((acc, c) => acc + c.coins_awarded, 0);

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CalendarCheck size={26} color="#01D676" />
          Daily Bonus
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Claim your daily reward and build your streak for bigger bonuses
        </Typography>
      </Box>

      {/* Stats mini row */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, mb: 4 }}>
        {[
          { icon: <Flame size={20} color="#f97316" />, label: "Current Streak", value: `${currentDay} days`, color: "#f97316" },
          { icon: <Coins size={20} color="#01D676" />, label: "Total from Bonuses", value: `${totalCoinsEarned.toLocaleString()} coins`, color: "#01D676" },
          { icon: <TrendingUp size={20} color="#a78bfa" />, label: "Bonuses Claimed", value: `${recentClaims.length}`, color: "#a78bfa" },
        ].map((s) => (
          <Paper
            key={s.label}
            elevation={0}
            sx={{
              borderRadius: 4,
              border: `1px solid ${colors.divider}`,
              bgcolor: colors.background.secondary,
              p: { xs: 2, sm: 2.5 },
              transition: "all 0.2s",
              "&:hover": { borderColor: "rgba(1,214,118,0.25)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 3, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}`, mb: 1.5 }}>
              {s.icon}
            </Box>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: colors.text.secondary }}>
              {s.label}
            </Typography>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: s.color, mt: 0.25 }}>
              {s.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Streak progress */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: `1px solid ${colors.divider}`,
          bgcolor: colors.background.secondary,
          p: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" isBold sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Flame size={20} color="#f97316" />
            7-Day Streak Progress
          </Typography>
          <Box
            sx={{
              borderRadius: 50,
              bgcolor: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.25)",
              px: 1.5,
              py: 0.5,
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#f97316",
            }}
          >
            🔥 Day {currentDay}
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(7, 1fr)" }, gap: { xs: 0.75, sm: 1 } }}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const isCompleted = day <= currentDay;
            const isCurrent = day === currentDay + (claimed ? 0 : 1);
            const dayReward = STREAK_REWARDS[day];
            return (
              <Box
                key={day}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                  borderRadius: 3,
                  p: { xs: 1, sm: 1.5 },
                  transition: "all 0.2s",
                  border: `1px solid ${isCompleted ? "rgba(1,214,118,0.4)" : isCurrent ? "rgba(1,214,118,0.2)" : colors.divider}`,
                  bgcolor: isCompleted
                    ? "rgba(1,214,118,0.12)"
                    : isCurrent
                    ? "rgba(1,214,118,0.05)"
                    : colors.background.ternary,
                }}
              >
                <Typography sx={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: colors.text.secondary }}>
                  D{day}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: { xs: 28, sm: 34 },
                    height: { xs: 28, sm: 34 },
                    borderRadius: "50%",
                    bgcolor: isCompleted ? "rgba(1,214,118,0.2)" : colors.background.ternary,
                    border: `1px solid ${isCompleted ? "rgba(1,214,118,0.3)" : colors.divider}`,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle size={15} color="#01D676" />
                  ) : (
                    <Star size={14} color={isCurrent ? "rgba(1,214,118,0.5)" : "rgba(169,169,202,0.3)"} />
                  )}
                </Box>
                <Typography sx={{ fontSize: "10px", fontWeight: 700, color: isCompleted ? "#01D676" : colors.text.secondary }}>
                  +{dayReward}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Main claim card */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          p: { xs: 3, sm: 5 },
          textAlign: "center",
          border: claimed ? "1px solid rgba(1,214,118,0.2)" : "1px solid rgba(1,214,118,0.25)",
          background: claimed
            ? "linear-gradient(135deg, rgba(1,214,118,0.05) 0%, rgba(0,126,69,0.03) 100%)"
            : "linear-gradient(135deg, rgba(1,214,118,0.1) 0%, rgba(0,126,69,0.06) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* background decoration */}
        <Box sx={{ pointerEvents: "none", position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: "rgba(1,214,118,0.05)", filter: "blur(80px)" }} />

        {claimed ? (
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                mx: "auto",
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "rgba(1,214,118,0.12)",
                border: "2px solid rgba(1,214,118,0.3)",
                boxShadow: "0 0 40px rgba(1,214,118,0.2)",
              }}
            >
              <CheckCircle size={40} color="#01D676" />
            </Box>
            <Typography variant="h5" isBold sx={{ mb: 1 }}>
              Bonus Claimed! 🎉
            </Typography>
            <Typography variant="body1" sx={{ color: colors.text.secondary, mb: 2 }}>
              You earned{" "}
              <Box component="span" sx={{ fontWeight: 800, color: "#01D676", fontSize: "1.2rem" }}>
                +{reward}
              </Box>{" "}
              coins today
            </Typography>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 50,
                bgcolor: "rgba(1,214,118,0.08)",
                border: "1px solid rgba(1,214,118,0.2)",
                px: 2.5,
                py: 1,
                fontSize: "0.875rem",
                color: colors.text.secondary,
              }}
            >
              <Clock size={14} />
              Come back tomorrow to continue your streak!
            </Box>
          </Box>
        ) : (
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                mx: "auto",
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "rgba(1,214,118,0.12)",
                border: "2px solid rgba(1,214,118,0.3)",
                boxShadow: "0 0 40px rgba(1,214,118,0.15)",
                animation: "pulse-glow 2.5s ease-in-out infinite",
              }}
            >
              <Gift size={40} color="#01D676" />
            </Box>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 50,
                bgcolor: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.2)",
                px: 2,
                py: 0.5,
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#f97316",
                mb: 2,
              }}
            >
              🔥 Day {nextDay} Streak Reward
            </Box>
            <Typography variant="h5" isBold sx={{ mb: 1 }}>
              Daily Bonus Ready!
            </Typography>
            <Typography variant="body1" sx={{ color: colors.text.secondary, mb: 1 }}>
              Claim your reward of
            </Typography>
            <Typography sx={{ fontSize: "2.5rem", fontWeight: 900, color: "#01D676", mb: 3, lineHeight: 1 }}>
              +{nextReward}
              <Box component="span" sx={{ fontSize: "1rem", fontWeight: 600, color: colors.text.secondary, ml: 1 }}>coins</Box>
            </Typography>
            {error && (
              <Box sx={{ mb: 2, borderRadius: 3, bgcolor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", px: 2, py: 1, fontSize: "0.875rem", color: "#f87171" }}>
                {error}
              </Box>
            )}
            <Button
              variant="contained"
              onClick={handleClaim}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Gift size={18} />}
              sx={{
                background: "linear-gradient(180deg,#01D676,#007e45)",
                borderRadius: 3,
                px: 6,
                py: 1.75,
                fontWeight: 800,
                fontSize: "1.1rem",
                textTransform: "none",
                boxShadow: "0 6px 24px rgba(1,214,118,0.3)",
                "&:hover": { filter: "brightness(1.1)", transform: "translateY(-1px)", boxShadow: "0 8px 30px rgba(1,214,118,0.35)" },
                transition: "all 0.2s",
              }}
            >
              {loading ? "Claiming..." : "Claim Bonus"}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Recent claims */}
      {recentClaims.length > 0 && (
        <Box>
          <Typography variant="subtitle1" isBold sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Clock size={18} color="#01D676" />
            Recent Claims
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {recentClaims.map((c) => (
              <Box
                key={c.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 3,
                  border: `1px solid ${colors.divider}`,
                  bgcolor: colors.background.secondary,
                  px: 2.5,
                  py: 1.75,
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: colors.background.ternary, borderColor: "rgba(1,214,118,0.2)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)" }}>
                    <CalendarCheck size={16} color="#01D676" />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Day {c.streak_day} Bonus
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: colors.text.secondary }}>
                      {new Date(c.claimed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, borderRadius: 50, bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)", px: 1.5, py: 0.5, fontSize: "0.875rem", fontWeight: 700, color: "#01D676" }}>
                  <Coins size={14} />
                  +{c.coins_awarded}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
