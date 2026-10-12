import type { MetadataRoute } from 'next';
import cachedRoutes from '../../content/sitemap-routes.json';
import { isExpiredJobPath } from '@/lib/job-age-path';

type CachedSitemapRoute = {
  url: string;
  lastModified?: string;
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority?: number;
};

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  return (cachedRoutes as CachedSitemapRoute[]).filter(route => !isExpiredJobPath(new URL(route.url).pathname)).map((route) => ({
    url: route.url,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    lastModified: route.lastModified ? new Date(route.lastModified) : undefined,
  }));
}
