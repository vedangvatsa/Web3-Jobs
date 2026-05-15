import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ─── Web3 Relevance Filter ─────────────────────────────────────────────
const WEB3_KEYWORDS = [
  'web3', 'crypto', 'blockchain', 'bitcoin', 'btc', 'ethereum', 'eth ',
  'defi', 'nft', 'dao', 'dapp', 'solana', 'polygon', 'matic',
  'arbitrum', 'optimism', 'zk', 'layer 2', 'l2', 'rollup',
  'token', 'stablecoin', 'staking', 'smart contract', 'consensus',
  'decentralized', 'decentralisation', 'decentralization',
  'metaverse', 'gamefi', 'wallet', 'ledger', 'metamask', 'phantom',
  'ipfs', 'filecoin', 'arweave', 'cosmos', 'polkadot', 'avalanche',
  'near', 'sui', 'aptos', 'monad', 'chainlink', 'oracle',
  'eigenlayer', 'restaking', 'celestia', 'modular',
  'base', 'coinbase', 'binance', 'okx', 'kraken',
  'uniswap', 'aave', 'maker', 'compound', 'curve',
  'ethglobal', 'ethdenver', 'ethcc', 'devcon', 'token2049',
  'hackathon', 'buildathon', 'hacker house', 'mining', 'miner',
  'rwa', 'on-chain', 'onchain', 'protocol', 'mainnet', 'testnet',
  'airdrop', 'farcaster', 'lens', 'socialfi', 'digital asset',
  'memecoin', 'meme coin', 'pragma', 'starknet', 'wormhole',
  'layerzero', 'bridge', 'ordinal', 'brc-20', 'rune',
  'dex', 'cex', 'amm', 'liquidity', 'yield',
  'opensea', 'blur', 'nft', 'mint',
  'web 3', 'block chain', 'bit coin', 'ether',
  'tron', 'cardano', 'ripple', 'xrp', 'dogecoin', 'shiba',
  'depin', 'zkp', 'zero knowledge', 'zk-snark', 'zk-stark',
  'ico', 'ido', 'ieo', 'launchpad',
  'validator', 'node operator', 'proof of',
];

function isWeb3Relevant(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();
  return WEB3_KEYWORDS.some(kw => text.includes(kw));
}

// ─── Cities for Luma geo-discovery ──────────────────────────────────────
const LUMA_CITIES = [
  { lat: 40.7128, lng: -74.0060 },   // New York
  { lat: 37.7749, lng: -122.4194 },  // San Francisco
  { lat: 34.0522, lng: -118.2437 },  // Los Angeles
  { lat: 41.8781, lng: -87.6298 },   // Chicago
  { lat: 25.7617, lng: -80.1918 },   // Miami
  { lat: 30.2672, lng: -97.7431 },   // Austin
  { lat: 39.7392, lng: -104.9903 },  // Denver
  { lat: 47.6062, lng: -122.3321 },  // Seattle
  { lat: 42.3601, lng: -71.0589 },   // Boston
  { lat: 43.6532, lng: -79.3832 },   // Toronto
  { lat: 51.5074, lng: -0.1278 },    // London
  { lat: 48.8566, lng: 2.3522 },     // Paris
  { lat: 52.5200, lng: 13.4050 },    // Berlin
  { lat: 52.3676, lng: 4.9041 },     // Amsterdam
  { lat: 47.3769, lng: 8.5417 },     // Zurich
  { lat: 38.7223, lng: -9.1393 },    // Lisbon
  { lat: 1.3521, lng: 103.8198 },    // Singapore
  { lat: 25.2048, lng: 55.2708 },    // Dubai
  { lat: 22.3193, lng: 114.1694 },   // Hong Kong
  { lat: 35.6762, lng: 139.6503 },   // Tokyo
];

// ─── Eventbrite dimensions ──────────────────────────────────────────────
const EB_KEYWORDS = ['web3', 'crypto', 'blockchain', 'ethereum', 'bitcoin', 'defi', 'nft', 'solana', 'dao'];
const EB_REGIONS = [
  'online', 'united-states', 'united-kingdom', 'canada', 'australia',
  'singapore', 'germany', 'uae', 'india', 'france',
  'japan', 'south-korea', 'hong-kong', 'switzerland', 'netherlands',
  'spain', 'brazil', 'nigeria', 'thailand', 'portugal',
];

// ─── Meetup dimensions ─────────────────────────────────────────────────
const MEETUP_KEYWORDS = ['blockchain', 'web3', 'crypto', 'ethereum', 'bitcoin', 'defi', 'nft'];

