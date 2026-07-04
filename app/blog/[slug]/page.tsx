import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Box, Chip } from "@mui/material";
import MarketingLayout from "@/components/marketing/marketing-layout";
import JsonLd from "@/components/marketing/json-ld";
import {
  PageContainer,
  CtaBanner,
  RelatedLinks,
} from "@/components/marketing/seo-sections";
import { BLOG_POSTS, getBlogPostBySlug } from "@/lib/content/blog-posts";
import { buildStandardPageGraph } from "@/lib/content/schema";
import colors from "@/theme/colors";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.rewardoxy.app/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = buildStandardPageGraph({
    webPage: {
      name: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
    },
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ],
    blogPosting: {
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      datePublished: post.date,
    },
  });

  return (
    <MarketingLayout>
      <JsonLd graph={jsonLd} />
      <PageContainer>
        <Box sx={{ mb: 1 }}>
          <Chip
            label={post.category}
            size="small"
            sx={{ bgcolor: colors.greenTint, color: colors.green, fontSize: "0.75rem" }}
          />
        </Box>
        <Box component="h1" sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" }, fontWeight: 800, mb: 2, lineHeight: 1.3 }}>
          {post.title}
        </Box>
        <Box sx={{ color: colors.textSecondary, fontSize: "0.875rem", mb: 4 }}>
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Box>

        {post.sections.map((section, i) => (
          <Box key={i} sx={{ mb: 4 }}>
            {section.heading && (
              <Box component="h2" sx={{ fontSize: "1.25rem", fontWeight: 700, mb: 2 }}>
                {section.heading}
              </Box>
            )}
            {section.paragraphs?.map((para, j) => (
              <Box
                key={j}
                sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: "0.95rem" }}
              >
                {para}
              </Box>
            ))}
            {section.bullets && (
              <Box component="ul" sx={{ color: colors.textSecondary, lineHeight: 2, pl: 3 }}>
                {section.bullets.map((bullet, k) => (
                  <Box component="li" key={k}>{bullet}</Box>
                ))}
              </Box>
            )}
          </Box>
        ))}

        <RelatedLinks links={post.relatedLinks} />

        <CtaBanner text="Ready to start earning on Rewardoxy?" buttonText="Sign Up Free" />

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Link href="/blog" style={{ color: colors.green, textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to Blog
          </Link>
        </Box>
      </PageContainer>
    </MarketingLayout>
  );
}
