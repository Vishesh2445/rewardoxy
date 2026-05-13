import { Metadata } from "next";
import Link from "next/link";
import { Box, Container, Paper, Grid } from "@mui/material";
import { Wallet, Bitcoin, Clock, Shield, CheckCircle, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Rewards & Cashout — Withdraw Your Earnings as Crypto",
  description:
    "Redeem your Rewardoxy coins as LTC cryptocurrency. Instant payouts, low minimum threshold, and transparent conversion rates. Learn how to cash out.",
  alternates: { canonical: "/rewards" },
  openGraph: {
    title: "Rewards & Cashout — Withdraw Your Earnings | Rewardoxy",
    description:
      "Redeem your Rewardoxy coins as LTC cryptocurrency. Instant payouts and low minimum threshold.",
    url: "https://www.rewardoxy.app/rewards",
  },
};

const colors = {
  bgPage: "#141523",
  bgCard: "#1d1e30",
  green: "#01D676",
  greenDark: "#007e45",
  textPrimary: "#ffffff",
  textSecondary: "#a9a9ca",
  divider: "#2a2b43",
  greenTint: "#00e9411a",
};

export default function RewardsPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.bgPage, color: colors.textPrimary }}>
      {/* Nav */}
      <Box
        component="nav"
        sx={{
          borderBottom: `1px solid ${colors.divider}`,
          bgcolor: "rgba(20,21,35,0.8)",
          backdropFilter: "blur(24px)",
        }}
      >
        <Container maxWidth="md" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ textDecoration: "none", color: colors.green, fontWeight: 800, fontSize: "1.25rem" }}>
            Rewardoxy
          </Link>
          <Box sx={{ display: "flex", gap: 3, fontSize: "0.875rem" }}>
            <Link href="/about" style={{ color: colors.textSecondary, textDecoration: "none" }}>About</Link>
            <Link href="/faq" style={{ color: colors.textSecondary, textDecoration: "none" }}>FAQ</Link>
            <Link href="/surveys" style={{ color: colors.textSecondary, textDecoration: "none" }}>Surveys</Link>
            <Link href="/contact" style={{ color: colors.textSecondary, textDecoration: "none" }}>Contact</Link>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
        {/* Hero */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Box component="h1" sx={{ fontSize: { xs: "2rem", sm: "2.75rem" }, fontWeight: 800, m: 0, lineHeight: 1.2 }}>
            Cash Out Your <Box component="span" sx={{ color: colors.green }}>Rewards</Box>
          </Box>
          <Box component="p" sx={{ mt: 2, fontSize: "1.1rem", color: colors.textSecondary, maxWidth: 600, mx: "auto" }}>
            Convert your earned coins into real cryptocurrency. Fast, transparent, and available worldwide.
          </Box>
        </Box>

        {/* How cashout works */}
        <Box component="h2" sx={{ fontSize: "1.5rem", fontWeight: 700, mb: 3 }}>How Withdrawals Work</Box>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            { step: "1", icon: <CheckCircle size={28} />, title: "Earn Coins", desc: "Complete surveys, offers, app installs, and daily bonuses to accumulate coins in your balance." },
            { step: "2", icon: <Wallet size={28} />, title: "Reach Minimum", desc: "Once your balance meets the minimum withdrawal threshold, the cashout option becomes available." },
            { step: "3", icon: <Bitcoin size={28} />, title: "Withdraw as Crypto", desc: "Enter your LTC wallet address and confirm. Your coins are converted and sent directly to your wallet." },
          ].map((item) => (
            <Grid size={{ xs: 12, sm: 4 }} key={item.step}>
              <Paper elevation={0} sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 3, p: 3, height: "100%", textAlign: "center" }}>
                <Box sx={{ color: colors.green, mb: 2, display: "flex", justifyContent: "center" }}>{item.icon}</Box>
                <Box sx={{ fontWeight: 700, fontSize: "1rem", mb: 1 }}>{item.title}</Box>
                <Box sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.7 }}>{item.desc}</Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Payout details */}
        <Paper elevation={0} sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 4, p: { xs: 3, sm: 5 }, mb: 5 }}>
          <Box component="h2" sx={{ fontSize: "1.25rem", fontWeight: 700, mt: 0, mb: 3 }}>Payout Details</Box>
          <Grid container spacing={3}>
            {[
              { label: "Payout Method", value: "LTC (Litecoin)" },
              { label: "Processing Time", value: "Usually within minutes" },
              { label: "Fees", value: "No platform fees — only network gas" },
              { label: "Availability", value: "Worldwide, 24/7" },
            ].map((detail) => (
              <Grid size={{ xs: 12, sm: 6 }} key={detail.label}>
                <Box>
                  <Box sx={{ fontSize: "0.8rem", color: colors.textSecondary, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", mb: 0.5 }}>
                    {detail.label}
                  </Box>
                  <Box sx={{ fontWeight: 700, fontSize: "1rem" }}>{detail.value}</Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Why crypto */}
        <Box component="h2" sx={{ fontSize: "1.5rem", fontWeight: 700, mb: 3 }}>Why We Pay in Cryptocurrency</Box>
        <Box component="p" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 4 }}>
          Cryptocurrency allows us to pay users anywhere in the world without the delays and fees of traditional banking. There are no intermediary banks, no currency conversion charges, and no waiting 3–5 business days. Once your withdrawal is approved, the LTC arrives in your wallet within minutes regardless of your country.
        </Box>

        {/* Benefits */}
        <Grid container spacing={2} sx={{ mb: 6 }}>
          {[
            { icon: <Clock size={20} />, title: "Instant Delivery", desc: "No waiting days for bank transfers. Crypto transactions confirm in minutes." },
            { icon: <Globe size={20} />, title: "No Country Restrictions", desc: "Unlike PayPal or bank transfers, crypto works the same everywhere in the world." },
            { icon: <Shield size={20} />, title: "Transparent & Verifiable", desc: "Every transaction is recorded on the blockchain. You can verify your payout independently." },
            { icon: <Wallet size={20} />, title: "You Control Your Funds", desc: "Coins go directly to your personal wallet. No third-party holds or account freezes." },
          ].map((benefit) => (
            <Grid size={{ xs: 12, sm: 6 }} key={benefit.title}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box sx={{ color: colors.green, mt: 0.25, flexShrink: 0 }}>{benefit.icon}</Box>
                <Box>
                  <Box sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 0.25 }}>{benefit.title}</Box>
                  <Box sx={{ color: colors.textSecondary, fontSize: "0.85rem", lineHeight: 1.7 }}>{benefit.desc}</Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Earning methods summary */}
        <Paper elevation={0} sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 4, p: { xs: 3, sm: 4 }, mb: 5 }}>
          <Box component="h2" sx={{ fontSize: "1.25rem", fontWeight: 700, mt: 0, mb: 2 }}>Ways to Earn Coins</Box>
          <Box component="ul" sx={{ color: colors.textSecondary, lineHeight: 2.2, pl: 2.5, m: 0 }}>
            <li><strong style={{ color: colors.textPrimary }}>Surveys</strong> — Answer questions from research companies (5–200 coins per survey)</li>
            <li><strong style={{ color: colors.textPrimary }}>App Installs</strong> — Download and try mobile apps (10–500 coins)</li>
            <li><strong style={{ color: colors.textPrimary }}>Games</strong> — Play mobile games and reach milestones (50–2000 coins)</li>
            <li><strong style={{ color: colors.textPrimary }}>Daily Bonus</strong> — Claim free coins every day just for logging in</li>
            <li><strong style={{ color: colors.textPrimary }}>Referrals</strong> — Earn a percentage of your friends&apos; earnings</li>
            <li><strong style={{ color: colors.textPrimary }}>Offerwalls</strong> — Complete advertiser tasks from multiple partner networks</li>
          </Box>
        </Paper>

        {/* CTA */}
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Box component="p" sx={{ color: colors.textSecondary, mb: 3, fontSize: "1.05rem" }}>
            Start earning and cash out your first reward today.
          </Box>
          <Link
            href="/auth/signup"
            style={{
              display: "inline-block",
              background: "linear-gradient(180deg, #01d676 0%, #007e45 100%)",
              color: "#fff",
              fontWeight: 700,
              padding: "14px 32px",
              borderRadius: 12,
              textDecoration: "none",
              fontSize: "1rem",
            }}
          >
            Create Free Account
          </Link>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ borderTop: `1px solid ${colors.divider}`, bgcolor: colors.bgCard, py: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ display: "flex", justifyContent: "center", gap: 3, fontSize: "0.875rem", flexWrap: "wrap" }}>
            {[
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
              { label: "FAQ", href: "/faq" },
              { label: "Surveys", href: "/surveys" },
              { label: "Rewards", href: "/rewards" },
              { label: "Contact", href: "/contact" },
              { label: "Terms", href: "/terms" },
              { label: "Privacy", href: "/privacy" },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ color: colors.textSecondary, textDecoration: "none" }}>
                {item.label}
              </Link>
            ))}
          </Box>
          <Box sx={{ textAlign: "center", mt: 2, fontSize: "0.75rem", color: "rgba(169,169,202,0.5)" }}>
            &copy; {new Date().getFullYear()} Rewardoxy. All rights reserved.
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
