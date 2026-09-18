import fs from 'fs';
import path from 'path';
import type { MetadataRoute } from 'next';
import { buildSitemapRoutes } from '../src/lib/sitemap-build';

interface SitemapJsonEntry {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

interface SitemapJsonDoc {
  $schema: string;
  name: string;
  url: string;
  generatedAt: string;
  publisher: {
    name: string;
    url: string;
  };
  count: number;
  urls: SitemapJsonEntry[];
}

type SerializableRoute = {
  url: string;
  lastModified?: string;
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority?: number;
};

function toIsoDate(value: Date | string | undefined): string | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function serializeRoutes(routes: MetadataRoute.Sitemap): SerializableRoute[] {
  return routes.map((route) => ({
    url: route.url,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    lastModified: toIsoDate(route.lastModified),
  }));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function routesToXml(routes: SerializableRoute[]): string {
  const urlEntries = routes
    .map((route) => {
      const parts = [`    <loc>${escapeXml(route.url)}</loc>`];
      if (route.lastModified) {
        parts.push(`    <lastmod>${escapeXml(route.lastModified.split('T')[0])}</lastmod>`);
      }
      if (route.changeFrequency) {
        parts.push(`    <changefreq>${escapeXml(route.changeFrequency)}</changefreq>`);
      }
      if (typeof route.priority === 'number') {
        parts.push(`    <priority>${route.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
}

export async function generateSitemapJson(): Promise<SitemapJsonDoc> {
  const routes = await buildSitemapRoutes();
  const serialized = serializeRoutes(routes);

  const urls: SitemapJsonEntry[] = serialized.map((route) => {
    const entry: SitemapJsonEntry = { url: route.url };
    if (route.lastModified) {
      entry.lastmod = route.lastModified.split('T')[0];
    }
    if (route.changeFrequency) {
      entry.changefreq = route.changeFrequency;
    }
    if (typeof route.priority === 'number') {
      entry.priority = route.priority;
    }
    return entry;
  });

  return {
    $schema: 'https://schema.org/sitemap',
    name: 'Hashtag Web3',
    url: 'https://hashtagweb3.com',
    generatedAt: new Date().toISOString(),
    publisher: {
      name: 'Hashtag Web3',
      url: 'https://hashtagweb3.com',
    },
    count: urls.length,
    urls,
  };
}

async function main() {
  console.log('[sitemap-json] Building route list...');
  const routes = await buildSitemapRoutes();
  const serialized = serializeRoutes(routes);

  const contentDir = path.join(process.cwd(), 'content');
  const routesPath = path.join(contentDir, 'sitemap-routes.json');
  fs.mkdirSync(contentDir, { recursive: true });
  fs.writeFileSync(routesPath, `${JSON.stringify(serialized, null, 2)}\n`, 'utf8');
  console.log(`[sitemap-json] Wrote ${serialized.length} routes -> ${routesPath}`);

  const publicDir = path.join(process.cwd(), 'public');
  const wellKnownDir = path.join(publicDir, '.well-known');
  fs.mkdirSync(wellKnownDir, { recursive: true });

  const xml = routesToXml(serialized);
  const xmlPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(xmlPath, xml, 'utf8');
  console.log(`[sitemap-json] Wrote XML -> ${xmlPath} (${(Buffer.byteLength(xml, 'utf8') / 1024).toFixed(1)} KB)`);

  const urls: SitemapJsonEntry[] = serialized.map((route) => {
    const entry: SitemapJsonEntry = { url: route.url };
    if (route.lastModified) entry.lastmod = route.lastModified.split('T')[0];
    if (route.changeFrequency) entry.changefreq = route.changeFrequency;
    if (typeof route.priority === 'number') entry.priority = route.priority;
    return entry;
  });
  const sitemapData: SitemapJsonDoc = {
    $schema: 'https://schema.org/sitemap',
    name: 'Hashtag Web3',
    url: 'https://hashtagweb3.com',
    generatedAt: new Date().toISOString(),
    publisher: { name: 'Hashtag Web3', url: 'https://hashtagweb3.com' },
    count: urls.length,
    urls,
  };
  const content = JSON.stringify(sitemapData, null, 2);
  const wellKnownPath = path.join(wellKnownDir, 'sitemap.json');
  fs.writeFileSync(wellKnownPath, content, 'utf8');

  console.log(`[sitemap-json] Successfully generated ${sitemapData.urls.length} URLs in:`);
  console.log(`  -> ${wellKnownPath} (${(Buffer.byteLength(content, 'utf8') / 1024).toFixed(1)} KB)`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[sitemap-json] Failed to generate sitemap artifacts:', err);
    process.exit(1);
  });
}
