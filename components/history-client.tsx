"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import {
  History, ChevronLeft, ChevronRight, CheckCircle, Gamepad2, FileText,
  Smartphone, Coins, XCircle, Gift, Star, TrendingUp, TrendingDown,
} from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

const PAGE_SIZE = 5;

interface Completion {
  id: string;
  program_id: string;
  payout_decimal: number | null;
  coins_awarded: number;
  created_at: string;
  source: string;
}

interface HistoryClientProps {
  userId: string;
  initialCompletions: Completion[];
  initialTotal: number;
}

const OFFER_ICONS: Record<string, typeof Gamepad2> = {
  game: Gamepad2, survey: FileText, app: Smartphone,
  cpx_survey: FileText, cpx_screenout: XCircle, cpx_bonus: Star,
};

function offerIcon(name: string, source?: string) {
  if (source === 'cpx') {
    if (name.includes('Survey')) return OFFER_ICONS.cpx_survey;
    if (name.includes('Screen-out')) return OFFER_ICONS.cpx_screenout;
    if (name.includes('Bonus')) return OFFER_ICONS.cpx_bonus;
    return OFFER_ICONS.survey;
  }
  if (source === 'notik' || source === 'revtoo' || source === 'klink') return Gift;
  const lower = name.toLowerCase();
  if (lower.includes("game") || lower.includes("play")) return OFFER_ICONS.game;
  if (lower.includes("survey") || lower.includes("fill")) return OFFER_ICONS.survey;
  return OFFER_ICONS.app;
}

const SOURCE_COLORS: Record<string, { bg: string; color: string }> = {
  cpx: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
  notik: { bg: "rgba(168,85,247,0.1)", color: "#a855f7" },
  revtoo: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  klink: { bg: "rgba(249,115,22,0.1)", color: "#f97316" },
  taskwall: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  gemiad: { bg: "rgba(236,72,153,0.1)", color: "#ec4899" },
  theoremreach: { bg: "rgba(14,165,233,0.1)", color: "#0ea5e9" },
};

