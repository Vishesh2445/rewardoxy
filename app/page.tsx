import Link from "next/link";
import {
  Shield,
  Zap,
  Globe,
  ClipboardList,
  CheckCircle,
  Wallet,
  Gamepad2,
  FileText,
  Smartphone,
  ArrowRight,
  Trophy,
  Users,
  DollarSign,
  Star,
  CalendarCheck,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Gradient glow behind hero */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[700px] rounded-full bg-emerald-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Get Paid to Complete{" "}
            <span className="text-emerald-400">Simple Tasks</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Join thousands earning USDT by completing offers, surveys &amp;
            games. Free to join. Instant withdrawals.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/signup"
              className="group flex h-12 items-center gap-2 rounded-full bg-emerald-500 px-8 font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
            >
              Start Earning Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/auth/login"
              className="flex h-12 items-center gap-2 rounded-full border border-zinc-700 px-8 font-semibold transition-colors hover:border-zinc-500 hover:bg-zinc-900"
            >
              Login
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Secure
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              Instant Payouts
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-400" />
              Worldwide
            </span>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            How It Works
          </h2>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            <StepCard
              icon={<ClipboardList className="h-8 w-8 text-emerald-400" />}
              step={1}
              title="Create Free Account"
              description="Sign up in seconds, no credit card needed."
            />
            <StepCard
              icon={<CheckCircle className="h-8 w-8 text-emerald-400" />}
              step={2}
              title="Complete Offers"
              description="Play games, fill surveys, try apps."
            />
            <StepCard
              icon={<Wallet className="h-8 w-8 text-emerald-400" />}
              step={3}
              title="Withdraw Crypto"
              description="Cash out in USDT via TRC-20, BEP-20 or SOL."
            />
          </div>
        </div>
      </section>

      {/* ── OFFERS PREVIEW ── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            Popular Offers
          </h2>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <OfferCard
              icon={<Gamepad2 className="h-8 w-8 text-emerald-400" />}
              title="Play Game"
              coins={500}
              difficulty="Easy"
            />
            <OfferCard
              icon={<FileText className="h-8 w-8 text-emerald-400" />}
              title="Fill Survey"
              coins={200}
              difficulty="Easy"
            />
            <OfferCard
              icon={<Smartphone className="h-8 w-8 text-emerald-400" />}
              title="Try App"
              coins={300}
              difficulty="Medium"
            />
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 text-emerald-400 font-semibold transition-colors hover:text-emerald-300"
            >
              View All Offers
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="border-t border-zinc-800 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            Why Choose Rewardoxy?
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<DollarSign className="h-6 w-6 text-emerald-400" />}
              title="Crypto Payouts"
              description="Withdraw in USDT via TRC-20, BEP-20, or SOL"
            />
            <FeatureCard
              icon={<CalendarCheck className="h-6 w-6 text-amber-400" />}
              title="Daily Bonus"
              description="Earn free coins every day with streak rewards"
            />
            <FeatureCard
              icon={<Trophy className="h-6 w-6 text-yellow-400" />}
              title="Leaderboard"
              description="Compete with others and climb the ranks"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-violet-400" />}
              title="Referral Program"
              description="Invite friends and earn bonus coins"
            />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-t border-zinc-800 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          <StatBlock label="Active Users" value="1,000+" />
          <StatBlock label="Offers Available" value="500+" />
          <StatBlock label="Paid Out" value="$10K+" />
          <StatBlock label="Countries" value="100+" />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-800 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <span className="text-lg font-bold text-emerald-400">
              Rewardoxy
            </span>
            <p className="mt-1 text-sm text-zinc-500">
              Complete tasks. Earn rewards. Withdraw crypto.
            </p>
          </div>

          <nav className="flex gap-6 text-sm text-zinc-400">
            <Link href="/terms" className="transition-colors hover:text-zinc-200">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-zinc-200">
              Privacy
            </Link>
            <Link href="/contact" className="transition-colors hover:text-zinc-200">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/* ── Subcomponents ── */

function StepCard({
  icon,
  step,
  title,
  description,
}: {
  icon: React.ReactNode;
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="fade-in-up group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center transition-colors hover:border-emerald-500/40">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
        {icon}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-emerald-400">
        Step {step}
      </p>
      <h3 className="mt-2 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </div>
  );
}

function OfferCard({
  icon,
  title,
  coins,
  difficulty,
}: {
  icon: React.ReactNode;
  title: string;
  coins: number;
  difficulty: "Easy" | "Medium";
}) {
  const badgeColor =
    difficulty === "Easy"
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-amber-500/10 text-amber-400";

  return (
    <div className="fade-in-up group flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center transition-colors hover:border-emerald-500/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <div className="mt-3 flex items-center gap-1.5">
        <Trophy className="h-4 w-4 text-emerald-400" />
        <span className="font-semibold text-emerald-400">{coins} coins</span>
      </div>
      <span
        className={`mt-3 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${badgeColor}`}
      >
        {difficulty}
      </span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center transition-colors hover:border-zinc-700">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold text-emerald-400">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}
