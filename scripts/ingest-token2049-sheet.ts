import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const rootDir = process.cwd();
const csvPath = '/tmp/google_sheet_events.csv';
const xmlPath = '/tmp/sheet_extracted/xl/worksheets/sheet1.xml';
const curatedPath = path.join(rootDir, 'content', 'curated-events.json');
const cachePath = path.join(rootDir, 'content', 'events-cache.json');

interface RawEvent {
  excelRow: number;
  eventId: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  eventName: string;
  category: string;
  price: string;
  url: string;
}

interface Web3Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  city?: string;
  country?: string;
  location: string;
  month?: string;
  url: string;
  website?: string | null;
  coverImage: string | null;
  twitter?: string | null;
  source?: string;
  slug?: string;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(cur);
        cur = '';
      } else if (c === '\r') {
        // ignore
      } else if (c === '\n') {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = '';
      } else {
        cur += c;
      }
    }
  }
  if (cur || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function parseSgtDateTime(dateStr: string, timeStr: string): string | null {
  const dayMatch = dateStr.match(/(\d+)\s+October/i);
  if (!dayMatch) return null;
  const day = parseInt(dayMatch[1], 10);

  let hours = 9;
  let minutes = 0;
  if (timeStr && timeStr.trim()) {
    const tMatch = timeStr.trim().match(/(\d+)(?::(\d+))?\s*(AM|PM)?/i);
    if (tMatch) {
      hours = parseInt(tMatch[1], 10);
      minutes = tMatch[2] ? parseInt(tMatch[2], 10) : 0;
      const ampm = tMatch[3] ? tMatch[3].toUpperCase() : '';
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }

  // Singapore is SGT = UTC+8. UTC = SGT - 8 hours
  const date = new Date(Date.UTC(2026, 9, day, hours - 8, minutes, 0));
  return date.toISOString();
}

function parseSgtRange(dateStr: string, startStr: string, endStr: string): { startDate: string; endDate: string } {
  let startDate = parseSgtDateTime(dateStr, startStr) || '2026-10-05T01:00:00.000Z';
  let endDate = parseSgtDateTime(dateStr, endStr);

  if (endDate) {
    const sTime = new Date(startDate).getTime();
    let eTime = new Date(endDate).getTime();
    if (eTime <= sTime) {
      // Overnight event into next morning
      eTime += 24 * 60 * 60 * 1000;
      endDate = new Date(eTime).toISOString();
    }
  } else {
    // Default 3 hours duration
    endDate = new Date(new Date(startDate).getTime() + 3 * 3600 * 1000).toISOString();
  }

  return { startDate, endDate };
}

function cleanUrlForCompare(u: string): string {
  if (!u) return '';
  let clean = u.trim().toLowerCase();
  clean = clean.split('#')[0].split('?')[0].replace(/\/+$/, '');
  clean = clean.replace(/^https?:\/\//, '').replace(/^www\./, '');
  clean = clean.replace(/^luma\.com\//, 'lu.ma/');
  return clean;
}

function cleanTitle(t: string): string {
  return (t || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[-\s]+/g, '-');
}

async function fetchLumaOrWebMetadata(url: string): Promise<{ description: string | null; coverImage: string | null }> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(6000),
      redirect: 'follow',
    });

    if (!res.ok) return { description: null, coverImage: null };
    const html = await res.text();
    const $ = cheerio.load(html);

    let desc = $('meta[property="og:description"]').attr('content') ||
               $('meta[name="description"]').attr('content') ||
               $('meta[name="twitter:description"]').attr('content') || null;

    let img = $('meta[property="og:image"]').attr('content') ||
              $('meta[name="og:image"]').attr('content') ||
              $('meta[property="twitter:image"]').attr('content') || null;

    if (desc) {
      desc = desc.replace(/\s+/g, ' ').trim();
      if (desc.length < 30) desc = null;
    }

    if (img && !img.startsWith('http')) {
      try {
        img = new URL(img, url).toString();
      } catch {
        img = null;
      }
    }

    return { description: desc, coverImage: img };
  } catch {
    return { description: null, coverImage: null };
  }
}

