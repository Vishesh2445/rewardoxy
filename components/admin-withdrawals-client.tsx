"use client";

import { useState } from "react";

interface Withdrawal {
  id: string;
  user_id: string;
  coins: number;
  amount_usd: number;
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
const TABS = ["all", "pending", "paid", "failed"] as const;

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  pending: { color: "text-[#9a3412]", bg: "bg-[#fff7ed]" },
  processing: { color: "text-blue-700", bg: "bg-blue-100" },
  paid: { color: "text-[#047857]", bg: "bg-[#ecfdf5]" },
  failed: { color: "text-rose-700", bg: "bg-rose-100" },
};

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
      setWithdrawals((prev) => prev.map((w) => (w.id === approveDialog ? { ...w, status: "paid", tx_hash: txHash } : w)));
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
      setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status: "failed" } : w)));
    }
    setActionLoading(null);
  }

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface">Withdrawal Management</h2>
          <p className="text-on-surface-variant mt-1">Review and process payout requests. <span className="font-semibold text-on-tertiary-container">{total} total withdrawals</span> pending your attention.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface border border-outline-variant text-primary font-semibold rounded-lg hover:bg-surface-container-low transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-outline-variant p-card-padding rounded-xl">
          <p className="text-label-caps font-label-caps text-outline uppercase">Total Volume</p>
          <p className="text-display-lg font-display-lg mt-2 text-primary">${withdrawals.reduce((sum, w) => sum + w.amount_usd, 0).toFixed(2)}</p>
        </div>
        <div className="bg-white border border-outline-variant p-card-padding rounded-xl">
          <p className="text-label-caps font-label-caps text-outline uppercase">Pending Requests</p>
          <p className="text-display-lg font-display-lg mt-2 text-primary">{withdrawals.filter(w => w.status === "pending").length}</p>
          <p className="text-body-sm font-body-sm text-error flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-sm">schedule</span> Requires action
          </p>
        </div>
        <div className="bg-white border border-outline-variant p-card-padding rounded-xl">
          <p className="text-label-caps font-label-caps text-outline uppercase">Total Requests</p>
          <p className="text-display-lg font-display-lg mt-2 text-primary">{total}</p>
        </div>
        <div className="bg-white border border-outline-variant p-card-padding rounded-xl">
          <p className="text-label-caps font-label-caps text-outline uppercase">Success Rate</p>
          <p className="text-display-lg font-display-lg mt-2 text-primary">
            {total > 0 ? ((withdrawals.filter(w => w.status === "paid").length / total) * 100).toFixed(1) : "100"}%
          </p>
          <p className="text-body-sm font-body-sm text-secondary flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-sm">check_circle</span> Completed
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleFilterChange(tab)}
            className={`px-4 py-2 rounded-lg font-semibold text-body-sm capitalize transition-all ${
              filter === tab
                ? "bg-on-tertiary-container text-on-primary"
                : "bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Withdrawal Table */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                {["User", "Date", "Coins", "USD", "Address", "Status", "TX Hash", "Actions"].map((h) => (
                  <th key={h} className="p-table-cell-padding text-left font-label-caps text-label-caps text-outline uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <span className="material-symbols-outlined animate-spin text-on-tertiary-container">refresh</span>
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface-variant">No withdrawals found</td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const sc = STATUS_COLORS[w.status] ?? STATUS_COLORS.pending;
                  return (
                    <tr key={w.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-table-cell-padding">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">{w.user_email}</span>
                          <span className="text-xs text-outline font-data-mono">ID: {w.user_id.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="p-table-cell-padding text-on-surface-variant">
                        {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="p-table-cell-padding text-right font-data-mono font-bold">{w.coins.toLocaleString()}</td>
                      <td className="p-table-cell-padding text-right font-data-mono text-on-surface-variant">${w.amount_usd.toFixed(2)}</td>
                      <td className="p-table-cell-padding">
                        <span className="text-on-surface-variant font-data-mono text-xs truncate max-w-[120px] block">
                          {w.crypto_address.slice(0, 10)}...{w.crypto_address.slice(-6)}
                        </span>
                      </td>
                      <td className="p-table-cell-padding">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${sc.bg} ${sc.color}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-table-cell-padding text-outline text-xs">
                        {w.tx_hash ? (
                          <span className="font-data-mono text-on-tertiary-container">{w.tx_hash.slice(0, 10)}...</span>
                        ) : "—"}
                      </td>
                      <td className="p-table-cell-padding">
                        {w.status === "pending" ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => { setApproveDialog(w.id); setTxHash(""); }}
                              disabled={actionLoading === w.id}
                              className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all"
                              title="Approve & Pay"
                            >
                              <span className="material-symbols-outlined text-lg">check_circle</span>
                            </button>
                            <button
                              onClick={() => handleReject(w.id)}
                              disabled={actionLoading === w.id}
                              className="p-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-all"
                              title="Reject"
                            >
                              <span className="material-symbols-outlined text-lg">cancel</span>
                            </button>
                          </div>
                        ) : (
                          <button className="p-1.5 text-outline hover:text-primary transition-all">
                            <span className="material-symbols-outlined text-lg">more_vert</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-gutter py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
            <p className="text-body-sm text-on-surface-variant">Showing <span className="font-semibold">{page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, total)}</span> of <span className="font-semibold">{total}</span> withdrawals</p>
            <div className="flex gap-2">
              <button onClick={() => fetchWithdrawals(page - 1, filter)} disabled={page === 0 || loading} className="p-2 border border-outline-variant rounded-lg text-outline disabled:opacity-50">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => fetchWithdrawals(page + 1, filter)} disabled={page >= totalPages - 1 || loading} className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      {approveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setApproveDialog(null)} />
          <div className="relative bg-white border border-outline-variant rounded-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant">
              <h3 className="font-title-sm text-title-sm text-on-surface">Approve Withdrawal</h3>
            </div>
            <div className="p-4">
              <p className="text-body-sm text-on-surface-variant mb-3">Enter the blockchain transaction hash to mark this withdrawal as paid.</p>
              <input
                className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-on-tertiary-container/20 focus:border-on-tertiary-container outline-none transition-all"
                placeholder="Transaction hash..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
              />
            </div>
            <div className="p-4 border-t border-outline-variant flex justify-end gap-2">
              <button onClick={() => setApproveDialog(null)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all text-body-sm">
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={txHash.trim().length < 5 || actionLoading !== null}
                className="px-4 py-2 bg-on-tertiary-container text-on-primary font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

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