// ═══════════════════════════════════════════════════════════════════════
// SOURCE 1: Luma (Geo Discovery API)
// ═══════════════════════════════════════════════════════════════════════
async function fetchLumaByCity(city) {
  const events = [];
  let cursor = null;
  let page = 0;

  while (page < 5) {
    let url = `https://api.lu.ma/discover/get-paginated-events?pagination_limit=50&latitude=${city.lat}&longitude=${city.lng}`;
    if (cursor) url += `&pagination_cursor=${cursor}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) break;
      const data = await res.json();
      const entries = data.entries || [];
      if (entries.length === 0) break;

      entries.forEach(entry => {
        const e = entry.event;
        if (!e) return;
        const geo = e.geo_address_info || {};
        events.push({
          id: `luma-${e.api_id}`,
          name: e.name,
          description: '',
          startDate: e.start_at,
          endDate: e.end_at,
          city: geo.city || '',
          country: geo.country || '',
          location: geo.city && geo.country ? `${geo.city}, ${geo.country}` : geo.city || geo.country || (e.location_type === 'online' ? 'Online' : 'TBA'),
          url: `https://lu.ma/${e.url || e.api_id}`,
          coverImage: e.cover_url || e.social_image_url || null,
          source: 'luma',
        });
      });

      cursor = data.next_cursor || null;
      if (!data.has_more || !cursor) break;
      page++;
    } catch { break; }
  }
  return events;
}

