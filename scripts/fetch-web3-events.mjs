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
  'sui', 'aptos', 'monad', 'chainlink',
  'eigenlayer', 'restaking', 'celestia',
  'coinbase', 'binance', 'okx', 'kraken',
  'uniswap', 'aave', 'maker', 'compound', 'curve',
  'ethglobal', 'ethdenver', 'ethcc', 'devcon', 'token2049',
  'hackathon', 'buildathon', 'hacker house', 'mining', 'miner',
  'rwa', 'on-chain', 'onchain', 'mainnet', 'testnet',
  'airdrop', 'farcaster', 'socialfi', 'digital asset',
  'memecoin', 'meme coin', 'pragma', 'starknet', 'wormhole',
  'layerzero', 'brc-20',
  'dex', 'cex', 'amm', 'liquidity',
  'opensea', 'blur', 'nft',
  'web 3', 'block chain', 'bit coin', 'ether',
  'tron', 'cardano', 'ripple', 'xrp', 'dogecoin', 'shiba',
  'depin', 'zkp', 'zero knowledge', 'zk-snark', 'zk-stark',
  'ico', 'ido', 'ieo', 'launchpad',
  'validator', 'node operator', 'proof of work', 'proof of stake'
];

function isWeb3Relevant(name, description = '') {
  if (!name) return false;
  const text = `${name} ${description || ''}`.toLowerCase();
  
  // Exclude events that are just generic tech hackathons unless they mention crypto
  if (text.includes('hackathon') && !WEB3_KEYWORDS.some(kw => kw !== 'hackathon' && text.includes(kw))) {
    return false;
  }

  // Exact word boundary checks for very short keywords
  if (/\b(zk|l2|eth|btc)\b/.test(text)) return true;

  // Filter out the short ones from the general `includes` check to avoid false positives like "teeth" (eth)
  const safeKeywords = WEB3_KEYWORDS.filter(kw => !['zk', 'l2', 'eth', 'btc'].includes(kw));
  return safeKeywords.some(kw => text.includes(kw));
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
  { lat: 49.2827, lng: -123.1207 },  // Vancouver
  { lat: 45.5017, lng: -73.5673 },   // Montreal
  { lat: 51.5074, lng: -0.1278 },    // London
  { lat: 48.8566, lng: 2.3522 },     // Paris
  { lat: 52.5200, lng: 13.4050 },    // Berlin
  { lat: 52.3676, lng: 4.9041 },     // Amsterdam
  { lat: 47.3769, lng: 8.5417 },     // Zurich
  { lat: 38.7223, lng: -9.1393 },    // Lisbon
  { lat: 40.4168, lng: -3.7038 },    // Madrid
  { lat: 41.3851, lng: 2.1734 },     // Barcelona
  { lat: 50.1109, lng: 8.6821 },     // Frankfurt
  { lat: 59.3293, lng: 18.0686 },    // Stockholm
  { lat: 1.3521, lng: 103.8198 },    // Singapore
  { lat: 25.2048, lng: 55.2708 },    // Dubai
  { lat: 24.4539, lng: 54.3773 },    // Abu Dhabi
  { lat: 22.3193, lng: 114.1694 },   // Hong Kong
  { lat: 35.6762, lng: 139.6503 },   // Tokyo
  { lat: 37.5665, lng: 126.9780 },   // Seoul
  { lat: -33.8688, lng: 151.2093 },  // Sydney
  { lat: -37.8136, lng: 144.9631 },  // Melbourne
  { lat: 19.0760, lng: 72.8777 },    // Mumbai
  { lat: 12.9716, lng: 77.5946 },    // Bangalore
  { lat: 28.6139, lng: 77.2090 },    // New Delhi
  { lat: -23.5505, lng: -46.6333 },  // Sao Paulo
  { lat: -34.6037, lng: -58.3816 },  // Buenos Aires
  { lat: 19.4326, lng: -99.1332 },   // Mexico City
  { lat: 4.6097, lng: -74.0817 },    // Bogota
  { lat: 6.5244, lng: 3.3792 },      // Lagos
  { lat: -33.9249, lng: 18.4241 },   // Cape Town
  { lat: 1.2921, lng: 36.8219 },     // Nairobi
  { lat: 13.7563, lng: 100.5018 },   // Bangkok
  { lat: 3.1390, lng: 101.6869 },    // Kuala Lumpur
  { lat: 14.5995, lng: 120.9842 },   // Manila
  { lat: -6.2088, lng: 106.8456 },   // Jakarta
  { lat: 10.7626, lng: 106.6601 },   // Ho Chi Minh
];

