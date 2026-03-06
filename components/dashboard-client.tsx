"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Box, Paper, Grid, Button } from "@mui/material";
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
} from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Completion {
  id: string;
  program_id: string;
  coins_awarded: number;
  created_at: string;
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
        .select("id, program_id, coins_awarded, created_at")
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

  const miniStats = [
    { icon: <Coins size={20} color="#01D676" />, label: "Balance", value: coins.toLocaleString(), sub: "coins", accent: true },
    { icon: <TrendingUp size={20} color="#01D676" />, label: "Total Earned", value: totalEarned.toLocaleString(), sub: "coins", accent: false },
    { icon: <Flame size={20} color="#01D676" />, label: "Streak", value: String(streak), sub: "days", accent: false },
    { icon: <CheckCircle size={20} color="#01D676" />, label: "Completions", value: String(completions.length), sub: "recent", accent: false },
  ];

  const quickActions = [
    { href: "/earn", icon: <Gift size={24} color="#01D676" />, title: "Complete Offers", description: "Earn coins by completing tasks" },
    { href: "/daily-bonus", icon: <CalendarCheck size={24} color="#01D676" />, title: "Daily Bonus", description: "Claim your daily reward" },
    { href: "/cashout", icon: <Wallet size={24} color="#01D676" />, title: "Cash Out", description: "Withdraw your earnings" },
  ];

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      {/* Welcome banner */}
      <Paper sx={{ mb: 4, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 3, bgcolor: "rgba(1,214,118,0.15)", border: "1px solid rgba(1,214,118,0.25)", boxShadow: "0 4px 12px rgba(1,214,118,0.1)" }}>
            <Zap size={20} color="#01D676" />
          </Box>
          <Box>
            <Typography variant="h6" isBold>
              Welcome back, <Box component="span" sx={{ background: colors.text.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{displayName}</Box>
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary }}>Here&apos;s your earnings overview</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats row */}
      <Grid container spacing={2}>
        {miniStats.map((s) => (
          <Grid size={{ xs: 6, lg: 3 }} key={s.label}>
            <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 2.5, transition: "all 0.2s", "&:hover": { borderColor: "rgba(1,214,118,0.4)" } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 3, bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)" }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: colors.text.secondary }}>{s.label}</Typography>
                  <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: s.accent ? "#01D676" : "#fff" }}>
                    {s.value}
                    <Box component="span" sx={{ ml: 0.5, fontSize: "0.75rem", fontWeight: 400, color: colors.text.secondary }}>{s.sub}</Box>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Quick actions */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        {quickActions.map((a) => (
          <Grid size={{ xs: 12, sm: 4 }} key={a.href}>
            <Paper
              component={Link}
              href={a.href}
              sx={{
                display: "flex", alignItems: "center", gap: 2, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 2.5, textDecoration: "none", color: "inherit",
                transition: "all 0.3s", "&:hover": { borderColor: "rgba(1,214,118,0.3)", boxShadow: "0 4px 20px rgba(1,214,118,0.05)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 3, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}`, flexShrink: 0 }}>
                {a.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.title}</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>{a.description}</Typography>
              </Box>
              <ArrowRight size={16} color={colors.text.secondary} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent activity */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" isBold>Recent Activity</Typography>
          {completions.length > 0 && (
            <Box component={Link} href="/history" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.875rem", color: "#01D676", textDecoration: "none", "&:hover": { filter: "brightness(1.1)" } }}>
              View All
              <ArrowRight size={14} />
            </Box>
          )}
        </Box>

        {completions.length === 0 ? (
          <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 4, textAlign: "center" }}>
            <Box sx={{ mx: "auto", mb: 1.5, display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 3, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}` }}>
              <Gift size={24} color="rgba(169,169,202,0.4)" />
            </Box>
            <Typography variant="body2" sx={{ color: colors.text.secondary }}>
              No completions yet. Complete your first offer to see activity here.
            </Typography>
            <Box component={Link} href="/earn" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 2, fontSize: "0.875rem", fontWeight: 500, color: "#01D676", textDecoration: "none", "&:hover": { filter: "brightness(1.1)" } }}>
              Browse Offers
              <ArrowRight size={14} />
            </Box>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {completions.map((c) => {
              const Icon = offerIcon(c.program_id);
              return (
                <Box
                  key={c.id}
                  sx={{
                    display: "flex", alignItems: "center", gap: 2, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, px: 2.5, py: 2,
                    transition: "all 0.2s", "&:hover": { borderColor: "rgba(1,214,118,0.4)" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 3, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}`, flexShrink: 0 }}>
                    <Icon size={20} color="#01D676" />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }} truncate>Program {c.program_id}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                      {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, borderRadius: 50, bgcolor: colors.background.secondary, border: "1px solid rgba(1,214,118,0.2)", px: 1.5, py: 0.5, fontSize: "0.875rem", fontWeight: 600, color: "#01D676" }}>
                    <CheckCircle size={14} />
                    +{c.coins_awarded}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
