import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.b2transport.in';
  
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
  
  const locationUrls = slugs.map((slug) => ({
    url: `${baseUrl}/locations/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...locationUrls,
  ];
}
