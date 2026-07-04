import { Metadata } from "next";
import { Box, Paper } from "@mui/material";
import { Users, Gift, Share2, TrendingUp } from "lucide-react";
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
import { REFERRAL_COMMISSION_PERCENT } from "@/lib/content/site-facts";
import colors from "@/theme/colors";

export const metadata: Metadata = {
  title: "Referral Program — Invite Friends & Earn Money",
  description:
    "Earn 5% of your friends' earnings on Rewardoxy. Share your referral code, grow passive income, and help others earn crypto too.",
  alternates: { canonical: "/referral-program" },
  openGraph: {
    title: "Referral Program | Rewardoxy",
    description: "Invite friends and earn 5% of their earnings forever.",
    url: "https://www.rewardoxy.app/referral-program",
  },
};

const jsonLd = buildStandardPageGraph({
  webPage: {
    name: "Referral Program — Rewardoxy",
    description: "Invite friends and earn 5% commission on their earnings.",
    path: "/referral-program",
  },
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Referral Program", path: "/referral-program" },
  ],
});

export default function ReferralProgramPage() {
  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer>
        <HeroSection
          title="Refer Friends &"
          highlight="Earn Together"
          subtitle={`Share Rewardoxy with friends and earn ${REFERRAL_COMMISSION_PERCENT}% of everything they earn — forever. Their earnings aren't reduced; you get a bonus on top.`}
        />

        <SectionHeading>How the Referral Program Works</SectionHeading>
        <StepGrid
          steps={[
            {
              step: "1",
              title: "Sign Up & Get Your Code",
              desc: "Every Rewardoxy account gets a unique referral code. Find it on your Referrals page after signing up.",
            },
            {
              step: "2",
              title: "Share With Friends",
              desc: "Send your code or referral link to friends, family, or your audience on social media.",
            },
            {
              step: "3",
              title: "Earn 5% Forever",
              desc: `When someone signs up with your code, you earn ${REFERRAL_COMMISSION_PERCENT}% of all their future earnings — automatically.`,
            },
          ]}
        />

        <SectionHeading>Why Refer Rewardoxy?</SectionHeading>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
          {[
            {
              icon: <TrendingUp size={24} />,
              title: "Passive Income",
              desc: "Earn while your referrals complete offers. The more active they are, the more you earn.",
            },
            {
              icon: <Gift size={24} />,
              title: "No Cost to Referrals",
              desc: "Your friends earn 100% of their offer payouts. Your 5% commission is paid by Rewardoxy, not deducted from them.",
            },
            {
              icon: <Users size={24} />,
              title: "Unlimited Referrals",
              desc: "There's no cap on how many people you can refer or how much you can earn from referrals.",
            },
            {
              icon: <Share2 size={24} />,
              title: "Easy to Share",
              desc: "Copy your referral link or code and share via text, social media, or email.",
            },
          ].map((item) => (
            <Paper key={item.title} elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 3 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box sx={{ color: colors.green }}>{item.icon}</Box>
                <Box>
                  <Box sx={{ fontWeight: 700, mb: 0.5 }}>{item.title}</Box>
                  <Box sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.7 }}>{item.desc}</Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        <SectionHeading>Referral Earnings Example</SectionHeading>
        <Prose>
          If you refer 10 friends who each earn $20/month, you&apos;d earn $10/month in referral
          commissions (5% × $200 total). Refer 50 active users earning $30/month each, and your
          passive referral income becomes $75/month — on top of your own earnings.
        </Prose>

        <RelatedLinks
          links={[
            { text: "How It Works", href: "/how-it-works" },
            { text: "FAQ", href: "/faq" },
            { text: "All Offerwalls", href: "/offers" },
          ]}
        />

        <CtaBanner text="Get your referral code — sign up free" buttonText="Create Account" />
      </PageContainer>
    </MarketingLayout>
  );
}
