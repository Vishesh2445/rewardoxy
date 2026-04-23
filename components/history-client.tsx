"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  History,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Gamepad2,
  FileText,
  Smartphone,
  Coins,
  XCircle,
  Gift,
  Star,
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
  game: Gamepad2,
  survey: FileText,
  app: Smartphone,
  cpx_survey: FileText,
  cpx_screenout: XCircle,
  cpx_bonus: Star,
};

function offerIcon(name: string, source?: string) {
  // CPX-specific icons
  if (source === 'cpx') {
    if (name.includes('Survey')) return OFFER_ICONS.cpx_survey;
    if (name.includes('Screen-out')) return OFFER_ICONS.cpx_screenout;
    if (name.includes('Bonus')) return OFFER_ICONS.cpx_bonus;
    return OFFER_ICONS.survey;
  }
  
  // Notik-specific icons
  if (source === 'notik') {
    return Gift; // Use Gift icon for Notik offers
  }
  
  // Regular offer icons
  const lower = name.toLowerCase();
  if (lower.includes("game") || lower.includes("play")) return OFFER_ICONS.game;
  if (lower.includes("survey") || lower.includes("fill")) return OFFER_ICONS.survey;
  return OFFER_ICONS.app;
}

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
    
    // Fetch completions, CPX transactions, and Notik transactions
    const [completionsResult, cpxResult, notikResult] = await Promise.all([
      supabase
        .from("completions")
        .select("id, program_id, payout_decimal, coins_awarded, created_at, source", { count: "exact" })
        .eq("player_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to),
      
      supabase
        .from("cpx_transactions")
        .select("id, transid, amount_local, status, type, created_at", { count: "exact" })
        .eq("userid", userId)
        .order("created_at", { ascending: false })
        .range(from, to),

      supabase
        .from("notik_transactions")
        .select("id, txn_id, amount, offer_name, event_name, created_at", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to),
    ]);

    // Merge and sort by date
    const merged = [
      ...(completionsResult.data ?? []),
      ...(cpxResult.data ?? []).map((cpx) => ({
        id: cpx.id,
        program_id: cpx.type === 'complete' ? 'CPX Survey' : cpx.type === 'out' ? 'CPX Screen-out' : cpx.type === 'bonus' ? 'CPX Rating Bonus' : 'CPX Research',
        payout_decimal: cpx.amount_local,
        coins_awarded: cpx.status === 2 ? -Math.round(Number(cpx.amount_local)) : Math.round(Number(cpx.amount_local)),
        created_at: cpx.created_at,
        source: 'cpx',
      })),
      ...(notikResult.data ?? []).map((notik) => ({
        id: notik.id,
        program_id: notik.event_name ? `Notik - ${notik.event_name}` : notik.offer_name || 'Notik Offer',
        payout_decimal: notik.amount,
        coins_awarded: Math.round(Number(notik.amount)),
        created_at: notik.created_at,
        source: 'notik',
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalCount = (completionsResult.count ?? 0) + (cpxResult.count ?? 0) + (notikResult.count ?? 0);

    if (merged) setCompletions(merged.slice(0, PAGE_SIZE));
    if (totalCount !== null) setTotal(totalCount);
    setPage(newPage);
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: { xs: 12, lg: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <History size={26} color={colors.primary} />
              Earning History
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              All your completed tasks and rewards
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.background.secondary, px: 2, py: 1 }}>
            <CheckCircle size={15} color={colors.primary} />
            <Box>
              <Typography sx={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: colors.text.secondary }}>Completions</Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{total}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {completions.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${colors.divider}`,
            bgcolor: colors.background.secondary,
            p: 6,
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 4, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}`, mx: "auto", mb: 2 }}>
            <Coins size={30} color="rgba(169,169,202,0.35)" />
          </Box>
          <Typography variant="body1" isBold sx={{ mb: 1 }}>No completions yet</Typography>
          <Typography variant="body2" color="textSecondary">
            Complete offers to see your history here.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Mobile cards */}
          <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1.5 }}>
            {completions.map((c) => {
              const Icon = offerIcon(c.program_id, c.source);
              const isChargeback = c.coins_awarded < 0;
              const displayAmount = isChargeback ? String(c.coins_awarded) : `+${c.coins_awarded}`;
              const amtColor = isChargeback ? colors.status.error : colors.primary;
              const amtBg = isChargeback ? "rgba(255, 68, 68, 0.1)" : "rgba(0, 208, 132, 0.1)";
              const amtBorder = isChargeback ? "1px solid rgba(255, 68, 68, 0.2)" : "1px solid rgba(0, 208, 132, 0.2)";

              return (
                <Box
                  key={c.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderRadius: 3,
                    border: `1px solid ${colors.divider}`,
                    bgcolor: colors.background.secondary,
                    px: 2,
                    py: 1.75,
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "rgba(0, 208, 132, 0.25)" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 42,
                      height: 42,
                      borderRadius: 3,
                      bgcolor: isChargeback ? "rgba(239,68,68,0.1)" : colors.background.ternary,
                      border: isChargeback ? "1px solid rgba(239,68,68,0.2)" : `1px solid ${colors.divider}`,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={isChargeback ? colors.status.error : colors.primary} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} truncate>
                        {c.program_id}
                      </Typography>
                      <Box sx={{ borderRadius: 50, bgcolor: c.source === 'cpx' ? 'rgba(59,130,246,0.1)' : c.source === 'notik' ? 'rgba(168,85,247,0.1)' : 'rgba(249,115,22,0.1)', border: c.source === 'cpx' ? '1px solid rgba(59,130,246,0.25)' : c.source === 'notik' ? '1px solid rgba(168,85,247,0.25)' : '1px solid rgba(249,115,22,0.25)', px: 1, py: 0.1, fontSize: '0.6rem', fontWeight: 700, color: c.source === 'cpx' ? '#3b82f6' : c.source === 'notik' ? '#a855f7' : '#f97316', textTransform: 'uppercase', flexShrink: 0 }}>
                        {c.source || 'unknown'}
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: "0.72rem", color: colors.text.secondary }}>
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        borderRadius: 50,
                        bgcolor: amtBg,
                        border: amtBorder,
                        px: 1.25,
                        py: 0.35,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: amtColor,
                      }}
                    >
                      {!isChargeback && <CheckCircle size={13} />}{displayAmount}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Desktop table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              display: { xs: "none", sm: "block" },
              borderRadius: 4,
              border: `1px solid ${colors.divider}`,
              bgcolor: "transparent",
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(29,30,48,0.9)" }}>
                  {["Date", "Program", "Source", "Coins"].map((h) => (
                    <TableCell
                      key={h}
                      align={h === "Coins" ? "right" : "left"}
                      sx={{
                        color: colors.text.secondary,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        borderColor: colors.divider,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {completions.map((c, i) => {
                  const Icon = offerIcon(c.program_id, c.source);
                  const isChargeback = c.coins_awarded < 0;
                  const displayAmount = isChargeback ? String(c.coins_awarded) : `+${c.coins_awarded}`;
                  const amtColor = isChargeback ? colors.status.error : colors.primary;
                  const amtBg = isChargeback ? "rgba(255, 68, 68, 0.1)" : "rgba(0, 208, 132, 0.1)";
                  const amtBorder = isChargeback ? "1px solid rgba(255, 68, 68, 0.2)" : "1px solid rgba(0, 208, 132, 0.2)";

                  return (
                    <TableRow
                      key={c.id}
                      sx={{
                        bgcolor: i % 2 === 0 ? "rgba(29,30,48,0.4)" : "rgba(29,30,48,0.25)",
                        "&:hover": { bgcolor: "rgba(29,30,48,0.65)" },
                      }}
                    >
                      <TableCell sx={{ color: colors.text.secondary, borderColor: colors.divider, whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.divider }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 2, bgcolor: isChargeback ? "rgba(255, 68, 68, 0.1)" : colors.background.ternary, border: isChargeback ? "1px solid rgba(255, 68, 68, 0.2)" : `1px solid ${colors.divider}` }}>
                            <Icon size={15} color={isChargeback ? colors.status.error : colors.primary} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {c.program_id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.divider }}>
                        <Box sx={{ display: "inline-block", borderRadius: 50, bgcolor: c.source === 'cpx' ? 'rgba(59,130,246,0.1)' : c.source === 'notik' ? 'rgba(168,85,247,0.1)' : 'rgba(249,115,22,0.1)', border: c.source === 'cpx' ? '1px solid rgba(59,130,246,0.25)' : c.source === 'notik' ? '1px solid rgba(168,85,247,0.25)' : '1px solid rgba(249,115,22,0.25)', px: 1.5, py: 0.25, fontSize: '0.75rem', fontWeight: 600, color: c.source === 'cpx' ? '#3b82f6' : c.source === 'notik' ? '#a855f7' : '#f97316', textTransform: 'capitalize' }}>
                          {c.source || 'unknown'}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ borderColor: colors.divider }}>
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            borderRadius: 50,
                            bgcolor: amtBg,
                            border: amtBorder,
                            px: 1.25,
                            py: 0.35,
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: amtColor,
                          }}
                        >
                          {!isChargeback && <CheckCircle size={13} />}{displayAmount}
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
            <Box sx={{ mt: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Button
                size="small"
                onClick={() => fetchPage(page - 1)}
                disabled={page === 0}
                startIcon={<ChevronLeft size={14} />}
                sx={{
                  color: colors.text.secondary,
                  bgcolor: colors.background.secondary,
                  border: `1px solid ${colors.divider}`,
                  borderRadius: 2,
                  fontSize: "0.75rem",
                  textTransform: "none",
                  "&:disabled": { opacity: 0.3 },
                }}
              >
                Prev
              </Button>
              <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                Page {page + 1} of {totalPages} · {total} completions
              </Typography>
              <Button
                size="small"
                onClick={() => fetchPage(page + 1)}
                disabled={page >= totalPages - 1}
                endIcon={<ChevronRight size={14} />}
                sx={{
                  color: colors.text.secondary,
                  bgcolor: colors.background.secondary,
                  border: `1px solid ${colors.divider}`,
                  borderRadius: 2,
                  fontSize: "0.75rem",
                  textTransform: "none",
                  "&:disabled": { opacity: 0.3 },
                }}
              >
                Next
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
