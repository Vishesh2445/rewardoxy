"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Box, Button, Paper, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from "@mui/material";
import { Coins, DollarSign, Wallet, ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

const NETWORKS = ["TRC-20", "BEP-20", "SOL"] as const;
const MIN_COINS = 2000;
const COINS_PER_USD = 1000;
const PAGE_SIZE = 10;

const EXPLORER_URLS: Record<string, string> = {
  "TRC-20": "https://tronscan.org/#/transaction/",
  "BEP-20": "https://bscscan.com/tx/",
  SOL: "https://solscan.io/tx/",
};

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
  network: string;
  status: string;
  tx_hash: string | null;
}

interface CashoutClientProps {
  userId: string;
  initialCoins: number;
  initialWithdrawals: Withdrawal[];
  initialTotal: number;
}

export default function CashoutClient({ userId, initialCoins, initialWithdrawals, initialTotal }: CashoutClientProps) {
  const router = useRouter();
  const [coins, setCoins] = useState(initialCoins);
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState<string>(NETWORKS[0]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const usd = coins / COINS_PER_USD;

  async function fetchPage(newPage: number) {
    const supabase = createClient();
    const from = newPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count } = await supabase.from("withdrawals").select("id, requested_at, coins, amount_usd, network, status, tx_hash", { count: "exact" }).eq("user_id", userId).order("requested_at", { ascending: false }).range(from, to);
    if (data) setWithdrawals(data);
    if (count !== null) setTotal(count);
    setPage(newPage);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (coins < MIN_COINS) { setError(`Minimum withdrawal is ${MIN_COINS} coins ($${(MIN_COINS / COINS_PER_USD).toFixed(2)})`); return; }
    if (!address.trim() || address.trim().length < 10) { setError("Enter a valid crypto address"); return; }
    setLoading(true);
    const res = await fetch("/api/withdraw", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ network }) });
    const body = await res.json();
    if (!res.ok) { setError(body.error || "Withdrawal failed"); setLoading(false); return; }
    setSuccess(`Withdrawal of $${body.amount_usd.toFixed(2)} submitted`);
    setCoins(0);
    setAddress("");
    setLoading(false);
    await fetchPage(0);
    router.refresh();
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" isBold>Cash Out</Typography>
        <Typography variant="body2" color="textSecondary">Withdraw your earnings as crypto</Typography>
      </Box>

      {/* Balance cards */}
      <Box sx={{ mb: 4, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 3, bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)" }}>
              <Coins size={20} color="#01D676" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: colors.text.secondary }}>Balance</Typography>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#01D676" }}>{coins.toLocaleString()}</Typography>
            </Box>
          </Box>
        </Paper>
        <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 3, bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)" }}>
              <DollarSign size={20} color="#01D676" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: colors.text.secondary }}>USD Value</Typography>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 700 }}>${usd.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Withdrawal form */}
      <Paper sx={{ mb: 4, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 3 }}>
        <Typography variant="subtitle1" isBold sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Wallet size={20} color="#01D676" />
          Withdraw
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, color: colors.text.secondary }}>Network</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {NETWORKS.map((n) => (
                <Button key={n} variant="outlined" onClick={() => setNetwork(n)}
                  sx={{
                    borderRadius: 2, px: 2, py: 1.25, fontSize: "0.875rem", fontWeight: 500, textTransform: "none",
                    ...(network === n
                      ? { borderColor: "rgba(1,214,118,0.5)", bgcolor: colors.background.secondary, color: "#01D676", "&:hover": { borderColor: "rgba(1,214,118,0.5)", bgcolor: colors.background.secondary } }
                      : { borderColor: colors.divider, bgcolor: colors.background.primary, color: colors.text.secondary, "&:hover": { color: "#fff", borderColor: colors.divider, bgcolor: colors.background.primary } }),
                  }}
                >
                  {n}
                </Button>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, color: colors.text.secondary }}>
              {network === "SOL" ? "SOL" : "USDT"} Address
            </Typography>
            <TextField fullWidth required value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder={`Your ${network} address`}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.background.ternary, borderRadius: 2, fontSize: "0.875rem", color: "#fff",
                  "& fieldset": { borderColor: colors.divider },
                  "&:hover fieldset": { borderColor: colors.divider },
                  "&.Mui-focused fieldset": { borderColor: colors.secondary, borderWidth: "1px" },
                  "& input::placeholder": { color: `${colors.text.secondary}80`, opacity: 1 },
                },
              }}
            />
          </Box>

          <Box sx={{ borderRadius: 2, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}`, px: 2, py: 1.5, fontSize: "0.875rem", color: colors.text.secondary }}>
            You will receive <Box component="span" sx={{ fontWeight: 600, color: "#fff" }}>${usd.toFixed(2)}</Box> for <Box component="span" sx={{ fontWeight: 600, color: "#01D676" }}>{coins.toLocaleString()} coins</Box>
            {coins < MIN_COINS && (
              <Box component="span" sx={{ display: "block", mt: 0.5, fontSize: "0.75rem", color: "#f87171" }}>
                Minimum {MIN_COINS} coins (${(MIN_COINS / COINS_PER_USD).toFixed(2)}) required
              </Box>
            )}
          </Box>

          {error && <Box sx={{ borderRadius: 2, bgcolor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", px: 2, py: 1.25, fontSize: "0.875rem", color: "#f87171" }}>{error}</Box>}
          {success && <Box sx={{ borderRadius: 2, bgcolor: "rgba(1,214,118,0.1)", border: "1px solid rgba(1,214,118,0.2)", px: 2, py: 1.25, fontSize: "0.875rem", color: "#01D676" }}>{success}</Box>}

          <Button type="submit" variant="contained" fullWidth disabled={loading || coins < MIN_COINS}
            endIcon={!loading ? <ArrowRight size={16} /> : undefined}
            sx={{ py: 1.25, borderRadius: 2, background: colors.background.gradient, fontWeight: 600, fontSize: "0.875rem", textTransform: "none", "&:hover": { filter: "brightness(1.1)" }, "&.Mui-disabled": { opacity: 0.5, color: "#fff" } }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : "Withdraw"}
          </Button>
        </Box>
      </Paper>

      {/* Withdrawal history */}
      <Box>
        <Typography variant="subtitle1" isBold sx={{ mb: 2 }}>Withdrawal History</Typography>
        {withdrawals.length === 0 ? (
          <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">No withdrawals yet.</Typography>
          </Paper>
        ) : (
          <>
            {/* Mobile cards */}
            <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
              {withdrawals.map((w) => {
                const st = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                return (
                  <Paper key={w.id} sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 2 }}>
                    <Box sx={{ mb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                        {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Typography>
                      <Box sx={{ borderRadius: 50, border: `1px solid ${st.border}`, bgcolor: st.bg, color: st.color, px: 1.25, py: 0.25, fontSize: "10px", fontWeight: 600, textTransform: "uppercase" }}>{w.status}</Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{w.coins.toLocaleString()} coins</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>${w.amount_usd.toFixed(2)} via {w.network}</Typography>
                      </Box>
                      {w.tx_hash && (
                        <Box component="a" href={`${EXPLORER_URLS[w.network] ?? ""}${w.tx_hash}`} target="_blank" rel="noopener noreferrer"
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
            <TableContainer component={Paper} sx={{ display: { xs: "none", sm: "block" }, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: "transparent" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(29,30,48,0.8)" }}>
                    {["Date", "Coins", "USD", "Network", "Status", "Tx"].map((h) => (
                      <TableCell key={h} sx={{ color: colors.text.secondary, fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 500, borderColor: colors.divider }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawals.map((w) => {
                    const st = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                    return (
                      <TableRow key={w.id} sx={{ bgcolor: "rgba(29,30,48,0.4)", "&:hover": { bgcolor: "rgba(29,30,48,0.6)" } }}>
                        <TableCell sx={{ color: colors.text.secondary, borderColor: colors.divider, whiteSpace: "nowrap" }}>
                          {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, color: "#fff", borderColor: colors.divider }}>{w.coins.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: "#fff", borderColor: colors.divider }}>${w.amount_usd.toFixed(2)}</TableCell>
                        <TableCell sx={{ color: colors.text.secondary, borderColor: colors.divider }}>{w.network}</TableCell>
                        <TableCell sx={{ borderColor: colors.divider }}>
                          <Box component="span" sx={{ borderRadius: 50, border: `1px solid ${st.border}`, bgcolor: st.bg, color: st.color, px: 1.25, py: 0.25, fontSize: "10px", fontWeight: 600, textTransform: "uppercase" }}>{w.status}</Box>
                        </TableCell>
                        <TableCell sx={{ borderColor: colors.divider }}>
                          {w.tx_hash ? (
                            <Box component="a" href={`${EXPLORER_URLS[w.network] ?? ""}${w.tx_hash}`} target="_blank" rel="noopener noreferrer"
                              sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#01D676", textDecoration: "none", "&:hover": { opacity: 0.8 } }}>
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
                  sx={{ color: colors.text.secondary, bgcolor: colors.background.primary, fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>Prev</Button>
                <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>Page {page + 1} of {totalPages}</Typography>
                <Button size="small" onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1} endIcon={<ChevronRight size={14} />}
                  sx={{ color: colors.text.secondary, bgcolor: colors.background.primary, fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>Next</Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
