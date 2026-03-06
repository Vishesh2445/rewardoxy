"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  History,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Gamepad2,
  FileText,
  Smartphone,
  Search,
} from "lucide-react";

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

  async function fetchPage(newPage: number) {
    const supabase = createClient();
    const from = newPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count } = await supabase
      .from("completions")
      .select("id, program_id, payout_decimal, coins_awarded, created_at", {
        count: "exact",
      })
      .eq("player_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data) setCompletions(data);
    if (count !== null) setTotal(count);
    setPage(newPage);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <History className="h-6 w-6 text-emerald-400" />
            Earning History
          </h1>
          <p className="text-sm text-zinc-500">{total} total completions</p>
        </div>
      </div>

      {completions.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
          <Search className="mx-auto h-10 w-10 text-zinc-700" />
          <p className="mt-3 text-sm text-zinc-500">
            No completions yet. Complete offers to see your history here.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {completions.map((c) => {
              const Icon = offerIcon(c.program_id);
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    <Icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Program {c.program_id}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center gap-1 text-sm font-semibold text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      +{c.coins_awarded}
                    </p>
                    {c.payout_decimal != null && (
                      <p className="text-[10px] text-zinc-500">${c.payout_decimal.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-zinc-800 sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Program</th>
                  <th className="px-4 py-3 text-right font-medium">Payout</th>
                  <th className="px-4 py-3 text-right font-medium">Coins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {completions.map((c) => {
                  const Icon = offerIcon(c.program_id);
                  return (
                    <tr key={c.id} className="bg-zinc-900/40">
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-emerald-400" />
                          <span className="font-medium">Program {c.program_id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400">
                        {c.payout_decimal != null ? `$${c.payout_decimal.toFixed(2)}` : "--"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                        +{c.coins_awarded}
                      </td>
                    </tr>
                  );
                })}
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
  );
}
