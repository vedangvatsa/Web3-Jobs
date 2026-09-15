/**
 * Sync upcoming Web3 events from Luma's /crypto category (multi-geo discover API)
 * and linked hub calendars into content/luma-crypto-events.json.
 *
 * Usage: npx tsx scripts/sync-luma-crypto-events.ts [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { getEventBaseSlug } from '../src/lib/events';

const OUTPUT = path.join('content', 'luma-crypto-events.json');
const UA = 'HashtagWeb3 Luma Sync/1.0 (+https://hashtagweb3.com)';

const GEO_HUBS = [
  { label: 'India', lat: 28.6139, lng: 77.209 },
  { label: 'US-East', lat: 40.7128, lng: -74.006 },
  { label: 'US-West', lat: 37.7749, lng: -122.4194 },
  { label: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { label: 'UAE', lat: 25.2048, lng: 55.2708 },
  { label: 'UK', lat: 51.5074, lng: -0.1278 },
  { label: 'Korea', lat: 37.5665, lng: 126.978 },
  { label: 'Germany', lat: 52.52, lng: 13.405 },
  { label: 'Japan', lat: 35.6762, lng: 139.6503 },
  { label: 'Australia', lat: -33.8688, lng: 151.2093 },
];

const SPAMMY =
  /earn (crypto|money|income)|passive income|get rich|financial freedom|trading signal|forex|scam|live zoom|webinar|100x|millionaire|double your|guaranteed (profit|return)/i;
const NON_WEB3 =
  /bodywork|breakup|badminton|pilates|pottery|baking|cooking class|ibm storage|user group event|keychains|film festival|mental health|climate action|charcha|impact-|viksit bharat|career crisis|international generalist|nyfw|jrat qvc|finissage|wellness & networking|ripple making|for kids|for families|children|toddler|outdoor workout|reform room|wind take you|data jam|electronics and computing|ssis|culture club|bestie|charming|yoga|meditation retreat|dog walk|cat cafe/i;
const WEB3_VOCAB =
  /crypto|bitcoin|btc\b|ethereum|\beth\b|ethglobal|ethcc|blockchain|web ?3|defi|nfts?|solana|dao|token2049|xrp|ripple|zk\b|zksync|zero.?knowledge|superteam|pragma|hyperliquid|onchain|on-chain|lido|polygon|arbitrum|optimism|base chain|coinbase|binance|airdrop|wallet|dapp|smart contract|layer ?2|metaverse|gamefi|staking|yield|digital asset|decentralized|cardano|cosmos|polkadot|monad|aptos|\bsui\b|chainlink|devcon|breakpoint|kbw|ibw|unchained|founders? dinner|vip dinner|afterparty|rooftop|networking|mixer|side event|coworking|co-working|launchpad|happy hour|lounge|meetup|hackathon|hacker ?house|builder ?house|buidl|solidity|uniswap|aave|makerdao|starknet|near protocol|near\b|toncoin|\bton\b|encode|trading|stablecoin|perp|dex\b|rwa|depin|vc\b|investor|capital|finance onchain|tradfi|web3/i;

const SOURCE_FILES = [
  'content/curated-events.json',
  'content/kbw-luma-events.json',
  'content/ibw-side-events.json',
  'content/india-luma-events.json',
  'content/events-cache.json',
];

type LumaApiEvent = {
  api_id: string;
  name: string;
  start_at: string;
  end_at?: string;
  url: string;
  cover_url?: string | null;
  social_image_url?: string | null;
  location_type?: string;
  geo_address_info?: {
    city?: string;
    country?: string;
    full_address?: string;
    address?: string;
  };
  calendar_api_id?: string;
};

type StoredEvent = {
  id: string;
  slug: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  city?: string;
  country?: string;
  location: string;
  url: string;
  registrationUrl?: string;
  coverImage?: string | null;
  source: 'luma-crypto';
  sideEventFor?: string[];
};

function normLumaUrl(urlOrSlug: string): string {
  const slug = urlOrSlug.replace(/^https?:\/\/(www\.)?(lu\.ma|luma\.com)\//i, '').replace(/\/$/, '').split('?')[0];
  return `https://luma.com/${slug.toLowerCase()}`;
}

function lumaSlugFromUrl(url: string): string {
  const m = url.match(/luma\.com\/([a-z0-9_-]+)/i);
  return m?.[1].toLowerCase() || '';
}

function loadKnownUrls(): Set<string> {
  const known = new Set<string>();
  for (const file of SOURCE_FILES) {
    if (!fs.existsSync(file)) continue;
    const raw = fs.readFileSync(file, 'utf8');
    for (const m of raw.matchAll(/https?:\/\/(?:lu\.ma|luma\.com)\/([a-zA-Z0-9_-]+)/gi)) {
      known.add(normLumaUrl(m[0]));
    }
  }
  return known;
}

function loadReservedSlugs(): Set<string> {
  const reserved = new Set<string>();
  for (const file of SOURCE_FILES) {
    if (!fs.existsSync(file)) continue;
    try {
      const events = JSON.parse(fs.readFileSync(file, 'utf8')) as Array<{ slug?: string; name?: string }>;
      if (!Array.isArray(events)) continue;
      for (const e of events) {
        if (e.slug) reserved.add(e.slug.toLowerCase());
        if (e.name) reserved.add(getEventBaseSlug({ name: e.name }));
      }
    } catch {
      /* ignore */
    }
  }
  const routes = [
    'jobs', 'blog', 'glossary', 'companies', 'community', 'learn', 'news', 'developers', 'events', 'contact', 'privacy',
  ];
  routes.forEach((r) => reserved.add(r));
  return reserved;
}

