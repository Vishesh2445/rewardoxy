import { Metadata } from "next";
import { Box, Paper, Grid } from "@mui/material";
import { Gamepad2, Trophy, Clock, Smartphone } from "lucide-react";
import MarketingLayout from "@/components/marketing/marketing-layout";
import JsonLd from "@/components/marketing/json-ld";
import {
  HeroSection,
  PageContainer,
  SectionHeading,
  Prose,
  CtaBanner,
  RelatedLinks,
} from "@/components/marketing/seo-sections";
import { buildStandardPageGraph } from "@/lib/content/schema";
import colors from "@/theme/colors";

export const metadata: Metadata = {
  title: "Get Paid to Play Games — Earn Money Playing Mobile Games",
  description:
    "Earn money playing mobile games on Rewardoxy. Complete game milestones and earn $1–$120 per offer. Partners: Notik, Taskwall, Revtoo, and more.",
  alternates: { canonical: "/play-and-earn" },
  openGraph: {
    title: "Get Paid to Play Games | Rewardoxy",
    description: "Earn $1–$120 playing mobile games. Complete milestones and withdraw as LTC.",
    url: "https://www.rewardoxy.app/play-and-earn",
  },
};

const jsonLd = buildStandardPageGraph({
  webPage: {
    name: "Get Paid to Play Games — Rewardoxy",
    description: "Earn money by playing mobile games and reaching milestones.",
    path: "/play-and-earn",
  },
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Play & Earn", path: "/play-and-earn" },
  ],
});

export default function PlayAndEarnPage() {
  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer>
        <HeroSection
          title="Get Paid to"
          highlight="Play Games"
          subtitle="Install mobile games through Rewardoxy, reach level milestones, and earn $1 to $120 per offer. Withdraw your earnings as Litecoin (LTC)."
        />

        <Prose>
          Game offers are among the highest-paying tasks on Rewardoxy. Advertisers pay you to install
          their game and reach specific milestones — like completing the tutorial, reaching Level 10,
          or playing for a set number of days. The more challenging the milestone, the higher the payout.
        </Prose>

        <SectionHeading>How Game Offers Work</SectionHeading>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              icon: <Smartphone size={24} />,
              title: "Install Through Rewardoxy",
              desc: "Always start game offers from the Earn page. This ensures your progress is tracked.",
            },
            {
              icon: <Gamepad2 size={24} />,
              title: "Play & Reach Milestones",
              desc: "Complete the required in-game tasks — reach a level, finish tutorial, or play for X days.",
            },
            {
              icon: <Trophy size={24} />,
              title: "Earn Coins",
              desc: "Once the advertiser confirms your milestone, coins credit to your Rewardoxy balance.",
            },
            {
              icon: <Clock size={24} />,
              title: "Keep the Game Installed",
              desc: "Don't uninstall until coins credit (usually 24–48 hours) to avoid reversals.",
            },
          ].map((item) => (
            <Grid size={{ xs: 12, sm: 6 }} key={item.title}>
              <Paper elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 3, height: "100%" }}>
                <Box sx={{ color: colors.green, mb: 1.5 }}>{item.icon}</Box>
                <Box sx={{ fontWeight: 700, mb: 0.5 }}>{item.title}</Box>
                <Box sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.7 }}>{item.desc}</Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <SectionHeading>Best Offerwalls for Game Offers</SectionHeading>
        <Prose>
          Notik, Taskwall, and Revtoo have the strongest game offer inventory on Rewardoxy. Notik
          typically features the highest-paying milestones ($5–$120), while Taskwall prominently
          features Lootably-sourced game offers. Check all three walls daily for new high-paying games.
        </Prose>

        <SectionHeading>Tips for Maximizing Game Earnings</SectionHeading>
        <Box component="ul" sx={{ color: colors.textSecondary, lineHeight: 2, pl: 3, mb: 4 }}>
          <li>Pick games you actually enjoy — milestones require real playtime</li>
          <li>New accounts often see the best game offer rates — prioritize high payouts first</li>
          <li>Read milestone requirements before starting — some require Level 20+</li>
          <li>Enable app tracking on iOS for proper attribution</li>
          <li>Complete offers on the same device you started them on</li>
          <li>Android users typically see more game inventory than iOS</li>
        </Box>

        <RelatedLinks
          links={[
            { text: "Notik Review", href: "/reviews/notik" },
            { text: "Taskwall Review", href: "/reviews/taskwall" },
            { text: "All Offerwalls", href: "/offers" },
            { text: "How It Works", href: "/how-it-works" },
          ]}
        />

        <CtaBanner text="Ready to get paid for playing games?" buttonText="Start Playing & Earning" />
      </PageContainer>
    </MarketingLayout>
  );
}
