"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Wallet, CheckCircle, XCircle, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

interface Withdrawal {
  id: string;
  user_id: string;
  coins: number;
  amount_usd: number;
  network: string;
  crypto_address: string;
  status: string;
  tx_hash: string | null;
  requested_at: string;
  user_email: string;
}

interface AdminWithdrawalsClientProps {
  initialWithdrawals: Withdrawal[];
  initialTotal: number;
}

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  pending: { color: "#facc15", bg: "rgba(250,204,21,0.15)" },
  processing: { color: "#60a5fa", bg: "rgba(96,165,250,0.15)" },
  paid: { color: "#01D676", bg: "rgba(1,214,118,0.15)" },
  failed: { color: "#f87171", bg: "rgba(239,68,68,0.15)" },
};

const TABS = ["all", "pending", "paid", "failed"] as const;

export default function AdminWithdrawalsClient({ initialWithdrawals, initialTotal }: AdminWithdrawalsClientProps) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [approveDialog, setApproveDialog] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function copyUid(uid: string) {
    navigator.clipboard.writeText(uid);
  }

  async function fetchWithdrawals(p: number, status: string) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (status !== "all") params.set("status", status);

    const res = await fetch(`/api/admin/withdrawals/search?${params}`);
    if (res.ok) {
      const data = await res.json();
      setWithdrawals(data.withdrawals);
      setTotal(data.total);
    }
    setPage(p);
    setLoading(false);
  }

  function handleFilterChange(newFilter: string) {
    setFilter(newFilter);
    fetchWithdrawals(0, newFilter);
  }

  async function handleApprove() {
    if (!approveDialog || !txHash.trim()) return;
    setActionLoading(approveDialog);
    const res = await fetch("/api/admin/withdrawals/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId: approveDialog, txHash }),
    });
    if (res.ok) {
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === approveDialog ? { ...w, status: "paid", tx_hash: txHash } : w))
      );
    }
    setApproveDialog(null);
    setTxHash("");
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    const res = await fetch("/api/admin/withdrawals/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId: id }),
    });
    if (res.ok) {
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: "failed" } : w))
      );
    }
    setActionLoading(null);
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Wallet size={24} color="#01D676" />
          Withdrawal Management
        </Typography>
        <Typography variant="body2" color="textSecondary">{total} total withdrawals</Typography>
      </Box>

      {/* Filter tabs */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {TABS.map((tab) => (
          <Button
            key={tab}
            onClick={() => handleFilterChange(tab)}
            sx={{
              textTransform: "capitalize",
              fontWeight: 600,
              fontSize: "0.8rem",
              borderRadius: 2,
              px: 2,
              py: 0.75,
              color: filter === tab ? "#fff" : colors.text.secondary,
              bgcolor: filter === tab ? colors.background.gradient : colors.primary,
              background: filter === tab ? colors.background.gradient : undefined,
              border: `1px solid ${filter === tab ? "transparent" : colors.divider}`,
              "&:hover": { bgcolor: colors.background.ternary },
            }}
          >
            {tab}
          </Button>
        ))}
      </Box>

      {/* Mobile cards */}
      <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1 }}>
        {withdrawals.map((w) => {
          const sc = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
          return (
            <Paper key={w.id} sx={{ borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem" }} truncate>{w.user_email}</Typography>
                <Box sx={{ borderRadius: 50, px: 1.25, py: 0.25, fontSize: "10px", fontWeight: 600, bgcolor: sc.bg, color: sc.color, textTransform: "capitalize" }}>
                  {w.status}
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                <Typography sx={{ fontSize: "0.6rem", color: colors.text.secondary, fontFamily: "monospace" }}>
                  {w.user_id.slice(0, 8)}...{w.user_id.slice(-4)}
                </Typography>
                <IconButton size="small" onClick={() => copyUid(w.user_id)} sx={{ p: 0.25, bgcolor: "transparent" }}>
                  <Copy size={10} color={colors.text.secondary} />
                </IconButton>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>
                  {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{w.coins.toLocaleString()} coins (${w.amount_usd.toFixed(2)})</Typography>
              <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary, mt: 0.5 }}>{w.network} - {w.crypto_address.slice(0, 12)}...</Typography>
              {w.status === "pending" && (
                <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                  <Button size="small" onClick={() => { setApproveDialog(w.id); setTxHash(""); }} disabled={actionLoading === w.id}
                    startIcon={<CheckCircle size={14} />}
                    sx={{ textTransform: "none", fontSize: "0.7rem", fontWeight: 600, color: "#01D676", bgcolor: "rgba(1,214,118,0.1)", borderRadius: 2, flex: 1 }}>
                    Approve
                  </Button>
                  <Button size="small" onClick={() => handleReject(w.id)} disabled={actionLoading === w.id}
                    startIcon={<XCircle size={14} />}
                    sx={{ textTransform: "none", fontSize: "0.7rem", fontWeight: 600, color: "#f87171", bgcolor: "rgba(239,68,68,0.1)", borderRadius: 2, flex: 1 }}>
                    Reject
                  </Button>
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Desktop table */}
      <TableContainer component={Paper} sx={{ display: { xs: "none", md: "block" }, borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: "transparent" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["User", "Date", "Coins", "USD", "Network", "Address", "Status", "TX Hash", "Actions"].map((h) => (
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
                  <TableCell sx={{ borderColor: colors.divider, maxWidth: 160 }}>
                    <Typography truncate sx={{ fontSize: "0.8rem", color: "#fff", fontWeight: 500 }}>{w.user_email}</Typography>
                    <Tooltip title="Click to copy full UID" arrow>
                      <Box
                        onClick={() => copyUid(w.user_id)}
                        sx={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: "0.65rem", fontFamily: "monospace", color: colors.text.secondary, "&:hover": { color: "#01D676" } }}
                      >
                        {w.user_id.slice(0, 8)}...
                        <Copy size={9} />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ borderColor: colors.divider, color: colors.text.secondary, fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell sx={{ borderColor: colors.divider, color: "#fff", fontWeight: 600 }}>{w.coins.toLocaleString()}</TableCell>
                  <TableCell sx={{ borderColor: colors.divider, color: "#01D676", fontWeight: 600 }}>${w.amount_usd.toFixed(2)}</TableCell>
                  <TableCell sx={{ borderColor: colors.divider, color: colors.text.secondary, fontSize: "0.8rem" }}>{w.network}</TableCell>
                  <TableCell sx={{ borderColor: colors.divider, color: colors.text.secondary, fontSize: "0.75rem", maxWidth: 120 }}>
                    <Typography truncate sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>{w.crypto_address}</Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: colors.divider }}>
                    <Box sx={{ display: "inline-block", borderRadius: 50, px: 1.25, py: 0.25, fontSize: "0.7rem", fontWeight: 600, bgcolor: sc.bg, color: sc.color, textTransform: "capitalize" }}>
                      {w.status}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: colors.divider, color: colors.text.secondary, fontSize: "0.75rem", maxWidth: 100 }}>
                    <Typography truncate sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>{w.tx_hash || "—"}</Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: colors.divider }}>
                    {w.status === "pending" && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Button size="small" onClick={() => { setApproveDialog(w.id); setTxHash(""); }} disabled={actionLoading === w.id}
                          sx={{ minWidth: 0, textTransform: "none", fontSize: "0.7rem", fontWeight: 600, color: "#01D676", bgcolor: "rgba(1,214,118,0.1)", borderRadius: 2, px: 1.5 }}>
                          {actionLoading === w.id ? <CircularProgress size={14} color="inherit" /> : "Approve"}
                        </Button>
                        <Button size="small" onClick={() => handleReject(w.id)} disabled={actionLoading === w.id}
                          sx={{ minWidth: 0, textTransform: "none", fontSize: "0.7rem", fontWeight: 600, color: "#f87171", bgcolor: "rgba(239,68,68,0.1)", borderRadius: 2, px: 1.5 }}>
                          Reject
                        </Button>
                      </Box>
                    )}
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
          <Button size="small" onClick={() => fetchWithdrawals(page - 1, filter)} disabled={page === 0 || loading} startIcon={<ChevronLeft size={14} />}
            sx={{ color: colors.text.secondary, bgcolor: colors.primary, border: `1px solid ${colors.divider}`, fontSize: "0.75rem", textTransform: "none" }}>
            Prev
          </Button>
          <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>Page {page + 1} of {totalPages}</Typography>
          <Button size="small" onClick={() => fetchWithdrawals(page + 1, filter)} disabled={page >= totalPages - 1 || loading} endIcon={<ChevronRight size={14} />}
            sx={{ color: colors.text.secondary, bgcolor: colors.primary, border: `1px solid ${colors.divider}`, fontSize: "0.75rem", textTransform: "none" }}>
            Next
          </Button>
        </Box>
      )}

      {/* Approve Dialog */}
      <Dialog
        open={!!approveDialog}
        onClose={() => setApproveDialog(null)}
        PaperProps={{
          sx: {
            bgcolor: colors.background.default,
            border: `1px solid ${colors.divider}`,
            borderRadius: 4,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${colors.divider}`, py: 1.5 }}>
          <Typography variant="subtitle1" isBold>Approve Withdrawal</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Enter the blockchain transaction hash to mark this withdrawal as paid.
          </Typography>
          <TextField
            fullWidth
            placeholder="Transaction hash..."
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApproveDialog(null)} sx={{ textTransform: "none", color: colors.text.secondary }}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={txHash.trim().length < 5 || actionLoading !== null}
            sx={{ textTransform: "none", fontWeight: 600, background: colors.background.gradient, color: "#fff", borderRadius: 2, px: 3 }}
          >
            {actionLoading ? <CircularProgress size={16} color="inherit" /> : "Confirm Approval"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
