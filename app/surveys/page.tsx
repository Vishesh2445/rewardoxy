import { Metadata } from "next";
import Link from "next/link";
import { Box, Container, Paper, Grid } from "@mui/material";
import { ClipboardList, Clock, DollarSign, Globe, Shield, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Paid Surveys — Earn Money Answering Questions",
  description:
    "Get paid to share your opinion on Rewardoxy. Complete surveys from top research companies and earn coins you can withdraw as crypto. Available worldwide.",
  alternates: { canonical: "/surveys" },
  openGraph: {
    title: "Paid Surveys — Earn Money Answering Questions | Rewardoxy",
    description:
      "Get paid to share your opinion on Rewardoxy. Complete surveys from top research companies and earn coins.",
    url: "https://www.rewardoxy.app/surveys",
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

export default function SurveysPage() {
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
            <Link href="/rewards" style={{ color: colors.textSecondary, textDecoration: "none" }}>Rewards</Link>
            <Link href="/contact" style={{ color: colors.textSecondary, textDecoration: "none" }}>Contact</Link>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
        {/* Hero */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Box component="h1" sx={{ fontSize: { xs: "2rem", sm: "2.75rem" }, fontWeight: 800, m: 0, lineHeight: 1.2 }}>
            Get Paid for <Box component="span" sx={{ color: colors.green }}>Surveys</Box>
          </Box>
          <Box component="p" sx={{ mt: 2, fontSize: "1.1rem", color: colors.textSecondary, maxWidth: 600, mx: "auto" }}>
            Share your opinions with leading market research companies and earn coins for every survey you complete. No experience needed.
          </Box>
        </Box>

        {/* How surveys work */}
        <Box component="h2" sx={{ fontSize: "1.5rem", fontWeight: 700, mb: 3 }}>How Paid Surveys Work on Rewardoxy</Box>
        <Box component="p" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 4 }}>
          Market research companies need real opinions from real people. They pay platforms like Rewardoxy to connect them with survey respondents. When you qualify for and complete a survey, the research company pays us and we credit coins to your account. Surveys typically take 5–20 minutes and pay between 20–200 coins depending on length and topic.
        </Box>

        {/* Survey providers */}
        <Paper elevation={0} sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 4, p: { xs: 3, sm: 4 }, mb: 5 }}>
          <Box component="h2" sx={{ fontSize: "1.25rem", fontWeight: 700, mt: 0, mb: 2 }}>Our Survey Partners</Box>
          <Grid container spacing={3}>
            {[
              { name: "CPX Research", desc: "One of the largest survey routers with thousands of daily surveys across all demographics and countries." },
              { name: "TheoremReach", desc: "AI-powered survey matching that finds the best-paying surveys for your profile automatically." },
              { name: "Revtoo", desc: "High-quality surveys focused on consumer products, media habits, and brand awareness." },
            ].map((partner) => (
              <Grid size={{ xs: 12, sm: 4 }} key={partner.name}>
                <Box>
                  <Box sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.5, color: colors.green }}>{partner.name}</Box>
                  <Box sx={{ color: colors.textSecondary, fontSize: "0.875rem", lineHeight: 1.7 }}>{partner.desc}</Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Tips */}
        <Box component="h2" sx={{ fontSize: "1.5rem", fontWeight: 700, mb: 3 }}>Tips to Earn More from Surveys</Box>
        <Grid container spacing={2} sx={{ mb: 6 }}>
          {[
            { icon: <CheckCircle size={20} />, title: "Complete your profile", desc: "Fill in demographic details so survey routers can match you with relevant surveys faster." },
            { icon: <Clock size={20} />, title: "Check back often", desc: "New surveys appear throughout the day. The earlier you start, the more inventory is available." },
            { icon: <Shield size={20} />, title: "Answer honestly", desc: "Inconsistent answers trigger quality checks and can disqualify you. Honest responses lead to more invitations." },
            { icon: <Globe size={20} />, title: "Use your real location", desc: "Surveys are geo-targeted. Using your actual IP ensures you see offers meant for your region." },
            { icon: <DollarSign size={20} />, title: "Prioritize high-value surveys", desc: "Longer surveys pay more per completion. Check the coin reward before starting to maximize your time." },
            { icon: <ClipboardList size={20} />, title: "Try multiple routers", desc: "Each survey partner has different inventory. If one router has no surveys, another likely does." },
          ].map((tip) => (
            <Grid size={{ xs: 12, sm: 6 }} key={tip.title}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box sx={{ color: colors.green, mt: 0.25, flexShrink: 0 }}>{tip.icon}</Box>
                <Box>
                  <Box sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 0.25 }}>{tip.title}</Box>
                  <Box sx={{ color: colors.textSecondary, fontSize: "0.85rem", lineHeight: 1.7 }}>{tip.desc}</Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* FAQ mini section */}
        <Paper elevation={0} sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 4, p: { xs: 3, sm: 4 }, mb: 5 }}>
          <Box component="h2" sx={{ fontSize: "1.25rem", fontWeight: 700, mt: 0, mb: 3 }}>Survey FAQ</Box>
          {[
            { q: "Why do I get disqualified from surveys?", a: "Surveys target specific demographics. If your profile doesn't match what the researcher needs, you'll be screened out. This is normal — try the next survey." },
            { q: "How long until survey coins appear?", a: "Most surveys credit within 5 minutes. Some may take up to 24 hours depending on the provider's verification process." },
            { q: "Are surveys available in my country?", a: "Surveys are available worldwide, but volume and payout vary by region. Tier-1 countries (US, UK, CA, AU, DE) typically have the most options." },
          ].map((faq, i) => (
            <Box key={i} sx={{ mb: i < 2 ? 3 : 0 }}>
              <Box sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.5 }}>{faq.q}</Box>
              <Box sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.7 }}>{faq.a}</Box>
            </Box>
          ))}
        </Paper>

        {/* CTA */}
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Box component="p" sx={{ color: colors.textSecondary, mb: 3, fontSize: "1.05rem" }}>
            Ready to get paid for your opinions?
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
            Start Taking Surveys
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
