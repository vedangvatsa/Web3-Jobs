#!/usr/bin/env node
/**
 * Full Luma + Meetup Scraper — paginates through ALL events
 * Appends to existing CSV
 */
import fs from 'fs';

const TODAY = new Date().toISOString().split('T')[0];
const CSV_PATH = '/Users/vedang/web3jobs/Web3-Jobs/scratch/luma-meetup-events.csv';

const TECH_KEYWORDS = [
  'tech', 'ai', 'artificial intelligence', 'machine learning', 'blockchain',
  'web3', 'crypto', 'developer', 'devops', 'cloud', 'data', 'startup',
  'fintech', 'cybersecurity', 'saas', 'api', 'engineering', 'coding',
  'python', 'javascript', 'react', 'kubernetes', 'docker', 'aws',
  'defi', 'nft', 'solidity', 'ethereum', 'bitcoin', 'token',
  'hackathon', 'open source', 'robotics', 'iot', 'quantum',
  'llm', 'gpt', 'genai', 'product', 'agile',
  'software', 'hardware', 'security', 'infosec', 'digital',
  'innovation', 'deep tech', 'venture', 'vc', 'founder', 'pitch',
  'agent', 'agentic', 'claude', 'openai', 'google', 'microsoft',
  'semiconductor', 'computing', 'neural', 'network', 'code',
  'no-code', 'low-code', 'automation', 'scraping', 'web dev',
  'frontend', 'backend', 'full stack', 'fullstack', 'database',
  'sql', 'nosql', 'devrel', 'platform', 'infrastructure',
  'protocol', 'consensus', 'wallet', 'dao', 'dapp', 'smart contract',
  'solana', 'polkadot', 'cosmos', 'layer 2', 'l2', 'zk',
  'zero knowledge', 'rollup', 'bridge', 'staking', 'yield',
];

function isTechEvent(name, desc = '') {
  const text = `${name} ${desc}`.toLowerCase();
  return TECH_KEYWORDS.some(kw => text.includes(kw));
}

function csvEscape(val) {
  if (!val) return '';
  const s = String(val).replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}

// ═══════════════════════════════════════════
// LUMA — Full paginated geo search
// ═══════════════════════════════════════════
async function scrapeLumaGeo(lat, lng, city, country) {
  console.log(`  [Luma] Paginating ALL events near ${city} (${lat}, ${lng})...`);
  const events = [];
  let cursor = '';
  let page = 0;
  let totalFetched = 0;

  while (true) {
    const params = new URLSearchParams({
      geo_latitude: String(lat),
      geo_longitude: String(lng),
      geo_radius: '80mi', // wider radius to catch more
      pagination_limit: '50',
    });
    if (cursor) params.set('pagination_cursor', cursor);

    try {
      const res = await fetch(`https://api.lu.ma/discover/get-paginated-events?${params}`, {
        headers: { 'accept': 'application/json', 'x-luma-client-type': 'web' },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        console.log(`    Page ${page}: HTTP ${res.status}`);
        break;
      }

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text.replace(/[\x00-\x1F\x7F]/g, ' '));
      } catch (e) {
        console.log(`    Page ${page}: JSON parse error`);
        break;
      }

      const entries = data.entries || [];
      totalFetched += entries.length;

      for (const entry of entries) {
        const evt = entry?.event;
        if (!evt) continue;

        const name = evt.name || '';
        const desc = evt.description || '';
        const startAt = evt.start_at ? new Date(evt.start_at) : null;
        const endAt = evt.end_at ? new Date(evt.end_at) : null;

        // Skip past events
        if (startAt && startAt < new Date(TODAY)) continue;

        // Tech filter
        if (!isTechEvent(name, desc)) continue;

        const venue = evt.geo_address_info?.full_address || evt.geo_address_info?.city || '';

        events.push({
          name: name.trim(),
          dateStart: startAt ? startAt.toISOString().split('T')[0] : '',
          dateEnd: endAt ? endAt.toISOString().split('T')[0] : '',
          country, city,
          venue: venue.trim(),
          category: 'Community Event',
          focusAreas: '',
          size: '',
          ticketType: '',
          url: evt.url ? `https://lu.ma/${evt.url}` : '',
          source: 'Luma',
          notes: (desc || '').substring(0, 150).replace(/[\n\r]/g, ' ').trim(),
        });
      }

      const hasMore = data.has_more;
      cursor = data.next_cursor || '';
      page++;

      process.stdout.write(`    Page ${page}: ${entries.length} entries (${totalFetched} total, ${events.length} tech) ${hasMore ? '→' : '✓'}\n`);

      if (!hasMore || !cursor || entries.length === 0) break;

      // Rate limit
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.log(`    Page ${page}: Error - ${err.message}`);
      break;
    }
  }

  console.log(`    ✅ Luma ${city}: ${events.length} tech events from ${totalFetched} total`);
  return events;
}

