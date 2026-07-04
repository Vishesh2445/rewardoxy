import { Metadata } from "next";
import Link from "next/link";
import { Box } from "@mui/material";
import MarketingLayout from "@/components/marketing/marketing-layout";
import JsonLd from "@/components/marketing/json-ld";
import { HeroSection, PageContainer, FaqList, CtaBanner } from "@/components/marketing/seo-sections";
import { SITE_FAQS } from "@/lib/content/faq";
import { buildStandardPageGraph } from "@/lib/content/schema";
import colors from "@/theme/colors";

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

const jsonLd = buildStandardPageGraph({
  webPage: {
    name: "FAQ — Rewardoxy",
    description: "Frequently asked questions about earning and withdrawing on Rewardoxy.",
    path: "/faq",
  },
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "FAQ", path: "/faq" },
  ],
  faqs: SITE_FAQS,
});

export default function FAQPage() {
  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer>
        <HeroSection
          title="Frequently Asked"
          highlight="Questions"
          subtitle="Everything you need to know about earning with Rewardoxy."
        />

        <FaqList faqs={SITE_FAQS} />

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
      </PageContainer>
    </MarketingLayout>
  );
}
