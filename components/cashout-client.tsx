"use client";

import { useState } from "react";
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
}

export default function CashoutClient({
  userId,
  initialCoins,
  initialWithdrawals,
  initialTotal,
  isBanned = false,
}: CashoutClientProps) {
  const router = useRouter();
  const [coins, setCoins] = useState(initialCoins);
  const [address, setAddress] = useState("");
  const [amountCoins, setAmountCoins] = useState<number | "">(initialCoins >= MIN_COINS ? initialCoins : "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const availableUsd = coins / COINS_PER_USD;
  const withdrawUsd = typeof amountCoins === "number" ? amountCoins / COINS_PER_USD : 0;

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
      setError(body.error || "Withdrawal failed");
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
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Wallet size={26} color="#01D676" />
          Cash Out
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Withdraw your coins directly to your LTC wallet instantly
        </Typography>
      </Box>

      {/* Balance summary card */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: "1px solid rgba(1,214,118,0.2)",
          background: "linear-gradient(135deg, rgba(1,214,118,0.08) 0%, rgba(0,126,69,0.05) 100%)",
          p: { xs: 3, sm: 4 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ pointerEvents: "none", position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(1,214,118,0.06)", filter: "blur(50px)" }} />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 3, bgcolor: "rgba(1,214,118,0.15)", border: "1px solid rgba(1,214,118,0.25)" }}>
              <Coins size={26} color="#01D676" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(1,214,118,0.7)" }}>Available Balance</Typography>
              <Typography sx={{ fontSize: "2rem", fontWeight: 800, color: "#01D676", lineHeight: 1.1 }}>
                {coins.toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "rgba(1,214,118,0.55)" }}>coins</Typography>
            </Box>
          </Box>

          <Box sx={{ borderLeft: { sm: `1px solid rgba(1,214,118,0.15)` }, pl: { sm: 3 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 3, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}` }}>
                <DollarSign size={26} color="#01D676" />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: colors.text.secondary }}>USD Value</Typography>
                <Typography sx={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.1 }}>
                  ${availableUsd.toFixed(2)}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: colors.text.secondary }}>USD</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ ml: { sm: "auto" }, display: "flex", flexDirection: "column", gap: 0.75 }}>
            {[
              { label: "Minimum cashout", value: `${MIN_COINS.toLocaleString()} coins ($${(MIN_COINS / COINS_PER_USD).toFixed(2)})` },
              { label: "Rate", value: "1,000 coins = $1 USD" },
              { label: "Processing", value: "Instant" },
            ].map((row) => (
              <Box key={row.label} sx={{ display: "flex", gap: 1, fontSize: "0.75rem" }}>
                <Typography sx={{ color: colors.text.secondary, fontSize: "inherit" }}>{row.label}:</Typography>
                <Typography sx={{ fontWeight: 600, color: "#fff", fontSize: "inherit" }}>{row.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {isBanned ? (
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 4,
            border: "1px solid rgba(239,68,68,0.3)",
            bgcolor: "rgba(239,68,68,0.08)",
            p: { xs: 3, sm: 4 },
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "#f87171", mb: 1, fontWeight: 700 }}>
            Account Banned
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            You cannot cash out because your account is suspended. If you believe this is a mistake, please contact support.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Withdrawal form */}
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
            <Typography variant="subtitle1" isBold sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <Wallet size={20} color="#01D676" />
              Withdrawal Details
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: colors.text.secondary, display: "flex", justifyContent: "space-between" }}>
                    <span>Amount (Coins)</span>
                    <Box
                      component="span"
                      onClick={() => setAmountCoins(coins)}
                      sx={{ color: "#01D676", fontSize: "0.8rem", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
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
                      if (val === "") {
                        setAmountCoins("");
                        return;
                      }
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 0) {
                        setAmountCoins(num);
                      }
                    }}
                    placeholder={`Min. ${MIN_COINS.toLocaleString()}`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Coins size={18} color={colors.text.secondary} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: colors.background.ternary,
                        borderRadius: 2,
                        fontSize: "0.875rem",
                        color: "#fff",
                        "& fieldset": { borderColor: colors.divider },
                        "&:hover fieldset": { borderColor: "rgba(1,214,118,0.3)" },
                        "&.Mui-focused fieldset": { borderColor: "#01D676", borderWidth: "1px" },
                        "& input::placeholder": { color: `${colors.text.secondary}80`, opacity: 1 },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: colors.text.secondary }}>
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
                        bgcolor: colors.background.ternary,
                        borderRadius: 2,
                        fontSize: "0.875rem",
                        color: "#fff",
                        "& fieldset": { borderColor: colors.divider },
                        "&:hover fieldset": { borderColor: "rgba(1,214,118,0.3)" },
                        "&.Mui-focused fieldset": { borderColor: "#01D676", borderWidth: "1px" },
                        "& input::placeholder": { color: `${colors.text.secondary}80`, opacity: 1 },
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Summary box */}
              <Box
                sx={{
                  borderRadius: 3,
                  bgcolor: colors.background.ternary,
                  border: `1px solid ${colors.divider}`,
                  p: 2.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Info size={15} color={colors.text.secondary} />
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: colors.text.secondary }}>Withdrawal Summary</Typography>
                </Box>
                {[
                  { label: "Coins to withdraw", value: `${(amountCoins || 0).toLocaleString()} coins`, accent: true },
                  { label: "Exchange rate", value: "1,000 coins = $1.00 USD" },
                  { label: "You receive", value: `$${withdrawUsd.toFixed(2)} USD in LTC`, accent: true },
                  { label: "Network fee", value: "Free 🎉" },
                ].map((row, i) => (
                  <Box
                    key={row.label}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 0.75,
                      borderTop: i > 0 ? `1px solid ${colors.divider}` : undefined,
                    }}
                  >
                    <Typography sx={{ fontSize: "0.8rem", color: colors.text.secondary }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: row.accent ? "#01D676" : "#fff" }}>{row.value}</Typography>
                  </Box>
                ))}
                {coins < MIN_COINS ? (
                  <Box sx={{ mt: 1.5, borderRadius: 2, bgcolor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", px: 2, py: 1, fontSize: "0.75rem", color: "#f87171" }}>
                    ⚠ You need at least {MIN_COINS.toLocaleString()} coins (${(MIN_COINS / COINS_PER_USD).toFixed(2)}) to withdraw
                  </Box>
                ) : (typeof amountCoins === "number" && amountCoins > coins) ? (
                  <Box sx={{ mt: 1.5, borderRadius: 2, bgcolor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", px: 2, py: 1, fontSize: "0.75rem", color: "#f87171" }}>
                    ⚠ You do not have enough coins
                  </Box>
                ) : null}
              </Box>

              {error && (
                <Box sx={{ borderRadius: 2, bgcolor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", px: 2, py: 1.25, fontSize: "0.875rem", color: "#f87171" }}>
                  {error}
                </Box>
              )}
              {success && (
                <Box sx={{ borderRadius: 2, bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)", px: 2, py: 1.25, fontSize: "0.875rem", color: "#01D676" }}>
                  ✓ {success}
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || coins < MIN_COINS || (typeof amountCoins !== "number") || (amountCoins > coins) || (amountCoins < MIN_COINS)}
                endIcon={!loading ? <ArrowRight size={16} /> : undefined}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  background: "linear-gradient(180deg,#01D676,#007e45)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  boxShadow: "0 4px 16px rgba(1,214,118,0.25)",
                  "&:hover": { filter: "brightness(1.1)" },
                  "&.Mui-disabled": { opacity: 0.4, color: "#fff" },
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : `Withdraw ${typeof amountCoins === "number" && amountCoins >= MIN_COINS ? `$${withdrawUsd.toFixed(2)}` : "Now"}`}
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {/* Withdrawal history */}
      <Box>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Clock size={18} color="#01D676" />
          <Typography variant="subtitle1" isBold>Withdrawal History</Typography>
          <Box sx={{ ml: 1, borderRadius: 50, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}`, px: 1.25, py: 0.25, fontSize: "0.7rem", color: colors.text.secondary }}>
            {total} total
          </Box>
        </Box>

        {withdrawals.length === 0 ? (
          <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.background.secondary, p: 5, textAlign: "center" }}>
            <Wallet size={36} color="rgba(169,169,202,0.3)" style={{ margin: "0 auto" }} />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              No withdrawals yet. Earn coins and cash out!
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Mobile cards */}
            <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1.5 }}>
              {withdrawals.map((w) => {
                const st = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                return (
                  <Paper key={w.id} elevation={0} sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.background.secondary, p: 2.5 }}>
                    <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                        {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Typography>
                      <Box sx={{ borderRadius: 50, border: `1px solid ${st.border}`, bgcolor: st.bg, color: st.color, px: 1.25, py: 0.25, fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>
                        {w.status}
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{w.coins.toLocaleString()} coins</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>${w.amount_usd.toFixed(2)} via LTC</Typography>
                      </Box>
                      {w.tx_hash && (
                        <Box component="a" href={`${EXPLORER_URLS}${w.tx_hash}`} target="_blank" rel="noopener noreferrer"
                          sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.75rem", color: "#01D676", textDecoration: "none", "&:hover": { opacity: 0.8 } }}>
                          Tx <ExternalLink size={12} />
                        </Box>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Box>

            {/* Desktop table */}
            <TableContainer component={Paper} elevation={0} sx={{ display: { xs: "none", sm: "block" }, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: "transparent", overflow: "hidden" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(29,30,48,0.9)" }}>
                    {["Date", "Coins", "USD", "Network", "Status", "Tx"].map((h) => (
                      <TableCell key={h} sx={{ color: colors.text.secondary, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", borderColor: colors.divider }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawals.map((w) => {
                    const st = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                    return (
                      <TableRow key={w.id} sx={{ bgcolor: "rgba(29,30,48,0.4)", "&:hover": { bgcolor: "rgba(29,30,48,0.65)" } }}>
                        <TableCell sx={{ color: colors.text.secondary, borderColor: colors.divider, whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                          {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#fff", borderColor: colors.divider }}>{w.coins.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#01D676", borderColor: colors.divider }}>${w.amount_usd.toFixed(2)}</TableCell>
                        <TableCell sx={{ color: colors.text.secondary, borderColor: colors.divider, fontSize: "0.8rem" }}>LTC</TableCell>
                        <TableCell sx={{ borderColor: colors.divider }}>
                          <Box component="span" sx={{ borderRadius: 50, border: `1px solid ${st.border}`, bgcolor: st.bg, color: st.color, px: 1.25, py: 0.35, fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>
                            {w.status}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderColor: colors.divider }}>
                          {w.tx_hash ? (
                            <Box component="a" href={`${EXPLORER_URLS}${w.tx_hash}`} target="_blank" rel="noopener noreferrer"
                              sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#01D676", textDecoration: "none", fontSize: "0.8rem", "&:hover": { opacity: 0.8 } }}>
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
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Button size="small" onClick={() => fetchPage(page - 1)} disabled={page === 0} startIcon={<ChevronLeft size={14} />}
                  sx={{ color: colors.text.secondary, bgcolor: colors.background.secondary, border: `1px solid ${colors.divider}`, borderRadius: 2, fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
                  Prev
                </Button>
                <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>Page {page + 1} of {totalPages}</Typography>
                <Button size="small" onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1} endIcon={<ChevronRight size={14} />}
                  sx={{ color: colors.text.secondary, bgcolor: colors.background.secondary, border: `1px solid ${colors.divider}`, borderRadius: 2, fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
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
