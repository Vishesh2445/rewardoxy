"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Trash2, RefreshCw } from "lucide-react";
import AdminShell from "@/components/admin-shell";
import colors from "@/theme/colors";

interface PasswordReset {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  users: {
    email: string;
    display_name: string | null;
  };
}

export default function AdminPasswordResetsClient() {
  const [passwordResets, setPasswordResets] = useState<PasswordReset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("all");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchPasswordResets();
  }, [status, offset]);

  async function fetchPasswordResets() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (status !== "all") {
        params.append("status", status);
      }

      const res = await fetch(`/api/admin/password-resets?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch password resets");
        return;
      }

      setPasswordResets(data.password_resets || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError("Failed to fetch password resets");
    }

    setLoading(false);
  }

  async function handleDelete(tokenId: string) {
    if (!confirm("Are you sure you want to delete this password reset token?")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/password-resets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_id: tokenId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete token");
        return;
      }

      fetchPasswordResets();
    } catch (err) {
      alert("Failed to delete token");
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminShell>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Password Resets
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage password reset requests
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => {
                  setStatus(e.target.value);
                  setOffset(0);
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="used">Used</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={fetchPasswordResets} sx={{ color: colors.text.secondary }}>
              <RefreshCw size={20} />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${colors.divider}` }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.background.ternary }}>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Token</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Expires</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : passwordResets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No password reset tokens found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                passwordResets.map((reset) => {
                  const isUsed = reset.used_at !== null;
                  const isExpired = new Date(reset.expires_at) < new Date();
                  const isValid = !isUsed && !isExpired;

                  return (
                    <TableRow key={reset.id} sx={{ "&:hover": { bgcolor: colors.background.ternary } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {reset.users?.display_name || "Unknown"}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {reset.users?.email || "Unknown email"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                          {reset.token.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(reset.created_at).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: isExpired ? "#ef4444" : "inherit" }}>
                          {new Date(reset.expires_at).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isUsed ? "Used" : isExpired ? "Expired" : "Valid"}
                          size="small"
                          sx={{
                            bgcolor: isUsed
                              ? "rgba(239,68,68,0.1)"
                              : isExpired
                              ? "rgba(245,158,11,0.1)"
                              : "rgba(1,214,118,0.1)",
                            color: isUsed
                              ? "#ef4444"
                              : isExpired
                              ? "#f59e0b"
                              : "#01D676",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(reset.id)}
                          sx={{ color: "#ef4444" }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {total > limit && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" color="textSecondary">
              Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} entries
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label="Prev"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                sx={{ cursor: "pointer" }}
              />
              <Chip
                label="Next"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                sx={{ cursor: "pointer" }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </AdminShell>
  );
}
