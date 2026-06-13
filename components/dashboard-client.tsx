"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Box, Paper, Grid, Button, Divider } from "@mui/material";
import {
  Coins,
  Flame,
  Gift,
  Wallet,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Gamepad2,
  FileText,
  Smartphone,
  CalendarCheck,
  Zap,
  Trophy,
  Users,
  Star,
  Clock,
} from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Completion {
  id: string;
  program_id: string;
  coins_awarded: number;
  created_at: string;
  source: string;
}

interface DashboardProps {
  userId: string;
  displayName: string;
  initialCoins: number;
  initialStreak: number;
  initialTotalEarned: number;
  initialCompletions: Completion[];
}

const OFFER_ICONS: Record<string, typeof Gamepad2> = {
  game: Gamepad2,
  survey: FileText,
  app: Smartphone,
};

function offerIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("game") || lower.includes("play")) return OFFER_ICONS.game;
  if (lower.includes("survey") || lower.includes("fill")) return OFFER_ICONS.survey;
  return OFFER_ICONS.app;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardClient({
  userId,
  displayName,
  initialCoins,
  initialStreak,
  initialTotalEarned,
  initialCompletions,
}: DashboardProps) {
  const [coins, setCoins] = useState(initialCoins);
  const [streak, setStreak] = useState(initialStreak);
  const [totalEarned, setTotalEarned] = useState(initialTotalEarned);
  const [completions, setCompletions] = useState<Completion[]>(initialCompletions);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    function subscribe() {
      if (channelRef.current) return;
      const channel = supabase
        .channel(`user-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "users",
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new as {
              coins_balance: number;
              streak_count: number;
              total_earned: number;
            };
            setCoins(row.coins_balance);
            setStreak(row.streak_count);
            setTotalEarned(row.total_earned);
          }
        )
        .subscribe();
      channelRef.current = channel;
    }

    function unsubscribe() {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        subscribe();
        refreshData();
      } else {
        unsubscribe();
      }
    }

    async function refreshData() {
      const { data: userData } = await supabase
        .from("users")
        .select("coins_balance, streak_count, total_earned")
        .eq("id", userId)
        .single();

      if (userData) {
        setCoins(userData.coins_balance);
        setStreak(userData.streak_count);
        setTotalEarned(userData.total_earned);
      }

      const { data: recent } = await supabase
        .from("completions")
        .select("id, program_id, coins_awarded, created_at, source")
        .eq("player_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (recent) setCompletions(recent);
    }

    subscribe();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      unsubscribe();
    };
  }, [userId]);

  const initials = displayName.slice(0, 2).toUpperCase();
  const usdValue = (coins / 1000).toFixed(2);

  const stats = [
    {
      icon: <Coins size={22} color={colors.primary} />,
      label: "Coin Balance",
      value: coins.toLocaleString(),
      sub: `≈ $${usdValue} USDT`,
      accent: true,
      glow: true,
    },
    {
      icon: <TrendingUp size={22} color={colors.primary} />,
      label: "Total Earned",
      value: totalEarned.toLocaleString(),
      sub: "lifetime coins",
      accent: false,
      glow: false,
    },
    {
      icon: <Flame size={22} color={colors.status.warning} />,
      label: "Day Streak",
      value: String(streak),
      sub: streak > 0 ? "🔥 Keep it up!" : "Start today!",
      accent: false,
      glow: false,
    },
    {
      icon: <CheckCircle size={22} color={colors.primary} />,
      label: "Completions",
      value: String(completions.length),
      sub: "recent tasks",
      accent: false,
      glow: false,
    },
  ];

  const quickActions = [
    {
      href: "/earn",
      icon: <Gift size={26} color={colors.primary} />,
      title: "Complete Offers",
      description: "Earn coins by completing tasks",
      primary: true,
    },
    {
      href: "/daily-bonus",
      icon: <CalendarCheck size={26} color={colors.primary} />,
      title: "Daily Bonus",
      description: "Claim your daily streak reward",
      primary: false,
    },
    {
      href: "/cashout",
      icon: <Wallet size={26} color={colors.primary} />,
      title: "Cash Out",
      description: "Withdraw earnings as USDT",
      primary: false,
    },
  ];

  const highlights = [
    { icon: <Trophy size={18} color={colors.status.warning} />, label: "Leaderboard", href: "/leaderboard" },
    { icon: <Users size={18} color={colors.primary} />, label: "Referrals", href: "/referrals" },
    { icon: <Star size={18} color={colors.secondary} />, label: "History", href: "/history" },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: { xs: 12, lg: 4 } }}>

      {/* ── HERO WELCOME BANNER ── */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 2,
          background: colors.background.glass,
          backdropFilter: colors.glass.backdrop,
          p: { xs: 3, sm: 4 },
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            background: colors.background.glassHover,
            boxShadow: `0 8px 32px rgba(99, 102, 241, 0.1)`,
          },
        }}
      >
        {/* background glow */}
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.08)",
            filter: "blur(60px)",
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          {/* Avatar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: colors.background.gradient,
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#fff",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
            }}
          >
            {initials}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" isBold>
              Welcome back,{" "}
              <Box
                component="span"
                sx={{
                  background: colors.text.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {displayName}
              </Box>{" "}
              👋
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary, mt: 0.25 }}>
              Here&apos;s your earnings overview
            </Typography>
          </Box>

          {/* Quick nav badges */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {highlights.map((h) => (
              <Box
                key={h.href}
                component={Link}
                href={h.href}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  borderRadius: 50,
                  border: `1px solid ${colors.glass.border}`,
                  background: colors.background.glass,
                  backdropFilter: colors.glass.backdrop,
                  px: 1.5,
                  py: 0.75,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: colors.text.secondary,
                  textDecoration: "none",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: colors.glass.borderHover, color: colors.primary, background: colors.background.glassHover },
                }}
              >
                {h.icon}
                {h.label}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* ── STATS ROW ── */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid size={{ xs: 6, lg: 3 }} key={s.label}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                background: colors.background.glass,
                backdropFilter: colors.glass.backdrop,
                p: { xs: 2, sm: 2.5 },
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": { background: colors.background.glassHover, boxShadow: `0 8px 24px rgba(99, 102, 241, 0.1)` },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    background: s.glow ? `rgba(99, 102, 241, 0.12)` : colors.background.secondary,
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: colors.text.secondary }}>
                    {s.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "1.1rem", sm: "1.35rem" },
                      fontWeight: 800,
                      background: s.accent ? colors.text.gradient : "none",
                      WebkitBackgroundClip: s.accent ? "text" : "unset",
                      WebkitTextFillColor: s.accent ? "transparent" : "unset",
                      color: s.accent ? "unset" : "#fff",
                      lineHeight: 1.2,
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary, mt: 0.25, opacity: 0.8 }}>
                    {s.sub}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ─ DAILY BONUS CTA ─ */}
      <Paper
        elevation={0}
        component={Link}
        href="/daily-bonus"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
          borderRadius: 2,
          background: colors.background.glass,
          backdropFilter: colors.glass.backdrop,
          p: { xs: 2.5, sm: 3 },
          textDecoration: "none",
          color: "inherit",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
          "&:hover": { background: colors.background.glassHover, boxShadow: `0 8px 32px rgba(99, 102, 241, 0.15)` },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: 2,
            background: `rgba(99, 102, 241, 0.15)`,
            border: `1px solid ${colors.glass.borderHover}`,
            flexShrink: 0,
            animation: "pulse-glow 2.5s ease-in-out infinite",
          }}
        >
          <CalendarCheck size={26} color={colors.primary} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" isBold sx={{ background: colors.text.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🔥 Day {streak} Streak — Claim Your Daily Bonus!
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary, mt: 0.25 }}>
            Free coins every day. Come back tomorrow to maintain your streak.
          </Typography>
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 0.5,
            borderRadius: 2,
            background: colors.background.gradient,
            color: "#fff",
            px: 2.5,
            py: 1,
            fontWeight: 700,
            fontSize: "0.875rem",
            flexShrink: 0,
          }}
        >
          Claim
          <ArrowRight size={16} />
        </Box>
      </Paper>

      {/* ── QUICK ACTIONS ── */}
      <Typography variant="subtitle1" isBold sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {quickActions.map((a) => (
          <Grid size={{ xs: 12, sm: 4 }} key={a.href}>
            <Paper
              component={Link}
              href={a.href}
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderRadius: 2,
                background: colors.background.glass,
                backdropFilter: colors.glass.backdrop,
                p: 2.5,
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: colors.background.glassHover,
                  boxShadow: `0 8px 24px rgba(99, 102, 241, 0.12)`,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: a.primary ? `rgba(99, 102, 241, 0.15)` : colors.background.secondary,
                  border: `1px solid ${a.primary ? colors.glass.borderHover : colors.glass.border}`,
                  flexShrink: 0,
                }}
              >
                {a.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {a.title}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                  {a.description}
                </Typography>
              </Box>
              <ArrowRight size={16} color={colors.text.secondary} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
