"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Mail,
  Wallet,
  Save,
  Loader2,
  CheckCircle,
  TrendingUp,
  Flame,
  Calendar,
  Award,
} from "lucide-react";

const NETWORKS = ["TRC-20", "BEP-20", "SOL"] as const;

interface ProfileClientProps {
  userId: string;
  email: string;
  displayName: string;
  cryptoAddress: string;
  preferredNetwork: string;
  totalEarned: number;
  streakCount: number;
  totalCompletions: number;
  totalWithdrawals: number;
  memberSince: string;
}

export default function ProfileClient({
  userId,
  email,
  displayName: initialName,
  cryptoAddress: initialAddress,
  preferredNetwork: initialNetwork,
  totalEarned,
  streakCount,
  totalCompletions,
  totalWithdrawals,
  memberSince,
}: ProfileClientProps) {
  const [name, setName] = useState(initialName);
  const [address, setAddress] = useState(initialAddress);
  const [network, setNetwork] = useState(initialNetwork);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("users")
      .update({
        display_name: name.trim() || null,
        crypto_address: address.trim() || null,
        preferred_network: network,
      })
      .eq("id", userId);

    setSaving(false);

    if (updateError) {
      setError("Failed to save profile");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-zinc-500">Manage your account settings</p>
      </div>

      {/* Stats overview */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MiniStat icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} label="Total Earned" value={totalEarned.toLocaleString()} />
        <MiniStat icon={<Flame className="h-4 w-4 text-amber-400" />} label="Streak" value={`${streakCount} days`} />
        <MiniStat icon={<Award className="h-4 w-4 text-violet-400" />} label="Offers Done" value={String(totalCompletions)} />
        <MiniStat icon={<Wallet className="h-4 w-4 text-sky-400" />} label="Withdrawals" value={String(totalWithdrawals)} />
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5 text-emerald-400" />
            Account Info
          </h2>

          <div className="space-y-4">
            {/* Email (read-only) */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                <Mail className="h-3.5 w-3.5" />
                Email
              </label>
              <input
                type="email"
                readOnly
                value={email}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-400 outline-none"
              />
            </div>

            {/* Display name */}
            <div>
              <label htmlFor="displayName" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                <User className="h-3.5 w-3.5" />
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                maxLength={30}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <p className="mt-1 text-xs text-zinc-500">Shown on the leaderboard</p>
            </div>

            {/* Member since */}
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Calendar className="h-3.5 w-3.5" />
              Member since{" "}
              {new Date(memberSince).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Wallet className="h-5 w-5 text-emerald-400" />
            Withdrawal Settings
          </h2>

          <div className="space-y-4">
            {/* Preferred network */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Preferred Network
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

            {/* Crypto address */}
            <div>
              <label htmlFor="cryptoAddress" className="mb-1.5 block text-sm font-medium text-zinc-300">
                {network === "SOL" ? "SOL" : "USDT"} Address
              </label>
              <input
                id="cryptoAddress"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Your ${network} address`}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <p className="mt-1 text-xs text-zinc-500">Used for future withdrawals</p>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {saved && (
          <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            Profile saved successfully
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </form>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
