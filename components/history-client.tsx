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
  TrendingUp,
} from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

const PAGE_SIZE = 20;

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
};

function offerIcon(name: string) {
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

  const totalCoins = completions.reduce((acc, c) => acc + c.coins_awarded, 0);

  async function fetchPage(newPage: number) {
    const supabase = createClient();
    const from = newPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count } = await supabase
      .from("completions")
      .select("id, program_id, payout_decimal, coins_awarded, created_at, source", { count: "exact" })
      .eq("player_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data) setCompletions(data);
    if (count !== null) setTotal(count);
    setPage(newPage);
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <History size={26} color="#01D676" />
            Earning History
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            All your completed tasks and rewards
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.background.secondary, px: 2, py: 1 }}>
            <CheckCircle size={15} color="#01D676" />
            <Box>
              <Typography sx={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: colors.text.secondary }}>Completions</Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{total}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 3, border: `1px solid rgba(1,214,118,0.2)`, bgcolor: "rgba(1,214,118,0.06)", px: 2, py: 1 }}>
            <TrendingUp size={15} color="#01D676" />
            <Box>
              <Typography sx={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: "rgba(1,214,118,0.6)" }}>Page Coins</Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#01D676" }}>{totalCoins.toLocaleString()}</Typography>
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
              const Icon = offerIcon(c.program_id);
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
                    "&:hover": { borderColor: "rgba(1,214,118,0.25)" },
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
                      bgcolor: colors.background.ternary,
                      border: `1px solid ${colors.divider}`,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color="#01D676" />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} truncate>
                        {c.program_id}
                      </Typography>
                      <Box sx={{ borderRadius: 50, bgcolor: c.source === 'cpx' ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)', border: c.source === 'cpx' ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(249,115,22,0.25)', px: 1, py: 0.1, fontSize: '0.6rem', fontWeight: 700, color: c.source === 'cpx' ? '#3b82f6' : '#f97316', textTransform: 'uppercase', flexShrink: 0 }}>
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
                        bgcolor: "rgba(1,214,118,0.1)",
                        border: "1px solid rgba(1,214,118,0.2)",
                        px: 1.25,
                        py: 0.35,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#01D676",
                      }}
                    >
                      <CheckCircle size={13} />+{c.coins_awarded}
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
                  const Icon = offerIcon(c.program_id);
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
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 2, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}` }}>
                            <Icon size={15} color="#01D676" />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {c.program_id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.divider }}>
                        <Box sx={{ display: "inline-block", borderRadius: 50, bgcolor: c.source === 'cpx' ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)', border: c.source === 'cpx' ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(249,115,22,0.25)', px: 1.5, py: 0.25, fontSize: '0.75rem', fontWeight: 600, color: c.source === 'cpx' ? '#3b82f6' : '#f97316', textTransform: 'capitalize' }}>
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
                            bgcolor: "rgba(1,214,118,0.1)",
                            border: "1px solid rgba(1,214,118,0.2)",
                            px: 1.25,
                            py: 0.35,
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "#01D676",
                          }}
                        >
                          +{c.coins_awarded}
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