// ─── Eventbrite & Meetup dimensions ──────────────────────────────────────
const EB_KEYWORDS = ['web3', 'crypto', 'blockchain', 'ethereum', 'bitcoin', 'defi', 'nft', 'solana', 'dao', 'rwa', 'decentralized', 'token'];
const EB_REGIONS = [
  'online', 'united-states', 'united-kingdom', 'canada', 'australia',
  'singapore', 'germany', 'uae', 'india', 'france',
  'japan', 'south-korea', 'hong-kong', 'switzerland', 'netherlands',
  'spain', 'brazil', 'nigeria', 'thailand', 'portugal',
  'argentina', 'mexico', 'colombia', 'chile', 'peru',
  'italy', 'sweden', 'denmark', 'austria', 'ireland',
  'malaysia', 'indonesia', 'vietnam', 'philippines', 'taiwan',
  'kenya', 'south-africa', 'ghana', 'egypt', 'morocco',
  'turkey', 'poland', 'czechia', 'romania', 'israel'
];

const MEETUP_KEYWORDS = ['blockchain', 'web3', 'crypto', 'ethereum', 'bitcoin', 'defi', 'nft', 'solana', 'decentralized'];

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

// Luma Community Hosts
const LUMA_COMMUNITIES = [
  'crypto', 'superteam', 'encode-club', 'ethglobal', 'chainlink',
  'token2049', 'ethprague', 'ethwarsaw', 'sui-network', 'web3foundation',
  'gnosis', 'lido', 'solana-nyc', 'wearelightdao', 'gemini',
  'polygon', 'arbitrum', 'optimism', 'base', 'avalanche', 
  'consensys', 'filecoin', 'polkadot', 'starknet', 'zksync',
  'a16zcrypto', 'paradigm', 'multicoin', 'panteracapital', 'framework',
  'buidlguidl', 'gitcoin', 'celo', 'aptos', 'sui',
  'berachain', 'monad', 'movementlabs', 'nearprotocol', 'bnbchain',
  'developerdao', 'boysclub', 'shefi', 'cryptomondays', 'ethereum'
];

