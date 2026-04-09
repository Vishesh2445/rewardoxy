import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://rewardoxy.app', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://rewardoxy.app/earn', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://rewardoxy.app/leaderboard', lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: 'https://rewardoxy.app/referrals', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://rewardoxy.app/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://rewardoxy.app/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: 'https://rewardoxy.app/terms', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];
}
