import { Metadata } from "next";
import Link from "next/link";
import { Box, Paper, Chip } from "@mui/material";
import MarketingLayout from "@/components/marketing/marketing-layout";
import JsonLd from "@/components/marketing/json-ld";
import { HeroSection, PageContainer, CtaBanner } from "@/components/marketing/seo-sections";
import { BLOG_POSTS } from "@/lib/content/blog-posts";
import { buildStandardPageGraph } from "@/lib/content/schema";
import colors from "@/theme/colors";

export const metadata: Metadata = {
  title: "Blog — Earning Tips, Guides & Crypto Rewards",
  description:
    "Rewardoxy blog: GPT site guides, crypto earning tips, survey strategies, and game offer tutorials. Learn how to maximize your earnings.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Rewardoxy Blog",
    description: "Earning guides, crypto tips, and GPT site comparisons.",
    url: "https://www.rewardoxy.app/blog",
  },
};

const CATEGORIES = ["GPT Guides", "Crypto", "Surveys", "Games"] as const;

const jsonLd = buildStandardPageGraph({
  webPage: {
    name: "Rewardoxy Blog",
    description: "Earning guides and tips for Rewardoxy users.",
    path: "/blog",
  },
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ],
});

export default function BlogPage() {
  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer maxWidth="lg">
        <HeroSection
          title="Rewardoxy"
          highlight="Blog"
          subtitle="Guides, tips, and strategies to help you earn more from surveys, games, app offers, and crypto payouts."
        />

        {CATEGORIES.map((category) => {
          const posts = BLOG_POSTS.filter((p) => p.category === category);
          if (posts.length === 0) return null;
          return (
            <Box key={category} sx={{ mb: 6 }}>
              <Box component="h2" sx={{ fontSize: "1.25rem", fontWeight: 700, mb: 2 }}>
                {category}
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {posts.map((post) => (
                  <Paper
                    key={post.slug}
                    elevation={0}
                    sx={{
                      bgcolor: colors.bgCard,
                      borderRadius: 3,
                      p: 3,
                      transition: "border-color 0.2s",
                      border: `1px solid transparent`,
                      "&:hover": { borderColor: "rgba(16,185,129,0.4)" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Chip
                        label={post.category}
                        size="small"
                        sx={{ bgcolor: colors.greenTint, color: colors.green, fontSize: "0.7rem" }}
                      />
                      <Box sx={{ fontSize: "0.8rem", color: colors.textSecondary }}>
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Box>
                    </Box>
                    <Link
                      href={`/blog/${post.slug}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Box sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 1, "&:hover": { color: colors.green } }}>
                        {post.title}
                      </Box>
                    </Link>
                    <Box sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.7 }}>
                      {post.description}
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          );
        })}

        <CtaBanner text="Ready to put these tips into action?" buttonText="Start Earning" />
      </PageContainer>
    </MarketingLayout>
  );
}
