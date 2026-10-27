import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import { lumaSourcePatch, object } from './luma-source-record';
import type { Web3Event } from '../src/lib/events';
import { canImportEvent } from './lib/event-retention.mjs';
import tombstones from '../content/event-tombstones.json';

const hash = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const write = (file: string, data: unknown) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

const EVENTS_TO_IMPORT = [
  { slug: 'moneyinmotion', url: 'https://luma.com/z10bdk0l', cleanTitle: 'Money in Motion: The Future of Cross-Border Payments' },
  { slug: 'pavbhaji', url: 'https://luma.com/pav-bhaji', cleanTitle: 'Achija Pav Bhaji Meetup' },
  { slug: 'paymentsnight', url: 'https://luma.com/qe2dcey1', cleanTitle: 'The Payments Night Mumbai Mixer' },
  { slug: 'longstable', url: 'https://luma.com/qwk7332m', cleanTitle: 'The Longs Table' },
  { slug: 'zecsycypherpunk', url: 'https://luma.com/ze1j2zv0', cleanTitle: 'ZECsy at ETH Cypherpunk Congress #3' },
  { slug: 'houseofhype', url: 'https://luma.com/x6m1zvfh', cleanTitle: 'House of HYPE: Hyperliquid India x Bitget Wallet' },
  { slug: 'zecsydevcon', url: 'https://luma.com/iaoyiiv7', cleanTitle: 'ZECsy at Devcon 8' },
  { slug: 'familyoffices', url: 'https://luma.com/FOIS_Mumbai', cleanTitle: 'Family Offices Investors Summit: Michelin Dinners Mumbai' },
  { slug: 'pizzaprotocols', url: 'https://luma.com/f72q8u4y', cleanTitle: 'Pizza, Protocols & People' },
  { slug: 'practicalprivacy', url: 'https://luma.com/h6e3ctg6', cleanTitle: 'Practical Privacy Day at Devcon Mumbai' },
  { slug: 'zcashforum', url: 'https://luma.com/3fid49nj', cleanTitle: 'Zcash Educational Forum & University Mixer' },
  { slug: 'indiahouse', url: 'https://luma.com/i4bpbsxn', cleanTitle: 'The India House' },
];

function fetchHtml(url: string): string {
  try {
    return execSync(`curl -sL "${url}" -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`, {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000,
    }).toString('utf8');
  } catch (err: any) {
    throw new Error(`curl failed for ${url}: ${err.message}`);
  }
}

function fetchBuffer(url: string): Buffer {
  try {
    return execSync(`curl -sL "${url}" -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`, {
      maxBuffer: 20 * 1024 * 1024,
      timeout: 30000,
    });
  } catch (err: any) {
    throw new Error(`curl buffer failed for ${url}: ${err.message}`);
  }
}

async function main() {
  const destination = 'content/events/sources/ibw-side-events.json';
  const stored = JSON.parse(fs.readFileSync(destination, 'utf8')) as Web3Event[];

  console.log(`Starting import of ${EVENTS_TO_IMPORT.length} events into ${destination}...`);

  for (const item of EVENTS_TO_IMPORT) {
    const lumaUrl = item.url;
    const slug = item.slug;

    console.log(`\nFetching ${item.cleanTitle} (${lumaUrl}) -> /${slug}...`);

    let html: string;
    try {
      html = fetchHtml(lumaUrl);
    } catch (err: any) {
      console.error(`Failed to fetch ${lumaUrl}:`, err.message);
      continue;
    }

    const fetchedAt = new Date().toISOString();
    const $ = cheerio.load(html);
    const raw = $('#__NEXT_DATA__').text();

    if (!raw) {
      console.error(`No __NEXT_DATA__ found at ${lumaUrl}`);
      continue;
    }

    let initial: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(raw);
      initial = object(object(object(object(parsed).props).pageProps).initialData);
    } catch (e: any) {
      console.error(`JSON parse error at ${lumaUrl}:`, e.message);
      continue;
    }

    const data = object(initial.data);
    const eventObj = object(data.event);
    const eventId = String(eventObj.api_id || '');

    if (!eventId.startsWith('evt-')) {
      console.error(`Invalid event ID ${eventId} at ${lumaUrl}`);
      continue;
    }

    const patch = lumaSourcePatch({ url: lumaUrl, fetchedAt, method: 'luma-page', data });

    // Optimize and store cover image if available
    let coverImageFilename: string | null = null;
    const existingImgs = fs.readdirSync('public/events').filter(f => f.startsWith(`${slug}-`) && f.endsWith('.webp'));
    if (existingImgs.length > 0) {
      coverImageFilename = `/events/${existingImgs[0]}`;
      console.log(`Reusing existing cover: public${coverImageFilename}`);
    } else if (patch.coverImage && patch.coverImage.startsWith('http')) {
      try {
        const original = fetchBuffer(patch.coverImage);
        if (original.length > 0) {
          const optimized = await sharp(original)
            .rotate()
            .resize({ width: 1500, height: 1500, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 88 })
            .toBuffer();
          const filename = `/events/${slug}-${hash(optimized).slice(0, 8)}.webp`;
          fs.writeFileSync(`public${filename}`, optimized);
          coverImageFilename = filename;
          console.log(`Saved optimized cover: public${filename}`);
        }
      } catch (err: any) {
        console.warn(`Could not optimize image for ${slug}:`, err.message);
      }
    }

    const id = `ibw-luma-${eventId}`;
    const pageTitle = $('title').text() || patch.name || item.cleanTitle;
    const descText = patch.description || `${item.cleanTitle} in Mumbai during India Blockchain Week.`;

    const web3Event: Web3Event = {
      ...patch,
      id,
      name: item.cleanTitle,
      description: descText,
      slug,
      url: lumaUrl,
      registrationUrl: lumaUrl,
      city: patch.city || 'Mumbai',
      country: patch.country || 'India',
      location: patch.location || 'Mumbai, India',
      source: 'curated-reviewed',
      sideEventFor: ['ibw', 'devcon'],
      coverImage: coverImageFilename,
      descriptionSource: {
        url: lumaUrl,
        fetchedAt,
        method: 'reviewed-primary-sources',
        pageTitle,
        sha256: hash(descText),
        evidence: [
          {
            url: lumaUrl,
            fetchedAt,
            sha256: hash(html),
            retrievedVia: 'Public primary HTTP response',
            representation: 'html',
          },
        ],
      },
    };

    if (!canImportEvent(web3Event, tombstones)) {
      console.warn(`Retention/tombstone prevents import for: ${id} (${slug})`);
      continue;
    }

    const existingIdx = stored.findIndex(e => e.id === id || e.slug === slug);
    if (existingIdx >= 0) {
      stored[existingIdx] = web3Event;
      console.log(`Updated existing entry in ibw-side-events: ${slug}`);
    } else {
      stored.push(web3Event);
      console.log(`Added new entry to ibw-side-events: ${slug}`);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  write(destination, stored);
  console.log(`\nSuccessfully wrote ${stored.length} events to ${destination}.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
