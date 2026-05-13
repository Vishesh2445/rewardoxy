import { Metadata } from "next";
import Link from "next/link";
import { Box, Container, Paper, Grid } from "@mui/material";
import { Shield, Zap, Globe, Users, Wallet, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "About Rewardoxy — Who We Are & How It Works",
  description:
    "Rewardoxy is a free rewards platform where users earn coins by completing surveys, tasks, and offers. Learn how we work, our mission, and why thousands trust us.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Rewardoxy — Who We Are & How It Works",
    description:
      "Rewardoxy is a free rewards platform where users earn coins by completing surveys, tasks, and offers.",
    url: "https://www.rewardoxy.app/about",
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

export default function AboutPage() {
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
            <Link href="/faq" style={{ color: colors.textSecondary, textDecoration: "none" }}>FAQ</Link>
            <Link href="/surveys" style={{ color: colors.textSecondary, textDecoration: "none" }}>Surveys</Link>
            <Link href="/rewards" style={{ color: colors.textSecondary, textDecoration: "none" }}>Rewards</Link>
            <Link href="/contact" style={{ color: colors.textSecondary, textDecoration: "none" }}>Contact</Link>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
        {/* Hero */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Box component="h1" sx={{ fontSize: { xs: "2rem", sm: "2.75rem" }, fontWeight: 800, m: 0, lineHeight: 1.2 }}>
            About <Box component="span" sx={{ color: colors.green }}>Rewardoxy</Box>
          </Box>
          <Box component="p" sx={{ mt: 2, fontSize: "1.1rem", color: colors.textSecondary, maxWidth: 600, mx: "auto" }}>
            We connect people worldwide with paid surveys, app trials, and micro-tasks so they can earn real money in their spare time.
          </Box>
        </Box>

        {/* Mission */}
        <Paper elevation={0} sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 4, p: { xs: 3, sm: 5 }, mb: 5 }}>
          <Box component="h2" sx={{ fontSize: "1.5rem", fontWeight: 700, mt: 0, mb: 2 }}>Our Mission</Box>
          <Box component="p" sx={{ color: colors.textSecondary, lineHeight: 1.8, m: 0 }}>
            Rewardoxy was built to give everyone — regardless of location — a simple way to earn extra income online. We partner with trusted advertisers and research companies who pay for user engagement. When you complete a survey, try an app, or finish a task, the advertiser pays us and we share that revenue with you as coins. Those coins convert directly to cryptocurrency you can withdraw at any time.
          </Box>
        </Paper>

        {/* How it works */}
        <Box component="h2" sx={{ fontSize: "1.5rem", fontWeight: 700, mb: 3 }}>How Rewardoxy Works</Box>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            { icon: <Users size={28} />, title: "Sign Up Free", desc: "Create an account in seconds with email or Google. No credit card, no hidden fees." },
            { icon: <CheckCircle size={28} />, title: "Complete Offers", desc: "Browse surveys, app installs, games, and tasks from our partner offerwalls. Each one shows the coin reward upfront." },
            { icon: <Wallet size={28} />, title: "Cash Out", desc: "Once you reach the minimum threshold, withdraw your earnings as LTC cryptocurrency directly to your wallet." },
          ].map((step) => (
            <Grid size={{ xs: 12, sm: 4 }} key={step.title}>
              <Paper elevation={0} sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 3, p: 3, height: "100%" }}>
                <Box sx={{ color: colors.green, mb: 2 }}>{step.icon}</Box>
                <Box sx={{ fontWeight: 700, fontSize: "1rem", mb: 1 }}>{step.title}</Box>
                <Box sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.7 }}>{step.desc}</Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Why trust us */}
        <Box component="h2" sx={{ fontSize: "1.5rem", fontWeight: 700, mb: 3 }}>Why Users Trust Rewardoxy</Box>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            { icon: <Shield size={22} />, title: "Transparent Payouts", desc: "Every transaction is logged. You can track your earnings and withdrawal history in real time." },
            { icon: <Zap size={22} />, title: "Instant Withdrawals", desc: "No waiting days for approval. Once verified, crypto payouts are processed within minutes." },
            { icon: <Globe size={22} />, title: "Available Worldwide", desc: "Users from over 100 countries earn on Rewardoxy. Offers are geo-targeted so you always see relevant tasks." },
          ].map((item) => (
            <Grid size={{ xs: 12, sm: 4 }} key={item.title}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box sx={{ color: colors.green, mt: 0.5, flexShrink: 0 }}>{item.icon}</Box>
                <Box>
                  <Box sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.5 }}>{item.title}</Box>
                  <Box sx={{ color: colors.textSecondary, fontSize: "0.875rem", lineHeight: 1.7 }}>{item.desc}</Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Our Partners */}
        <Paper elevation={0} sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 4, p: { xs: 3, sm: 5 }, mb: 5 }}>
          <Box component="h2" sx={{ fontSize: "1.5rem", fontWeight: 700, mt: 0, mb: 2 }}>Our Offer Partners</Box>
          <Box component="p" sx={{ color: colors.textSecondary, lineHeight: 1.8, m: 0 }}>
            We work with established offerwalls and survey routers including CPX Research, MyLead, Notik, Revtoo, GemiAd, and TheoremReach. These companies have been in the market research and advertising space for years, ensuring you always have legitimate, well-paying offers available.
          </Box>
        </Paper>

        {/* CTA */}
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Box component="p" sx={{ color: colors.textSecondary, mb: 3, fontSize: "1.05rem" }}>
            Ready to start earning?
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
