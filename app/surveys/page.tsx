import { Metadata } from "next";
import Link from "next/link";
import { Box, Container, Paper, Grid } from "@mui/material";
import { ClipboardList, Clock, DollarSign, Globe, Shield, CheckCircle } from "lucide-react";
import MarketingLayout from "@/components/marketing/marketing-layout";
import JsonLd from "@/components/marketing/json-ld";
import { HeroSection, PageContainer, SectionHeading, Prose, CtaBanner, RelatedLinks } from "@/components/marketing/seo-sections";
import { buildStandardPageGraph } from "@/lib/content/schema";
import colors from "@/theme/colors";

export const metadata: Metadata = {
  title: "Paid Surveys — Earn Money Answering Questions",
  description:
    "Get paid to share your opinion on Rewardoxy. Complete surveys from top research companies and earn coins you can withdraw as Litecoin (LTC). Available worldwide.",
  alternates: { canonical: "/surveys" },
  openGraph: {
    title: "Paid Surveys — Earn Money Answering Questions | Rewardoxy",
    description:
      "Get paid to share your opinion on Rewardoxy. Complete surveys from top research companies and earn coins.",
    url: "https://www.rewardoxy.app/surveys",
  },
};

const jsonLd = buildStandardPageGraph({
  webPage: {
    name: "Paid Surveys — Rewardoxy",
    description: "Get paid to complete surveys and withdraw as LTC.",
    path: "/surveys",
  },
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Surveys", path: "/surveys" },
  ],
});

export default function SurveysPage() {
  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer>
        <HeroSection
          title="Get Paid for"
          highlight="Surveys"
          subtitle="Share your opinions with leading market research companies and earn coins for every survey you complete. No experience needed."
        />

        <SectionHeading>How Paid Surveys Work on Rewardoxy</SectionHeading>
        <Prose>
          Market research companies need real opinions from real people. They pay platforms like Rewardoxy to connect them with survey respondents. When you qualify for and complete a survey, the research company pays us and we credit coins to your account. Surveys typically take 5–20 minutes and pay between 20–200 coins depending on length and topic.
        </Prose>

        <Paper elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 4, p: { xs: 3, sm: 4 }, mb: 5 }}>
          <Box component="h2" sx={{ fontSize: "1.25rem", fontWeight: 700, mt: 0, mb: 2 }}>Our Survey Partners</Box>
          <Grid container spacing={3}>
            {[
              { name: "CPX Research", slug: "cpx-research", desc: "One of the largest survey routers with thousands of daily surveys across all demographics and countries." },
              { name: "TheoremReach", slug: "theoremreach", desc: "AI-powered survey matching that finds the best-paying surveys for your profile automatically." },
              { name: "Revtoo Surveys", slug: "revtoo-surveys", desc: "High-quality surveys focused on consumer products, media habits, and brand awareness." },
            ].map((partner) => (
              <Grid size={{ xs: 12, sm: 4 }} key={partner.name}>
                <Box>
                  <Link href={`/reviews/${partner.slug}`} style={{ textDecoration: "none" }}>
                    <Box sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.5, color: colors.green }}>{partner.name} →</Box>
                  </Link>
                  <Box sx={{ color: colors.textSecondary, fontSize: "0.875rem", lineHeight: 1.7 }}>{partner.desc}</Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <SectionHeading>Tips to Earn More from Surveys</SectionHeading>
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

        <RelatedLinks
          links={[
            { text: "All Offerwalls", href: "/offers" },
            { text: "CPX Research Review", href: "/reviews/cpx-research" },
            { text: "TheoremReach Review", href: "/reviews/theoremreach" },
            { text: "Revtoo Surveys Review", href: "/reviews/revtoo-surveys" },
          ]}
        />

        <CtaBanner text="Ready to get paid for your opinions?" buttonText="Start Taking Surveys" />
      </PageContainer>
    </MarketingLayout>
  );
}
