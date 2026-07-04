import { Metadata } from "next";
import { Box, Paper, Grid } from "@mui/material";
import { Wallet, Bitcoin, Clock, Shield, CheckCircle } from "lucide-react";
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
  title: "Earn Litecoin Online — LTC Crypto Payout Guide",
  description:
    "Withdraw your Rewardoxy earnings as Litecoin (LTC). $2 minimum, 1,000 coins = $1 USD, fast processing. Learn how to earn and cash out LTC.",
  alternates: { canonical: "/crypto-payout" },
  openGraph: {
    title: "Earn Litecoin (LTC) on Rewardoxy",
    description: "Earn crypto by completing tasks. Withdraw as LTC with $2 minimum.",
    url: "https://www.rewardoxy.app/crypto-payout",
  },
};

const jsonLd = buildStandardPageGraph({
  webPage: {
    name: "Crypto Payout — Earn Litecoin on Rewardoxy",
    description: "Guide to earning and withdrawing Litecoin (LTC) on Rewardoxy.",
    path: "/crypto-payout",
  },
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Crypto Payout", path: "/crypto-payout" },
  ],
});

export default function CryptoPayoutPage() {
  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer>
        <HeroSection
          title="Earn & Withdraw"
          highlight="Litecoin (LTC)"
          subtitle="Rewardoxy pays in Litecoin — a fast, low-fee cryptocurrency. Earn coins by completing tasks and withdraw directly to your LTC wallet."
        />

        <Prose>
          Unlike traditional rewards sites that pay in gift cards or PayPal, Rewardoxy sends your
          earnings as Litecoin (LTC) directly to your crypto wallet. This means faster payouts,
          lower fees, and full control over your money.
        </Prose>

        <SectionHeading>How LTC Withdrawals Work</SectionHeading>
        <StepGrid
          steps={[
            {
              step: "1",
              title: "Earn Coins",
              desc: "Complete surveys, app offers, and game milestones. All earnings credit to one balance.",
            },
            {
              step: "2",
              title: "Reach Minimum",
              desc: `${MIN_COINS.toLocaleString()} coins ($${MIN_COINS / COINS_PER_USD}) — achievable in your first session.`,
            },
            {
              step: "3",
              title: "Enter LTC Address",
              desc: "Paste your Litecoin wallet address on the Cashout page and confirm.",
            },
          ]}
        />

        <SectionHeading>Payout Details</SectionHeading>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { icon: <Bitcoin size={24} />, label: "Currency", value: PAYOUT_METHOD_FULL },
            { icon: <Wallet size={24} />, label: "Minimum", value: `${MIN_COINS.toLocaleString()} coins ($${MIN_COINS / COINS_PER_USD})` },
            { icon: <CheckCircle size={24} />, label: "Rate", value: `${COINS_PER_USD.toLocaleString()} coins = $1 USD` },
            { icon: <Clock size={24} />, label: "Speed", value: "Minutes after approval" },
            { icon: <Shield size={24} />, label: "Fees", value: "Network fee only (minimal)" },
          ].map((item) => (
            <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
              <Paper elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 2.5, display: "flex", gap: 2, alignItems: "center" }}>
                <Box sx={{ color: colors.green }}>{item.icon}</Box>
                <Box>
                  <Box sx={{ fontSize: "0.8rem", color: colors.textSecondary }}>{item.label}</Box>
                  <Box sx={{ fontWeight: 700 }}>{item.value}</Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <SectionHeading>Setting Up Your LTC Wallet</SectionHeading>
        <Prose>
          You need a Litecoin wallet address to receive withdrawals. Popular options include Exodus,
          Trust Wallet, and exchange wallets from Coinbase, Binance, or Kraken. Create your wallet
          first, then copy your LTC receiving address to the Rewardoxy Cashout page. Always
          double-check your address — crypto transactions cannot be reversed.
        </Prose>

        <RelatedLinks
          links={[
            { text: "How It Works", href: "/how-it-works" },
            { text: "Rewards Page", href: "/rewards" },
            { text: "FAQ", href: "/faq" },
            { text: "Start Earning", href: "/auth/signup" },
          ]}
        />

        <CtaBanner text="Start earning Litecoin today" buttonText="Create Free Account" />
      </PageContainer>
    </MarketingLayout>
  );
}