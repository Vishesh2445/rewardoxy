import { Metadata } from "next";
import HomePageClient from "@/components/home/home-page-client";
import JsonLd from "@/components/marketing/json-ld";
import { HOMEPAGE_FAQS } from "@/lib/content/homepage-faq";
import { buildStandardPageGraph } from "@/lib/content/schema";

export const metadata: Metadata = {
  title: "Rewardoxy — Get Paid to Complete Surveys & Tasks",
  description:
    "Earn real rewards by completing surveys, tasks, and offers. Join Rewardoxy and start earning today. Cash out as Litecoin (LTC) instantly.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Rewardoxy — Get Paid to Complete Surveys & Tasks",
    description:
      "Earn real rewards by completing surveys, tasks, and offers. Cash out as Litecoin (LTC).",
    url: "https://www.rewardoxy.app",
  },
};

const jsonLd = buildStandardPageGraph({
  webPage: {
    name: "Rewardoxy — Get Paid to Complete Surveys & Tasks",
    description: "Earn real rewards by completing surveys, tasks, and offers. Cash out as Litecoin (LTC).",
    path: "/",
  },
  breadcrumbs: [{ name: "Home", path: "/" }],
  faqs: HOMEPAGE_FAQS,
});

export default function HomePage() {
  return (
    <>
      <JsonLd graph={jsonLd} />
      <HomePageClient faqs={HOMEPAGE_FAQS} />
    </>
  );
}