const WEB3_STRONG =
  /crypto|cryptocurrency|bitcoin|btc\b|ethereum|\beth\b|ethglobal|ethcc|blockchain|web ?3|defi|nfts?|solana|dao\b|token2049|xrp\b|ripple|zk\b|zksync|superteam|pragma\b|hyperliquid|onchain|on-chain|polygon|arbitrum|optimism|coinbase|binance|airdrop|wallet|smart contract|layer ?2|starknet|monad\b|aptos|\bsui\b|chainlink|devcon|breakpoint|kbw|ibw|unchained|hackathon|hacker ?house|builder ?house|buidl|solidity|uniswap|aave|makerdao|near protocol|\bnear\b|toncoin|encode club|founders? dinner|afterparty|side event|coworking.*web3|web3.*coworking|tradfi.*onchain|onchain.*finance|perp|dex\b|rwa\b|depin|stablecoin|digital asset|decentralized finance|metamask|trezor|bitcoin only|lightning network/i;
const WEAK_ONLY =
  /networking|mixer|happy hour|meetup|investor|vc\b|venture capital|capital forum|biotech|k-pop|mahj|margs|corgi|working moms|movie night|kindergarten|stripe developer|ruby coworking|cyber ladies|autonomy in motion|drone|uav|hardware meetup|lp series|realtor|junk-a-haulics|geo meetup|coworking day|female founders circle|life sciences|parent mixer|top golf|neurotech(?!.*web3)|financial networking|broker happy hour|code & coffee/i;

function passesQuality(e: LumaApiEvent): boolean {
  const name = e.name || '';
  if (SPAMMY.test(name) || NON_WEB3.test(name)) return false;
  if (WEAK_ONLY.test(name) && !WEB3_STRONG.test(name)) return false;
  const hasCore = /\b(crypto|cryptocurrency|blockchain|web ?3|defi|solana|ethereum|bitcoin|btc|nft|dao|token2049|onchain|stablecoin|airdrop|wallet|hackathon|devcon|kbw|ibw|superteam|metamask|uniswap|hyperliquid|monad|starknet)\b/i.test(name);
  if (!WEB3_STRONG.test(name) && !hasCore) return false;
  if (e.location_type === 'online' && !/\b(zoom|online|virtual)\b/i.test(name)) return false;
  if (/participant list/i.test(name)) return false;
  return true;
}

function buildDescription(e: LumaApiEvent): string {
  const city = e.geo_address_info?.city?.trim();
  const country = e.geo_address_info?.country?.trim();
  const where = city && country ? `${city}, ${country}` : city || country || 'TBA';
  const headline = e.name.split(/[|·]/)[0].trim();
  return `${headline} — Web3 community event in ${where}.`;
}

