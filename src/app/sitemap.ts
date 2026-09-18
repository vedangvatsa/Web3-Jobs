import type { MetadataRoute } from 'next';
import cachedRoutes from '../../content/sitemap-routes.json';

type CachedSitemapRoute = {
  url: string;
  lastModified?: string;
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority?: number;
};

/** Precomputed at build time (scripts/generate-sitemap-json.ts) — no Worker crawl at runtime. */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return (cachedRoutes as CachedSitemapRoute[]).map((route) => ({
    url: route.url,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    lastModified: route.lastModified ? new Date(route.lastModified) : undefined,
  }));
}
