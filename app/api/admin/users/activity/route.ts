import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { adminSupabase } = result;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // First get the user's auth UID to match with player_id in completions
  const { data: userData } = await adminSupabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!userData) {
    return NextResponse.json({ completions: [], withdrawals: [] });
  }

  const [completionsRes, cpxRes, notikRes, gemiadRes, theoremreachRes, revtooRes, withdrawalsRes] = await Promise.all([
    adminSupabase
      .from("completions")
      .select("id, program_id, coins_awarded, payout_decimal, created_at, source")
      .eq("player_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    adminSupabase
      .from("cpx_transactions")
      .select("id, transid, amount_local, status, type, created_at")
      .eq("userid", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    adminSupabase
      .from("notik_transactions")
      .select("id, txn_id, amount, offer_name, event_name, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    adminSupabase
      .from("gemiad_transactions")
      .select("id, txid, reward, offer_name, event_name, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    adminSupabase
      .from("theoremreach_transactions")
      .select("id, tx_id, reward, offer_name, is_reversal, is_screenout, is_profiler, is_offer, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    adminSupabase
      .from("revtoo_transactions")
      .select("id, trans_id, reward, offer_name, offer_type, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    adminSupabase
      .from("withdrawals")
      .select("id, coins, amount_usd, status, requested_at")
      .eq("user_id", userId)
      .order("requested_at", { ascending: false })
      .limit(20),
  ]);

  // Transform completions data to match expected format
  const completions = (completionsRes.data ?? []).map(c => ({
    id: c.id,
    offer_name: c.program_id || 'Unknown Offer',
    coins: c.coins_awarded || 0,
    status: 'completed',
    completed_at: c.created_at,
    source: c.source || 'unknown',
  }));

  // Transform CPX transactions
  const cpxCompletions = (cpxRes.data ?? []).map(c => ({
    id: `cpx-${c.id}`,
    offer_name: c.type === 'complete' ? 'CPX Survey' : c.type === 'out' ? 'CPX Screen-out' : c.type === 'bonus' ? 'CPX Rating Bonus' : 'CPX Research',
    coins: c.status === 2 ? -Math.round(Number(c.amount_local)) : Math.round(Number(c.amount_local)),
    status: c.status === 2 ? 'reversed' : 'completed',
    completed_at: c.created_at,
    source: 'cpx',
  }));

  // Transform Notik transactions
  const notikCompletions = (notikRes.data ?? []).map(n => ({
    id: `notik-${n.id}`,
    offer_name: n.event_name ? `Notik - ${n.event_name}` : n.offer_name || 'Notik Offer',
    coins: Math.round(Number(n.amount)),
    status: Number(n.amount) < 0 ? 'reversed' : 'completed',
    completed_at: n.created_at,
    source: 'notik',
  }));

  // Transform GemiAd transactions
  const gemiadCompletions = (gemiadRes.data ?? []).map(g => ({
    id: `gemiad-${g.id}`,
    offer_name: g.event_name ? `GemiAd - ${g.event_name}` : g.offer_name || 'GemiAd Offer',
    coins: Math.round(Number(g.reward)),
    status: g.status === 'completed' ? 'completed' : 'reversed',
    completed_at: g.created_at,
    source: 'gemiad',
  }));

  // Transform TheoremReach transactions
  const theoremreachCompletions = (theoremreachRes.data ?? []).map(tr => {
    let offerName = 'TheoremReach';
    if (tr.is_screenout) offerName = 'TheoremReach Screen-out';
    else if (tr.is_profiler) offerName = 'TheoremReach Profiler';
    else if (tr.is_offer) offerName = 'TheoremReach Offer';
    else offerName = 'TheoremReach Survey';
    
    if (tr.offer_name) offerName = `${offerName} - ${tr.offer_name}`;
    
    return {
      id: `theoremreach-${tr.id}`,
      offer_name: offerName,
      coins: tr.reward,
      status: tr.is_reversal ? 'reversed' : 'completed',
      completed_at: tr.created_at,
      source: 'theoremreach',
    };
  });

  // Transform Revtoo transactions
  const revtooCompletions = (revtooRes.data ?? []).map(r => ({
    id: `revtoo-${r.id}`,
    offer_name: r.offer_name ? `Revtoo - ${r.offer_name}` : 'Revtoo Offer',
    coins: r.status === 1 ? Math.round(Number(r.reward)) : -Math.round(Number(r.reward)),
    status: r.status === 1 ? 'completed' : 'reversed',
    completed_at: r.created_at,
    source: 'revtoo',
  }));

  // Merge all completions and sort by date
  const allCompletions = [
    ...completions,
    ...cpxCompletions,
    ...notikCompletions,
    ...gemiadCompletions,
    ...theoremreachCompletions,
    ...revtooCompletions,
  ].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    .slice(0, 20); // Limit to 20 most recent

  return NextResponse.json({
    completions: allCompletions,
    withdrawals: withdrawalsRes.data ?? [],
  });
}
