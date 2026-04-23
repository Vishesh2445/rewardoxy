"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Box, Button, Paper, TextField, CircularProgress, Avatar, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import { Settings, Save, CheckCircle, Wallet, TrendingUp, Flame, Mail, User, Calendar, AlertCircle, Send, Plus, Coins, Gift, CalendarCheck, ArrowRight } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Withdrawal {
  id: string;
  coins: number;
  amount_usd: number;
  status: string;
  tx_hash: string | null;
  requested_at: string;
}

interface ReferrerInfo {
  email: string;
  displayName: string;
  referralCode: string;
}

interface ProfileContentProps {
  userId: string;
  email: string;
  displayName: string;
  cryptoAddress: string;
  totalEarned: number;
  streakCount: number;
  totalCompletions: number;
  totalWithdrawals: number;
  monthEarned: number;
  memberSince: string;
  emailVerified: boolean;
  referredBy: ReferrerInfo | null;
  initialCoins: number;
}

function timeSince(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const years = now.getFullYear() - d.getFullYear();
  const months = now.getMonth() - d.getMonth() + years * 12;
  if (months >= 12) return `${Math.floor(months / 12)}Y ago`;
  if (months > 0) return `${months}M ago`;
  return "Recently";
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "rgba(255, 107, 53, 0.1)", color: colors.secondary },
  processing: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
  paid: { bg: "rgba(0, 208, 132, 0.1)", color: colors.primary },
  failed: { bg: "rgba(255, 68, 68, 0.1)", color: colors.status.error },
};

