"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { Users, AlertTriangle, ChevronLeft, ChevronRight, Copy, Shield, ShieldQuestion, ShieldX, Undo2, ArrowLeft } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import Link from "next/link";
import { useRouter } from "next/navigation";

function countryFlag(code: string | null | undefined): string {
  if (!code || code === "UNKNOWN" || code.length !== 2) return "🌍";
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface FlaggedUser {
  id: string;
  email: string;
  display_name: string | null;
  signup_country: string | null;
  last_seen_country: string | null;
  fraud_status: string;
  vpn_detected_count: number;
  mismatch_count: number;
  created_at: string;
}

interface FraudLog {
  id: string;
  event_type: string;
  signup_country: string | null;
  detected_country: string | null;
  ip_address: string | null;
  vpn_data: any;
  action_taken: string;
  created_at: string;
}

const PAGE_SIZE = 20;

export default function AdminFlaggedUsersClient() {
  const router = useRouter();
  const [users, setUsers] = useState<FlaggedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FlaggedUser | null>(null);
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchFlaggedUsers = useCallback(async (p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    const res = await fetch(`/api/admin/users/flagged?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPage(p);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFlaggedUsers(0);
  }, [fetchFlaggedUsers]);

  async function openLogsDialog(user: FlaggedUser) {
    setSelectedUser(user);
    setLogsDialogOpen(true);
    setLogsLoading(true);
    const res = await fetch(`/api/admin/users/fraud-logs?userId=${user.id}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
    }
    setLogsLoading(false);
  }

  async function handleResolve(userId: string) {
    if (!confirm("Are you sure you want to resolve and reset fraud flags for this user? This will unlock cashouts.")) return;
    
    setActionLoading(`resolve-${userId}`);
    const res = await fetch("/api/admin/users/fraud-resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    
    if (res.ok) {
      setToast({ open: true, message: "User fraud data resolved and reset.", severity: "success" });
      fetchFlaggedUsers(page);
    } else {
      setToast({ open: true, message: "Failed to resolve user.", severity: "error" });
    }
    setActionLoading(null);
  }

  async function handleSuspend(userId: string) {
    if (!confirm("Are you sure you want to permanently suspend this user?")) return;
    
    setActionLoading(`suspend-${userId}`);
    const res = await fetch("/api/admin/users/fraud-suspend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    
    if (res.ok) {
      setToast({ open: true, message: "User suspended.", severity: "success" });
      fetchFlaggedUsers(page);
    } else {
      setToast({ open: true, message: "Failed to suspend user.", severity: "error" });
    }
    setActionLoading(null);
  }

  function copyUid(uid: string) { navigator.clipboard.writeText(uid); }
  function formatDate(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Button 
            startIcon={<ArrowLeft size={16} />} 
            onClick={() => router.back()}
            sx={{ color: colors.text.secondary, mb: 1, textTransform: "none" }}
          >
            Back to Users
          </Button>
          <Typography variant="h5" isBold sx={{ display: "flex", alignItems: "center", gap: 1, color: "#f59e0b" }}>
            <AlertTriangle size={24} color="#f59e0b" />
            Flagged Users
          </Typography>
          <Typography variant="body2" color="textSecondary">{total} users require attention</Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#f59e0b" }} />
        </Box>
      ) : users.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: colors.primary }}>
          <Shield size={48} color={colors.text.secondary} style={{ opacity: 0.5, marginBottom: 16 }} />
          <Typography variant="h6">All clear!</Typography>
          <Typography variant="body2" color="textSecondary">No flagged users at the moment.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: `1px solid ${colors.divider}`, bgcolor: "transparent" }}>
          <Table>
            <TableHead>
              <TableRow>
                {["Email", "Signup Country", "Last Seen", "Fraud Status", "Risk Score", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ color: colors.text.secondary, fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", borderColor: colors.divider, bgcolor: colors.primary, whiteSpace: "nowrap" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const countryMismatch = u.signup_country && u.last_seen_country && u.signup_country !== u.last_seen_country;
                
                return (
                  <TableRow key={u.id} sx={{ "&:hover": { bgcolor: colors.background.ternary } }}>
                    <TableCell sx={{ borderColor: colors.divider, color: "#fff", fontSize: "0.85rem" }}>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <span>{u.email}</span>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: colors.text.secondary, mt: 0.5 }}>
                          <Typography sx={{ fontSize: "0.65rem", fontFamily: "monospace" }}>{u.id}</Typography>
                          <IconButton size="small" onClick={() => copyUid(u.id)} sx={{ p: 0.25 }}><Copy size={10} /></IconButton>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.divider, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {countryFlag(u.signup_country)} {u.signup_country || "—"}
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.divider, fontSize: "0.85rem", whiteSpace: "nowrap", color: countryMismatch ? "#f87171" : undefined }}>
                      {countryFlag(u.last_seen_country)} {u.last_seen_country || "—"} {countryMismatch ? "⚠️" : ""}
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.divider }}>
                      <Box sx={{ display: "inline-block", borderRadius: 50, px: 1.25, py: 0.25, fontSize: "0.7rem", fontWeight: 600, 
                        bgcolor: u.fraud_status === "suspended" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)", 
                        color: u.fraud_status === "suspended" ? "#f87171" : "#f59e0b",
                        border: `1px solid ${u.fraud_status === "suspended" ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)"}`, 
                        textTransform: "capitalize" }}>
                        {u.fraud_status.replace("_", " ")}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.divider, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {(u.vpn_detected_count || 0) > 0 && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#f59e0b", fontSize: "0.75rem" }}>
                            <Shield size={14} /> {u.vpn_detected_count} VPN hits
                          </Box>
                        )}
                        {(u.mismatch_count || 0) > 0 && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#f87171", fontSize: "0.75rem" }}>
                            <AlertTriangle size={14} /> {u.mismatch_count} mismatches
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.divider }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button size="small" onClick={() => openLogsDialog(u)}
                          sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, color: colors.text.secondary, bgcolor: "rgba(169,169,202,0.1)", borderRadius: 2, "&:hover": { bgcolor: "rgba(169,169,202,0.2)" } }}>
                          View Logs
                        </Button>
                        <Button size="small" onClick={() => handleResolve(u.id)} disabled={actionLoading === `resolve-${u.id}`}
                          startIcon={<Undo2 size={14} />}
                          sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, color: "#01D676", bgcolor: "rgba(1,214,118,0.1)", borderRadius: 2, "&:hover": { bgcolor: "rgba(1,214,118,0.2)" } }}>
                          {actionLoading === `resolve-${u.id}` ? <CircularProgress size={14} color="inherit" /> : "Resolve & Reset"}
                        </Button>
                        <Button size="small" onClick={() => handleSuspend(u.id)} disabled={actionLoading === `suspend-${u.id}` || u.fraud_status === "suspended"}
                          startIcon={<ShieldX size={14} />}
                          sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, color: "#f87171", bgcolor: "rgba(239,68,68,0.1)", borderRadius: 2, "&:hover": { bgcolor: "rgba(239,68,68,0.2)" }, "&.Mui-disabled": { opacity: 0.3 } }}>
                          {actionLoading === `suspend-${u.id}` ? <CircularProgress size={14} color="inherit" /> : "Suspend"}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Button size="small" onClick={() => fetchFlaggedUsers(page - 1)} disabled={page === 0 || loading} startIcon={<ChevronLeft size={14} />}
            sx={{ color: colors.text.secondary, bgcolor: colors.primary, border: `1px solid ${colors.divider}`, fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
            Prev
          </Button>
          <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>Page {page + 1} of {totalPages}</Typography>
          <Button size="small" onClick={() => fetchFlaggedUsers(page + 1)} disabled={page >= totalPages - 1 || loading} endIcon={<ChevronRight size={14} />}
            sx={{ color: colors.text.secondary, bgcolor: colors.primary, border: `1px solid ${colors.divider}`, fontSize: "0.75rem", textTransform: "none", "&:disabled": { opacity: 0.3 } }}>
            Next
          </Button>
        </Box>
      )}

      {/* Logs Dialog */}
      <Dialog 
        open={logsDialogOpen} 
        onClose={() => setLogsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { bgcolor: colors.primary, border: `1px solid ${colors.divider}`, borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ color: "#fff", display: "flex", alignItems: "center", gap: 1 }}>
          <ShieldQuestion size={20} color="#f59e0b" /> Fraud Logs for {selectedUser?.email}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: colors.divider }}>
          {logsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress sx={{ color: "#f59e0b" }} /></Box>
          ) : logs.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4, color: colors.text.secondary }}>No logs found for this user.</Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {logs.map(log => (
                <Box key={log.id} sx={{ p: 2, borderRadius: 2, bgcolor: colors.background.ternary, border: `1px solid ${colors.divider}` }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip size="small" 
                        label={log.event_type.replace("_", " ")} 
                        sx={{ 
                          fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
                          bgcolor: log.event_type.includes("admin") ? "rgba(1,214,118,0.15)" : "rgba(245,158,11,0.15)",
                          color: log.event_type.includes("admin") ? "#01D676" : "#f59e0b",
                        }} 
                      />
                      <Chip size="small" 
                        label={`Action: ${log.action_taken}`}
                        sx={{ 
                          fontSize: "0.65rem",
                          bgcolor: "transparent", border: `1px solid ${colors.divider}`, color: colors.text.secondary
                        }} 
                      />
                    </Box>
                    <Typography sx={{ fontSize: "0.75rem", color: colors.text.secondary }}>{formatDate(log.created_at)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 3, pt: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>IP ADDRESS</Typography>
                      <Typography sx={{ fontSize: "0.85rem" }}>{log.ip_address || "—"}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>SIGNUP COUNTRY</Typography>
                      <Typography sx={{ fontSize: "0.85rem" }}>{countryFlag(log.signup_country)} {log.signup_country || "—"}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary }}>DETECTED COUNTRY</Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: log.signup_country !== log.detected_country ? "#f87171" : undefined }}>
                        {countryFlag(log.detected_country)} {log.detected_country || "—"}
                      </Typography>
                    </Box>
                  </Box>
                  {log.vpn_data && typeof log.vpn_data === "object" && (
                    <Box sx={{ mt: 2, p: 1, borderRadius: 1, bgcolor: "rgba(0,0,0,0.2)" }}>
                      <Typography sx={{ fontSize: "0.7rem", color: colors.text.secondary, mb: 0.5 }}>VPN DATA</Typography>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {Object.entries(log.vpn_data).map(([k, v]) => (
                          <Typography key={k} sx={{ fontSize: "0.75rem", color: v ? "#f59e0b" : colors.text.secondary }}>
                            {k}: {v ? "true" : "false"}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLogsDialogOpen(false)} sx={{ color: colors.text.secondary, textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleCloseToast} severity={toast.severity}
          sx={{ bgcolor: toast.severity === "success" ? "rgba(1,214,118,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${toast.severity === "success" ? "rgba(1,214,118,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.severity === "success" ? "#01D676" : "#f87171", "& .MuiAlert-icon": { color: toast.severity === "success" ? "#01D676" : "#f87171" } }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
