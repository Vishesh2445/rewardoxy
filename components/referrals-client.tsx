"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Coins,
  Copy,
  Check,
  Link2,
  UserPlus,
} from "lucide-react";

interface Referral {
  id: string;
  masked_email: string;
  created_at: string;
}

interface ReferralsClientProps {
  referralCode: string;
  totalReferrals: number;
  totalCoins: number;
  referrals: Referral[];
}

export default function ReferralsClient({
  referralCode,
  totalReferrals,
  totalCoins,
  referrals,
}: ReferralsClientProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://rewardoxy.com/auth/signup?ref=${referralCode}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <h1 className="text-2xl font-bold">Referrals</h1>
            <p className="text-sm text-zinc-500">
              Invite friends and earn bonus coins
            </p>
          </div>
        </div>

        {/* Referral link */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Link2 className="h-4 w-4 text-emerald-400" />
            Your Referral Link
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                copied
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10">
                <Users className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Referrals
                </p>
                <p className="text-2xl font-bold">{totalReferrals}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <Coins className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Coins Earned
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {totalCoins.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral list */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Your Referrals</h2>

          {referrals.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
              <UserPlus className="mx-auto h-10 w-10 text-zinc-700" />
              <p className="mt-3 text-sm text-zinc-500">
                No referrals yet. Share your link to start earning.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10">
                      <Users className="h-4 w-4 text-violet-400" />
                    </div>
                    <span className="text-sm font-medium">{r.masked_email}</span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(r.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
