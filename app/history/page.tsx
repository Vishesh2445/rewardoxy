import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import HistoryClient from "@/components/history-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [userResult, completionsResult, cpxResult, notikResult, gemiadResult, theoremreachResult, revtooResult] = await Promise.all([
    supabase
      .from("users")
      .select("coins_balance, display_name")
      .eq("id", user.id)
      .single(),

    supabase
      .from("completions")
      .select("id, program_id, payout_decimal, coins_awarded, created_at, source", {
        count: "exact",
      })
      .eq("player_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),

    // Fetch CPX transactions
    supabase
      .from("cpx_transactions")
      .select("id, transid, amount_local, status, type, created_at", {
        count: "exact",
      })
      .eq("userid", user.id)
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),

    // Fetch Notik transactions
    supabase
      .from("notik_transactions")
      .select("id, txn_id, amount, offer_name, event_name, created_at", {
        count: "exact",
      })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),

    // Fetch GemiAd transactions
    supabase
      .from("gemiad_transactions")
      .select("id, txid, reward, offer_name, event_name, status, created_at", {
        count: "exact",
      })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),

    // Fetch TheoremReach transactions
    supabase
      .from("theoremreach_transactions")
      .select("id, tx_id, reward, offer_name, is_reversal, is_screenout, is_profiler, is_offer, created_at", {
        count: "exact",
      })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),

    // Fetch Revtoo transactions
    supabase
      .from("revtoo_transactions")
      .select("id, trans_id, reward, offer_name, status, created_at", {
        count: "exact",
      })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),
  ]);

  const coins = userResult.data?.coins_balance ?? 0;

  // Merge completions, CPX transactions, Notik transactions, GemiAd transactions, TheoremReach transactions, and Revtoo transactions
  const allCompletions = [
    ...(completionsResult.data ?? []),
    ...(cpxResult.data ?? []).map((cpx) => ({
      id: cpx.id,
      program_id: cpx.type === 'complete' ? 'CPX Survey' : cpx.type === 'out' ? 'CPX Screen-out' : cpx.type === 'bonus' ? 'CPX Rating Bonus' : 'CPX Research',
      payout_decimal: cpx.amount_local,
      coins_awarded: cpx.status === 2 ? -Math.round(Number(cpx.amount_local)) : Math.round(Number(cpx.amount_local)),
      created_at: cpx.created_at,
      source: 'cpx',
    })),
    ...(notikResult.data ?? []).map((notik) => ({
      id: notik.id,
      program_id: notik.event_name ? `Notik - ${notik.event_name}` : notik.offer_name || 'Notik Offer',
      payout_decimal: notik.amount,
      coins_awarded: Math.round(Number(notik.amount)),
      created_at: notik.created_at,
      source: 'notik',
    })),
    ...(gemiadResult.data ?? []).map((gemiad) => ({
      id: gemiad.id,
      program_id: gemiad.event_name ? `GemiAd - ${gemiad.event_name}` : gemiad.offer_name || 'GemiAd Offer',
      payout_decimal: gemiad.reward / 700, // Convert coins back to USD for display
      coins_awarded: gemiad.reward,
      created_at: gemiad.created_at,
      source: 'gemiad',
    })),
    ...(theoremreachResult.data ?? []).map((tr) => {
      let programName = 'TheoremReach';
      if (tr.is_screenout) programName = 'TheoremReach Screen-out';
      else if (tr.is_profiler) programName = 'TheoremReach Profiler';
      else if (tr.is_offer) programName = 'TheoremReach Offer';
      else programName = 'TheoremReach Survey';
      
      if (tr.offer_name) programName = `${programName} - ${tr.offer_name}`;
      
      return {
        id: tr.id,
        program_id: programName,
        payout_decimal: Math.abs(tr.reward) / 700, // Convert coins to USD for display
        coins_awarded: tr.reward,
        created_at: tr.created_at,
        source: 'theoremreach',
      };
    }),
    ...(revtooResult.data ?? []).map((revtoo) => ({
      id: revtoo.id,
      program_id: revtoo.offer_name ? `Revtoo - ${revtoo.offer_name}` : 'Revtoo Offer',
      payout_decimal: Math.abs(revtoo.reward) / 1000, // Convert coins back to USD for display
      coins_awarded: revtoo.status === 1 ? Math.round(Number(revtoo.reward)) : -Math.round(Number(revtoo.reward)),
      created_at: revtoo.created_at,
      source: 'revtoo',
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalCount = (completionsResult.count ?? 0) + (cpxResult.count ?? 0) + (notikResult.count ?? 0) + (gemiadResult.count ?? 0) + (theoremreachResult.count ?? 0) + (revtooResult.count ?? 0);

  return (
    <AppShell 
      coins={coins}
      userId={user.id}
      userName={userResult.data?.display_name ?? "User"}
      userAvatar={undefined}
    >
      <HistoryClient
        userId={user.id}
        initialCompletions={allCompletions.slice(0, PAGE_SIZE)}
        initialTotal={totalCount}
      />
    </AppShell>
  );
}
