import { Metadata } from "next";
import Link from "next/link";
import { Box, Paper, Grid, Chip } from "@mui/material";
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
import { OFFERWALLS } from "@/lib/content/offerwalls";
import { buildStandardPageGraph } from "@/lib/content/schema";
import colors from "@/theme/colors";

export const metadata: Metadata = {
  title: "Best Offerwalls 2026 — Complete Partner List",
  description:
    "Browse all offerwalls on Rewardoxy: CPX Research, Notik, GemiAd, Taskwall, and more. Compare payout ranges and start earning from 10+ trusted partners.",
  alternates: { canonical: "/offers" },
  openGraph: {
    title: "Best Offerwalls 2026 — Complete Partner List | Rewardoxy",
    description: "Browse all offerwalls on Rewardoxy. Compare partners and start earning today.",
    url: "https://www.rewardoxy.app/offers",
  },
};

const TYPE_LABELS: Record<string, string> = {
  surveys: "Surveys",
  games: "Games",
  apps: "Apps",
  mixed: "Mixed",
};

const jsonLd = buildStandardPageGraph({
  webPage: {
    name: "Offerwalls on Rewardoxy",
    description: "Complete list of offerwall partners on Rewardoxy.",
    path: "/offers",
  },
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Offerwalls", path: "/offers" },
  ],
});

export default function OffersPage() {
  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer maxWidth="lg">
        <HeroSection
          title="Offerwalls on Rewardoxy — Earn from"
          highlight="10+ Trusted Partners"
          subtitle="Rewardoxy aggregates multiple offerwall partners into one platform. Complete offers from any partner and all earnings credit to a single balance you can withdraw as Litecoin (LTC)."
        />

        <Prose>
          Each offerwall on Rewardoxy specializes in different earning methods — surveys, mobile games,
          app installs, and more. Browse our partners below, read detailed reviews, and start earning
          from the walls that match your style.
        </Prose>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {OFFERWALLS.map((wall) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={wall.slug}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: colors.bgCard,
                  borderRadius: 3,
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.2s",
                  border: `1px solid transparent`,
                  "&:hover": { borderColor: "rgba(16,185,129,0.4)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Box
                    component="img"
                    src={wall.logo}
                    alt={wall.name}
                    sx={{ width: 48, height: 48, objectFit: "contain", borderRadius: 1 }}
                  />
                  <Box>
                    <Box sx={{ fontWeight: 700, fontSize: "1rem" }}>{wall.name}</Box>
                    <Chip
                      label={TYPE_LABELS[wall.type]}
                      size="small"
                      sx={{ mt: 0.5, bgcolor: colors.greenTint, color: colors.green, fontSize: "0.7rem" }}
                    />
                  </Box>
                </Box>
                <Box sx={{ color: colors.textSecondary, fontSize: "0.875rem", lineHeight: 1.7, flexGrow: 1, mb: 2 }}>
                  {wall.tagline}
                </Box>
                <Box sx={{ fontSize: "0.8rem", color: colors.green, fontWeight: 600, mb: 2 }}>
                  {wall.payoutRange}
                </Box>
                <Link
                  href={`/reviews/${wall.slug}`}
                  style={{ color: colors.green, textDecoration: "none", fontWeight: 600, fontSize: "0.875rem" }}
                >
                  Read review →
                </Link>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <SectionHeading>How Offerwalls Work on Rewardoxy</SectionHeading>
        <StepGrid
          steps={[
            {
              step: "1",
              title: "Choose a Partner",
              desc: "Browse offerwalls above and pick one that matches your earning style — surveys, games, or apps.",
            },
            {
              step: "2",
              title: "Complete Offers",
              desc: "Open the offerwall from your Earn page, complete tasks, and coins credit automatically to your balance.",
            },
            {
              step: "3",
              title: "Withdraw as LTC",
              desc: "All partners share one balance. Withdraw as Litecoin once you reach 2,000 coins ($2 minimum).",
            },
          ]}
        />

        <RelatedLinks
          links={[
            { text: "Paid Surveys", href: "/surveys" },
            { text: "Play & Earn Games", href: "/play-and-earn" },
            { text: "App Trials", href: "/app-trials" },
            { text: "Crypto Payout", href: "/crypto-payout" },
            { text: "How It Works", href: "/how-it-works" },
          ]}
        />

        <CtaBanner text="Ready to start earning from multiple offerwalls?" buttonText="Create Free Account" />
      </PageContainer>
    </MarketingLayout>
  );
}
