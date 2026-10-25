import { MetadataRoute } from 'next';
import { CONTENT_LAST_UPDATED, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Keep in sync with locationDatabase in src/app/locations/[slug]/page.tsx.
  const slugs = [
    "ranchi",
    "jamshedpur",
    "dhanbad",
    "bokaro",
    "hazaribagh",
    "deoghar",
    "giridih",
    "ramgarh"
  ];

  // Real "last changed" date instead of the build time, so Google can trust <lastmod>.
  const lastModified = new Date(CONTENT_LAST_UPDATED);

  const locationUrls = slugs.map((slug) => ({
    url: `${SITE_URL}/locations/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: slug === 'ranchi' ? 0.9 : 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    ...[
      '/services/house-shifting-van-ranchi',
      '/services/goods-transport-ranchi',
      '/services/interstate-shifting-ranchi',
      '/services/bike-car-transport-ranchi',
    ].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    ...locationUrls,
  ];
}
