import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import { lumaSourcePatch, object } from './luma-source-record';
import type { Web3Event } from '../src/lib/events';
import { canImportEvent } from './lib/event-retention.mjs';
import tombstones from '../content/event-tombstones.json';

const hash = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const write = (file: string, data: unknown) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

// 1. Tag the 9 existing cross-listed events with "ibw"
function tagExistingEvents() {
  const updates = [
    { file: 'content/events/sources/events-cache.json', id: 'w3v-perps--chai-with-hyprearn' },
    { file: 'content/events/sources/events-cache.json', id: 'luma-evt-Mr3xwAWeAXMdGam' },
    { file: 'content/events/sources/verified-discovery.json', id: 'discovery-evt-jHFnev6fVW7VZNJ' },
    { file: 'content/events/sources/verified-discovery.json', id: 'discovery-evt-mBETGg2pLhndBTP' },
    { file: 'content/events/sources/verified-discovery.json', id: 'discovery-evt-n7ByAuH2ZtA86Jf' },
    { file: 'content/events/sources/verified-discovery.json', id: 'discovery-evt-CrfUNgdw4aVQtjy' },
    { file: 'content/events/sources/verified-discovery.json', id: 'discovery-evt-mC0qvi7LT4zh1da' },
    { file: 'content/events/sources/india-luma-events.json', id: 'india-luma-4al1ai5x' },
    { file: 'content/events/sources/india-luma-events.json', id: 'india-luma-kfh8wkql' },
  ];

  for (const { file, id } of updates) {
    const list = JSON.parse(fs.readFileSync(file, 'utf8')) as Web3Event[];
    const item = list.find(e => e.id === id);
    if (item) {
      const current = new Set(item.sideEventFor || ['devcon']);
      current.add('ibw');
      item.sideEventFor = Array.from(current);
      write(file, list);
      console.log(`Tagged existing event ${id} with ibw in ${file}`);
    } else {
      console.warn(`Could not find ${id} in ${file}`);
    }
  }
}

// 2. Map of 45 missing events -> short one-word slug
const SLUG_MAP: Record<string, string> = {
  'indie-builders-dinner-2026': 'harkirat',
  '3xehz0zi': 'touchgrass',
  'padel-pickle-club': 'pickleball',
  'ccxd0wz0': 'cmosummit',
  '9vf77z15': 'walk404',
  '3m6mrikv': 'bughunters',
  'yhs0jlfx': 'mevibes',
  '9bhu9f28': 'cryptomondays',
  'vxs2cvjg': 'noslides',
  '7l76qryo': 'nopitches',
  '4iotvxh0': 'assassin',
  'uxs32jih': 'sechub',
  'Stark-Space-Mumbai-Day-1': 'starkday1',
  'qzlsn6lt': 'privacyhub',
  'bnmumbai26': 'buildernights',
  'claude-0yz1': 'claudecode',
  'stark-after-dark-mumbai': 'starkafterdark',
  'jjl2hz9z': 'armada',
  'dvu4zt0s': 'noslippage',
  'cfut7t9n': 'lowgas',
  'hashkey-demo-day-mumbai': 'hashkey',
  'stark-space-mumbai-day-2': 'starkday2',
  'gjfpaw4r': 'openhouse',
  '0g-builders-mumbai': 'zerog',
  'defi-69kr': 'defilunch',
  '1t7wknyp': 'clickoptions',
  'kydf59j8': 'undisclosed',
  'b2scefde': 'cafecompute',
  'rloppl7e': 'allowlist',
  'rkhah22j': 'seedphrases',
  'un1ip2l2': 'opendoors',
  '4o1mzip0': 'freshair',
  'il76d51q': 'l2beat',
  'd6v9he6d': 'coffeex',
  'phluxeas': 'womenweb3',
  'gmi3qcpz': 'foundervc',
  'defi-32af': 'deepflow',
  'ena53peq': 'ctparty',
  'hgkcvozg': 'zkfriends',
  'wtkth99f': 'daovote',
  'zmsks9jh': 'stepfarming',
  'hqe3sz43': 'onelastgm',
  'kwi8jlpk': 'clearsigning',
  'd054y35i': 'yachtrave',
  'odo7gaar': 'dontghost',
  'frontier-traders-india': 'frontiertraders',
};

async function main() {
  tagExistingEvents();

  const missingList = JSON.parse(fs.readFileSync('/tmp/missing-ibw-events.json', 'utf8')) as Array<{
    api_id: string;
    name: string;
    url: string;
    start_at: string;
  }>;

  const destination = 'content/events/sources/ibw-side-events.json';
  const stored = JSON.parse(fs.readFileSync(destination, 'utf8')) as Web3Event[];

  console.log(`Starting import of ${missingList.length} missing events into ${destination}...`);

  for (const item of missingList) {
    const lumaUrl = item.url;
    const urlKey = lumaUrl.split('/').pop()!;
    const slug = SLUG_MAP[urlKey];

    if (!slug) {
      console.error(`Missing slug mapping for: ${item.name} (${urlKey})`);
      continue;
    }

    console.log(`\nFetching ${item.name} (${lumaUrl}) -> /${slug}...`);

    let response: Response;
    try {
      response = await fetch(lumaUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(30000),
      });
    } catch (err: any) {
      console.error(`Failed to fetch ${lumaUrl}:`, err.message);
      continue;
    }

    if (!response.ok) {
      console.error(`HTTP ${response.status} fetching ${lumaUrl}`);
      continue;
    }

    const html = await response.text();
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
    const eventId = String(eventObj.api_id || item.api_id);

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
        const imgRes = await fetch(patch.coverImage, { signal: AbortSignal.timeout(30000) });
        if (imgRes.ok) {
          const original = Buffer.from(await imgRes.arrayBuffer());
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
    const pageTitle = $('title').text() || patch.name || item.name;
    const descText = patch.description || `${patch.name || item.name} in Mumbai during India Blockchain Week.`;

    const web3Event: Web3Event = {
      ...patch,
      id,
      name: patch.name || item.name,
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

    // Small polite delay between network calls
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  write(destination, stored);
  console.log(`\nSuccessfully wrote ${stored.length} events to ${destination}.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