// Luma Crypto Hub
async function fetchLumaHub() {
  try {
    const res = await fetch('https://lu.ma/crypto', { headers: { 'User-Agent': UA, 'Accept': 'text/html' } });
    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(/id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!match) return [];
    const data = JSON.parse(match[1]);
    const items = data.props?.pageProps?.initialData?.data?.timeline_calendars || [];

    return items.map(item => {
      const cal = item.calendar;
      if (!cal) return null;
      return {
        id: `luma-${cal.api_id}`,
        name: cal.name,
        description: cal.description_short || '',
        startDate: item.start_at,
        endDate: item.end_at,
        city: cal.geo_city || '',
        country: cal.geo_country || '',
        location: [cal.geo_city, cal.geo_country].filter(Boolean).join(', ') || 'Virtual / TBA',
        url: `https://lu.ma/${cal.slug}`,
        coverImage: cal.cover_image_url || cal.social_image_url || null,
        source: 'luma',
      };
    }).filter(Boolean);
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════════════
// SOURCE 2: Eventbrite (JSON-LD ListItem scraping)
// ═══════════════════════════════════════════════════════════════════════
async function fetchEventbritePage(keyword, region, page = 1) {
  const url = `https://www.eventbrite.com/d/${region}/${keyword}/?page=${page}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const html = await res.text();

    const jsonLdBlocks = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
    const events = [];

    for (const block of jsonLdBlocks) {
      try {
        const json = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
        const parsed = JSON.parse(json);

        // Eventbrite uses itemListElement wrapper
        const items = parsed.itemListElement
          ? parsed.itemListElement.map(li => li.item).filter(Boolean)
          : (Array.isArray(parsed) ? parsed : [parsed]);

        for (const item of items) {
          if (item['@type'] !== 'Event') continue;

          const loc = item.location;
          let locationStr = 'Online';
          let city = '';
          let country = '';
          if (loc) {
            if (loc['@type'] === 'VirtualLocation') {
              locationStr = 'Online';
            } else if (loc.address) {
              city = loc.address.addressLocality || '';
              country = loc.address.addressCountry || '';
              locationStr = [city, country].filter(Boolean).join(', ') || loc.name || 'TBA';
            }
          }

          // Extract unique ID from URL
          const ticketId = item.url?.match(/tickets?-(\d+)/)?.[1] || item.url?.match(/(\d{10,})/)?.[1];

          events.push({
            id: `eb-${ticketId || item.name?.replace(/\s+/g, '-').slice(0, 80)}`,
            name: item.name,
            description: (item.description || '').slice(0, 200),
            startDate: item.startDate,
            endDate: item.endDate || item.startDate,
            city,
            country,
            location: locationStr,
            url: item.url,
            coverImage: item.image || null,
            source: 'eventbrite',
          });
        }
      } catch { /* skip */ }
    }
    return events;
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════════════
// SOURCE 3: Meetup.com (JSON-LD scraping)
// ═══════════════════════════════════════════════════════════════════════
async function fetchMeetupPage(keyword) {
  const url = `https://www.meetup.com/find/?keywords=${keyword}&source=EVENTS`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const html = await res.text();

    const jsonLdBlocks = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
    const events = [];

    for (const block of jsonLdBlocks) {
      try {
        const json = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
        const parsed = JSON.parse(json);

        const items = parsed.itemListElement
          ? parsed.itemListElement.map(li => li.item).filter(Boolean)
          : (Array.isArray(parsed) ? parsed : [parsed]);

        for (const item of items) {
          if (item['@type'] !== 'Event') continue;

          const loc = item.location;
          let locationStr = 'Online';
          let city = '';
          let country = '';
          if (loc) {
            if (loc.address) {
              city = loc.address.addressLocality || '';
              country = loc.address.addressCountry || '';
              locationStr = [city, country].filter(Boolean).join(', ') || loc.name || 'TBA';
            } else if (loc.name) {
              locationStr = loc.name;
            }
          }

          events.push({
            id: `mu-${item.url || item.name?.replace(/\s+/g, '-').slice(0, 80)}`,
            name: item.name,
            description: (item.description || '').slice(0, 200),
            startDate: item.startDate,
            endDate: item.endDate || item.startDate,
            city,
            country,
            location: locationStr,
            url: item.url,
            coverImage: item.image || null,
            source: 'meetup',
          });
        }
      } catch { /* skip */ }
    }
    return events;
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
async function fetchWeb3Events() {
  console.log('Starting Web3 Events Aggregator...\n');
  const allEventsMap = new Map();

  // ── 1. Luma Geo Discovery ──
  console.log(`[Luma] Scanning ${LUMA_CITIES.length} cities...`);
  for (let i = 0; i < LUMA_CITIES.length; i += 5) {
    const batch = LUMA_CITIES.slice(i, i + 5);
    const results = await Promise.all(batch.map(fetchLumaByCity));
    results.flat().forEach(e => { if (!allEventsMap.has(e.id)) allEventsMap.set(e.id, e); });
    console.log(`  Batch ${i / 5 + 1}: ${allEventsMap.size} unique`);
    await new Promise(r => setTimeout(r, 200));
  }

  // ── 2. Luma Crypto Hub ──
  console.log(`[Luma] Fetching crypto hub...`);
  const hubEvents = await fetchLumaHub();
  hubEvents.forEach(e => { if (!allEventsMap.has(e.id)) allEventsMap.set(e.id, e); });
  console.log(`[Luma] Total: ${allEventsMap.size}`);

  // ── 3. Eventbrite ──
  console.log(`\n[Eventbrite] Scraping ${EB_KEYWORDS.length} keywords × ${EB_REGIONS.length} regions...`);
  let ebBefore = allEventsMap.size;
  for (const keyword of EB_KEYWORDS) {
    for (let i = 0; i < EB_REGIONS.length; i += 5) {
      const regionBatch = EB_REGIONS.slice(i, i + 5);
      const fetches = regionBatch.flatMap(r => [
        fetchEventbritePage(keyword, r, 1),
        fetchEventbritePage(keyword, r, 2),
      ]);
      const results = await Promise.all(fetches);
      results.flat().forEach(e => { if (!allEventsMap.has(e.id)) allEventsMap.set(e.id, e); });
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`  "${keyword}" done (total: ${allEventsMap.size})`);
  }
  console.log(`[Eventbrite] +${allEventsMap.size - ebBefore} events`);

  // ── 4. Meetup.com ──
  console.log(`\n[Meetup] Scraping ${MEETUP_KEYWORDS.length} keywords...`);
  let muBefore = allEventsMap.size;
  for (const kw of MEETUP_KEYWORDS) {
    const events = await fetchMeetupPage(kw);
    events.forEach(e => { if (!allEventsMap.has(e.id)) allEventsMap.set(e.id, e); });
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`[Meetup] +${allEventsMap.size - muBefore} events`);

  // ── Filter: future + Web3 relevant ──
  const now = new Date().toISOString();
  const rawCount = allEventsMap.size;

  const validEvents = Array.from(allEventsMap.values())
    .filter(e => {
      if (!e.startDate) return false;
      if ((e.endDate || e.startDate) < now) return false;
      // Eventbrite & Meetup events are already keyword-searched, so always relevant.
      // Luma geo events need filtering.
      if (e.source === 'luma' && !isWeb3Relevant(e.name, e.description)) return false;
      return true;
    })
    .map(e => {
      const d = new Date(e.startDate);
      return {
        ...e,
        month: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      };
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  console.log(`\n${rawCount} raw → ${validEvents.length} Web3-relevant upcoming events.`);

  const cachePath = path.join(__dirname, '../content/events-cache.json');
  fs.writeFileSync(cachePath, JSON.stringify(validEvents, null, 2));
  console.log(`Saved to ${cachePath}`);
}

fetchWeb3Events();
