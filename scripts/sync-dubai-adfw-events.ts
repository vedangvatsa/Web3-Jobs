import fs from 'node:fs';
import path from 'node:path';
import { lumaSourcePatch, type LumaSnapshot } from './luma-source-record';
import type { Web3Event } from '../src/lib/events';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'luma-dubai');
fs.mkdirSync(CACHE_DIR, { recursive: true });

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchEventDetails(eventId: string, lumaUrl: string): Promise<Record<string, unknown> | null> {
  const cacheFile = path.join(CACHE_DIR, `${eventId}.json`);
  if (fs.existsSync(cacheFile)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    } catch {}
  }

  // Try API first
  try {
    const res = await fetch(`https://api.lu.ma/event/get?event_api_id=${eventId}`, {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json',
        'Referer': 'https://luma.com/dubaievents'
      }
    });
    if (res.ok) {
      const data = await res.json();
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
      return data;
    }
  } catch (err) {
    console.warn(`[sync-dubai] API fetch error for ${eventId}:`, (err as Error).message);
  }

  // Fallback to page scraping if API returned error
  try {
    const slug = lumaUrl.replace(/^https?:\/\/(www\.)?(lu\.ma|luma\.com)\//i, '').replace(/\/$/, '').split('?')[0];
    const res = await fetch(`https://luma.com/${slug}`, {
      headers: { 'User-Agent': UA }
    });
    if (res.ok) {
      const html = await res.text();
      const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (m) {
        const initial = JSON.parse(m[1]);
        const data = initial.props?.pageProps?.initialData?.data;
        if (data && data.api_id) {
          fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
          return data;
        }
      }
    }
  } catch (err) {
    console.warn(`[sync-dubai] Page scrape error for ${lumaUrl}:`, (err as Error).message);
  }

  return null;
}

async function main() {
  const fullListPath = '/tmp/dubaievents_full_list.json';
  if (!fs.existsSync(fullListPath)) {
    throw new Error('Missing /tmp/dubaievents_full_list.json');
  }

  const rawEntries = JSON.parse(fs.readFileSync(fullListPath, 'utf8'));
  console.log(`Processing ${rawEntries.length} calendar entries...`);

  const results: Array<{ entry: any; patch: Partial<Web3Event> | null; rawData: any }> = [];

  for (let i = 0; i < rawEntries.length; i++) {
    const entry = rawEntries[i];
    const ev = entry.event;
    const eventId = ev.api_id;
    const urlSlug = ev.url;
    const lumaUrl = urlSlug.startsWith('http') ? urlSlug : `https://luma.com/${urlSlug}`;

    process.stdout.write(`[${i + 1}/${rawEntries.length}] Fetching ${ev.name.slice(0, 40)}... `);

    const data = await fetchEventDetails(eventId, lumaUrl);
    if (!data) {
      console.log('FAILED');
      results.push({ entry, patch: null, rawData: null });
      continue;
    }

    try {
      const snapshot: LumaSnapshot = {
        url: lumaUrl,
        fetchedAt: new Date().toISOString(),
        method: 'luma-api',
        data
      };
      const patch = lumaSourcePatch(snapshot);
      console.log(`OK (desc: ${patch.description?.length ?? 0} chars)`);
      results.push({ entry, patch, rawData: data });
    } catch (err) {
      console.log(`PARSE ERROR: ${(err as Error).message}`);
      results.push({ entry, patch: null, rawData: data });
    }

    await delay(120);
  }

  fs.writeFileSync(path.join(CACHE_DIR, 'all_parsed_results.json'), JSON.stringify(results, null, 2));
  console.log(`Saved all results to ${path.join(CACHE_DIR, 'all_parsed_results.json')}`);
}

main().catch(console.error);