function buildLocation(e: LumaApiEvent): { city: string; country: string; location: string } {
  const geo = e.geo_address_info || {};
  const city = (geo.city || '').trim();
  const country = (geo.country || '').trim();
  const venue = (geo.full_address || geo.address || '').trim();
  const location =
    venue || (city && country ? `${city}, ${country}` : city || country || 'TBA');
  return { city, country, location };
}

function inferSideEvents(e: LumaApiEvent): string[] | undefined {
  const text = e.name.toLowerCase();
  const start = e.start_at.slice(0, 10);
  const city = (e.geo_address_info?.city || '').toLowerCase();
  const side: string[] = [];
  if (/kbw|korea blockchain week/i.test(text) || (city.includes('seoul') && start >= '2026-09-21' && start <= '2026-09-28')) {
    side.push('kbw');
  }
  if (/ibw|india blockchain week/i.test(text) || (city.includes('mumbai') && start >= '2026-11-01' && start <= '2026-11-08')) {
    side.push('ibw');
  }
  if (/devcon|ethglobal mumbai/i.test(text)) side.push('devcon');
  if (/token2049|breakpoint/i.test(text)) {
    if (/singapore/i.test(e.geo_address_info?.country || '')) side.push('token2049');
    if (/abu dhabi|dubai|uae/i.test(`${e.geo_address_info?.country || ''} ${city}`)) side.push('breakpoint');
  }
  return side.length ? [...new Set(side)] : undefined;
}

function proposeSlug(name: string, lumaPath: string, taken: Set<string>, startDate: string): string {
  const fromName = getEventBaseSlug({ name });
  const fromPath = lumaPath.replace(/[^a-z0-9]/gi, '').slice(0, 6);
  const day = startDate.slice(8, 10).replace(/^0/, '');
  let base = fromName.length <= 10 ? fromName : fromName.slice(0, 10);
  if (base.length < 3 && fromPath.length >= 4) base = fromPath;
  if (base.length < 3) base = 'lc';

  let slug = base;
  let n = 2;
  while (taken.has(slug)) {
    slug = n === 2 && fromPath.length >= 3 ? `${base}${fromPath.slice(0, 3)}` : `${base}${n}`;
    n++;
  }
  if (taken.has(slug) && slug.length <= 8) slug = `${base}${day}`;
  n = 2;
  while (taken.has(slug)) slug = `${base}${n++}`;
  taken.add(slug);
  return slug;
}

async function fetchCategoryEvents(lat: number, lng: number): Promise<Map<string, LumaApiEvent>> {
  const out = new Map<string, LumaApiEvent>();
  let cursor: string | null = null;
  for (let page = 0; page < 25; page++) {
    let url = `https://api.lu.ma/discover/get-paginated-events?category_api_id=cat-crypto&pagination_limit=100&latitude=${lat}&longitude=${lng}`;
    if (cursor) url += `&pagination_cursor=${encodeURIComponent(cursor)}`;
    const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': UA } });
    if (!res.ok) break;
    const data = (await res.json()) as {
      entries?: Array<{ event: LumaApiEvent }>;
      has_more?: boolean;
      next_cursor?: string | null;
    };
    for (const entry of data.entries || []) {
      if (entry.event?.api_id) out.set(entry.event.api_id, entry.event);
    }
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
    await new Promise((r) => setTimeout(r, 120));
  }
  return out;
}

async function fetchHubCalendars(): Promise<string[]> {
  const html = await (await fetch('https://luma.com/crypto', { headers: { 'user-agent': UA } })).text();
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) return [];
  const next = JSON.parse(m[1]) as { props?: { pageProps?: { initialData?: { data?: { timeline_calendars?: Array<{ calendar?: { slug?: string } }>; featured_calendars?: Array<{ calendar?: { slug?: string } }> } } } } };
  const data = next.props?.pageProps?.initialData?.data;
  const slugs = new Set<string>();
  for (const row of [...(data?.timeline_calendars || []), ...(data?.featured_calendars || [])]) {
    if (row.calendar?.slug) slugs.add(row.calendar.slug);
  }
  return [...slugs];
}

