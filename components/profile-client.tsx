"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box, Button, Paper, TextField, CircularProgress, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import { Settings, Save, CheckCircle, Wallet, TrendingUp, Flame, Mail, User, Calendar, AlertCircle, Send, Plus } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface Withdrawal {
  id: string;
  coins: number;
  amount_usd: number;
  status: string;
  tx_hash: string | null;
  requested_at: string;
}

interface Completion {
  id: string;
  program_id: string;
  coins_awarded: number;
  created_at: string;
  source: string;
}

interface ReferrerInfo {
  email: string;
  displayName: string;
  referralCode: string;
}

interface ProfileClientProps {
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
}

function stringAvatar(name: string, size: number = 100) {
  return {
    sx: { bgcolor: colors.secondary, width: size, height: size, fontSize: size * 0.4, fontWeight: 700 },
    children: (name || "U").charAt(0).toUpperCase(),
  };
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
  pending: { bg: "rgba(250,204,21,0.1)", color: "#facc15" },
  processing: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
  paid: { bg: "rgba(1,214,118,0.1)", color: "#01D676" },
  failed: { bg: "rgba(239,68,68,0.1)", color: "#f87171" },
};

const PAGE_SIZE = 5;

export default function ProfileClient({
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
}: ProfileClientProps) {
  const [name, setName] = useState(initialName);
  const [address, setAddress] = useState(initialAddress);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Pagination states for Completions
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [completionsPage, setCompletionsPage] = useState(1);
  const [hasMoreCompletions, setHasMoreCompletions] = useState(true);
  const [loadingCompletions, setLoadingCompletions] = useState(true);

  // Pagination states for Withdrawals
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [hasMoreWithdrawals, setHasMoreWithdrawals] = useState(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);

  const [emailVerified, setEmailVerified] = useState(initialEmailVerified);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showVerificationToast, setShowVerificationToast] = useState(false);

  // Initial Fetch
  useEffect(() => {
    async function fetchInitialData() {
      const supabase = createClient();
      
      const compTarget = PAGE_SIZE - 1;
      const withTarget = PAGE_SIZE - 1;

      const [compRes, withRes] = await Promise.all([
        supabase.from("completions").select("id, program_id, coins_awarded, created_at, source")
          .eq("player_id", userId).order("created_at", { ascending: false }).range(0, compTarget),
        supabase.from("withdrawals").select("id, coins, amount_usd, status, tx_hash, requested_at")
          .eq("user_id", userId).order("requested_at", { ascending: false }).range(0, withTarget),
      ]);
      
      const comps = compRes.data ?? [];
      setCompletions(comps);
      setHasMoreCompletions(comps.length === PAGE_SIZE);
      setLoadingCompletions(false);

      const withs = withRes.data ?? [];
      setWithdrawals(withs);
      setHasMoreWithdrawals(withs.length === PAGE_SIZE);
      setLoadingWithdrawals(false);
    }
    fetchInitialData();
  }, [userId]);

  // Load More Completions
  async function loadMoreCompletions() {
    setLoadingCompletions(true);
    const supabase = createClient();
    const from = completionsPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await supabase.from("completions").select("id, program_id, coins_awarded, created_at, source")
      .eq("player_id", userId).order("created_at", { ascending: false }).range(from, to);
    
    if (data && data.length > 0) {
      setCompletions(prev => [...prev, ...data]);
      setHasMoreCompletions(data.length === PAGE_SIZE);
      setCompletionsPage(prev => prev + 1);
    } else {
      setHasMoreCompletions(false);
    }
    setLoadingCompletions(false);
  }

  // Load More Withdrawals
  async function loadMoreWithdrawals() {
    setLoadingWithdrawals(true);
    const supabase = createClient();
    const from = withdrawalsPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await supabase.from("withdrawals").select("id, coins, amount_usd, status, tx_hash, requested_at")
      .eq("user_id", userId).order("requested_at", { ascending: false }).range(from, to);
    
    if (data && data.length > 0) {
      setWithdrawals(prev => [...prev, ...data]);
      setHasMoreWithdrawals(data.length === PAGE_SIZE);
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

  const totalUsd = (totalEarned * 0.001).toFixed(2);

  const stats = [
    { icon: <TrendingUp size={18} color="#01D676" />, label: "Total Earned", value: `${totalEarned.toLocaleString()} coins` },
    { icon: <Calendar size={18} color="#01D676" />, label: "This Month", value: `${monthEarned.toLocaleString()} coins` },
    { icon: <CheckCircle size={18} color="#01D676" />, label: "Completed Offers", value: String(totalCompletions) },
    { icon: <Wallet size={18} color="#01D676" />, label: "Withdrawals", value: String(totalWithdrawals) },
    { icon: <Flame size={18} color="#01D676" />, label: "Streak", value: `${streakCount} days` },
  ];

  const TABS = ["Completed Offers", "Withdrawals"] as const;

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
          <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 3 }}>
            <Typography variant="subtitle1" isBold sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <User size={20} color="#01D676" /> Account Info
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: colors.secondary }}>
                      <CheckCircle size={16} />
                      <Typography variant="body2" sx={{ color: colors.secondary, fontWeight: 600 }}>Email Verified</Typography>
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
                        borderColor: colors.secondary,
                        color: colors.secondary,
                        fontSize: "0.75rem",
                        textTransform: "none",
                        py: 0.5,
                        px: 1.5,
                        "&:hover": {
                          borderColor: colors.secondary,
                          bgcolor: "rgba(1,214,118,0.1)",
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

          <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 3 }}>
            <Typography variant="subtitle1" isBold sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Wallet size={20} color="#01D676" /> Withdrawal Settings
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

          {error && <Box sx={{ borderRadius: 2, bgcolor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", px: 2, py: 1.25, fontSize: "0.875rem", color: "#f87171" }}>{error}</Box>}
          {saved && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 2, bgcolor: colors.background.secondary, border: "1px solid rgba(1,214,118,0.2)", px: 2, py: 1.25, fontSize: "0.875rem", color: "#01D676" }}>
              <CheckCircle size={16} /> Profile saved successfully
            </Box>
          )}

          <Button type="submit" variant="contained" disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
            sx={{ alignSelf: "flex-start", background: colors.background.gradient, borderRadius: 2, px: 3, py: 1.5, fontWeight: 600, fontSize: "0.875rem", textTransform: "none", boxShadow: "0 4px 12px rgba(1,214,118,0.2)", "&:hover": { filter: "brightness(1.1)" }, "&.Mui-disabled": { opacity: 0.5, color: "#fff" } }}>
            Save Changes
          </Button>
        </Box>
      </Box>
    );
  }

  /* ── main profile view ─────── */
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4, pb: { xs: 12, lg: 4 } }}>
      {/* header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" isBold>My Profile</Typography>
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
        <Paper sx={{ flex: 1, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.scrollBar.track, p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Avatar {...stringAvatar(initialName || email)} />
          <Typography variant="h6" isBold sx={{ mt: 1.5 }}>{initialName || email.split("@")[0]}</Typography>
          <Typography variant="caption" sx={{ color: colors.text.secondary }}>Joined {timeSince(memberSince)}</Typography>
          <Typography variant="caption" sx={{ color: colors.text.secondary, mt: 0.5 }}>{email}</Typography>
        </Paper>

        {/* stats card */}
        <Paper sx={{ flex: 1, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.scrollBar.track, p: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, height: "100%" }}>
            {stats.map((s) => (
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

      {/* tabs */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        {TABS.map((tab, i) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(i)}
            sx={{
              borderRadius: 50, px: 2.5, py: 1, fontSize: "0.8rem", fontWeight: 600, textTransform: "none",
              ...(activeTab === i
                ? { bgcolor: colors.secondary, color: "#000", "&:hover": { bgcolor: colors.secondary, filter: "brightness(1.1)" } }
                : { bgcolor: colors.primary, color: colors.text.secondary, border: `1px solid ${colors.divider}`, "&:hover": { bgcolor: colors.background.ternary } }),
            }}
          >
            {tab}
          </Button>
        ))}
      </Box>

      {activeTab === 0 && loadingCompletions && completions.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={28} sx={{ color: colors.secondary }} />
        </Box>
      ) : activeTab === 1 && loadingWithdrawals && withdrawals.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={28} sx={{ color: colors.secondary }} />
        </Box>
      ) : (
        <>
          {/* completed offers tab */}
          {activeTab === 0 && (
            completions.length === 0 ? (
              <Paper sx={{ borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 6, textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.875rem", color: colors.text.secondary }}>No offers have been completed yet</Typography>
              </Paper>
            ) : (
              <>
                {/* Mobile cards */}
                <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
                   {completions.map((c) => {
                     const isChargeback = c.coins_awarded < 0;
                     const displayAmount = isChargeback ? String(c.coins_awarded) : `+${c.coins_awarded}`;
                     const amtColor = isChargeback ? "#f87171" : "#01D676";
                     const amtBg = isChargeback ? "rgba(239,68,68,0.1)" : "rgba(1,214,118,0.1)";
                     const amtBorder = isChargeback ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(1,214,118,0.2)";

                     return (
                      <Box key={c.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, px: 2, py: 1.5 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }} truncate>{c.program_id}</Typography>
                            <Box sx={{ borderRadius: 50, bgcolor: c.source === 'cpx' ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)', border: c.source === 'cpx' ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(249,115,22,0.25)', px: 1, py: 0.1, fontSize: '0.6rem', fontWeight: 700, color: c.source === 'cpx' ? '#3b82f6' : '#f97316', textTransform: 'uppercase', flexShrink: 0 }}>
                              {c.source || 'unknown'}
                            </Box>
                          </Box>
                          <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                            {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, borderRadius: 50, bgcolor: amtBg, border: amtBorder, px: 1.5, py: 0.25, fontSize: "0.8rem", fontWeight: 600, color: amtColor, flexShrink: 0 }}>
                          {displayAmount}
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
                        {["Program", "Source", "Coins Awarded", "Date"].map((h) => (
                          <TableCell key={h} sx={{ color: colors.text.secondary, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", borderColor: colors.divider, bgcolor: colors.primary }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {completions.map((c) => {
                         const isChargeback = c.coins_awarded < 0;
                         const displayAmount = isChargeback ? String(c.coins_awarded) : `+${c.coins_awarded}`;
                         const amtColor = isChargeback ? "#f87171" : "#01D676";
                         const amtBg = isChargeback ? "rgba(239,68,68,0.1)" : "rgba(1,214,118,0.1)";
                         const amtBorder = isChargeback ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(1,214,118,0.2)";

                         return (
                          <TableRow key={c.id} sx={{ "&:hover": { bgcolor: colors.background.ternary } }}>
                            <TableCell sx={{ borderColor: colors.divider, color: "#fff", fontSize: "0.875rem" }}>{c.program_id}</TableCell>
                            <TableCell sx={{ borderColor: colors.divider }}>
                              <Box sx={{ display: "inline-block", borderRadius: 50, bgcolor: c.source === 'cpx' ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)', border: c.source === 'cpx' ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(249,115,22,0.25)', px: 1.5, py: 0.25, fontSize: '0.75rem', fontWeight: 600, color: c.source === 'cpx' ? '#3b82f6' : '#f97316', textTransform: 'capitalize' }}>
                                {c.source || 'unknown'}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ borderColor: colors.divider }}>
                              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, borderRadius: 50, bgcolor: amtBg, border: amtBorder, px: 1.5, py: 0.25, fontSize: "0.8rem", fontWeight: 600, color: amtColor }}>
                                {displayAmount}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ borderColor: colors.divider, color: colors.text.secondary, fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                              {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {hasMoreCompletions && (
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Button
                      onClick={loadMoreCompletions}
                      disabled={loadingCompletions}
                      startIcon={loadingCompletions ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
                      sx={{ textTransform: "none", color: colors.text.secondary, border: `1px solid ${colors.divider}`, borderRadius: 2, px: 3, "&:hover": { bgcolor: colors.background.ternary, color: "#fff" } }}
                    >
                      {loadingCompletions ? "Loading..." : "Load More"}
                    </Button>
                  </Box>
                )}
              </>
            )
          )}

          {/* withdrawals tab */}
          {activeTab === 1 && (
            withdrawals.length === 0 ? (
              <Paper sx={{ borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 6, textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.875rem", color: colors.text.secondary }}>No withdrawals yet</Typography>
              </Paper>
            ) : (
              <>
                {/* Mobile cards */}
                <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
                  {withdrawals.map((w) => {
                    const sc = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                    return (
                      <Box key={w.id} sx={{ borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, px: 2, py: 1.5 }}>
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
                            <TableCell sx={{ borderColor: colors.divider, color: "#01D676", fontWeight: 600, fontSize: "0.875rem" }}>${w.amount_usd.toFixed(2)}</TableCell>
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
            )
          )}
        </>
      )}

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
            bgcolor: "rgba(1,214,118,0.1)",
            border: "1px solid rgba(1,214,118,0.3)",
            color: colors.secondary,
            "& .MuiAlert-icon": { color: colors.secondary },
          }}
        >
          Verification email sent!
        </Alert>
      </Snackbar>
    </Box>
  );
}
