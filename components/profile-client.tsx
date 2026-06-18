"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box, Button, Paper, TextField, CircularProgress, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import { Save, CheckCircle, Wallet, TrendingUp, Flame, Mail, User, Calendar, AlertCircle, Send, Plus } from "lucide-react";
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
    sx: { bgcolor: colors.primary, width: size, height: size, fontSize: size * 0.4, fontWeight: 700 },
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
  pending: { bg: "rgba(255, 107, 53, 0.1)", color: colors.primary },
  processing: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
  paid: { bg: "rgba(0, 208, 132, 0.1)", color: colors.primary },
  failed: { bg: "rgba(255, 68, 68, 0.1)", color: colors.status.error },
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

  const [completions, setCompletions] = useState<Completion[]>([]);
  const [completionsPage, setCompletionsPage] = useState(1);
  const [hasMoreCompletions, setHasMoreCompletions] = useState(true);
  const [loadingCompletions, setLoadingCompletions] = useState(true);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [hasMoreWithdrawals, setHasMoreWithdrawals] = useState(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);

  const [emailVerified, setEmailVerified] = useState(initialEmailVerified);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showVerificationToast, setShowVerificationToast] = useState(false);

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
      bgcolor: "#252539", borderRadius: "12px", fontSize: "0.875rem", color: "#fff",
      "& fieldset": { borderColor: "rgba(255,255,255,0.06)", borderWidth: "1px" },
      "&:hover fieldset": { borderColor: "rgba(16,185,129,0.3)" },
      "&.Mui-focused fieldset": { borderColor: "#10B981", borderWidth: "1.5px" },
      "& input::placeholder": { color: `${colors.text.secondary}80`, opacity: 1 },
    },
  };

  const totalUsd = (totalEarned * 0.001).toFixed(2);

  const stats = [
    { icon: <TrendingUp size={16} color={colors.primary} />, label: "Total Earned", value: `${totalEarned.toLocaleString()} coins`, color: colors.primary },
    { icon: <Calendar size={16} color={colors.primary} />, label: "This Month", value: `${monthEarned.toLocaleString()} coins`, color: colors.primary },
    { icon: <CheckCircle size={16} color={colors.primary} />, label: "Completed", value: String(totalCompletions), color: colors.primary },
    { icon: <Wallet size={16} color={colors.primary} />, label: "Withdrawals", value: String(totalWithdrawals), color: colors.primary },
    { icon: <Flame size={16} color={colors.status.warning} />, label: "Streak", value: `${streakCount} days`, color: colors.status.warning },
  ];

  const TABS = ["Withdrawals"] as const;

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: { xs: 12, lg: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" isBold>My Profile</Typography>
      </Box>

      {/* Hero card */}
      <Box
        sx={{
          mb: 3,
          borderRadius: "20px",
          background: "linear-gradient(135deg, #232645 0%, #1A1B2E 100%)",
          p: { xs: 3, sm: 4 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: 3,
        }}
      >
        {/* Avatar */}
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #10B981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem", fontWeight: 700, color: "#fff",
              boxShadow: "0 4px 20px rgba(16, 185, 129, 0.35)",
            }}
          >
            {(initialName || email).charAt(0).toUpperCase()}
          </Box>
        </Box>

        <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
          <Typography variant="h6" isBold>{initialName || email.split("@")[0]}</Typography>
          <Typography sx={{ fontSize: "0.8rem", color: colors.text.secondary, mt: 0.25 }}>
            {email}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, justifyContent: { xs: "center", md: "flex-start" } }}>
            <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
              Joined {timeSince(memberSince)}
            </Typography>
            {emailVerified && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: colors.primary }}>
                <CheckCircle size={12} />
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: colors.primary }}>Verified</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Stats grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" }, gap: 1.25, mb: 3 }}>
        {stats.map((s) => (
          <Box key={s.label} sx={{ borderRadius: "14px", background: "#232645", p: 2 }}>
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, borderRadius: "8px",
              background: `${s.color}1a`, mb: 1.5,
            }}>
              {s.icon}
            </Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800, lineHeight: 1.2 }}>{s.value}</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary, mt: 0.25 }}>{s.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Account Settings */}
      <Box component="form" onSubmit={handleSave} sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
          {/* Account Info */}
          <Box sx={{ borderRadius: "14px", bgcolor: "#232645", p: 2.5 }}>
            <Typography variant="subtitle1" isBold sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "0.95rem" }}>
              <User size={18} color={colors.primary} /> Account Info
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.75, display: "flex", alignItems: "center", gap: 0.75, fontWeight: 600, color: colors.text.secondary, fontSize: "0.8rem" }}>
                  <Mail size={14} /> Email
                </Typography>
                <TextField fullWidth value={email} slotProps={{ input: { readOnly: true } }}
                  sx={{ ...textFieldSx, "& .MuiOutlinedInput-root": { ...textFieldSx["& .MuiOutlinedInput-root"], color: colors.text.secondary } }} />
                <Box sx={{ mt: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {emailVerified ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: colors.primary }}>
                      <CheckCircle size={14} />
                      <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 600, fontSize: "0.8rem" }}>Email Verified</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AlertCircle size={14} color="#facc15" />
                      <Typography variant="body2" sx={{ color: "#facc15", fontWeight: 600, fontSize: "0.8rem" }}>Email not verified</Typography>
                    </Box>
                  )}
                  {!emailVerified && (
                    <Button
                      size="small" variant="outlined"
                      onClick={async () => {
                        setResendingVerification(true);
                        try {
                          const res = await fetch("/api/resend-verification", { method: "POST" });
                          if (res.ok) setShowVerificationToast(true);
                          else { const data = await res.json(); setError(data.error || "Failed"); }
                        } catch { setError("Failed to send verification email"); }
                        finally { setResendingVerification(false); }
                      }}
                      disabled={resendingVerification}
                      startIcon={<Send size={12} />}
                      sx={{
                        borderColor: colors.primary, color: colors.primary, fontSize: "0.7rem",
                        textTransform: "none", py: 0.25, px: 1.5, borderRadius: "10px",
                        "&:hover": { borderColor: colors.primary, bgcolor: "rgba(16,185,129,0.1)" },
                      }}
                    >
                      {resendingVerification ? "Sending..." : "Resend"}
                    </Button>
                  )}
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: colors.text.secondary, fontSize: "0.8rem" }}>
                  Display Name
                </Typography>
                <TextField fullWidth value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name"
                  slotProps={{ input: { inputProps: { maxLength: 30 } } }} sx={textFieldSx} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.8rem", color: colors.text.secondary }}>
                <Calendar size={14} />
                Member since {new Date(memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </Box>
              {referredBy && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.8rem", color: colors.primary }}>
                  <User size={14} />
                  Referred by {referredBy.displayName || referredBy.email}
                </Box>
              )}
            </Box>
          </Box>

          {/* Withdrawal Settings */}
          <Box sx={{ borderRadius: "14px", bgcolor: "#232645", p: 2.5 }}>
            <Typography variant="subtitle1" isBold sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontSize: "0.95rem" }}>
              <Wallet size={18} color={colors.primary} /> Withdrawal Settings
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: colors.text.secondary, fontSize: "0.8rem" }}>
                  LTC Address
                </Typography>
                <TextField fullWidth value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your LTC address" sx={textFieldSx} />
              </Box>
            </Box>
          </Box>
        </Box>

        {error && <Box sx={{ borderRadius: "10px", bgcolor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", px: 2, py: 1, fontSize: "0.8rem", color: colors.status.error }}>{error}</Box>}
        {saved && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: "10px", bgcolor: "#1A1B2E", border: "1px solid rgba(16,185,129,0.2)", px: 2, py: 1, fontSize: "0.8rem", color: colors.primary }}>
            <CheckCircle size={14} /> Profile saved successfully
          </Box>
        )}

        <Button type="submit" variant="contained" disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
          sx={{
            alignSelf: "flex-start",
            background: "linear-gradient(180deg, #10B981, #059669)",
            borderRadius: "14px", px: 3, py: 1.25, fontWeight: 600, fontSize: "0.85rem",
            textTransform: "none", boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
            "&:hover": { filter: "brightness(1.1)" },
            "&.Mui-disabled": { opacity: 0.5, color: "#fff" },
          }}>
          Save Changes
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        {TABS.map((tab, i) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(i)}
            sx={{
              borderRadius: "20px", px: 2.5, py: 0.75, fontSize: "0.8rem", fontWeight: 600, textTransform: "none",
              ...(activeTab === i
                ? { bgcolor: colors.primary, color: "#000", "&:hover": { bgcolor: colors.primary, filter: "brightness(1.1)" } }
                : { bgcolor: "#1A1B2E", color: colors.text.secondary, border: "1px solid rgba(255,255,255,0.05)", "&:hover": { bgcolor: "#232645" } }),
            }}
          >
            {tab}
          </Button>
        ))}
      </Box>

      {loadingWithdrawals && withdrawals.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={28} sx={{ color: colors.primary }} />
        </Box>
      ) : (
        <>
          {withdrawals.length === 0 ? (
            <Box sx={{ borderRadius: "14px", bgcolor: "#1A1B2E", p: 5, textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.875rem", color: colors.text.secondary }}>No withdrawals yet</Typography>
            </Box>
          ) : (
            <>
              {/* Mobile cards */}
              <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
                {withdrawals.map((w) => {
                  const sc = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                  return (
                    <Box key={w.id} sx={{ borderRadius: "12px", bgcolor: "#1A1B2E", p: 2 }}>
                      <Box sx={{ mb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>
                          {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </Typography>
                        <Box sx={{ borderRadius: "6px", bgcolor: sc.bg, px: 1, py: 0.25, fontSize: "10px", fontWeight: 600, color: sc.color, textTransform: "capitalize" }}>
                          {w.status}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{w.coins.toLocaleString()} coins</Typography>
                          <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>${w.amount_usd.toFixed(2)} via LTC</Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              {/* Desktop table */}
              <TableContainer sx={{ display: { xs: "none", sm: "block" }, borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", bgcolor: "transparent", mb: 2, overflow: "hidden" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#1A1B2E" }}>
                      {["Coins", "Amount", "Status", "Date"].map((h) => (
                        <TableCell key={h} sx={{ color: colors.text.secondary, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", borderColor: "rgba(255,255,255,0.05)" }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {withdrawals.map((w) => {
                      const sc = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                      return (
                        <TableRow key={w.id} sx={{ "&:hover": { bgcolor: "rgba(26,27,46,0.5)" } }}>
                          <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "0.8rem" }}>{w.coins.toLocaleString()}</TableCell>
                          <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)", color: colors.primary, fontWeight: 600, fontSize: "0.8rem" }}>${w.amount_usd.toFixed(2)}</TableCell>
                          <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                            <Box sx={{ display: "inline-block", borderRadius: "6px", bgcolor: sc.bg, px: 1, py: 0.25, fontSize: "0.7rem", fontWeight: 600, color: sc.color, textTransform: "capitalize" }}>
                              {w.status}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)", color: colors.text.secondary, fontSize: "0.75rem", whiteSpace: "nowrap" }}>
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
                    sx={{
                      textTransform: "none", color: colors.text.secondary,
                      border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px",
                      px: 3, bgcolor: "#1A1B2E",
                      "&:hover": { bgcolor: "#232645", color: "#fff" },
                    }}
                  >
                    {loadingWithdrawals ? "Loading..." : "Load More"}
                  </Button>
                </Box>
              )}
            </>
          )}
        </>
      )}

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
            bgcolor: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
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