async function main() {
  console.log('🚀 Starting TOKEN2049 Singapore side events ingestion...');

  if (!fs.existsSync(csvPath) || !fs.existsSync(xmlPath)) {
    console.log('No Google Sheet export files found in /tmp, skipping TOKEN2049 sheet ingestion.');
    return;
  }

  // 1. Read XML to extract cell H hyperlink formulas
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const rowToUrl: Record<string, string> = {};
  const regex = /<c r="H(\d+)"[^>]*><f>HYPERLINK\(&quot;([^&]+)&quot;/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    rowToUrl[match[1]] = match[2];
  }
  console.log(`Extracted ${Object.keys(rowToUrl).length} cell URLs from sheet1.xml`);

  // 2. Read existing events
  const curated: Web3Event[] = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));
  const cache: Web3Event[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const allExisting = [...curated, ...cache];
  const existingCleanUrls = new Map<string, Web3Event>();
  allExisting.forEach(e => {
    const cu = cleanUrlForCompare(e.url);
    if (cu && cu.length > 5) existingCleanUrls.set(cu, e);
  });
  const existingIds = new Set(allExisting.map(e => e.id));
  const existingSlugs = new Set(allExisting.map(e => e.slug).filter(Boolean));

  // 3. Parse CSV rows
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(csvText);

  const rawEvents: RawEvent[] = [];

  rows.forEach((r, idx) => {
    const excelRow = idx + 1;
    const eventId = r[0];
    const dateStr = r[1];
    const startTime = r[2];
    const endTime = r[3];
    const eventName = r[4];
    const category = r[5];
    const price = r[6];
    let url = rowToUrl[excelRow] || r[7] || '';

    // Ignore headers, non-events, and obvious test entries
    if (!eventName || eventName === 'Event' || !dateStr || !dateStr.includes('October')) {
      return;
    }
    if (eventName.toLowerCase().includes('new-design-test') || url.includes('localhost')) {
      return;
    }

    rawEvents.push({
      excelRow,
      eventId,
      dateStr,
      startTime,
      endTime,
      eventName: eventName.trim(),
      category: category.trim(),
      price: price.trim(),
      url: url.trim(),
    });
  });

  console.log(`Parsed ${rawEvents.length} events from Google Sheet`);

  // 4. Deduplicate against existing events
  const missingRawEvents: RawEvent[] = [];
  let alreadyMatchedCount = 0;

  for (const raw of rawEvents) {
    let resolvedUrl = raw.url;

    // Normalizations for well-known entries
    if (resolvedUrl === 'Coming Soon' || raw.eventName.includes('AFTER 2049')) {
      resolvedUrl = 'https://asia.token2049.com/after2049';
    } else if (resolvedUrl.startsWith('coinferencex.com')) {
      resolvedUrl = 'https://' + resolvedUrl;
    } else if (resolvedUrl === 'Link' && raw.eventName.includes('All That Matters')) {
      resolvedUrl = 'https://events.bizzabo.com/atm26';
    } else if (resolvedUrl === 'Invite Only' && raw.eventName.includes('TOKEN2049')) {
      resolvedUrl = 'https://asia.token2049.com';
    } else if (resolvedUrl === 'Invite Only' && raw.eventName.includes('Forbes')) {
      resolvedUrl = 'https://www.forbes.com/forbes-live-events/global-ceo-conference/';
    } else if (resolvedUrl.includes('soliduslabs.com')) {
      resolvedUrl = 'https://www.soliduslabs.com';
    } else if (resolvedUrl.toLowerCase().includes('invite only') && raw.eventName.includes('Agentic Finance')) {
      resolvedUrl = 'https://mnm.live/agentic-finance';
    } else if (resolvedUrl.startsWith('luma.com')) {
      resolvedUrl = 'https://' + resolvedUrl;
    } else if (resolvedUrl.startsWith('http://localhost')) {
      continue;
    }

    raw.url = resolvedUrl;

    const cUrl = cleanUrlForCompare(raw.url);
    const cTitle = cleanTitle(raw.eventName);

    let matchFound = false;
    if (cUrl && existingCleanUrls.has(cUrl)) {
      matchFound = true;
    }

    if (!matchFound) {
      for (const ex of allExisting) {
        const exTitle = cleanTitle(ex.name);
        if (exTitle === cTitle) {
          matchFound = true;
          break;
        }
        if (cTitle.length > 12 && (exTitle.includes(cTitle) || cTitle.includes(exTitle))) {
          matchFound = true;
          break;
        }
      }
    }

    if (matchFound) {
      alreadyMatchedCount++;
    } else {
      missingRawEvents.push(raw);
    }
  }

  console.log(`Matched with existing: ${alreadyMatchedCount}`);
  console.log(`To be ingested: ${missingRawEvents.length}`);

  // 5. Enrich with metadata (descriptions, banners)
  console.log('Fetching live metadata and cover banners...');
  const newEvents: Web3Event[] = [];
  const CONCURRENCY = 8;

  for (let i = 0; i < missingRawEvents.length; i += CONCURRENCY) {
    const chunk = missingRawEvents.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async item => {
        let metaDesc: string | null = null;
        let metaCover: string | null = null;

        if (item.url.startsWith('http')) {
          const fetched = await fetchLumaOrWebMetadata(item.url);
          metaDesc = fetched.description;
          metaCover = fetched.coverImage;
        }

        const { startDate, endDate } = parseSgtRange(item.dateStr, item.startTime, item.endTime);

        // Fallback description if meta description is unavailable
        let desc = metaDesc;
        if (!desc || desc.length < 40) {
          const catText = item.category ? `${item.category.toLowerCase()} event` : 'Web3 gathering';
          const priceNote = item.price && item.price !== 'Free' ? ` Tickets: ${item.price}.` : (item.price === 'Free' ? ' Free admission with registration.' : '');
          desc = `${item.eventName} is an official ${catText} taking place during TOKEN2049 Singapore Week. Join crypto founders, protocol builders, investors, and Web3 enthusiasts for high-signal discussions, networking, and ecosystem collaborations in Singapore.${priceNote}`;
        }

        // Clean up URL formatting
        let cleanUrl = item.url;
        if (cleanUrl.includes('luma.com/')) {
          cleanUrl = cleanUrl.replace('luma.com/', 'lu.ma/');
        }

        // Base ID and slug
        let baseSlug = slugify(item.eventName);
        if (!baseSlug) baseSlug = `token2049-sg-${item.excelRow}`;
        let slug = baseSlug;
        let counter = 1;
        while (existingSlugs.has(slug)) {
          slug = `${baseSlug}-${counter++}`;
        }
        existingSlugs.add(slug);

        let id = `token2049-sg-${slug}`;
        if (existingIds.has(id)) {
          id = `token2049-sg-${slug}-${Date.now().toString(36)}`;
        }
        existingIds.add(id);

        const eventObj: Web3Event = {
          id,
          name: item.eventName,
          description: desc,
          startDate,
          endDate,
          city: 'Singapore',
          country: 'Singapore',
          location: 'Singapore',
          month: 'October 2026',
          url: cleanUrl,
          coverImage: metaCover || null,
          source: 'token2049-sheet',
          slug,
        };

        return eventObj;
      })
    );

    newEvents.push(...results);
    console.log(`Processed ${Math.min(i + CONCURRENCY, missingRawEvents.length)} / ${missingRawEvents.length} events...`);
  }

  console.log(`\nSuccessfully enriched ${newEvents.length} new events!`);

  // 6. Append to content/events-cache.json
  const updatedCache = [...cache, ...newEvents];
  fs.writeFileSync(cachePath, JSON.stringify(updatedCache, null, 2), 'utf8');
  console.log(`✅ Saved ${newEvents.length} events to ${cachePath}. Total cache size: ${updatedCache.length}`);

  // Summary statistics
  const withImages = newEvents.filter(e => !!e.coverImage).length;
  console.log(`Events with high-res cover banners: ${withImages} / ${newEvents.length} (${Math.round((withImages / newEvents.length) * 100)}%)`);
}

main().catch(err => {
  console.error('Error during ingestion:', err);
  process.exit(1);
});
