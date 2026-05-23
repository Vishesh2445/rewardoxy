import { Metadata } from "next";
import Link from "next/link";
import { Box, Container, Paper } from "@mui/material";
import PublicFooter from "@/components/public-footer";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Find answers to common questions about Rewardoxy: how to earn, minimum withdrawal, supported countries, payout methods, account issues, and more.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ — Frequently Asked Questions | Rewardoxy",
    description:
      "Find answers to common questions about Rewardoxy: how to earn, minimum withdrawal, supported countries, and payout methods.",
    url: "https://www.rewardoxy.app/faq",
  },
};

const colors = {
  bgPage: "#141523",
  bgCard: "#1d1e30",
  green: "#10B981",
  textPrimary: "#ffffff",
  textSecondary: "#a9a9ca",
  divider: "#2a2b43",
};

const faqs = [
  {
    q: "What is Rewardoxy?",
    a: "Rewardoxy is a free online rewards platform that pays you for completing surveys, trying apps, playing games, and finishing micro-tasks. Advertisers pay us when you engage with their content, and we share that revenue with you as coins.",
  },
  {
    q: "Is Rewardoxy free to join?",
    a: "Yes, creating an account is completely free. There are no hidden fees, subscriptions, or upfront costs. You sign up with your email or Google account and start earning immediately.",
  },
  {
    q: "How do I earn coins?",
    a: "After signing up, go to the Earn page where you'll find offers from multiple partner offerwalls. Each offer shows the coin reward before you start. Complete the requirements (install an app, answer a survey, reach a game level, etc.) and coins are credited to your balance automatically.",
  },
  {
    q: "What is the minimum withdrawal amount?",
    a: "The minimum withdrawal threshold is displayed on the Cashout page. Once your balance meets the minimum, you can request a payout at any time.",
  },
  {
    q: "How are payouts processed?",
    a: "Payouts are sent as LTC (Litecoin) cryptocurrency directly to the wallet address you provide. Most withdrawals are processed within minutes after approval.",
  },
  {
    q: "Which countries are supported?",
    a: "Rewardoxy is available worldwide. However, the number and value of available offers varies by country. Users in the US, UK, Canada, Australia, and Western Europe typically see the highest-paying offers.",
  },
  {
    q: "Why was my offer not credited?",
    a: "Offers can take anywhere from a few minutes to 24 hours to credit. Make sure you completed all requirements listed in the offer description. If an offer still hasn't credited after 24 hours, contact our support team with the offer name and completion details.",
  },
  {
    q: "Can I use a VPN?",
    a: "No. Using a VPN, proxy, or any tool that masks your real IP address will result in offers not crediting and may lead to account suspension. Advertisers require genuine engagement from real locations.",
  },
  {
    q: "How does the referral program work?",
    a: "Every user gets a unique referral code. When someone signs up using your code, you earn a percentage of their earnings as a bonus — without reducing what they earn. Check the Referrals page for your code and stats.",
  },
  {
    q: "Is my data safe?",
    a: "We take privacy seriously. We only collect information necessary to operate the platform and process payouts. We never sell your personal data to third parties. Read our Privacy Policy for full details.",
  },
  {
    q: "What if I have a problem with my account?",
    a: "Contact us at support@rewardoxy.app or use the Contact page. Include your account email and a description of the issue. We typically respond within 24 hours.",
  },
  {
    q: "How is Rewardoxy different from other GPT sites?",
    a: "We focus on instant crypto payouts, a clean user experience, and partnering only with reputable offerwalls. There are no point inflation tricks — our coin-to-crypto rate is transparent and consistent.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function FAQPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.bgPage, color: colors.textPrimary }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

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
            <Link href="/surveys" style={{ color: colors.textSecondary, textDecoration: "none" }}>Surveys</Link>
            <Link href="/rewards" style={{ color: colors.textSecondary, textDecoration: "none" }}>Rewards</Link>
            <Link href="/contact" style={{ color: colors.textSecondary, textDecoration: "none" }}>Contact</Link>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 6, sm: 10 } }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box component="h1" sx={{ fontSize: { xs: "2rem", sm: "2.5rem" }, fontWeight: 800, m: 0 }}>
            Frequently Asked Questions
          </Box>
          <Box component="p" sx={{ mt: 2, color: colors.textSecondary, fontSize: "1.05rem" }}>
            Everything you need to know about earning with Rewardoxy.
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {faqs.map((faq, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                bgcolor: colors.bgCard,
                border: `1px solid ${colors.divider}`,
                borderRadius: 3,
                p: { xs: 2.5, sm: 3.5 },
              }}
            >
              <Box component="h2" sx={{ fontSize: "1.05rem", fontWeight: 700, m: 0, mb: 1.5 }}>
                {faq.q}
              </Box>
              <Box sx={{ color: colors.textSecondary, fontSize: "0.925rem", lineHeight: 1.8 }}>
                {faq.a}
              </Box>
            </Paper>
          ))}
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Box component="p" sx={{ color: colors.textSecondary, mb: 2 }}>
            Still have questions?
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
            <Link
              href="/contact"
              style={{
                display: "inline-block",
                background: "linear-gradient(180deg, #10B981 0%, #059669 100%)",
                color: "#fff",
                fontWeight: 700,
                padding: "12px 28px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Contact Support
            </Link>
            <Link
              href="/auth/signup"
              style={{
                display: "inline-block",
                border: "1px solid #10B981",
                color: "#10B981",
                fontWeight: 700,
                padding: "12px 28px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Start Earning
            </Link>
          </Box>
        </Box>
      </Container>

      <PublicFooter />
    </Box>
  );
}
