"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Users, Search, ShieldOff, ShieldCheck, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Activity, Copy } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

interface User {
  id: string;
  email: string;
  coins_balance: number;
  total_earned: number;
  role: string;
  is_banned: boolean;
  created_at: string;
}

interface Completion {
  id: string;
  offer_name: string;
  coins: number;
  status: string;
  completed_at: string;
}

interface Withdrawal {
  id: string;
  coins: number;
  amount_usd: number;

  status: string;
  requested_at: string;
}

interface UserActivity {
  completions: Completion[];
  withdrawals: Withdrawal[];
}

interface AdminUsersClientProps {
  initialUsers: User[];
  initialTotal: number;
}

const PAGE_SIZE = 20;

export default function AdminUsersClient({ initialUsers, initialTotal }: AdminUsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [banLoading, setBanLoading] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<Record<string, UserActivity>>({});
  const [activityLoading, setActivityLoading] = useState<string | null>(null);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchUsers = useCallback(async (q: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ q, page: String(p) });
    const res = await fetch(`/api/admin/users/search?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPage(p);
    }
    setLoading(false);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchUsers(search, 0);
  }

  async function handleBan(userId: string, ban: boolean) {
    setBanLoading(userId);
    try {
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, banned: ban }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_banned: ban } : u))
        );
        setToast({
          open: true,
          message: `User successfully ${ban ? "banned" : "unbanned"}.`,
          severity: "success",
        });
      } else {
        const data = await res.json();
        setToast({
          open: true,
          message: data.error || "Failed to update ban status.",
          severity: "error",
        });
      }
    } catch {
      setToast({
        open: true,
        message: "Network error. Failed to update ban status.",
        severity: "error",
      });
    }
    setBanLoading(null);
  }

  async function toggleActivity(userId: string) {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);

    if (!activityData[userId]) {
      setActivityLoading(userId);
      const res = await fetch(`/api/admin/users/activity?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setActivityData((prev) => ({ ...prev, [userId]: data }));
      }
      setActivityLoading(null);
    }
  }

  function copyUid(uid: string) {
    navigator.clipboard.writeText(uid);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const statusColor = (s: string) => {
    if (s === "paid" || s === "approved" || s === "credited") return "#01D676";
    if (s === "pending") return "#facc15";
    if (s === "failed" || s === "rejected") return "#f87171";
    return colors.text.secondary;
  };

  const renderActivityPanel = (userId: string) => {
    const data = activityData[userId];
    const isLoading = activityLoading === userId;

    return (
      <Box sx={{ p: 2, bgcolor: colors.background.ternary, borderRadius: 2 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={20} sx={{ color: "#01D676" }} />
          </Box>
        ) : !data ? (
          <Typography variant="body2" color="textSecondary">Failed to load activity</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Completions */}
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#01D676", mb: 1 }}>
                Completions ({data.completions.length})
              </Typography>
              {data.completions.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.8rem" }}>No completions</Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {data.completions.map((c) => (
                    <Box key={c.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: colors.primary, borderRadius: 2, px: 1.5, py: 0.75, fontSize: "0.8rem" }}>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 500, flex: 1 }} truncate>{c.offer_name}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#01D676" }}>+{c.coins}</Typography>
                        <Box sx={{ fontSize: "0.65rem", fontWeight: 600, color: statusColor(c.status), textTransform: "capitalize" }}>{c.status}</Box>
                        <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>{formatDate(c.completed_at)}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Withdrawals */}
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#facc15", mb: 1 }}>
                Withdrawals ({data.withdrawals.length})
              </Typography>
              {data.withdrawals.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.8rem" }}>No withdrawals</Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {data.withdrawals.map((w) => (
                    <Box key={w.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: colors.primary, borderRadius: 2, px: 1.5, py: 0.75, fontSize: "0.8rem" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>${w.amount_usd.toFixed(2)}</Typography>
                        <Box sx={{ fontSize: "0.65rem", color: colors.text.secondary }}>LTC</Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                        <Typography sx={{ fontSize: "0.8rem", color: colors.text.secondary }}>{w.coins.toLocaleString()} coins</Typography>
                        <Box sx={{ fontSize: "0.65rem", fontWeight: 600, color: statusColor(w.status), textTransform: "capitalize" }}>{w.status}</Box>
                        <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>{formatDate(w.requested_at)}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Users size={24} color="#01D676" />
            User Management
          </Typography>
          <Typography variant="body2" color="textSecondary">{total} total users</Typography>
        </Box>
        <Box component="form" onSubmit={handleSearch} sx={{ display: "flex", gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color={colors.text.secondary} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 240 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: colors.background.gradient,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : "Search"}
          </Button>
        </Box>
      </Box>

      {/* Mobile cards */}
      <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1 }}>
        {users.map((u) => (
          <Paper key={u.id} sx={{ borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.primary, p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} truncate>{u.email}</Typography>
              <Box sx={{ borderRadius: 50, px: 1.25, py: 0.25, fontSize: "10px", fontWeight: 600, bgcolor: u.is_banned ? "rgba(239,68,68,0.15)" : "rgba(1,214,118,0.15)", color: u.is_banned ? "#f87171" : "#01D676" }}>
                {u.is_banned ? "Banned" : "Active"}
              </Box>
            </Box>

            {/* UID row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
              <Typography sx={{ fontSize: "0.65rem", color: colors.text.secondary, fontFamily: "monospace" }}>
                {u.id.slice(0, 8)}...{u.id.slice(-4)}
              </Typography>
              <IconButton size="small" onClick={() => copyUid(u.id)} sx={{ p: 0.25, bgcolor: "transparent" }}>
                <Copy size={10} color={colors.text.secondary} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", gap: 2, fontSize: "0.75rem", color: colors.text.secondary, mb: 1 }}>
              <span>Balance: {u.coins_balance.toLocaleString()}</span>
              <span>Earned: {u.total_earned.toLocaleString()}</span>
            </Box>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <Button
                size="small"
                onClick={() => handleBan(u.id, !u.is_banned)}
                disabled={banLoading === u.id || u.role === "admin"}
                startIcon={u.is_banned ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: u.is_banned ? "#01D676" : "#f87171",
                  bgcolor: u.is_banned ? "rgba(1,214,118,0.1)" : "rgba(239,68,68,0.1)",
                  borderRadius: 2,
                  "&:hover": { bgcolor: u.is_banned ? "rgba(1,214,118,0.2)" : "rgba(239,68,68,0.2)" },
                }}
              >
                {banLoading === u.id ? <CircularProgress size={14} color="inherit" /> : u.is_banned ? "Unban" : "Ban"}
              </Button>
              <Button
                size="small"
                onClick={() => toggleActivity(u.id)}
                startIcon={<Activity size={14} />}
                endIcon={expandedUser === u.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: colors.text.secondary,
                  bgcolor: "rgba(169,169,202,0.1)",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "rgba(169,169,202,0.2)" },
                }}
              >
                Activity
              </Button>
            </Box>
            <Collapse in={expandedUser === u.id} unmountOnExit>
              {renderActivityPanel(u.id)}
            </Collapse>
          </Paper>
        ))}
      </Box>

      {/* Desktop table */}
      <TableContainer component={Paper} sx={{ display: { xs: "none", md: "block" }, borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: "transparent" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["UID", "Email", "Balance", "Total Earned", "Role", "Status", "Joined", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: colors.text.secondary, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", borderColor: colors.divider, bgcolor: colors.primary }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <>
                <TableRow key={u.id} sx={{ "&:hover": { bgcolor: colors.background.ternary } }}>
                  <TableCell sx={{ borderColor: colors.divider, fontFamily: "monospace", fontSize: "0.7rem", color: colors.text.secondary }}>
                    <Tooltip title="Click to copy full UID" arrow>
                      <Box
                        onClick={() => copyUid(u.id)}
                        sx={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 0.5, "&:hover": { color: "#01D676" } }}
                      >
                        {u.id.slice(0, 8)}...
                        <Copy size={10} />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ borderColor: colors.divider, color: "#fff", fontSize: "0.875rem" }}>{u.email}</TableCell>
                  <TableCell sx={{ borderColor: colors.divider, color: "#01D676", fontWeight: 600 }}>{u.coins_balance.toLocaleString()}</TableCell>
                  <TableCell sx={{ borderColor: colors.divider, color: colors.text.secondary }}>{u.total_earned.toLocaleString()}</TableCell>
                  <TableCell sx={{ borderColor: colors.divider }}>
                    <Box sx={{ display: "inline-block", borderRadius: 50, px: 1.25, py: 0.25, fontSize: "0.7rem", fontWeight: 600, bgcolor: u.role === "admin" ? "rgba(96,165,250,0.15)" : "rgba(169,169,202,0.1)", color: u.role === "admin" ? "#60a5fa" : colors.text.secondary, textTransform: "capitalize" }}>
                      {u.role}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: colors.divider }}>
                    <Box sx={{ display: "inline-block", borderRadius: 50, px: 1.25, py: 0.25, fontSize: "0.7rem", fontWeight: 600, bgcolor: u.is_banned ? "rgba(239,68,68,0.15)" : "rgba(1,214,118,0.15)", color: u.is_banned ? "#f87171" : "#01D676" }}>
                      {u.is_banned ? "Banned" : "Active"}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: colors.divider, color: colors.text.secondary, fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    {formatDate(u.created_at)}
                  </TableCell>
                  <TableCell sx={{ borderColor: colors.divider }}>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Button
                        size="small"
                        onClick={() => handleBan(u.id, !u.is_banned)}
                        disabled={banLoading === u.id || u.role === "admin"}
                        startIcon={u.is_banned ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: u.is_banned ? "#01D676" : "#f87171",
                          bgcolor: u.is_banned ? "rgba(1,214,118,0.1)" : "rgba(239,68,68,0.1)",
                          borderRadius: 2,
                          "&:hover": { bgcolor: u.is_banned ? "rgba(1,214,118,0.2)" : "rgba(239,68,68,0.2)" },
                        }}
                      >
                        {banLoading === u.id ? <CircularProgress size={14} color="inherit" /> : u.is_banned ? "Unban" : "Ban"}
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => toggleActivity(u.id)}
                        sx={{
                          bgcolor: "rgba(169,169,202,0.1)",
                          borderRadius: 2,
                          "&:hover": { bgcolor: "rgba(169,169,202,0.2)" },
                        }}
                      >
                        {expandedUser === u.id ? <ChevronUp size={16} color={colors.text.secondary} /> : <Activity size={16} color={colors.text.secondary} />}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow key={`${u.id}-activity`}>
                  <TableCell colSpan={8} sx={{ p: 0, borderColor: expandedUser === u.id ? colors.divider : "transparent" }}>
                    <Collapse in={expandedUser === u.id} unmountOnExit>
                      {renderActivityPanel(u.id)}
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Button size="small" onClick={() => fetchUsers(search, page - 1)} disabled={page === 0 || loading} startIcon={<ChevronLeft size={14} />}
            sx={{ color: colors.text.secondary, bgcolor: colors.primary, border: `1px solid ${colors.divider}`, fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
            Prev
          </Button>
          <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>Page {page + 1} of {totalPages}</Typography>
          <Button size="small" onClick={() => fetchUsers(search, page + 1)} disabled={page >= totalPages - 1 || loading} endIcon={<ChevronRight size={14} />}
            sx={{ color: colors.text.secondary, bgcolor: colors.primary, border: `1px solid ${colors.divider}`, fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
            Next
          </Button>
        </Box>
      )}

      {/* Toast Feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{
            bgcolor: toast.severity === "success" ? "rgba(1,214,118,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${toast.severity === "success" ? "rgba(1,214,118,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.severity === "success" ? "#01D676" : "#f87171",
            "& .MuiAlert-icon": { color: toast.severity === "success" ? "#01D676" : "#f87171" },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