export default function HistoryClient({
  userId,
  initialCompletions,
  initialTotal,
}: HistoryClientProps) {
  const [completions, setCompletions] = useState<Completion[]>(initialCompletions);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function fetchPage(newPage: number) {
    const supabase = createClient();
    const from = newPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const [completionsResult, cpxResult, notikResult, gemiadResult, theoremreachResult, revtooResult, taskwallResult, klinkResult] = await Promise.all([
      supabase.from("completions").select("id, program_id, payout_decimal, coins_awarded, created_at, source", { count: "exact" }).eq("player_id", userId).order("created_at", { ascending: false }).range(from, to),
      supabase.from("cpx_transactions").select("id, transid, amount_local, status, type, created_at", { count: "exact" }).eq("userid", userId).order("created_at", { ascending: false }).range(from, to),
      supabase.from("notik_transactions").select("id, txn_id, amount, offer_name, event_name, created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).range(from, to),
      supabase.from("gemiad_transactions").select("id, txid, reward, offer_name, event_name, status, created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).range(from, to),
      supabase.from("theoremreach_transactions").select("id, tx_id, reward, offer_name, is_reversal, is_screenout, is_profiler, is_offer, created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).range(from, to),
      supabase.from("revtoo_transactions").select("id, trans_id, reward, offer_name, status, created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).range(from, to),
      supabase.from("taskwall_transactions").select("id, txn_key, amount, offer_name, created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).range(from, to),
      supabase.from("klink_transactions").select("id, conversion_id, coins_awarded, offer_name, event_type, event_name, created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).range(from, to),
    ]);
    const merged = [
      ...(completionsResult.data ?? []),
      ...(cpxResult.data ?? []).map((cpx) => ({ id: cpx.id, program_id: cpx.type === 'complete' ? 'CPX Survey' : cpx.type === 'out' ? 'CPX Screen-out' : cpx.type === 'bonus' ? 'CPX Rating Bonus' : 'CPX Research', payout_decimal: cpx.amount_local, coins_awarded: cpx.status === 2 ? -Math.round(Number(cpx.amount_local)) : Math.round(Number(cpx.amount_local)), created_at: cpx.created_at, source: 'cpx' })),
      ...(notikResult.data ?? []).map((notik) => ({ id: notik.id, program_id: notik.event_name ? `Notik - ${notik.event_name}` : notik.offer_name || 'Notik Offer', payout_decimal: notik.amount, coins_awarded: Math.round(Number(notik.amount)), created_at: notik.created_at, source: 'notik' })),
      ...(gemiadResult.data ?? []).map((gemiad) => ({ id: gemiad.id, program_id: gemiad.event_name ? `GemiAd - ${gemiad.event_name}` : gemiad.offer_name || 'GemiAd Offer', payout_decimal: gemiad.reward, coins_awarded: gemiad.reward, created_at: gemiad.created_at, source: 'gemiad' })),
      ...(theoremreachResult.data ?? []).map((tr) => { let programName = 'TheoremReach'; if (tr.is_screenout) programName = 'TheoremReach Screen-out'; else if (tr.is_profiler) programName = 'TheoremReach Profiler'; else if (tr.is_offer) programName = 'TheoremReach Offer'; else programName = 'TheoremReach Survey'; if (tr.offer_name) programName = `${programName} - ${tr.offer_name}`; return { id: tr.id, program_id: programName, payout_decimal: Math.abs(tr.reward), coins_awarded: tr.reward, created_at: tr.created_at, source: 'theoremreach' }; }),
      ...(revtooResult.data ?? []).map((revtoo) => ({ id: revtoo.id, program_id: revtoo.offer_name || 'Revtoo Offer', payout_decimal: Math.abs(revtoo.reward), coins_awarded: revtoo.status === 2 ? -Math.abs(revtoo.reward) : revtoo.reward, created_at: revtoo.created_at, source: 'revtoo' })),
      ...(taskwallResult.data ?? []).map((tw) => ({ id: tw.id, program_id: tw.offer_name || 'Taskwall Offer', payout_decimal: tw.amount, coins_awarded: tw.amount, created_at: tw.created_at, source: 'taskwall' })),
      ...(klinkResult.data ?? []).map((klink) => ({ id: klink.id, program_id: klink.event_name ? `Klink - ${klink.event_name}` : klink.offer_name || 'Klink Offer', payout_decimal: Math.abs(Number(klink.coins_awarded)), coins_awarded: klink.event_type === 'chargeback' ? -Math.abs(Math.round(Number(klink.coins_awarded))) : Math.round(Number(klink.coins_awarded)), created_at: klink.created_at, source: 'klink' })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const totalCount = (completionsResult.count ?? 0) + (cpxResult.count ?? 0) + (notikResult.count ?? 0) + (gemiadResult.count ?? 0) + (theoremreachResult.count ?? 0) + (revtooResult.count ?? 0) + (taskwallResult.count ?? 0) + (klinkResult.count ?? 0);
    if (merged) setCompletions(merged.slice(0, PAGE_SIZE));
    if (totalCount !== null) setTotal(totalCount);
    setPage(newPage);
  }

  const totalEarned = completions.filter(c => c.coins_awarded > 0).reduce((sum, c) => sum + c.coins_awarded, 0);
  const totalDeducted = completions.filter(c => c.coins_awarded < 0).reduce((sum, c) => sum + Math.abs(c.coins_awarded), 0);

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: { xs: 12, lg: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <History size={24} color={colors.primary} />
          Earning History
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, fontSize: "0.8rem" }}>
          All your completed tasks and rewards
        </Typography>
      </Box>

      {/* Summary bar */}
      <Box
        sx={{
          mb: 3,
          borderRadius: "12px",
          bgcolor: "#232645",
          p: { xs: 1.5, sm: 2 },
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "space-around",
        }}
      >
        {[
          { icon: <TrendingUp size={14} color={colors.primary} />, label: "Earned", value: `+${totalEarned.toLocaleString()}`, color: colors.primary },
          { icon: <TrendingDown size={14} color={colors.status.error} />, label: "Deducted", value: `-${totalDeducted.toLocaleString()}`, color: colors.status.error },
          { icon: <CheckCircle size={14} color={colors.primary} />, label: "Total", value: total.toLocaleString(), color: "#fff" },
        ].map((s, i) => (
          <Box key={s.label} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
            {i > 0 && <Box sx={{ width: 1, height: 20, bgcolor: "rgba(255,255,255,0.06)", mx: 1 }} />}
            {s.icon}
            <Box>
              <Typography sx={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: colors.text.secondary }}>{s.label}</Typography>
              <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: s.color }}>{s.value}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {completions.length === 0 ? (
        <Box sx={{ borderRadius: "14px", bgcolor: "#1A1B2E", p: 5, textAlign: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "14px", bgcolor: "#232645", mx: "auto", mb: 2 }}>
            <Coins size={26} color="rgba(169,169,202,0.35)" />
          </Box>
          <Typography variant="body1" isBold sx={{ mb: 0.5, fontSize: "0.95rem" }}>No completions yet</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.8rem" }}>
            Complete offers to see your history here.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Mobile cards */}
          <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
            {completions.map((c) => {
              const Icon = offerIcon(c.program_id, c.source);
              const isChargeback = c.coins_awarded < 0;
              const displayAmount = isChargeback ? String(c.coins_awarded) : `+${c.coins_awarded}`;
              const amtColor = isChargeback ? colors.status.error : colors.primary;
              const sc = SOURCE_COLORS[c.source] || { bg: "rgba(169,169,202,0.1)", color: "#a9a9ca" };

              return (
                <Box
                  key={c.id}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    borderRadius: "12px", bgcolor: "#1A1B2E", px: 1.75, py: 1.5,
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: "#232645" },
                  }}
                >
                  <Box sx={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 38, height: 38, borderRadius: "10px",
                    background: isChargeback ? "rgba(239,68,68,0.1)" : `${sc.bg}`,
                    flexShrink: 0,
                  }}>
                    <Icon size={18} color={isChargeback ? colors.status.error : sc.color} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem" }} truncate>
                        {c.program_id}
                      </Typography>
                      <Box sx={{ borderRadius: "4px", bgcolor: sc.bg, px: 0.75, py: 0.1, fontSize: "0.6rem", fontWeight: 700, color: sc.color, textTransform: "uppercase", flexShrink: 0 }}>
                        {c.source || 'unknown'}
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: "0.68rem", color: colors.text.secondary }}>
                      {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: "flex", alignItems: "center", gap: 0.5,
                    borderRadius: "8px", bgcolor: isChargeback ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                    px: 1, py: 0.35, fontSize: "0.8rem", fontWeight: 700, color: amtColor,
                    flexShrink: 0,
                  }}>
                    {!isChargeback && <CheckCircle size={12} />}{displayAmount}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Desktop table */}
          <TableContainer sx={{
            display: { xs: "none", sm: "block" },
            borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)",
            bgcolor: "transparent", overflow: "hidden",
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#1A1B2E" }}>
                  {["Date", "Program", "Source", "Coins"].map((h) => (
                    <TableCell key={h} align={h === "Coins" ? "right" : "left"}
                      sx={{ color: colors.text.secondary, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", borderColor: "rgba(255,255,255,0.05)" }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {completions.map((c) => {
                  const Icon = offerIcon(c.program_id, c.source);
                  const isChargeback = c.coins_awarded < 0;
                  const displayAmount = isChargeback ? String(c.coins_awarded) : `+${c.coins_awarded}`;
                  const amtColor = isChargeback ? colors.status.error : colors.primary;
                  const sc = SOURCE_COLORS[c.source] || { bg: "rgba(169,169,202,0.1)", color: "#a9a9ca" };

                  return (
                    <TableRow key={c.id} sx={{ "&:hover": { bgcolor: "rgba(26,27,46,0.5)" } }}>
                      <TableCell sx={{ color: colors.text.secondary, borderColor: "rgba(255,255,255,0.05)", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                        {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                          <Box sx={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: 28, height: 28, borderRadius: "8px",
                            background: isChargeback ? "rgba(239,68,68,0.1)" : sc.bg,
                          }}>
                            <Icon size={14} color={isChargeback ? colors.status.error : sc.color} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                            {c.program_id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <Box sx={{ display: "inline-block", borderRadius: "4px", bgcolor: sc.bg, px: 1, py: 0.25, fontSize: "0.7rem", fontWeight: 600, color: sc.color, textTransform: "capitalize" }}>
                          {c.source || 'unknown'}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <Box component="span" sx={{
                          display: "inline-flex", alignItems: "center", gap: 0.5,
                          borderRadius: "8px", bgcolor: isChargeback ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                          px: 1, py: 0.35, fontSize: "0.78rem", fontWeight: 700, color: amtColor,
                        }}>
                          {!isChargeback && <CheckCircle size={12} />}{displayAmount}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Button size="small" onClick={() => fetchPage(page - 1)} disabled={page === 0}
                startIcon={<ChevronLeft size={14} />}
                sx={{ color: colors.text.secondary, bgcolor: "#1A1B2E", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
                Prev
              </Button>
              <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                Page {page + 1} of {totalPages} · {total} completions
              </Typography>
              <Button size="small" onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1}
                endIcon={<ChevronRight size={14} />}
                sx={{ color: colors.text.secondary, bgcolor: "#1A1B2E", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
                Next
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
