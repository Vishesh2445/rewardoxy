"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  coins_balance: number;
  total_earned: number;
  role: string;
  is_banned: boolean;
  created_at: string;
  signup_country?: string | null;
  last_seen_country?: string | null;
  fraud_status?: string;
  vpn_detected_count?: number;
  mismatch_count?: number;
  signup_source?: string;
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
  source?: string;
}

const PAGE_SIZE = 20;

function countryFlag(code: string | null | undefined): string {
  if (!code || code === "UNKNOWN" || code.length !== 2) return "🌍";
  const codePoints = code.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getInitials(email: string): string {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const FRAUD_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  clean: { bg: "bg-emerald-100", text: "text-emerald-700" },
  cashout_blocked: { bg: "bg-amber-100", text: "text-amber-700" },
  flagged: { bg: "bg-rose-100", text: "text-rose-700" },
  suspended: { bg: "bg-rose-100", text: "text-rose-700" },
};

export default function AdminUsersClient({ initialUsers, initialTotal, source = "" }: AdminUsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [banLoading, setBanLoading] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<Record<string, UserActivity>>({});
  const [activityLoading, setActivityLoading] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchUsers = useCallback(async (q: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ q, page: String(p) });
    if (source) params.set("source", source);
    const res = await fetch(`/api/admin/users/search?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPage(p);
    }
    setLoading(false);
  }, [source]);

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
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_banned: ban } : u)));
      }
    } catch {}
    setBanLoading(null);
  }

  async function toggleActivity(userId: string) {
    if (expandedUser === userId) { setExpandedUser(null); return; }
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

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const statusColor = (s: string) => {
    if (s === "paid" || s === "approved" || s === "credited") return "text-emerald-600";
    if (s === "pending") return "text-amber-600";
    if (s === "failed" || s === "rejected") return "text-rose-600";
    return "text-on-surface-variant";
  };

  return (
    <>
      {/* Page Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">User Management</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage and monitor {total} total registered users across the reward ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/users/flagged"
            className="px-4 py-2 bg-white border border-outline-variant text-on-surface font-semibold rounded-lg hover:bg-surface-container transition-all flex items-center gap-2 text-body-sm"
          >
            <span className="material-symbols-outlined text-[20px]">report_problem</span>
            Flagged Users
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-on-tertiary-container/20 focus:border-on-tertiary-container outline-none transition-all"
              placeholder="Search by email or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-on-tertiary-container text-on-primary font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all text-body-sm"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* Main Data Table Container */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                {["UID", "Email", "Balance", "Earned", "Country", "Last Seen", "Fraud", "VPN", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="p-table-cell-padding text-left font-label-caps text-label-caps text-outline uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map((u) => {
                const fs = FRAUD_STATUS_COLORS[u.fraud_status || "clean"] || FRAUD_STATUS_COLORS.clean;
                const countryMismatch = u.signup_country && u.last_seen_country && u.signup_country !== u.last_seen_country;

                return (
                  <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="p-table-cell-padding font-data-mono text-data-mono text-on-surface-variant">
                      {u.id.slice(0, 8)}...
                    </td>
                    <td className="p-table-cell-padding">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold text-on-tertiary-fixed-variant">
                          {getInitials(u.email)}
                        </div>
                        <span className="font-body-sm font-semibold truncate max-w-[180px]">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-table-cell-padding text-right font-data-mono text-on-surface font-semibold">{u.coins_balance.toLocaleString()}</td>
                    <td className="p-table-cell-padding text-right font-data-mono text-on-surface">{u.total_earned.toLocaleString()}</td>
                    <td className="p-table-cell-padding text-center">
                      <span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold text-on-surface">
                        {countryFlag(u.signup_country)} {u.signup_country || "—"}
                      </span>
                    </td>
                    <td className="p-table-cell-padding text-on-surface-variant">
                      {countryFlag(u.last_seen_country)} {u.last_seen_country || "—"}
                      {countryMismatch && <span className="ml-1">⚠️</span>}
                    </td>
                    <td className="p-table-cell-padding text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${fs.bg} ${fs.text}`}>
                        {(u.fraud_status || "clean").replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-table-cell-padding text-center font-data-mono text-on-surface-variant">{u.vpn_detected_count || 0}</td>
                    <td className="p-table-cell-padding">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${u.is_banned ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_banned ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                        {u.is_banned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="p-table-cell-padding text-on-surface-variant font-body-sm whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="p-table-cell-padding text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleBan(u.id, !u.is_banned)}
                          disabled={banLoading === u.id || u.role === "admin"}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                            u.is_banned
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                          } disabled:opacity-50`}
                        >
                          {u.is_banned ? "Unban" : "Ban"}
                        </button>
                        <button
                          onClick={() => toggleActivity(u.id)}
                          className="px-2 py-1 bg-surface-container-high rounded text-on-surface-variant hover:bg-surface-container transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {expandedUser === u.id ? "expand_less" : "expand_more"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Activity Panel */}
        {expandedUser && (
          <div className="border-t border-outline-variant bg-surface-container-low p-4">
            {activityLoading === expandedUser ? (
              <div className="flex justify-center py-6">
                <span className="material-symbols-outlined animate-spin text-on-tertiary-container">refresh</span>
              </div>
            ) : activityData[expandedUser] ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-label-caps text-label-caps text-on-tertiary-container uppercase mb-3">Completions ({activityData[expandedUser].completions.length})</h4>
                  {activityData[expandedUser].completions.length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant">No completions</p>
                  ) : (
                    <div className="space-y-2">
                      {activityData[expandedUser].completions.map((c) => (
                        <div key={c.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-body-sm">
                          <span className="font-medium truncate flex-1">{c.offer_name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-emerald-600">+{c.coins}</span>
                            <span className={`text-[11px] font-semibold capitalize ${statusColor(c.status)}`}>{c.status}</span>
                            <span className="text-on-surface-variant text-xs">{formatDate(c.completed_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-label-caps text-label-caps text-amber-600 uppercase mb-3">Withdrawals ({activityData[expandedUser].withdrawals.length})</h4>
                  {activityData[expandedUser].withdrawals.length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant">No withdrawals</p>
                  ) : (
                    <div className="space-y-2">
                      {activityData[expandedUser].withdrawals.map((w) => (
                        <div key={w.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-body-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${w.amount_usd.toFixed(2)}</span>
                            <span className="text-on-surface-variant text-xs">LTC</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-on-surface-variant">{w.coins.toLocaleString()} coins</span>
                            <span className={`text-[11px] font-semibold capitalize ${statusColor(w.status)}`}>{w.status}</span>
                            <span className="text-on-surface-variant text-xs">{formatDate(w.requested_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-body-sm text-on-surface-variant text-center py-4">Failed to load activity</p>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-gutter py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
            <p className="text-body-sm text-on-surface-variant">Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, total)} of {total} users</p>
            <div className="flex items-center gap-4">
              <span className="text-body-sm font-semibold text-on-surface">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchUsers(search, page - 1)}
                  disabled={page === 0 || loading}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant bg-white opacity-50 cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={() => fetchUsers(search, page + 1)}
                  disabled={page >= totalPages - 1 || loading}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant bg-white hover:bg-surface-container-high transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <footer className="mt-8 flex justify-between items-center text-body-sm text-on-primary-container/60">
        <p>© 2024 Rewardoxy Ecosystem Management. All rights reserved.</p>
        <div className="flex gap-4">
          <a className="hover:underline" href="#">Privacy Policy</a>
          <a className="hover:underline" href="#">Audit Logs</a>
        </div>
      </footer>
    </>
  );
}
