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

interface DailyBonusClientProps {
  streakCount: number;
  alreadyClaimed: boolean;
  todayReward: number | null;
  todayStreak: number | null;
  todayCoinsEarned: number;
}

export default function DailyBonusClient({
  streakCount,
  alreadyClaimed: initialClaimed,
  todayReward: initialReward,
  todayStreak: initialStreak,
  todayCoinsEarned,
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
  const isUnlocked = todayCoinsEarned >= 1000;
  const coinsProgress = Math.min(todayCoinsEarned, 1000);

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: { xs: 12, lg: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CalendarCheck size={26} color={colors.primary} />
          Daily Bonus
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Claim your daily reward and build your streak for bigger bonuses
        </Typography>
      </Box>

      {/* Stats mini row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 4 }}>
        {[
          { icon: <Flame size={20} color={colors.status.warning} />, label: "Current Streak", value: `${currentDay} days`, color: colors.status.warning },
          { icon: <Coins size={20} color={colors.primary} />, label: "Today's Coins", value: `${todayCoinsEarned.toLocaleString()} / 1000`, color: colors.primary },
          { icon: <TrendingUp size={20} color={colors.secondary} />, label: "Status", value: isUnlocked ? "Unlocked ✓" : "Locked", color: isUnlocked ? colors.primary : colors.status.warning },
        ].map((s) => (
          <Paper
            key={s.label}
            elevation={0}
            sx={{
              borderRadius: 4,
              border: `1px solid ${colors.divider}`,
              bgcolor: colors.background.secondary,
              p: 2.5,
              transition: "all 0.2s",
              "&:hover": { borderColor: "rgba(0, 208, 132, 0.25)" },
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
            <Flame size={20} color={colors.status.warning} />
            7-Day Streak Progress
          </Typography>
          <Box
            sx={{
              borderRadius: 50,
              bgcolor: "rgba(255, 107, 53, 0.1)",
              border: "1px solid rgba(255, 107, 53, 0.25)",
              px: 1.5,
              py: 0.5,
              fontSize: "0.75rem",
              fontWeight: 700,
              color: colors.secondary,
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
                  border: `1px solid ${isCompleted ? "rgba(0, 208, 132, 0.4)" : isCurrent ? "rgba(0, 208, 132, 0.2)" : colors.divider}`,
                  bgcolor: isCompleted
                    ? "rgba(0, 208, 132, 0.12)"
                    : isCurrent
                    ? "rgba(0, 208, 132, 0.05)"
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
                    bgcolor: isCompleted ? "rgba(0, 208, 132, 0.2)" : colors.background.ternary,
                    border: `1px solid ${isCompleted ? "rgba(0, 208, 132, 0.3)" : colors.divider}`,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle size={15} color={colors.primary} />
                  ) : (
                    <Star size={14} color={isCurrent ? "rgba(0, 208, 132, 0.5)" : "rgba(169,169,202,0.3)"} />
                  )}
                </Box>
                <Typography sx={{ fontSize: "10px", fontWeight: 700, color: isCompleted ? colors.primary : colors.text.secondary }}>
                  +{dayReward}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Main claim card - Compact Layout */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: claimed ? "1px solid rgba(0, 208, 132, 0.2)" : "1px solid rgba(0, 208, 132, 0.25)",
          background: claimed
            ? "linear-gradient(135deg, rgba(0, 208, 132, 0.05) 0%, rgba(0,126,69,0.03) 100%)"
            : "linear-gradient(135deg, rgba(0, 208, 132, 0.1) 0%, rgba(0,126,69,0.06) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* background decoration */}
        <Box sx={{ pointerEvents: "none", position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(0, 208, 132, 0.05)", filter: "blur(60px)" }} />

        {claimed ? (
          <Box sx={{ position: "relative", p: { xs: 3, sm: 4 }, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" }, gap: 3, alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "rgba(0, 208, 132, 0.12)",
                border: "2px solid rgba(0, 208, 132, 0.3)",
                boxShadow: "0 0 40px rgba(0, 208, 132, 0.2)",
                mx: { xs: "auto", sm: 0 },
              }}
            >
              <CheckCircle size={32} color={colors.primary} />
            </Box>
            <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
              <Typography variant="h6" isBold sx={{ mb: 0.5 }}>
                Bonus Claimed! 🎉
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 1 }}>
                You earned{" "}
                <Box component="span" sx={{ fontWeight: 800, color: colors.primary, fontSize: "1.1rem" }}>
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
                  bgcolor: "rgba(0, 208, 132, 0.08)",
                  border: "1px solid rgba(0, 208, 132, 0.2)",
                  px: 2,
                  py: 0.5,
                  fontSize: "0.8rem",
                  color: colors.text.secondary,
                }}
              >
                <Clock size={14} />
                Come back tomorrow to continue your streak!
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ position: "relative", p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "auto 1fr auto" }, gap: 3, alignItems: "center" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "center", md: "flex-start" }, gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "rgba(0, 208, 132, 0.12)",
                    border: "2px solid rgba(0, 208, 132, 0.3)",
                    boxShadow: "0 0 30px rgba(0, 208, 132, 0.15)",
                    animation: "pulse-glow 2.5s ease-in-out infinite",
                  }}
                >
                  <Gift size={28} color={colors.primary} />
                </Box>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    borderRadius: 50,
                    bgcolor: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.2)",
                    px: 1.5,
                    py: 0.35,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#f97316",
                  }}
                >
                  🔥 Day {nextDay}
                </Box>
              </Box>

              <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                <Typography variant="h6" isBold sx={{ mb: 0.5 }}>
                  Daily Bonus Ready!
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 1 }}>
                  Claim your reward of{" "}
                  <Box component="span" sx={{ fontWeight: 800, color: colors.primary, fontSize: "1.5rem" }}>
                    +{nextReward}
                  </Box>{" "}
                  <Box component="span" sx={{ fontSize: "0.9rem" }}>coins</Box>
                </Typography>
                {!isUnlocked && (
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, borderRadius: 50, bgcolor: "rgba(255, 107, 53, 0.1)", border: "1px solid rgba(255, 107, 53, 0.2)", px: 2, py: 0.5, fontSize: "0.75rem", color: colors.secondary }}>
                    <TrendingUp size={14} />
                    Earn {(1000 - coinsProgress).toLocaleString()} more coins ({coinsProgress.toLocaleString()}/1000)
                  </Box>
                )}
                {error && (
                  <Box sx={{ mt: 1, display: "inline-block", borderRadius: 2, bgcolor: "rgba(255, 68, 68, 0.1)", border: "1px solid rgba(255, 68, 68, 0.2)", px: 2, py: 0.75, fontSize: "0.8rem", color: colors.status.error }}>
                    {error}
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-end" } }}>
                <Button
                  variant="contained"
                  onClick={handleClaim}
                  disabled={loading || !isUnlocked}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Gift size={16} />}
                  sx={{
                    background: !isUnlocked 
                      ? "linear-gradient(180deg,#4a5568,#2d3748)" 
                      : "linear-gradient(180deg,#00D084,#007e45)",
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    textTransform: "none",
                    boxShadow: !isUnlocked ? "none" : "0 6px 24px rgba(0, 208, 132, 0.3)",
                    "&:hover": { filter: !isUnlocked ? "none" : "brightness(1.1)", transform: !isUnlocked ? "none" : "translateY(-1px)", boxShadow: !isUnlocked ? "none" : "0 8px 30px rgba(0, 208, 132, 0.35)" },
                    transition: "all 0.2s",
                    "&.Mui-disabled": {
                      background: "linear-gradient(180deg,#4a5568,#2d3748)",
                      color: "rgba(255,255,255,0.5)",
                    }
                  }}
                >
                  {loading ? "Claiming..." : !isUnlocked ? "Locked" : "Claim Bonus"}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