// ═══════════════════════════════════════════
// LUMA — Place-based paginated search (catches local events the geo might miss)
// ═══════════════════════════════════════════
async function scrapeLumaPlace(placeId, city, country) {
  console.log(`  [Luma-Place] Paginating events for place ${placeId}...`);
  const events = [];
  let cursor = '';
  let page = 0;
  let totalFetched = 0;

  while (true) {
    const params = new URLSearchParams({
      discover_place_api_id: placeId,
      pagination_limit: '50',
    });
    if (cursor) params.set('pagination_cursor', cursor);

    try {
      const res = await fetch(`https://api.lu.ma/discover/get-paginated-events?${params}`, {
        headers: { 'accept': 'application/json', 'x-luma-client-type': 'web' },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) break;

      const text = await res.text();
      let data;
      try { data = JSON.parse(text.replace(/[\x00-\x1F\x7F]/g, ' ')); }
      catch { break; }

      const entries = data.entries || [];
      totalFetched += entries.length;

      for (const entry of entries) {
        const evt = entry?.event;
        if (!evt) continue;

        const name = evt.name || '';
        const desc = evt.description || '';
        const startAt = evt.start_at ? new Date(evt.start_at) : null;
        const endAt = evt.end_at ? new Date(evt.end_at) : null;

        if (startAt && startAt < new Date(TODAY)) continue;
        if (!isTechEvent(name, desc)) continue;

        events.push({
          name: name.trim(),
          dateStart: startAt ? startAt.toISOString().split('T')[0] : '',
          dateEnd: endAt ? endAt.toISOString().split('T')[0] : '',
          country, city,
          venue: evt.geo_address_info?.full_address || '',
          category: 'Community Event',
          focusAreas: '',
          size: '',
          ticketType: '',
          url: evt.url ? `https://lu.ma/${evt.url}` : '',
          source: 'Luma',
          notes: (desc || '').substring(0, 150).replace(/[\n\r]/g, ' ').trim(),
        });
      }

      const hasMore = data.has_more;
      cursor = data.next_cursor || '';
      page++;
      process.stdout.write(`    Page ${page}: ${entries.length} entries (${totalFetched} total, ${events.length} tech) ${hasMore ? '→' : '✓'}\n`);

      if (!hasMore || !cursor || entries.length === 0) break;
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      break;
    }
  }

  console.log(`    ✅ Luma-Place ${city}: ${events.length} tech events from ${totalFetched} total`);
  return events;
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
async function main() {
  console.log(`\n🔍 Luma + Meetup Full Scraper`);
  console.log(`   Today: ${TODAY}\n`);

  const allEvents = [];

  // Singapore
  console.log(`\n📍 Singapore`);
  console.log('─'.repeat(50));
  const sgGeo = await scrapeLumaGeo(1.3521, 103.8198, 'Singapore', 'Singapore');
  const sgPlace = await scrapeLumaPlace('discplace-mUbtdfNjfWaLQ72', 'Singapore', 'Singapore');
  allEvents.push(...sgGeo, ...sgPlace);

  // KL  
  console.log(`\n📍 Kuala Lumpur`);
  console.log('─'.repeat(50));
  // First get KL place ID
  let klPlaceId = '';
  try {
    const klRes = await fetch('https://api.lu.ma/url?url=kuala-lumpur', {
      headers: { 'accept': 'application/json', 'x-luma-client-type': 'web' },
    });
    const klText = await klRes.text();
    const klMatch = klText.match(/"api_id":"(discplace-[^"]+)"/);
    if (klMatch) klPlaceId = klMatch[1];
  } catch (_) {}
  
  const klGeo = await scrapeLumaGeo(3.1390, 101.6869, 'Kuala Lumpur', 'Malaysia');
  if (klPlaceId) {
    const klPlace = await scrapeLumaPlace(klPlaceId, 'Kuala Lumpur', 'Malaysia');
    allEvents.push(...klPlace);
  }
  allEvents.push(...klGeo);

  // Also try Johor Bahru (close to SG, often has tech events)
  console.log(`\n📍 Johor Bahru (bonus)`);
  console.log('─'.repeat(50));
  const jbGeo = await scrapeLumaGeo(1.4927, 103.7414, 'Johor Bahru', 'Malaysia');
  allEvents.push(...jbGeo);

  // Penang
  console.log(`\n📍 Penang (bonus)`);
  console.log('─'.repeat(50));
  const pgGeo = await scrapeLumaGeo(5.4164, 100.3327, 'Penang', 'Malaysia');
  allEvents.push(...pgGeo);

  // Deduplicate
  const seen = new Set();
  const unique = allEvents.filter(e => {
    const key = `${e.name.toLowerCase().replace(/[^a-z0-9]/g, '')}|${e.dateStart}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => (a.dateStart || '9999').localeCompare(b.dateStart || '9999'));

  // Write CSV
  const headers = ['Event Name', 'Date Start', 'Date End', 'Country', 'City', 'Venue', 'Category', 'Focus Areas', 'Estimated Size', 'Ticket Type', 'Website URL', 'Source Platform', 'Notes'];
  const rows = unique.map(e => [
    e.name, e.dateStart, e.dateEnd, e.country, e.city, e.venue,
    e.category, e.focusAreas, e.size, e.ticketType, e.url, e.source, e.notes,
  ].map(csvEscape).join(','));

  fs.writeFileSync(CSV_PATH, [headers.join(','), ...rows].join('\n'));

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ Luma: ${unique.length} unique tech events`);
  console.log(`   File: ${CSV_PATH}`);

  const byCountry = {};
  for (const e of unique) byCountry[e.country] = (byCountry[e.country] || 0) + 1;
  console.log(`\n   By country:`);
  for (const [c, n] of Object.entries(byCountry)) console.log(`     ${c}: ${n}`);
  
  const byCity = {};
  for (const e of unique) byCity[e.city] = (byCity[e.city] || 0) + 1;
  console.log(`\n   By city:`);
  for (const [c, n] of Object.entries(byCity).sort((a,b) => b[1]-a[1])) console.log(`     ${c}: ${n}`);
}

main().catch(console.error);
