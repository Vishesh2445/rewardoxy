"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Button,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Coins,
  DollarSign,
  Wallet,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  Check,
  Info,
  X,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

const MIN_COINS = 2000;
const COINS_PER_USD = 1000;
const PAGE_SIZE = 5;

const EXPLORER_URLS = "https://litecoin.info/tx/";

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  pending: { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.2)" },
  processing: { bg: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "rgba(56,189,248,0.2)" },
  paid: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", border: "rgba(34,197,94,0.2)" },
  failed: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.2)" },
};

interface Withdrawal {
  id: string;
  requested_at: string;
  coins: number;
  amount_usd: number;
  status: string;
  tx_hash: string | null;
}

interface CashoutClientProps {
  userId: string;
  initialCoins: number;
  initialWithdrawals: Withdrawal[];
  initialTotal: number;
  isBanned?: boolean;
  emailVerified?: boolean;
  fraudStatus?: string;
  fraudNotification?: { id: string; message: string } | null;
  savedCryptoAddress?: string;
}

export default function CashoutClient({
  userId,
  initialCoins,
  initialWithdrawals,
  initialTotal,
  isBanned = false,
  emailVerified = false,
  fraudStatus = "clean",
  fraudNotification = null,
  savedCryptoAddress = "",
}: CashoutClientProps) {
  const router = useRouter();
  const [coins, setCoins] = useState(initialCoins);
  const [address, setAddress] = useState(savedCryptoAddress);
  const [amountCoins, setAmountCoins] = useState<number | "">(initialCoins >= MIN_COINS ? initialCoins : "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [showFraudBanner, setShowFraudBanner] = useState(!!fraudNotification);
  const [fraudNotifId] = useState(fraudNotification?.id || null);
  const isFraudBlocked = fraudStatus === "cashout_blocked" || fraudStatus === "suspended";

  useEffect(() => {
    fetch("/api/cashout/page-view-fraud-check", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => {});
  }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const availableUsd = coins / COINS_PER_USD;
  const withdrawUsd = typeof amountCoins === "number" ? amountCoins / COINS_PER_USD : 0;

  async function dismissFraudBanner() {
    setShowFraudBanner(false);
    if (fraudNotifId) {
      try {
        await fetch("/api/notifications/dismiss", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: fraudNotifId }),
        });
      } catch {}
    }
  }

  async function fetchPage(newPage: number) {
    const supabase = createClient();
    const from = newPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count } = await supabase
      .from("withdrawals")
      .select("id, requested_at, coins, amount_usd, status, tx_hash", { count: "exact" })
      .eq("user_id", userId)
      .order("requested_at", { ascending: false })
      .range(from, to);
    if (data) setWithdrawals(data);
    if (count !== null) setTotal(count);
    setPage(newPage);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (typeof amountCoins !== "number" || amountCoins < MIN_COINS) {
      setError(`Minimum withdrawal is ${MIN_COINS.toLocaleString()} coins`);
      return;
    }
    if (amountCoins > coins) {
      setError(`You only have ${coins.toLocaleString()} coins available`);
      return;
    }
    if (!address.trim() || address.trim().length < 10) {
      setError("Enter a valid LTC wallet address");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_coins: amountCoins, address: address.trim() }),
    });
    const body = await res.json();
    if (!res.ok) {
      if (body.fraud) {
        setShowFraudBanner(true);
        setError(null);
      } else {
        setError(body.error || "Withdrawal failed");
      }
      setLoading(false);
      return;
    }
    setSuccess(`Withdrawal of $${body.amount_usd.toFixed(2)} submitted`);
    setCoins((prev) => prev - body.coins);
    setAddress("");
    setAmountCoins("");
    setLoading(false);
    await fetchPage(0);
    router.refresh();
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: { xs: 12, lg: 4 } }}>
      {/* Fraud Detection Banner */}
      {(showFraudBanner || isFraudBlocked) && (
        <Box
          sx={{
            mb: 3,
            borderRadius: "14px",
            background: "rgba(245, 158, 11, 0.08)",
            p: { xs: 2, sm: 2.5 },
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} color="#f59e0b" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#f59e0b", mb: 0.5 }}>
                Cashouts Paused
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: colors.text.secondary, lineHeight: 1.6 }}>
                We have noticed some unusual activity in your account. As a result, we&apos;ve paused cashouts for now. If this doesn&apos;t seem right, please contact support.
              </Typography>
              <Box sx={{ mt: 1.5, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  href="/contact"
                  startIcon={<MessageCircle size={14} />}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#f59e0b",
                    background: "rgba(245, 158, 11, 0.1)",
                    borderRadius: "10px",
                    px: 2,
                    "&:hover": { background: "rgba(245, 158, 11, 0.15)" },
                  }}
                >
                  Message Support
                </Button>
              </Box>
            </Box>
            {showFraudBanner && (
              <IconButton
                size="small"
                onClick={dismissFraudBanner}
                sx={{ color: "rgba(245, 158, 11, 0.5)", "&:hover": { color: "#f59e0b" } }}
              >
                <X size={16} />
              </IconButton>
            )}
          </Box>
        </Box>
      )}

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Wallet size={24} color={colors.primary} />
          Cash Out
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, fontSize: "0.8rem" }}>
          Withdraw your coins directly to your LTC wallet instantly
        </Typography>
      </Box>

      {/* Balance hero card */}
      <Box
        sx={{
          mb: 3,
          borderRadius: "20px",
          background: "linear-gradient(135deg, #232645 0%, #1E2148 100%)",
          p: { xs: 2.5, sm: 3 },
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "auto auto 1fr" }, gap: 3, alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 48, height: 48, borderRadius: "12px",
              background: "rgba(191, 187, 187, 0.1)", overflow: "hidden",
            }}>
              <Box component="img" src="/litecoin-ltc-icon.png" sx={{ width: 26, height: 26, objectFit: "contain" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: colors.text.secondary }}>
                Available Balance
              </Typography>
              <Typography sx={{ fontSize: "1.75rem", fontWeight: 800, background: colors.text.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>
                {coins.toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary, opacity: 0.7 }}>coins</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, pl: { sm: 3 }, borderLeft: { sm: "1px solid rgba(255,255,255,0.08)" } }}>
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 48, height: 48, borderRadius: "12px",
              background: "#1A1B2E",
            }}>
              <DollarSign size={24} color={colors.primary} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: colors.text.secondary }}>
                USD Value
              </Typography>
              <Typography sx={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.1 }}>
                ${availableUsd.toFixed(2)}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>USD</Typography>
            </Box>
          </Box>

          <Box sx={{ ml: { sm: "auto" }, display: "flex", flexDirection: "column", gap: 0.75, pl: { sm: 3 }, borderLeft: { sm: "1px solid rgba(255,255,255,0.08)" } }}>
            {[
              { label: "Minimum", value: `${MIN_COINS.toLocaleString()} coins` },
              { label: "Rate", value: "1,000 = $1 USD" },
            ].map((row) => (
              <Box key={row.label} sx={{ display: "flex", gap: 1, fontSize: "0.75rem" }}>
                <Typography sx={{ color: colors.text.secondary, fontSize: "inherit" }}>{row.label}:</Typography>
                <Typography sx={{ fontWeight: 600, color: "#fff", fontSize: "inherit" }}>{row.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {isBanned ? (
        <Box sx={{ mb: 3, borderRadius: "14px", bgcolor: "rgba(239,68,68,0.08)", p: 3, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: colors.status.error, mb: 1, fontWeight: 700 }}>
            Account Banned
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            You cannot cash out because your account is suspended. Please contact support.
          </Typography>
        </Box>
      ) : !emailVerified ? (
        <Box sx={{ mb: 3, borderRadius: "14px", bgcolor: "rgba(245,158,11,0.08)", p: 3, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: colors.status.warning, mb: 1, fontWeight: 700 }}>
            Email Verification Required
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            You must verify your email address before you can submit a withdrawal.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Withdrawal form */}
          <Box
            sx={{
              mb: 3,
              borderRadius: "14px",
              bgcolor: "#232645",
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Typography variant="subtitle1" isBold sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
              <Wallet size={18} color={colors.primary} />
              Withdrawal Details
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: colors.text.secondary, display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>Amount (Coins)</span>
                    <Box
                      component="span"
                      onClick={() => setAmountCoins(coins)}
                      sx={{ color: colors.primary, fontSize: "0.75rem", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    >
                      Max: {coins.toLocaleString()}
                    </Box>
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    value={amountCoins}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") { setAmountCoins(""); return; }
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 0) setAmountCoins(num);
                    }}
                    placeholder={`Min. ${MIN_COINS.toLocaleString()}`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Coins size={16} color={colors.text.secondary} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#252539",
                        borderRadius: "12px",
                        fontSize: "0.875rem",
                        color: "#fff",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.06)", borderWidth: "1px" },
                        "&:hover fieldset": { borderColor: "rgba(16,185,129,0.3)" },
                        "&.Mui-focused fieldset": { borderColor: "#10B981", borderWidth: "1.5px" },
                        "& input::placeholder": { color: `${colors.text.secondary}80`, opacity: 1 },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: colors.text.secondary, fontSize: "0.8rem" }}>
                    LTC Wallet Address
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Your LTC wallet address"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#252539",
                        borderRadius: "12px",
                        fontSize: "0.875rem",
                        color: "#fff",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.06)", borderWidth: "1px" },
                        "&:hover fieldset": { borderColor: "rgba(16,185,129,0.3)" },
                        "&.Mui-focused fieldset": { borderColor: "#10B981", borderWidth: "1.5px" },
                        "& input::placeholder": { color: `${colors.text.secondary}80`, opacity: 1 },
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Summary box */}
              <Box sx={{ borderRadius: "12px", bgcolor: "#252539", p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Info size={14} color={colors.text.secondary} />
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: colors.text.secondary }}>Withdrawal Summary</Typography>
                </Box>
                {[
                  { label: "Coins to withdraw", value: `${(amountCoins || 0).toLocaleString()} coins`, accent: true },
                  { label: "Exchange rate", value: "1,000 coins = $1.00 USD" },
                  { label: "You receive", value: `$${withdrawUsd.toFixed(2)} USD in LTC`, accent: true },
                  { label: "Network fee", value: "Free" },
                ].map((row, i) => (
                  <Box
                    key={row.label}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 0.5,
                      borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined,
                    }}
                  >
                    <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: row.accent ? colors.primary : "#fff" }}>{row.value}</Typography>
                  </Box>
                ))}
                {coins < MIN_COINS && (
                  <Box sx={{ mt: 1.5, borderRadius: "8px", bgcolor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", px: 1.5, py: 0.75, fontSize: "0.7rem", color: "#f87171" }}>
                    You need at least {MIN_COINS.toLocaleString()} coins (${(MIN_COINS / COINS_PER_USD).toFixed(2)}) to withdraw
                  </Box>
                )}
              </Box>

              {error && (
                <Box sx={{ borderRadius: "10px", bgcolor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", px: 2, py: 1, fontSize: "0.8rem", color: colors.status.error }}>
                  {error}
                </Box>
              )}
              {success && (
                <Box sx={{ borderRadius: "10px", bgcolor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", px: 2, py: 1, fontSize: "0.8rem", color: colors.primary }}>
                  {success}
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || coins < MIN_COINS || (typeof amountCoins !== "number") || (amountCoins > coins) || (amountCoins < MIN_COINS)}
                endIcon={!loading ? <ArrowRight size={16} /> : undefined}
                sx={{
                  py: 1.25,
                  borderRadius: "14px",
                  background: "linear-gradient(180deg, #10B981, #059669)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textTransform: "none",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)",
                  "&:hover": { filter: "brightness(1.1)" },
                  "&.Mui-disabled": { opacity: 0.4, color: "#fff" },
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : `Withdraw ${typeof amountCoins === "number" && amountCoins >= MIN_COINS ? `$${withdrawUsd.toFixed(2)}` : "Now"}`}
              </Button>
            </Box>
          </Box>
        </>
      )}

      {/* Withdrawal history */}
      <Box>
        <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <Clock size={16} color={colors.primary} />
          <Typography variant="subtitle1" isBold>Withdrawal History</Typography>
          <Box sx={{ ml: 1, borderRadius: "20px", bgcolor: "#1A1B2E", border: "1px solid rgba(255,255,255,0.05)", px: 1.25, py: 0.25, fontSize: "0.7rem", color: colors.text.secondary }}>
            {total} total
          </Box>
        </Box>

        {withdrawals.length === 0 ? (
          <Box sx={{ borderRadius: "14px", bgcolor: "#1A1B2E", p: 4, textAlign: "center" }}>
            <Wallet size={32} color="rgba(169,169,202,0.3)" style={{ margin: "0 auto" }} />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5, fontSize: "0.8rem" }}>
              No withdrawals yet. Earn coins and cash out!
            </Typography>
          </Box>
        ) : (
          <>
            {/* Mobile cards */}
            <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
              {withdrawals.map((w) => {
                const st = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                return (
                  <Box key={w.id} sx={{ borderRadius: "12px", bgcolor: "#1A1B2E", p: 2 }}>
                    <Box sx={{ mb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>
                        {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Typography>
                      <Box sx={{ borderRadius: "6px", bgcolor: st.bg, color: st.color, px: 1, py: 0.25, fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>
                        {w.status}
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{w.coins.toLocaleString()} coins</Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>${w.amount_usd.toFixed(2)} via LTC</Typography>
                      </Box>
                      {w.tx_hash && (
                        <Box component="a" href={`${EXPLORER_URLS}${w.tx_hash}`} target="_blank" rel="noopener noreferrer"
                          sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.7rem", color: colors.primary, textDecoration: "none" }}>
                          Tx <ExternalLink size={10} />
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Desktop table */}
            <TableContainer sx={{ display: { xs: "none", sm: "block" }, borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", bgcolor: "transparent", overflow: "hidden" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#1A1B2E" }}>
                    {["Date", "Coins", "USD", "Network", "Status", "Tx"].map((h) => (
                      <TableCell key={h} sx={{ color: colors.text.secondary, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", borderColor: "rgba(255,255,255,0.05)" }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawals.map((w) => {
                    const st = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                    return (
                      <TableRow key={w.id} sx={{ "&:hover": { bgcolor: "rgba(26,27,46,0.5)" } }}>
                        <TableCell sx={{ color: colors.text.secondary, borderColor: "rgba(255,255,255,0.05)", whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                          {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#fff", borderColor: "rgba(255,255,255,0.05)" }}>{w.coins.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: colors.primary, borderColor: "rgba(255,255,255,0.05)" }}>${w.amount_usd.toFixed(2)}</TableCell>
                        <TableCell sx={{ color: colors.text.secondary, borderColor: "rgba(255,255,255,0.05)", fontSize: "0.8rem" }}>LTC</TableCell>
                        <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <Box component="span" sx={{ borderRadius: "6px", bgcolor: st.bg, color: st.color, px: 1, py: 0.35, fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>
                            {w.status}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          {w.tx_hash ? (
                            <Box component="a" href={`${EXPLORER_URLS}${w.tx_hash}`} target="_blank" rel="noopener noreferrer"
                              sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#10B981", textDecoration: "none", fontSize: "0.8rem" }}>
                              {w.tx_hash.slice(0, 8)}... <ExternalLink size={12} />
                            </Box>
                          ) : (
                            <Box component="span" sx={{ color: "rgba(169,169,202,0.4)" }}>--</Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Button size="small" onClick={() => fetchPage(page - 1)} disabled={page === 0} startIcon={<ChevronLeft size={14} />}
                  sx={{ color: colors.text.secondary, bgcolor: "#1A1B2E", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
                  Prev
                </Button>
                <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>Page {page + 1} of {totalPages}</Typography>
                <Button size="small" onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1} endIcon={<ChevronRight size={14} />}
                  sx={{ color: colors.text.secondary, bgcolor: "#1A1B2E", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
                  Next
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