async function fetchLumaCommunity(slug) {
  try {
    const res = await fetch(`https://lu.ma/${slug}`, { headers: { 'User-Agent': UA, 'Accept': 'text/html' }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(/id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!match) return [];
    const data = JSON.parse(match[1]);
    const initialData = data.props?.pageProps?.initialData?.data;
    const items = initialData?.featured_items || initialData?.timeline_calendars || [];

    return items.map(item => {
      const cal = item.calendar || item;
      const event = item.event || item;
      if (!cal && !event) return null;
      const geo = event?.geo_address_info || {};
      return {
        id: `luma-host-${event?.api_id || cal?.api_id}`,
        name: event?.name || cal?.name || '',
        description: (event?.description_short || cal?.description_short || '').slice(0, 200),
        startDate: event?.start_at || item.start_at || '',
        endDate: event?.end_at || item.end_at || '',
        city: geo.city || cal?.geo_city || '',
        country: geo.country || cal?.geo_country || '',
        location: [geo.city || cal?.geo_city, geo.country || cal?.geo_country].filter(Boolean).join(', ') || 'Virtual / TBA',
        url: `https://lu.ma/${event?.url || cal?.slug || event?.api_id}`,
        coverImage: event?.cover_url || cal?.cover_image_url || null,
        source: 'luma-trusted',
      };
    }).filter(e => e && e.name && e.startDate);
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
// SOURCE 3: Meetup.com (Apollo State extraction across cities)
// ═══════════════════════════════════════════════════════════════════════
const MEETUP_CITIES = [
  'New York', 'San Francisco', 'London', 'Singapore', 'Berlin',
  'Miami', 'Tokyo', 'Dubai', 'Toronto', 'Hong Kong',
  'Austin', 'Paris', 'Chicago', 'Los Angeles', 'Seoul',
];

async function fetchMeetupPage(keyword, location) {
  const url = `https://www.meetup.com/find/?keywords=${keyword}&source=EVENTS&location=${encodeURIComponent(location)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const html = await res.text();

    const nextMatch = html.match(/id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!nextMatch) return [];

    const data = JSON.parse(nextMatch[1]);
    const apollo = data.props?.pageProps?.__APOLLO_STATE__;
    if (!apollo) return [];

    const eventKeys = Object.keys(apollo).filter(k => k.startsWith('Event:'));
    return eventKeys.map(k => {
      const e = apollo[k];
      if (!e) return null;

      const venue = e.venue ? apollo[`Venue:${e.venue.id || e.venue.__ref?.split(':')[1]}`] || e.venue : null;
      const city = venue?.city || '';
      const country = venue?.country || '';

      return {
        id: `mu-${e.id}`,
        name: e.title,
        description: (e.description || '').slice(0, 200),
        startDate: e.dateTime,
        endDate: e.endTime || e.dateTime,
        city,
        country,
        location: city && country ? `${city}, ${country}` : city || country || 'Online',
        url: e.eventUrl,
        coverImage: e.featuredEventPhoto?.highResUrl || e.featuredEventPhoto?.baseUrl || null,
        source: 'meetup',
      };
    }).filter(e => e && e.startDate);
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════════════
// SOURCE 4: ConferenceIndex.org (HTML parsing with cheerio)
// ═══════════════════════════════════════════════════════════════════════
async function fetchConferenceIndex(page = 1) {
  const url = page === 1
    ? 'https://conferenceindex.org/conferences/blockchain'
    : `https://conferenceindex.org/conferences/blockchain?page=${page}`;
  try {
    const { load } = await import('cheerio');
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = load(html);

    const events = [];
    $('a[href*="/event/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const title = $(el).text().trim();
      if (!title || title.length < 5) return;

      // Context contains "Mon DD Title - City, Country"
      const $parent = $(el).closest('tr, li, div');
      const ctx = $parent.text().replace(/\s+/g, ' ').trim();

      // Extract date (e.g. "May 18", "Jun 12")
      const dateMatch = ctx.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})/i);
      let startDate = '';
      if (dateMatch) {
        const year = new Date().getFullYear();
        const d = new Date(`${dateMatch[1]} ${dateMatch[2]}, ${year}`);
        if (d < new Date()) d.setFullYear(year + 1);
        startDate = d.toISOString();
      }

      // Extract location (after " - ")
      const locMatch = ctx.match(/\s-\s(.+?)$/);
      const location = locMatch ? locMatch[1].trim() : 'TBA';
      const locParts = location.split(',').map(s => s.trim());
      const city = locParts[0] || '';
      const country = locParts[1] || '';

      const fullUrl = href.startsWith('http') ? href : `https://conferenceindex.org${href}`;

      events.push({
        id: `ci-${href.replace(/[^a-z0-9]/gi, '-').slice(0, 100)}`,
        name: title,
        description: '',
        startDate,
        endDate: startDate,
        city,
        country,
        location,
        url: fullUrl,
        coverImage: null,
        source: 'conferenceindex',
      });
    });

    // Deduplicate within page
    const seen = new Set();
    return events.filter(e => {
      if (seen.has(e.url)) return false;
      seen.add(e.url);
      return e.startDate;
    });
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════════════
// SOURCE 5: ETHGlobal (HTML parsing)
// ═══════════════════════════════════════════════════════════════════════
async function fetchETHGlobal() {
  try {
    const { load } = await import('cheerio');
    const res = await fetch('https://ethglobal.com/events', { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = load(html);

    const events = [];
    const seen = new Set();

    $('a[href^="/events/"]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || seen.has(href) || href === '/events/') return;
      seen.add(href);

      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (!text || text.length < 10) return;

      // Extract name (handles ETHGlobal X 2026, Pragma X 2026, ETHOnline 2026, etc.)
      const nameMatch = text.match(/(ETHGlobal\s+[\w\s]+\d{4}|Pragma\s+[\w\s]+\d{4}|ETHOnline\s+\d{4}|Superhack\s*\d{4}|HackFS\s*\d{4}|Agentic\s+\w+)/i);
      const name = nameMatch ? nameMatch[1].trim() : text.substring(0, 60);

      // Extract location (City, Country pattern)
      const locMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:Hackathon|Conference|Summit|Co-working|Meetup|Online)/);
      const location = locMatch ? `${locMatch[1]}, ${locMatch[2]}` : (text.includes('Online') ? 'Online' : 'TBA');
      const locParts = location.split(',').map(s => s.trim());

      // Extract date: handles "Jun 12th", "July 4th", "May 30th – Jun 1st, 2025"
      const dateMatch = text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2})(?:st|nd|rd|th)/i);
      const yearMatch = text.match(/,\s*(\d{4})/);
      let startDate = '';
      if (dateMatch && yearMatch) {
        startDate = new Date(`${dateMatch[1]} ${dateMatch[2]}, ${yearMatch[1]}`).toISOString();
      }

      events.push({
        id: `ethg-${href.replace(/\//g, '')}`,
        name,
        description: '',
        startDate,
        endDate: startDate,
        city: locParts[0] || '',
        country: locParts[1] || '',
        location,
        url: `https://ethglobal.com${href}`,
        coverImage: null,
        source: 'ethglobal',
      });
    });

    return events.filter(e => e.startDate);
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════════════
// SOURCE 6: CoinMarketCap Events (__NEXT_DATA__)
// ═══════════════════════════════════════════════════════════════════════
async function fetchCoinMarketCap() {
  try {
    const res = await fetch('https://coinmarketcap.com/events/', { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(/id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!match) return [];

    const data = JSON.parse(match[1]);
    const table = data.props?.pageProps?.tableData;
    if (!table) return [];

    const events = [];
    for (const key of Object.keys(table)) {
      const group = table[key];
      if (!group?.eventsList) continue;
      for (const item of group.eventsList) {
        const coinName = item.name?.[0]?.name || '';
        const startDate = item.eventTime ? new Date(item.eventTime).toISOString() : '';

        events.push({
          id: `cmc-${item.id}`,
          name: `${coinName}: ${item.title}`,
          description: (item.content || '').slice(0, 200),
          startDate,
          endDate: startDate,
          city: '',
          country: '',
          location: 'Online',
          url: item.originalSource || `https://coinmarketcap.com/events/`,
          coverImage: null,
          source: 'coinmarketcap',
        });
      }
    }
    return events.filter(e => e.startDate);
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

  // ── 2. Luma Community Hosts ──
  console.log(`\n[Luma] Scraping ${LUMA_COMMUNITIES.length} community hosts...`);
  for (let i = 0; i < LUMA_COMMUNITIES.length; i += 5) {
    const batch = LUMA_COMMUNITIES.slice(i, i + 5);
    const results = await Promise.all(batch.map(fetchLumaCommunity));
    results.flat().forEach(e => { if (!allEventsMap.has(e.id)) allEventsMap.set(e.id, e); });
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`[Luma] Total: ${allEventsMap.size}`);

  // ── 3. Eventbrite ──
  console.log(`\n[Eventbrite] Scraping ${EB_KEYWORDS.length} keywords × ${EB_REGIONS.length} regions...`);
  let ebBefore = allEventsMap.size;
  for (const keyword of EB_KEYWORDS) {
    for (const region of EB_REGIONS) {
      const p1 = await fetchEventbritePage(keyword, region, 1);
      p1.forEach(e => { if (!allEventsMap.has(e.id)) allEventsMap.set(e.id, e); });
      
      // Random sleep 200-500ms to avoid 429 Too Many Requests
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
    }
    console.log(`  "${keyword}" done (total: ${allEventsMap.size})`);
  }
  console.log(`[Eventbrite] +${allEventsMap.size - ebBefore} events`);

  // ── 4. Meetup.com ──
  console.log(`\n[Meetup] Scraping ${MEETUP_KEYWORDS.length} keywords × ${MEETUP_CITIES.length} cities...`);
  let muBefore = allEventsMap.size;
  for (const kw of MEETUP_KEYWORDS) {
    for (const city of MEETUP_CITIES) {
      const results = await fetchMeetupPage(kw, city);
      results.forEach(e => { if (!allEventsMap.has(e.id)) allEventsMap.set(e.id, e); });
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
    }
  }
  console.log(`[Meetup] +${allEventsMap.size - muBefore} events`);

  // ── 5. ConferenceIndex (3 pages) ──
  console.log(`\n[ConferenceIndex] Scraping blockchain conferences...`);
  let ciBefore = allEventsMap.size;
  for (let page = 1; page <= 3; page++) {
    const events = await fetchConferenceIndex(page);
    events.forEach(e => { if (!allEventsMap.has(e.id)) allEventsMap.set(e.id, e); });
    console.log(`  Page ${page}: ${events.length} events (total: ${allEventsMap.size})`);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`[ConferenceIndex] +${allEventsMap.size - ciBefore} events`);

  // ── 6. ETHGlobal ──
  console.log(`\n[ETHGlobal] Fetching upcoming events...`);
  let egBefore = allEventsMap.size;
  const ethgEvents = await fetchETHGlobal();
  ethgEvents.forEach(e => { if (!allEventsMap.has(e.id)) allEventsMap.set(e.id, e); });
  console.log(`[ETHGlobal] +${allEventsMap.size - egBefore} events`);

  // ── 7. CoinMarketCap ──
  console.log(`\n[CoinMarketCap] Fetching token events...`);
  let cmcBefore = allEventsMap.size;
  const cmcEvents = await fetchCoinMarketCap();
  cmcEvents.forEach(e => { if (!allEventsMap.has(e.id)) allEventsMap.set(e.id, e); });
  console.log(`[CoinMarketCap] +${allEventsMap.size - cmcBefore} events`);

  // Blacklist: catch obvious non-Web3 spam
  const BLACKLIST = [
    'apple repair', 'garden festival', 'yoga', 'pilates', 'cooking class',
    'real estate agent', 'pottery', 'wine tasting', 'book club', 'knitting',
    'full stack training', 'python training', 'java training', 'seo training',
    'wedding', 'baby shower', 'bridal', 'church service', 'sermon',
  ];
  function isBlacklisted(name) {
    if (!name) return false;
    const lower = name.toLowerCase();
    return BLACKLIST.some(b => lower.includes(b));
  }

  const now = new Date().toISOString();
  const rawCount = allEventsMap.size;

  // Exclusively Web3 sources (verified crypto hosts, dedicated blockchain categories)
  const TRUSTED_SOURCES = new Set(['conferenceindex', 'ethglobal', 'coinmarketcap', 'luma-trusted']);

  const validEvents = Array.from(allEventsMap.values())
    .filter(e => {
      if (!e.startDate) return false;
      if (!e.name) return false;
      if (e.startDate < now) return false;
      if (isBlacklisted(e.name)) return false;
      
      // Keyword-searched sources bypass strict title filtering
      if (!TRUSTED_SOURCES.has(e.source) && !isWeb3Relevant(e.name, e.description)) {
        return false;
      }
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
