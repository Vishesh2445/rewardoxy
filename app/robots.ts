import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/profile/',
          '/history/',
          '/cashout/',
          '/daily-bonus/',
          '/banned/',
          '/my-offers/',
          '/offers/',
        ],
      },
    ],
    sitemap: 'https://www.rewardoxy.app/sitemap.xml',
  };
}
