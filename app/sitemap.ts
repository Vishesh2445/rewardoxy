import { MetadataRoute } from "next";
import { OFFERWALLS } from "@/lib/content/offerwalls";
import { COUNTRIES } from "@/lib/content/countries";
import { BLOG_POSTS } from "@/lib/content/blog-posts";

const BASE_URL = "https://www.rewardoxy.app";

const STATIC_PAGES: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.8 },
  { path: "/surveys", changeFrequency: "weekly", priority: 0.8 },
  { path: "/rewards", changeFrequency: "weekly", priority: 0.8 },
  { path: "/crypto-payout", changeFrequency: "weekly", priority: 0.8 },
  { path: "/offers", changeFrequency: "weekly", priority: 0.9 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.8 },
  { path: "/play-and-earn", changeFrequency: "weekly", priority: 0.8 },
  { path: "/app-trials", changeFrequency: "weekly", priority: 0.8 },
  { path: "/referral-program", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/leaderboard", changeFrequency: "daily", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const reviewEntries = OFFERWALLS.map((wall) => ({
    url: `${BASE_URL}/reviews/${wall.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const countryEntries = COUNTRIES.map((country) => ({
    url: `${BASE_URL}/country/${country.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogEntries = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...reviewEntries, ...countryEntries, ...blogEntries];
}
