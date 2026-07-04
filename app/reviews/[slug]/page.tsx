import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Box, Paper, Grid } from "@mui/material";
import { CheckCircle, XCircle } from "lucide-react";
import MarketingLayout from "@/components/marketing/marketing-layout";
import JsonLd from "@/components/marketing/json-ld";
import {
  HeroSection,
  PageContainer,
  SectionHeading,
  Prose,
  CtaBanner,
  RelatedLinks,
  FaqList,
} from "@/components/marketing/seo-sections";
import { OFFERWALLS, getOfferwallBySlug } from "@/lib/content/offerwalls";
import { buildStandardPageGraph } from "@/lib/content/schema";
import colors from "@/theme/colors";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return OFFERWALLS.map((wall) => ({ slug: wall.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const wall = getOfferwallBySlug(slug);
  if (!wall) return {};

  return {
    title: `${wall.name} Review — Earn on Rewardoxy`,
    description: `${wall.name} on Rewardoxy: ${wall.tagline} Payout range: ${wall.payoutRange}. Read our full review and start earning.`,
    alternates: { canonical: `/reviews/${wall.slug}` },
    openGraph: {
      title: `${wall.name} Review | Rewardoxy`,
      description: wall.tagline,
      url: `https://www.rewardoxy.app/reviews/${wall.slug}`,
    },
  };
}

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params;
  const wall = getOfferwallBySlug(slug);
  if (!wall) notFound();

  const relatedWalls = wall.relatedSlugs
    .map((s) => getOfferwallBySlug(s))
    .filter(Boolean);

  const jsonLd = buildStandardPageGraph({
    webPage: {
      name: `${wall.name} Review — Rewardoxy`,
      description: wall.tagline,
      path: `/reviews/${wall.slug}`,
    },
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Offerwalls", path: "/offers" },
      { name: wall.name, path: `/reviews/${wall.slug}` },
    ],
    faqs: wall.faqs,
  });

  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center", mb: 4 }}>
          <Box
            component="img"
            src={wall.logo}
            alt={wall.name}
            sx={{ width: 80, height: 80, objectFit: "contain" }}
          />
        </Box>
        <HeroSection
          title={`${wall.name} on`}
          highlight="Rewardoxy"
          subtitle={wall.tagline}
        />

        <SectionHeading>What is {wall.name}?</SectionHeading>
        {wall.description.map((para, i) => (
          <Prose key={i}>{para}</Prose>
        ))}

        <Paper elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 3, mb: 4 }}>
          <Box sx={{ fontWeight: 700, mb: 1 }}>Average Payout Range</Box>
          <Box sx={{ color: colors.green, fontSize: "1.1rem", fontWeight: 600 }}>{wall.payoutRange}</Box>
        </Paper>

        <SectionHeading>How to Earn More from {wall.name}</SectionHeading>
        <Box component="ul" sx={{ color: colors.textSecondary, lineHeight: 2, pl: 3, mb: 4 }}>
          {wall.tips.map((tip, i) => (
            <Box component="li" key={i} sx={{ mb: 0.5 }}>{tip}</Box>
          ))}
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 3, height: "100%" }}>
              <Box sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle size={20} color={colors.green} /> Pros
              </Box>
              {wall.pros.map((pro, i) => (
                <Box key={i} sx={{ color: colors.textSecondary, fontSize: "0.9rem", mb: 1, lineHeight: 1.7 }}>
                  • {pro}
                </Box>
              ))}
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 3, height: "100%" }}>
              <Box sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <XCircle size={20} color="#EF4444" /> Cons
              </Box>
              {wall.cons.map((con, i) => (
                <Box key={i} sx={{ color: colors.textSecondary, fontSize: "0.9rem", mb: 1, lineHeight: 1.7 }}>
                  • {con}
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>

        <SectionHeading>{wall.name} FAQ</SectionHeading>
        <FaqList faqs={wall.faqs} />

        <RelatedLinks
          links={[
            { text: "All Offerwalls", href: "/offers" },
            { text: "Earning vertical", href: wall.relatedVertical },
            ...relatedWalls.map((w) => ({
              text: `${w!.name} Review`,
              href: `/reviews/${w!.slug}`,
            })),
          ]}
        />

        <CtaBanner
          text={`Start earning with ${wall.name} on Rewardoxy`}
          buttonText="Sign Up Free"
        />
      </PageContainer>
    </MarketingLayout>
  );
}