async function fetchCalendarPageEvents(slug: string): Promise<LumaApiEvent[]> {
  const res = await fetch(`https://luma.com/${encodeURIComponent(slug)}`, { headers: { 'user-agent': UA } });
  if (!res.ok) return [];
  const html = await res.text();
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) return [];
  const events: LumaApiEvent[] = [];
  const walk = (obj: unknown) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }
    const o = obj as Record<string, unknown>;
    if (typeof o.api_id === 'string' && o.api_id.startsWith('evt-') && typeof o.name === 'string' && typeof o.start_at === 'string') {
      events.push(o as LumaApiEvent);
    }
    Object.values(o).forEach(walk);
  };
  walk(JSON.parse(m[1]));
  const byId = new Map<string, LumaApiEvent>();
  events.forEach((e) => byId.set(e.api_id, e));
  return [...byId.values()];
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const knownUrls = loadKnownUrls();
  const takenSlugs = loadReservedSlugs();

  const existingById = new Map<string, StoredEvent>();
  if (fs.existsSync(OUTPUT)) {
    try {
      for (const e of JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) as StoredEvent[]) {
        existingById.set(e.id, e);
        if (e.slug) takenSlugs.add(e.slug.toLowerCase());
      }
    } catch {
      /* fresh file */
    }
  }

  const merged = new Map<string, LumaApiEvent>();
  for (const hub of GEO_HUBS) {
    const batch = await fetchCategoryEvents(hub.lat, hub.lng);
    console.log(`${hub.label}: ${batch.size} events`);
    for (const [id, ev] of batch) merged.set(id, ev);
  }

  const hubSlugs = await fetchHubCalendars();
  console.log(`Hub calendars: ${hubSlugs.length}`);
  for (const slug of hubSlugs) {
    const events = await fetchCalendarPageEvents(slug);
    for (const e of events) merged.set(e.api_id, e);
    await new Promise((r) => setTimeout(r, 100));
  }

  const now = Date.now();
  const candidates = [...merged.values()].filter(
    (e) => new Date(e.start_at).getTime() > now - 86400000 && passesQuality(e),
  );

  const nextEvents: StoredEvent[] = [];
  let skippedKnown = 0;
  let skippedQuality = 0;

  for (const e of merged.values()) {
    if (new Date(e.start_at).getTime() <= now - 86400000) continue;
    if (!passesQuality(e)) skippedQuality++;
  }

  for (const e of candidates) {
    const url = normLumaUrl(e.url);
    if (knownUrls.has(url)) {
      skippedKnown++;
      continue;
    }

    const id = `luma-crypto-${e.api_id.replace(/^evt-/, '')}`;
    const prev = existingById.get(id);
    const { city, country, location } = buildLocation(e);
    const slug = prev?.slug || proposeSlug(e.name, lumaSlugFromUrl(url), takenSlugs, e.start_at);

    nextEvents.push({
      id,
      slug,
      name: e.name.trim(),
      description: prev?.description || buildDescription(e),
      startDate: e.start_at,
      endDate: e.end_at || e.start_at,
      city: city || undefined,
      country: country || undefined,
      location,
      url,
      registrationUrl: url,
      coverImage: e.cover_url || e.social_image_url || null,
      source: 'luma-crypto',
      sideEventFor: inferSideEvents(e),
    });
    knownUrls.add(url);
  }

  nextEvents.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name));

  console.log('\nMerged raw:', merged.size);
  console.log('Quality upcoming:', candidates.length);
  console.log('Skipped (already listed elsewhere):', skippedKnown);
  console.log('New luma-crypto records:', nextEvents.length);

  if (dryRun) {
    console.log('\nDry run — sample new events:');
    nextEvents.slice(0, 15).forEach((e) => console.log(`  /${e.slug}  ${e.startDate.slice(0, 10)}  ${e.name.slice(0, 55)}`));
    return;
  }

  fs.writeFileSync(OUTPUT, `${JSON.stringify(nextEvents, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
