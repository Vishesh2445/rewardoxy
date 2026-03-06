"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Coins,
  DollarSign,
  Wallet,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

const NETWORKS = ["TRC-20", "BEP-20", "SOL"] as const;
const MIN_COINS = 2000;
const COINS_PER_USD = 1000;
const PAGE_SIZE = 10;

const EXPLORER_URLS: Record<string, string> = {
  "TRC-20": "https://tronscan.org/#/transaction/",
  "BEP-20": "https://bscscan.com/tx/",
  SOL: "https://solscan.io/tx/",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  processing: "bg-sky-500/10 text-sky-400",
  paid: "bg-emerald-500/10 text-emerald-400",
  failed: "bg-red-500/10 text-red-400",
};

interface Withdrawal {
  id: string;
  created_at: string;
  coins: number;
  amount_usd: number;
  network: string;
  status: string;
  tx_hash: string | null;
}

interface CashoutClientProps {
  userId: string;
  initialCoins: number;
  initialWithdrawals: Withdrawal[];
  initialTotal: number;
}

export default function CashoutClient({
  userId,
  initialCoins,
  initialWithdrawals,
  initialTotal,
}: CashoutClientProps) {
  const router = useRouter();

  const [coins, setCoins] = useState(initialCoins);
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState<string>(NETWORKS[0]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const usd = coins / COINS_PER_USD;

  async function fetchPage(newPage: number) {
    const supabase = createClient();
    const from = newPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count } = await supabase
      .from("withdrawals")
      .select("id, created_at, coins, amount_usd, network, status, tx_hash", {
        count: "exact",
      })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data) setWithdrawals(data);
    if (count !== null) setTotal(count);
    setPage(newPage);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (coins < MIN_COINS) {
      setError(`Minimum withdrawal is ${MIN_COINS} coins ($${(MIN_COINS / COINS_PER_USD).toFixed(2)})`);
      return;
    }

    if (!address.trim() || address.trim().length < 10) {
      setError("Enter a valid crypto address");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ network }),
    });

    const body = await res.json();

    if (!res.ok) {
      setError(body.error || "Withdrawal failed");
      setLoading(false);
      return;
    }

    setSuccess(`Withdrawal of $${body.amount_usd.toFixed(2)} submitted`);
    setCoins(0);
    setAddress("");
    setLoading(false);

    // Refresh history
    await fetchPage(0);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Cash Out</h1>
            <p className="text-sm text-zinc-500">Withdraw your earnings as crypto</p>
          </div>
        </div>

        {/* Balance cards */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <Coins className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Balance
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {coins.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  USD Value
                </p>
                <p className="text-2xl font-bold">${usd.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal form */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Wallet className="h-5 w-5 text-emerald-400" />
            Withdraw
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Network selector */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Network
              </label>
              <div className="flex gap-2">
                {NETWORKS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNetwork(n)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      network === n
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Address input */}
            <div>
              <label
                htmlFor="address"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                {network === "SOL" ? "SOL" : "USDT"} Address
              </label>
              <input
                id="address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Your ${network} address`}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Amount info */}
            <div className="rounded-lg bg-zinc-800/50 px-4 py-3 text-sm text-zinc-400">
              You will receive{" "}
              <span className="font-semibold text-zinc-100">
                ${usd.toFixed(2)}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-emerald-400">
                {coins.toLocaleString()} coins
              </span>
              {coins < MIN_COINS && (
                <span className="mt-1 block text-xs text-red-400">
                  Minimum {MIN_COINS} coins (${(MIN_COINS / COINS_PER_USD).toFixed(2)}) required
                </span>
              )}
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || coins < MIN_COINS}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Withdraw
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Withdrawal history */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Withdrawal History</h2>

          {withdrawals.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
              <p className="text-sm text-zinc-500">No withdrawals yet.</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="space-y-3 sm:hidden">
                {withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        {new Date(w.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                          STATUS_STYLES[w.status] ?? STATUS_STYLES.pending
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {w.coins.toLocaleString()} coins
                        </p>
                        <p className="text-xs text-zinc-500">
                          ${w.amount_usd.toFixed(2)} via {w.network}
                        </p>
                      </div>
                      {w.tx_hash && (
                        <a
                          href={`${EXPLORER_URLS[w.network] ?? ""}${w.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          Tx
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto rounded-xl border border-zinc-800 sm:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Coins</th>
                      <th className="px-4 py-3 font-medium">USD</th>
                      <th className="px-4 py-3 font-medium">Network</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Tx</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="bg-zinc-900/40">
                        <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                          {new Date(w.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {w.coins.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">${w.amount_usd.toFixed(2)}</td>
                        <td className="px-4 py-3 text-zinc-400">{w.network}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                              STATUS_STYLES[w.status] ?? STATUS_STYLES.pending
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {w.tx_hash ? (
                            <a
                              href={`${EXPLORER_URLS[w.network] ?? ""}${w.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                            >
                              {w.tx_hash.slice(0, 8)}...
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-zinc-600">--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => fetchPage(page - 1)}
                    disabled={page === 0}
                    className="flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </button>
                  <span className="text-xs text-zinc-500">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => fetchPage(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-30"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
