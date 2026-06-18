"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

function countryFlag(code: string | null | undefined): string {
  if (!code || code === "UNKNOWN" || code.length !== 2) return "🌍";
  const codePoints = code.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

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
      fetchFlaggedUsers(page);
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
      fetchFlaggedUsers(page);
    }
    setActionLoading(null);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-section-gap flex justify-between items-end">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-tertiary-container mb-2 text-body-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Users
          </button>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-amber-500">report_problem</span>
            Flagged Users
          </h2>
          <p className="text-on-surface-variant font-body-md text-body-md flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${total > 0 ? "bg-amber-500" : "bg-emerald-500"}`}></span>
            {total} users require attention.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface border border-outline-variant text-on-surface font-semibold rounded-lg hover:bg-surface-container-low transition-all text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">history</span>
            Review History
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-on-tertiary-container text-[40px]">refresh</span>
        </div>
      ) : users.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Decorative Background Element */}
            <div className="absolute inset-0 -z-10 opacity-30 blur-3xl pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-on-tertiary-container/10 rounded-full"></div>
            </div>

            {/* Main Empty State Card */}
            <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-24 h-24 bg-secondary-container/20 rounded-full flex items-center justify-center mb-6 relative">
                <span className="material-symbols-outlined text-[48px] text-secondary">verified_user</span>
                <span className="absolute inset-0 rounded-full border-4 border-secondary/20 animate-ping"></span>
              </div>
              <h3 className="font-display-lg text-display-lg text-on-surface mb-2">All clear!</h3>
              <p className="text-on-surface-variant max-w-md mx-auto font-body-md text-body-md">
                No flagged users at the moment. Your automated security filters and manual reports are currently empty.
              </p>
              <div className="mt-8 pt-8 border-t border-outline-variant/30 w-full flex justify-center gap-8">
                <div className="text-center">
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">System Health</p>
                  <p className="font-data-mono text-data-mono text-emerald-600 font-bold">OPTIMAL</p>
                </div>
                <div className="text-center">
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Last Scan</p>
                  <p className="font-data-mono text-data-mono text-on-surface font-bold">2 MIN AGO</p>
                </div>
                <div className="text-center">
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Active Rules</p>
                  <p className="font-data-mono text-data-mono text-on-surface font-bold">42</p>
                </div>
              </div>
            </div>

            {/* Side Info Panel */}
            <div className="md:col-span-4 flex flex-col gap-6">
              {/* Security Pulse Card */}
              <div className="bg-primary-container p-6 rounded-xl text-on-primary">
                <p className="font-label-caps text-label-caps text-on-primary-container uppercase mb-3">Real-time Watch</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-on-tertiary-container/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-tertiary-container">security</span>
                  </div>
                  <div>
                    <p className="font-title-sm text-title-sm leading-tight">Shield Active</p>
                    <p className="text-on-primary-container text-xs">Monitoring traffic</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-1 bg-on-primary-container/20 rounded-full overflow-hidden">
                    <div className="h-full bg-on-tertiary-container w-3/4 animate-[shimmer-bar_2s_infinite]"></div>
                  </div>
                  <p className="text-[10px] font-data-mono text-on-primary-container">SYS_LOG: NO_THREATS_DETECTED</p>
                </div>
              </div>

              {/* Mini Insight Card */}
              <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant flex-1">
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4">Latest Action</h4>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container-lowest border border-outline-variant flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">check_circle</span>
                  </div>
                  <div className="text-body-sm">
                    <p className="text-on-surface font-semibold">System Monitoring</p>
                    <p className="text-on-surface-variant text-xs mt-1">All security filters active and operational.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm hidden md:block">
            <table className="w-full border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {["Email", "Signup Country", "Last Seen", "Fraud Status", "Risk Score", "Actions"].map((h) => (
                    <th key={h} className="p-table-cell-padding text-left font-label-caps text-label-caps text-outline uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {users.map((u) => {
                  const countryMismatch = u.signup_country && u.last_seen_country && u.signup_country !== u.last_seen_country;

                  return (
                    <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="p-table-cell-padding">
                        <div className="flex flex-col">
                          <span className="font-body-sm font-semibold text-on-surface">{u.email}</span>
                          <span className="font-data-mono text-data-mono text-on-surface-variant text-[10px]">{u.id}</span>
                        </div>
                      </td>
                      <td className="p-table-cell-padding text-on-surface-variant whitespace-nowrap">
                        {countryFlag(u.signup_country)} {u.signup_country || "—"}
                      </td>
                      <td className={`p-table-cell-padding whitespace-nowrap ${countryMismatch ? "text-rose-600" : "text-on-surface-variant"}`}>
                        {countryFlag(u.last_seen_country)} {u.last_seen_country || "—"} {countryMismatch ? "⚠️" : ""}
                      </td>
                      <td className="p-table-cell-padding">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          u.fraud_status === "suspended" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {u.fraud_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-table-cell-padding">
                        <div className="flex flex-col gap-0.5">
                          {u.vpn_detected_count > 0 && (
                            <span className="flex items-center gap-1 text-amber-600 text-body-sm">
                              <span className="material-symbols-outlined text-[14px]">shield</span>
                              {u.vpn_detected_count} VPN hits
                            </span>
                          )}
                          {u.mismatch_count > 0 && (
                            <span className="flex items-center gap-1 text-rose-600 text-body-sm">
                              <span className="material-symbols-outlined text-[14px]">warning</span>
                              {u.mismatch_count} mismatches
                            </span>
                          )}
                          {u.vpn_detected_count === 0 && u.mismatch_count === 0 && (
                            <span className="text-on-surface-variant">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-table-cell-padding">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openLogsDialog(u)}
                            className="px-2 py-1 bg-surface-container-high rounded text-on-surface-variant hover:bg-surface-container transition-all text-[11px] font-semibold"
                          >
                            View Logs
                          </button>
                          <button
                            onClick={() => handleResolve(u.id)}
                            disabled={actionLoading === `resolve-${u.id}`}
                            className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-all text-[11px] font-semibold disabled:opacity-50"
                          >
                            {actionLoading === `resolve-${u.id}` ? "..." : "Resolve"}
                          </button>
                          <button
                            onClick={() => handleSuspend(u.id)}
                            disabled={actionLoading === `suspend-${u.id}` || u.fraud_status === "suspended"}
                            className="px-2 py-1 bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition-all text-[11px] font-semibold disabled:opacity-50"
                          >
                            {actionLoading === `suspend-${u.id}` ? "..." : "Suspend"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {users.map((u) => {
              const countryMismatch = u.signup_country && u.last_seen_country && u.signup_country !== u.last_seen_country;
              return (
                <div key={u.id} className="bg-white border border-outline-variant rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body-sm font-semibold truncate max-w-[200px]">{u.email}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      u.fraud_status === "suspended" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {u.fraud_status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex gap-4 text-body-sm text-on-surface-variant mb-3">
                    <span>Signup: {countryFlag(u.signup_country)} {u.signup_country || "—"}</span>
                    <span className={countryMismatch ? "text-rose-600" : ""}>
                      Last: {countryFlag(u.last_seen_country)} {u.last_seen_country || "—"} {countryMismatch ? "⚠️" : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openLogsDialog(u)} className="flex-1 px-2 py-1 bg-surface-container-high rounded text-on-surface-variant text-[11px] font-semibold">Logs</button>
                    <button onClick={() => handleResolve(u.id)} className="flex-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold">Resolve</button>
                    <button onClick={() => handleSuspend(u.id)} className="flex-1 px-2 py-1 bg-rose-100 text-rose-700 rounded text-[11px] font-semibold">Suspend</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => fetchFlaggedUsers(page - 1)} disabled={page === 0 || loading} className="px-3 py-2 text-body-sm text-on-surface-variant bg-white border border-outline-variant rounded-lg hover:bg-surface-container transition-all disabled:opacity-50 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">chevron_left</span> Prev
              </button>
              <span className="text-body-sm text-on-surface-variant">Page {page + 1} of {totalPages}</span>
              <button onClick={() => fetchFlaggedUsers(page + 1)} disabled={page >= totalPages - 1 || loading} className="px-3 py-2 text-body-sm text-on-surface-variant bg-white border border-outline-variant rounded-lg hover:bg-surface-container transition-all disabled:opacity-50 flex items-center gap-1">
                Next <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Logs Dialog */}
      {logsDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setLogsDialogOpen(false)} />
          <div className="relative bg-white border border-outline-variant rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant">
              <h3 className="font-title-sm text-title-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">shield_question</span>
                Fraud Logs for {selectedUser?.email}
              </h3>
              <button onClick={() => setLogsDialogOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <span className="material-symbols-outlined animate-spin text-on-tertiary-container">refresh</span>
                </div>
              ) : logs.length === 0 ? (
                <p className="text-center text-on-surface-variant py-8">No logs found for this user.</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase">{log.event_type.replace("_", " ")}</span>
                          <span className="px-2 py-0.5 border border-outline-variant rounded text-[10px] text-on-surface-variant">Action: {log.action_taken}</span>
                        </div>
                        <span className="text-body-sm text-on-surface-variant">{formatDate(log.created_at)}</span>
                      </div>
                      <div className="flex gap-6 text-body-sm">
                        <div>
                          <p className="text-[10px] text-on-surface-variant uppercase">IP Address</p>
                          <p className="text-on-surface">{log.ip_address || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant uppercase">Signup Country</p>
                          <p className="text-on-surface">{countryFlag(log.signup_country)} {log.signup_country || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant uppercase">Detected Country</p>
                          <p className={log.signup_country !== log.detected_country ? "text-rose-600" : "text-on-surface"}>
                            {countryFlag(log.detected_country)} {log.detected_country || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-outline-variant flex justify-end">
              <button onClick={() => setLogsDialogOpen(false)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all text-body-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