export default function ProfileContent({
  userId,
  email,
  displayName: initialName,
  cryptoAddress: initialAddress,
  totalEarned,
  streakCount,
  totalCompletions,
  totalWithdrawals,
  monthEarned,
  referredBy,
  memberSince,
  emailVerified: initialEmailVerified,
  initialCoins,
}: ProfileContentProps) {
  const [name, setName] = useState(initialName);
  const [address, setAddress] = useState(initialAddress);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Pagination states for Withdrawals
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [hasMoreWithdrawals, setHasMoreWithdrawals] = useState(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);

  const [emailVerified, setEmailVerified] = useState(initialEmailVerified);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showVerificationToast, setShowVerificationToast] = useState(false);

  // Dashboard states
  const [coins, setCoins] = useState(initialCoins);
  const [streak, setStreak] = useState(streakCount);
  const [dashboardTotalEarned, setDashboardTotalEarned] = useState(totalEarned);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  // Initial Fetch
  useEffect(() => {
    async function fetchInitialData() {
      const supabase = createClient();
      const withTarget = 4;

      const { data: withRes } = await supabase
        .from("withdrawals")
        .select("id, coins, amount_usd, status, tx_hash, requested_at")
        .eq("user_id", userId)
        .order("requested_at", { ascending: false })
        .range(0, withTarget);

      const withs = withRes ?? [];
      setWithdrawals(withs);
      setHasMoreWithdrawals(withs.length === 5);
      setLoadingWithdrawals(false);
    }
    fetchInitialData();
  }, [userId]);

  // Dashboard realtime subscription
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
            setDashboardTotalEarned(row.total_earned);
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
      } else {
        unsubscribe();
      }
    }

    subscribe();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      unsubscribe();
    };
  }, [userId]);

  // Load More Withdrawals
  async function loadMoreWithdrawals() {
    setLoadingWithdrawals(true);
    const supabase = createClient();
    const from = withdrawalsPage * 5;
    const to = from + 4;
    const { data } = await supabase.from("withdrawals").select("id, coins, amount_usd, status, tx_hash, requested_at")
      .eq("user_id", userId).order("requested_at", { ascending: false }).range(from, to);

    if (data && data.length > 0) {
      setWithdrawals(prev => [...prev, ...data]);
      setHasMoreWithdrawals(data.length === 5);
      setWithdrawalsPage(prev => prev + 1);
    } else {
      setHasMoreWithdrawals(false);
    }
    setLoadingWithdrawals(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("users")
      .update({ display_name: name.trim() || null, crypto_address: address.trim() || null })
      .eq("id", userId);
    setSaving(false);
    if (updateError) { setError("Failed to save profile"); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: colors.background.ternary, borderRadius: 2, fontSize: "0.875rem", color: "#fff",
      "& fieldset": { borderColor: colors.divider },
      "&:hover fieldset": { borderColor: colors.divider },
      "&.Mui-focused fieldset": { borderColor: colors.secondary, borderWidth: "1px" },
      "& input::placeholder": { color: `${colors.text.secondary}80`, opacity: 1 },
    },
  };

  const initials = initialName.slice(0, 2).toUpperCase() || email.slice(0, 2).toUpperCase();
  const usdValue = (coins / 1000).toFixed(2);

  const dashboardStats = [
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
      value: dashboardTotalEarned.toLocaleString(),
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
      value: String(totalCompletions),
      sub: "tasks completed",
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

  const profileStats = [
    { icon: <TrendingUp size={18} color={colors.primary} />, label: "Total Earned", value: `${totalEarned.toLocaleString()} coins` },
    { icon: <Calendar size={18} color={colors.primary} />, label: "This Month", value: `${monthEarned.toLocaleString()} coins` },
    { icon: <CheckCircle size={18} color={colors.primary} />, label: "Completed Offers", value: String(totalCompletions) },
    { icon: <Wallet size={18} color={colors.primary} />, label: "Withdrawals", value: String(totalWithdrawals) },
    { icon: <Flame size={18} color={colors.status.warning} />, label: "Streak", value: `${streak} days` },
  ];

  /* ── settings panel ─────────── */
  if (showSettings) {
    return (
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 4, pb: { xs: 12, lg: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5" isBold>Settings</Typography>
          <Button onClick={() => setShowSettings(false)} sx={{ color: colors.secondary, textTransform: "none", fontWeight: 600, fontSize: "0.875rem" }}>
            Back to Profile
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSave} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.background.primary, p: 3 }}>
            <Typography variant="subtitle1" isBold sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <User size={20} color={colors.primary} /> Account Info
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.75, display: "flex", alignItems: "center", gap: 0.75, fontWeight: 500, color: colors.text.secondary }}>
                  <Mail size={14} /> Email
                </Typography>
                <TextField fullWidth value={email} slotProps={{ input: { readOnly: true } }}
                  sx={{ ...textFieldSx, "& .MuiOutlinedInput-root": { ...textFieldSx["& .MuiOutlinedInput-root"], color: colors.text.secondary } }} />
                {/* Email Verification Status */}
                <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {emailVerified ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: colors.primary }}>
                      <CheckCircle size={16} />
                      <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 600 }}>Email Verified</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <AlertCircle size={16} color="#facc15" />
                      <Typography variant="body2" sx={{ color: "#facc15", fontWeight: 600 }}>Email not verified</Typography>
                    </Box>
                  )}
                  {!emailVerified && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        setResendingVerification(true);
                        try {
                          const res = await fetch("/api/resend-verification", { method: "POST" });
                          if (res.ok) {
                            setShowVerificationToast(true);
                          } else {
                            const data = await res.json();
                            setError(data.error || "Failed to send verification email");
                          }
                        } catch (err) {
                          setError("Failed to send verification email");
                        } finally {
                          setResendingVerification(false);
                        }
                      }}
                      disabled={resendingVerification}
                      startIcon={<Send size={14} />}
                      sx={{
                        borderColor: colors.primary,
                        color: colors.primary,
                        fontSize: "0.75rem",
                        textTransform: "none",
                        py: 0.5,
                        px: 1.5,
                        "&:hover": {
                          borderColor: colors.primary,
                          bgcolor: "rgba(0, 208, 132, 0.1)",
                        },
                      }}
                    >
                      {resendingVerification ? "Sending..." : "Resend"}
                    </Button>
                  )}
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.75, display: "flex", alignItems: "center", gap: 0.75, fontWeight: 500, color: colors.text.secondary }}>
                  <User size={14} /> Display Name
                </Typography>
                <TextField fullWidth value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name"
                  slotProps={{ input: { inputProps: { maxLength: 30 } } }} sx={textFieldSx} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.875rem", color: colors.text.secondary }}>
                <Calendar size={14} />
                Member since {new Date(memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </Box>
              {referredBy && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.875rem", color: colors.secondary, mt: 0.5 }}>
                  <User size={14} />
                  Referred by {referredBy.displayName || referredBy.email}
                </Box>
              )}
            </Box>
          </Paper>

          <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.background.primary, p: 3 }}>
            <Typography variant="subtitle1" isBold sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Wallet size={20} color={colors.primary} /> Withdrawal Settings
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, color: colors.text.secondary }}>
                  LTC Address
                </Typography>
                <TextField fullWidth value={address} onChange={(e) => setAddress(e.target.value)} placeholder={`Your LTC address`} sx={textFieldSx} />
              </Box>
            </Box>
          </Paper>

          {error && <Box sx={{ borderRadius: 2, bgcolor: "rgba(255, 68, 68, 0.1)", border: "1px solid rgba(255, 68, 68, 0.2)", px: 2, py: 1.25, fontSize: "0.875rem", color: colors.status.error }}>{error}</Box>}
          {saved && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 2, bgcolor: colors.background.secondary, border: "1px solid rgba(0, 208, 132, 0.2)", px: 2, py: 1.25, fontSize: "0.875rem", color: colors.primary }}>
              <CheckCircle size={16} /> Profile saved successfully
            </Box>
          )}

          <Button type="submit" variant="contained" disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
            sx={{ alignSelf: "flex-start", background: colors.background.gradient, borderRadius: 2, px: 3, py: 1.5, fontWeight: 600, fontSize: "0.875rem", textTransform: "none", boxShadow: "0 4px 12px rgba(0, 208, 132, 0.2)", "&:hover": { filter: "brightness(1.1)" }, "&.Mui-disabled": { opacity: 0.5, color: "#fff" } }}>
            Save Changes
          </Button>
        </Box>
      </Box>
    );
  }

  /* ── main profile view ─────── */
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4, pb: { xs: 12, lg: 4 } }}>
      {/* ── DASHBOARD WELCOME SECTION ── */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 2,
          background: colors.background.glass,
          backdropFilter: colors.glass.backdrop,
          border: `1px solid ${colors.glass.border}`,
          p: { xs: 3, sm: 4 },
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            background: colors.background.glassHover,
            borderColor: colors.glass.borderHover,
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
                {initialName || email.split("@")[0]}
              </Box>{" "}
              👋
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary, mt: 0.25 }}>
              Here&apos;s your earnings overview
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ── DASHBOARD STATS ROW ── */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {dashboardStats.map((s) => (
          <Grid size={{ xs: 6, lg: 3 }} key={s.label}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                background: colors.background.glass,
                backdropFilter: colors.glass.backdrop,
                border: `1px solid ${colors.glass.border}`,
                p: { xs: 2, sm: 2.5 },
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": { borderColor: colors.glass.borderHover, background: colors.background.glassHover, boxShadow: `0 8px 24px rgba(99, 102, 241, 0.1)` },
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
                    border: `1px solid ${s.glow ? colors.glass.borderHover : colors.glass.border}`,
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
          border: `1px solid ${colors.glass.borderHover}`,
          p: { xs: 2.5, sm: 3 },
          textDecoration: "none",
          color: "inherit",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
          "&:hover": { borderColor: colors.primary, background: colors.background.glassHover, boxShadow: `0 8px 32px rgba(99, 102, 241, 0.15)` },
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
      <Grid container spacing={2} sx={{ mb: 6 }}>
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
                border: `1px solid ${a.primary ? colors.glass.borderHover : colors.glass.border}`,
                p: 2.5,
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: colors.primary,
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

      {/* ── PROFILE SECTION DIVIDER ── */}
      <Box sx={{ my: 4, height: 1, bgcolor: colors.divider }} />
      <Typography variant="h6" isBold sx={{ mb: 3 }}>My Profile</Typography>

      {/* header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box />
        <Button
          onClick={() => setShowSettings(true)}
          startIcon={<Settings size={16} />}
          sx={{ color: colors.secondary, textTransform: "none", fontWeight: 600, fontSize: "0.875rem" }}
        >
          Settings
        </Button>
      </Box>

      {/* top cards */}
      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" }, mb: 3 }}>
        {/* avatar + info card */}
        <Paper sx={{ flex: 1, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.background.secondary, p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Avatar sx={{ bgcolor: colors.secondary, width: 100, height: 100, fontSize: "2.5rem", fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Typography variant="h6" isBold sx={{ mt: 1.5 }}>{initialName || email.split("@")[0]}</Typography>
          <Typography variant="caption" sx={{ color: colors.text.secondary }}>Joined {timeSince(memberSince)}</Typography>
          <Typography variant="caption" sx={{ color: colors.text.secondary, mt: 0.5 }}>{email}</Typography>
        </Paper>

        {/* stats card */}
        <Paper sx={{ flex: 1, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.background.secondary, p: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, height: "100%" }}>
            {profileStats.map((s) => (
              <Box key={s.label} sx={{ display: "flex", flexDirection: "column", gap: 0.5, p: 1.5, borderRadius: 3, bgcolor: colors.background.default, border: `1px solid ${colors.divider}` }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  {s.icon}
                </Box>
                <Typography sx={{ fontSize: "1.125rem", fontWeight: 700 }}>{s.value}</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Withdrawal History Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" isBold sx={{ mb: 2 }}>
          Withdrawal History
        </Typography>

        {loadingWithdrawals && withdrawals.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress size={28} sx={{ color: colors.secondary }} />
          </Box>
        ) : (
          <>
            {withdrawals.length === 0 ? (
              <Paper sx={{ borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.background.primary, p: 6, textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.875rem", color: colors.text.secondary }}>No withdrawals yet</Typography>
              </Paper>
            ) : (
              <>
                {/* Mobile cards */}
                <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
                  {withdrawals.map((w) => {
                    const sc = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                    return (
                      <Box key={w.id} sx={{ borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.background.primary, px: 2, py: 1.5 }}>
                        <Box sx={{ mb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                            {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </Typography>
                          <Box sx={{ borderRadius: 50, bgcolor: sc.bg, px: 1.25, py: 0.25, fontSize: "10px", fontWeight: 600, color: sc.color, textTransform: "capitalize" }}>
                            {w.status}
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{w.coins.toLocaleString()} coins</Typography>
                            <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>${w.amount_usd.toFixed(2)} via LTC</Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                {/* Desktop table */}
                <TableContainer component={Paper} sx={{ display: { xs: "none", sm: "block" }, borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: "transparent", mb: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {["Coins", "Amount", "Status", "Date"].map((h) => (
                          <TableCell key={h} sx={{ color: colors.text.secondary, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", borderColor: colors.divider, bgcolor: colors.primary }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {withdrawals.map((w) => {
                        const sc = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                        return (
                          <TableRow key={w.id} sx={{ "&:hover": { bgcolor: colors.background.ternary } }}>
                            <TableCell sx={{ borderColor: colors.divider, color: "#fff", fontSize: "0.875rem" }}>{w.coins.toLocaleString()}</TableCell>
                            <TableCell sx={{ borderColor: colors.divider, color: colors.primary, fontWeight: 600, fontSize: "0.875rem" }}>${w.amount_usd.toFixed(2)}</TableCell>
                            <TableCell sx={{ borderColor: colors.divider }}>
                              <Box sx={{ display: "inline-block", borderRadius: 50, bgcolor: sc.bg, px: 1.5, py: 0.25, fontSize: "0.75rem", fontWeight: 600, color: sc.color, textTransform: "capitalize" }}>
                                {w.status}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ borderColor: colors.divider, color: colors.text.secondary, fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                              {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {hasMoreWithdrawals && (
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Button
                      onClick={loadMoreWithdrawals}
                      disabled={loadingWithdrawals}
                      startIcon={loadingWithdrawals ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
                      sx={{ textTransform: "none", color: colors.text.secondary, border: `1px solid ${colors.divider}`, borderRadius: 2, px: 3, "&:hover": { bgcolor: colors.background.ternary, color: "#fff" } }}
                    >
                      {loadingWithdrawals ? "Loading..." : "Load More"}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>

      {/* Success toast for verification email sent */}
      <Snackbar
        open={showVerificationToast}
        autoHideDuration={4000}
        onClose={() => setShowVerificationToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowVerificationToast(false)}
          severity="success"
          sx={{
            bgcolor: "rgba(0, 208, 132, 0.1)",
            border: "1px solid rgba(0, 208, 132, 0.3)",
            color: colors.primary,
            "& .MuiAlert-icon": { color: colors.primary },
          }}
        >
          Verification email sent!
        </Alert>
      </Snackbar>
    </Box>
  );
}
