"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { History, ChevronLeft, ChevronRight, CheckCircle, Gamepad2, FileText, Smartphone, Search } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

const PAGE_SIZE = 20;

interface Completion {
  id: string;
  program_id: string;
  payout_decimal: number | null;
  coins_awarded: number;
  created_at: string;
}

interface HistoryClientProps {
  userId: string;
  initialCompletions: Completion[];
  initialTotal: number;
}

const OFFER_ICONS: Record<string, typeof Gamepad2> = { game: Gamepad2, survey: FileText, app: Smartphone };

function offerIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("game") || lower.includes("play")) return OFFER_ICONS.game;
  if (lower.includes("survey") || lower.includes("fill")) return OFFER_ICONS.survey;
  return OFFER_ICONS.app;
}

export default function HistoryClient({ userId, initialCompletions, initialTotal }: HistoryClientProps) {
  const [completions, setCompletions] = useState<Completion[]>(initialCompletions);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function fetchPage(newPage: number) {
    const supabase = createClient();
    const from = newPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count } = await supabase
      .from("completions")
      .select("id, program_id, payout_decimal, coins_awarded, created_at", { count: "exact" })
      .eq("player_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data) setCompletions(data);
    if (count !== null) setTotal(count);
    setPage(newPage);
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <History size={24} color="#01D676" />
            Earning History
          </Typography>
          <Typography variant="body2" color="textSecondary">{total} total completions</Typography>
        </Box>
      </Box>

      {completions.length === 0 ? (
        <Paper sx={{ borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 6, textAlign: "center" }}>
          <Search size={40} color="rgba(169,169,202,0.4)" style={{ margin: "0 auto" }} />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5 }}>No completions yet. Complete offers to see your history here.</Typography>
        </Paper>
      ) : (
        <>
          {/* Mobile cards */}
          <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
            {completions.map((c) => {
              const Icon = offerIcon(c.program_id);
              return (
                <Box key={c.id} sx={{ display: "flex", alignItems: "center", gap: 2, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, px: 2, py: 1.5, transition: "all 0.2s" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 3, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}`, flexShrink: 0 }}>
                    <Icon size={20} color="#01D676" />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }} truncate>Program {c.program_id}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                      {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, borderRadius: 50, bgcolor: colors.background.secondary, border: "1px solid rgba(1,214,118,0.2)", px: 1.25, py: 0.25, fontSize: "0.875rem", fontWeight: 600, color: "#01D676" }}>
                      <CheckCircle size={14} />+{c.coins_awarded}
                    </Box>
                    {c.payout_decimal != null && (
                      <Typography sx={{ mt: 0.25, fontSize: "10px", color: colors.text.secondary }}>${c.payout_decimal.toFixed(2)}</Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Desktop table */}
          <TableContainer component={Paper} sx={{ display: { xs: "none", sm: "block" }, borderRadius: 4, border: `1px solid ${colors.divider}`, bgcolor: "transparent" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(29,30,48,0.8)" }}>
                  <TableCell sx={{ color: colors.text.secondary, fontSize: "0.75rem", textTransform: "uppercase", borderColor: colors.divider }}>Date</TableCell>
                  <TableCell sx={{ color: colors.text.secondary, fontSize: "0.75rem", textTransform: "uppercase", borderColor: colors.divider }}>Program</TableCell>
                  <TableCell align="right" sx={{ color: colors.text.secondary, fontSize: "0.75rem", textTransform: "uppercase", borderColor: colors.divider }}>Payout</TableCell>
                  <TableCell align="right" sx={{ color: colors.text.secondary, fontSize: "0.75rem", textTransform: "uppercase", borderColor: colors.divider }}>Coins</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completions.map((c) => {
                  const Icon = offerIcon(c.program_id);
                  return (
                    <TableRow key={c.id} sx={{ bgcolor: "rgba(29,30,48,0.4)", "&:hover": { bgcolor: "rgba(29,30,48,0.6)" } }}>
                      <TableCell sx={{ color: colors.text.secondary, borderColor: colors.divider, whiteSpace: "nowrap" }}>
                        {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.divider }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Icon size={16} color="#01D676" />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>Program {c.program_id}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ color: colors.text.secondary, borderColor: colors.divider }}>
                        {c.payout_decimal != null ? `$${c.payout_decimal.toFixed(2)}` : "--"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: "#01D676", borderColor: colors.divider }}>+{c.coins_awarded}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Button size="small" onClick={() => fetchPage(page - 1)} disabled={page === 0} startIcon={<ChevronLeft size={14} />}
                sx={{ color: colors.text.secondary, bgcolor: colors.background.primary, border: `1px solid ${colors.divider}`, fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
                Prev
              </Button>
              <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>Page {page + 1} of {totalPages}</Typography>
              <Button size="small" onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1} endIcon={<ChevronRight size={14} />}
                sx={{ color: colors.text.secondary, bgcolor: colors.background.primary, border: `1px solid ${colors.divider}`, fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
                Next
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
