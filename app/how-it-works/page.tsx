import { Metadata } from "next";
import Link from "next/link";
import { Box, Paper } from "@mui/material";
import { UserPlus, ListChecks, Wallet } from "lucide-react";
import MarketingLayout from "@/components/marketing/marketing-layout";
import JsonLd from "@/components/marketing/json-ld";
import {
  HeroSection,
  PageContainer,
  SectionHeading,
  Prose,
  StepGrid,
  CtaBanner,
  RelatedLinks,
} from "@/components/marketing/seo-sections";
import { buildStandardPageGraph } from "@/lib/content/schema";
import { MIN_COINS, COINS_PER_USD, PAYOUT_METHOD_FULL } from "@/lib/content/site-facts";
import colors from "@/theme/colors";

export const metadata: Metadata = {
  title: "How It Works — Earn Crypto by Completing Tasks",
  description:
    "Learn how Rewardoxy works: sign up free, complete surveys and offers from 10+ partners, earn coins, and withdraw as Litecoin (LTC). Step-by-step guide.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How Rewardoxy Works | Earn Crypto Online",
    description: "Sign up, complete tasks, earn coins, withdraw as LTC. Full guide.",
    url: "https://www.rewardoxy.app/how-it-works",
  },
};

const jsonLd = buildStandardPageGraph({
  webPage: {
    name: "How Rewardoxy Works",
    description: "Step-by-step guide to earning and withdrawing on Rewardoxy.",
    path: "/how-it-works",
  },
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
  ],
});

export default function HowItWorksPage() {
  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer>
        <HeroSection
          title="How to Earn"
          highlight="Crypto Online"
          subtitle="Rewardoxy connects you with advertisers who pay for your time. Complete surveys, try apps, play games — and withdraw your earnings as Litecoin (LTC)."
        />

        <StepGrid
          steps={[
            {
              step: "1",
              title: "Create Your Free Account",
              desc: "Sign up with email or Google in under 30 seconds. No payment required, ever.",
            },
            {
              step: "2",
              title: "Complete Tasks & Offers",
              desc: "Browse 10+ offerwall partners on the Earn page. Each task shows its coin reward before you start.",
            },
            {
              step: "3",
              title: "Withdraw as LTC",
              desc: `Reach ${MIN_COINS.toLocaleString()} coins ($${MIN_COINS / COINS_PER_USD} minimum) and cash out to your Litecoin wallet.`,
            },
          ]}
        />

        <SectionHeading>Coin Economics</SectionHeading>
        <Paper elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 3, mb: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={{ color: colors.textSecondary }}>Conversion rate</Box>
              <Box sx={{ fontWeight: 700 }}>{COINS_PER_USD.toLocaleString()} coins = $1 USD</Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={{ color: colors.textSecondary }}>Minimum withdrawal</Box>
              <Box sx={{ fontWeight: 700 }}>{MIN_COINS.toLocaleString()} coins (${MIN_COINS / COINS_PER_USD})</Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={{ color: colors.textSecondary }}>Payout method</Box>
              <Box sx={{ fontWeight: 700 }}>{PAYOUT_METHOD_FULL}</Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={{ color: colors.textSecondary }}>Processing time</Box>
              <Box sx={{ fontWeight: 700 }}>Minutes (after approval)</Box>
            </Box>
          </Box>
        </Paper>

        <SectionHeading>Ways to Earn</SectionHeading>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
          {[
            {
              icon: <ListChecks size={24} />,
              title: "Paid Surveys",
              desc: "Share your opinion with market research companies. Earn $0.20–$3.00 per survey via CPX Research, TheoremReach, and Revtoo Surveys.",
              href: "/surveys",
            },
            {
              icon: <UserPlus size={24} />,
              title: "App Trials & Installs",
              desc: "Try new apps and services. CPI offers credit within minutes; CPE offers pay more for reaching milestones.",
              href: "/app-trials",
            },
            {
              icon: <Wallet size={24} />,
              title: "Play Games for Cash",
              desc: "Install mobile games and earn $1–$120 for reaching level milestones. Best offers on Notik and Taskwall.",
              href: "/play-and-earn",
            },
          ].map((item) => (
            <Paper key={item.href} elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 3 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box sx={{ color: colors.green, mt: 0.25 }}>{item.icon}</Box>
                <Box>
                  <Box sx={{ fontWeight: 700, mb: 0.5 }}>{item.title}</Box>
                  <Box sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.7, mb: 1 }}>
                    {item.desc}
                  </Box>
                  <Link href={item.href} style={{ color: colors.green, fontSize: "0.875rem", fontWeight: 600 }}>
                    Learn more →
                  </Link>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        <SectionHeading>What to Expect</SectionHeading>
        <Prose>
          Most offers credit within 5 minutes to 24 hours depending on the type. Surveys and app installs
          are fastest. Game milestone offers may take 24–48 hours after you reach the required level.
          Withdrawals are processed as LTC to your wallet — most complete within minutes after you submit
          a cashout request.
        </Prose>

        <RelatedLinks
          links={[
            { text: "All Offerwalls", href: "/offers" },
            { text: "Crypto Payout Guide", href: "/crypto-payout" },
            { text: "FAQ", href: "/faq" },
            { text: "Referral Program", href: "/referral-program" },
          ]}
        />

        <CtaBanner text="Ready to start earning crypto?" buttonText="Create Free Account" />
      </PageContainer>
    </MarketingLayout>
  );
}
