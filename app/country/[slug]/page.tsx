import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Box, Paper } from "@mui/material";
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
import { COUNTRIES, getCountryBySlug } from "@/lib/content/countries";
import { getOfferwallBySlug } from "@/lib/content/offerwalls";
import { buildStandardPageGraph } from "@/lib/content/schema";
import colors from "@/theme/colors";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) return {};

  return {
    title: `Earn Money Online in ${country.name}`,
    description: `Get paid to complete surveys, play games, and try apps in ${country.name}. Withdraw earnings as Litecoin (LTC) on Rewardoxy.`,
    alternates: { canonical: `/country/${country.slug}` },
    openGraph: {
      title: `Earn Money Online in ${country.name} | Rewardoxy`,
      description: `GPT earning guide for ${country.name}. Surveys, games, apps, and LTC payouts.`,
      url: `https://www.rewardoxy.app/country/${country.slug}`,
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  const bestWalls = country.bestOfferwalls
    .map((s) => getOfferwallBySlug(s))
    .filter(Boolean);

  const jsonLd = buildStandardPageGraph({
    webPage: {
      name: `Earn Money Online in ${country.name}`,
      description: country.intro[0],
      path: `/country/${country.slug}`,
    },
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: country.name, path: `/country/${country.slug}` },
    ],
    faqs: country.faq,
  });

  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer>
        <HeroSection
          title={`${country.flag} Earn Money Online in`}
          highlight={country.name}
          subtitle={`Your guide to earning on Rewardoxy in ${country.name} — best offerwalls, top verticals, and LTC withdrawal tips.`}
        />

        {country.intro.map((para, i) => (
          <Prose key={i}>{para}</Prose>
        ))}

        <SectionHeading>Top Earning Methods in {country.name}</SectionHeading>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
          {country.topVerticals.map((v, i) => (
            <Paper key={i} elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 3 }}>
              <Box sx={{ fontWeight: 700, color: colors.green, mb: 0.5 }}>
                #{i + 1} {v.name}
              </Box>
              <Box sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.7 }}>
                {v.reason}
              </Box>
            </Paper>
          ))}
        </Box>

        <SectionHeading>Best Offerwalls for {country.name}</SectionHeading>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 4 }}>
          {bestWalls.map((wall) => (
            <Link
              key={wall!.slug}
              href={`/reviews/${wall!.slug}`}
              style={{
                color: colors.green,
                textDecoration: "none",
                padding: "8px 16px",
                border: `1px solid ${colors.divider}`,
                borderRadius: 8,
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {wall!.name}
            </Link>
          ))}
        </Box>

        <Paper elevation={0} sx={{ bgcolor: colors.bgCard, borderRadius: 3, p: 3, mb: 4 }}>
          <Box sx={{ fontWeight: 700, mb: 1 }}>Average Monthly Earnings</Box>
          <Box sx={{ color: colors.green, fontSize: "1.1rem", fontWeight: 600, mb: 2 }}>
            {country.avgEarnings}
          </Box>
          <Box sx={{ fontWeight: 700, mb: 1 }}>LTC Payout Notes</Box>
          <Box sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.7 }}>
            {country.payoutNotes}
          </Box>
        </Paper>

        <SectionHeading>Earning Tips for {country.name}</SectionHeading>
        <Box component="ul" sx={{ color: colors.textSecondary, lineHeight: 2, pl: 3, mb: 4 }}>
          {country.tips.map((tip, i) => (
            <Box component="li" key={i}>{tip}</Box>
          ))}
        </Box>

        <SectionHeading>FAQ — Earning in {country.name}</SectionHeading>
        <FaqList faqs={country.faq} />

        <RelatedLinks
          links={[
            { text: "All Offerwalls", href: "/offers" },
            { text: "How It Works", href: "/how-it-works" },
            { text: "Crypto Payout", href: "/crypto-payout" },
            { text: "Blog", href: "/blog" },
          ]}
        />

        <CtaBanner
          text={`Start earning in ${country.name} today`}
          buttonText="Create Free Account"
        />
      </PageContainer>
    </MarketingLayout>
  );
}
