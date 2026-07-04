import { Metadata } from "next";
import { Box, Paper, Grid } from "@mui/material";
import { Download, CheckCircle, Clock, Shield } from "lucide-react";
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
  title: "Get Paid to Try Apps — Download Apps & Earn Money",
  description:
    "Get paid to download and try apps on Rewardoxy. Complete app installs and trials for $0.50–$15 per offer. Withdraw earnings as Litecoin (LTC).",
  alternates: { canonical: "/app-trials" },
  openGraph: {
    title: "Get Paid to Try Apps | Rewardoxy",
    description: "Download apps, complete trials, and earn coins. Withdraw as LTC.",
    url: "https://www.rewardoxy.app/app-trials",
  },
};

const jsonLd = buildStandardPageGraph({
  webPage: {
    name: "Get Paid to Try Apps — Rewardoxy",
    description: "Earn money by downloading and trying mobile apps.",
    path: "/app-trials",
  },
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "App Trials", path: "/app-trials" },
  ],
});

export default function AppTrialsPage() {
  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer>
        <HeroSection
          title="Get Paid to"
          highlight="Try Apps"
          subtitle="Download apps, complete free trials, and sign up for services — all through Rewardoxy. Earn $0.50 to $15+ per offer and withdraw as Litecoin."
        />

        <Prose>
          App trial offers are one of the fastest ways to earn on Rewardoxy. Advertisers pay you to
          install their app, create an account, or start a free trial. Simple CPI (Cost Per Install)
          offers credit within minutes, while CPE offers pay more for completing specific actions.
        </Prose>

        <SectionHeading>Types of App Offers</SectionHeading>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              icon: <Download size={24} />,
              title: "CPI — Install & Open",
              desc: "Install the app and open it once. Fastest crediting — usually within 5–15 minutes. Pays $0.30–$2.00.",
            },
            {
              icon: <CheckCircle size={24} />,
              title: "CPE — Complete Action",
              desc: "Install and complete a specific action (sign up, reach a level, make a purchase). Pays $1.00–$15.00.",
            },
            {
              icon: <Clock size={24} />,
              title: "Free Trials",
              desc: "Start a free trial for streaming, fintech, or subscription services. Pays $2.00–$10.00. Read cancellation terms.",
            },
            {
              icon: <Shield size={24} />,
              title: "Sign-Up Offers",
              desc: "Create an account on a website or service. Quick and easy — pays $0.50–$5.00 per sign-up.",
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

        <SectionHeading>Best Offerwalls for App Offers</SectionHeading>
        <Prose>
          GemiAd, Vortex, Klink, and MyLead have the best app install and trial inventory. GemiAd
          excels at quick CPI offers, while Klink features finance and lifestyle app trials with
          competitive payouts. Check the aggregated offers feed on the Earn page for app offers
          from all partners in one place.
        </Prose>

        <SectionHeading>App Offer Tips</SectionHeading>
        <Box component="ul" sx={{ color: colors.textSecondary, lineHeight: 2, pl: 3, mb: 4 }}>
          <li>Always install through Rewardoxy&apos;s link — never search the app store directly</li>
          <li>Allow tracking permissions when prompted for proper attribution</li>
          <li>Keep apps installed for at least 24 hours after completing requirements</li>
          <li>Use a real email address for sign-up offers that require verification</li>
          <li>Read free trial terms — some require cancellation before billing</li>
          <li>Disable ad blockers before starting app offers</li>
        </Box>

        <RelatedLinks
          links={[
            { text: "GemiAd Review", href: "/reviews/gemiad" },
            { text: "Vortex Review", href: "/reviews/vortex" },
            { text: "Klink Review", href: "/reviews/klink" },
            { text: "All Offerwalls", href: "/offers" },
          ]}
        />

        <CtaBanner text="Ready to earn from app trials?" buttonText="Start Trying Apps" />
      </PageContainer>
    </MarketingLayout>
  );
}
