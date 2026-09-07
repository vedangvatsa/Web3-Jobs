import fs from 'fs';
import path from 'path';
import sitemap from '../src/app/sitemap';

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

export async function generateSitemapJson(): Promise<SitemapJsonDoc> {
  const routes = await sitemap();

  const urls: SitemapJsonEntry[] = routes.map((route) => {
    const entry: SitemapJsonEntry = {
      url: route.url,
    };

    if (route.lastModified) {
      entry.lastmod =
        route.lastModified instanceof Date
          ? route.lastModified.toISOString().split('T')[0]
          : String(route.lastModified).split('T')[0];
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
  console.log('[sitemap-json] Generating machine-readable JSON sitemaps...');
  const sitemapData = await generateSitemapJson();
  const content = JSON.stringify(sitemapData, null, 2);

  const publicDir = path.join(process.cwd(), 'public');
  const wellKnownDir = path.join(publicDir, '.well-known');

  if (!fs.existsSync(wellKnownDir)) {
    fs.mkdirSync(wellKnownDir, { recursive: true });
  }

  const wellKnownPath = path.join(wellKnownDir, 'sitemap.json');
  const rootSitemapPath = path.join(publicDir, 'sitemap.json');

  fs.writeFileSync(wellKnownPath, content, 'utf8');
  fs.writeFileSync(rootSitemapPath, content, 'utf8');

  console.log(`[sitemap-json] Successfully generated ${sitemapData.urls.length} URLs in:`);
  console.log(`  -> ${wellKnownPath} (${(Buffer.byteLength(content, 'utf8') / 1024).toFixed(1)} KB)`);
  console.log(`  -> ${rootSitemapPath} (${(Buffer.byteLength(content, 'utf8') / 1024).toFixed(1)} KB)`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[sitemap-json] Failed to generate JSON sitemap:', err);
    process.exit(1);
  });
}
