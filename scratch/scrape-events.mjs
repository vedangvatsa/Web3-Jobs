#!/usr/bin/env node
/**
 * Tech Events Scraper v2 — Singapore & Malaysia
 * Sources: Luma API, Eventbrite HTML/JSON-LD, 10times JSON-LD, Meetup HTML
 */

import fs from 'fs';
import path from 'path';

const TODAY = new Date().toISOString().split('T')[0];
const CSV_PATH = path.join(process.cwd(), 'scratch', 'tech-events-sg-my.csv');
const allEvents = [];

const TECH_KEYWORDS = [
  'tech', 'ai', 'artificial intelligence', 'machine learning', 'blockchain',
  'web3', 'crypto', 'developer', 'devops', 'cloud', 'data', 'startup',
  'fintech', 'cybersecurity', 'saas', 'api', 'engineering', 'coding',
  'python', 'javascript', 'react', 'kubernetes', 'docker', 'aws',
  'defi', 'nft', 'solidity', 'ethereum', 'bitcoin', 'token',
  'hackathon', 'open source', 'robotics', 'iot', 'quantum',
  'llm', 'gpt', 'genai', 'product', 'design', 'ux', 'agile',
  'software', 'hardware', 'security', 'infosec', 'digital',
  'innovation', 'deep tech', 'venture', 'vc', 'founder', 'pitch',
  'agent', 'agentic', 'claude', 'openai', 'google', 'microsoft',
  'semiconductor', 'computing', 'neural', 'network', 'code',
];

function isTechEvent(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();
  return TECH_KEYWORDS.some(kw => text.includes(kw));
}

function csvEscape(val) {
  if (!val) return '';
  const s = String(val).replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}

function safeFetch(url, opts = {}) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(15000) }).catch(e => {
    console.log(`    Fetch error: ${e.message}`);
    return { ok: false, status: 0, text: async () => '', json: async () => ({}) };
  });
}

// ═══════════════════════════════════════════
// 1. LUMA — fetch each event by ID from the place endpoint
// ═══════════════════════════════════════════
async function scrapeLuma(placeSlug, city, country) {
  console.log(`  [Luma] Fetching events for ${city}...`);
  const events = [];
  
  try {
    // Step 1: Get place data + featured event IDs
    const placeRes = await safeFetch(`https://api.lu.ma/url?url=${placeSlug}`, {
      headers: { 'accept': 'application/json', 'x-luma-client-type': 'web' }
    });
    if (!placeRes.ok) { console.log(`    Luma place ${placeRes.status}`); return events; }
    
    const placeText = await placeRes.text();
    // Parse with strict:false to handle control chars
    let placeData;
    try {
      placeData = JSON.parse(placeText.replace(/[\x00-\x1F\x7F]/g, ' '));
    } catch (e) {
      console.log(`    Luma JSON parse error, extracting IDs via regex...`);
      const idsMatch = placeText.match(/"featured_event_api_ids":\[([^\]]*)\]/);
      if (!idsMatch) return events;
      const ids = idsMatch[1].match(/"(evt-[^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
      placeData = { data: { place: { featured_event_api_ids: ids } } };
    }
    
    const featuredIds = placeData?.data?.place?.featured_event_api_ids || [];
    const eventCount = placeData?.data?.place?.event_count || 0;
    console.log(`    Place has ${eventCount} events, ${featuredIds.length} featured`);
    
    // Step 2: Also get full event list via search-like endpoint  
    let allEventIds = [...featuredIds];
    
    // Try paginated listing
    for (let cursor = ''; ; ) {
      const params = new URLSearchParams({
        place_slug: placeSlug,
        pagination_limit: '50',
      });
      if (cursor) params.set('pagination_cursor', cursor);
      
      const listRes = await safeFetch(
        `https://api.lu.ma/discover/get-paginated-events-for-place?${params}`,
        { headers: { 'accept': 'application/json', 'x-luma-client-type': 'web' } }
      );
      
      if (listRes.ok) {
        const listText = await listRes.text();
        try {
          const listData = JSON.parse(listText.replace(/[\x00-\x1F\x7F]/g, ' '));
          const entries = listData?.entries || [];
          for (const entry of entries) {
            const eid = entry?.event?.api_id;
            if (eid && !allEventIds.includes(eid)) allEventIds.push(eid);
            
            // Also extract inline event data
            const evt = entry?.event;
            if (evt?.name) {
              const name = evt.name;
              const desc = evt.description || '';
              const startAt = evt.start_at ? new Date(evt.start_at) : null;
              
              if (startAt && startAt < new Date(TODAY)) continue;
              if (!isTechEvent(name, desc)) continue;
              
              events.push({
                name: name.trim(),
                dateStart: startAt ? startAt.toISOString().split('T')[0] : '',
                dateEnd: evt.end_at ? new Date(evt.end_at).toISOString().split('T')[0] : '',
                country, city,
                venue: evt.geo_address_info?.full_address || '',
                category: 'Community Event',
                focusAreas: '',
                size: '',
                ticketType: '',
                url: evt.url ? `https://lu.ma/${evt.url}` : '',
                source: 'Luma',
                notes: (desc || '').substring(0, 120).replace(/[\n\r]/g, ' ').trim(),
              });
            }
          }
          cursor = listData?.next_cursor || '';
          if (!cursor || entries.length === 0) break;
        } catch (_) { break; }
      } else {
        break;
      }
    }
    
    // Step 3: Fetch individual events we haven't already captured
    const capturedUrls = new Set(events.map(e => e.url));
    const toFetch = allEventIds.filter(id => !events.some(e => e.url.includes(id)));
    
    // Batch fetch (5 at a time)
    for (let i = 0; i < toFetch.length; i += 5) {
      const batch = toFetch.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map(async (eventId) => {
          const res = await safeFetch(`https://api.lu.ma/event/get?event_api_id=${eventId}`, {
            headers: { 'accept': 'application/json', 'x-luma-client-type': 'web' }
          });
          if (!res.ok) return null;
          const text = await res.text();
          const data = JSON.parse(text.replace(/[\x00-\x1F\x7F]/g, ' '));
          return data?.event;
        })
      );
      
      for (const r of results) {
        if (r.status !== 'fulfilled' || !r.value) continue;
        const evt = r.value;
        const name = evt.name || '';
        const desc = evt.description || '';
        const startAt = evt.start_at ? new Date(evt.start_at) : null;
        
        if (startAt && startAt < new Date(TODAY)) continue;
        if (!isTechEvent(name, desc)) continue;
        
        const url = evt.url ? `https://lu.ma/${evt.url}` : '';
        if (capturedUrls.has(url)) continue;
        capturedUrls.add(url);
        
        events.push({
          name: name.trim(),
          dateStart: startAt ? startAt.toISOString().split('T')[0] : '',
          dateEnd: evt.end_at ? new Date(evt.end_at).toISOString().split('T')[0] : '',
          country, city,
          venue: evt.geo_address_info?.full_address || evt.location || '',
          category: 'Community Event',
          focusAreas: '',
          size: '',
          ticketType: '',
          url,
          source: 'Luma',
          notes: (desc || '').substring(0, 120).replace(/[\n\r]/g, ' ').trim(),
        });
      }
      
      if (i + 5 < toFetch.length) await new Promise(r => setTimeout(r, 300));
    }
    
  } catch (err) {
    console.log(`    Luma error for ${city}: ${err.message}`);
  }
  
  console.log(`    Found ${events.length} tech events from Luma ${city}`);
  return events;
}

// ═══════════════════════════════════════════
// 2. EVENTBRITE — HTML scrape with JSON-LD extraction
// ═══════════════════════════════════════════
async function scrapeEventbrite(slug, city, country) {
  console.log(`  [Eventbrite] Fetching events for ${city}...`);
  const events = [];
  
  for (const keyword of ['tech', 'ai', 'blockchain', 'startup', 'developer', 'data-science', 'cybersecurity', 'web3', 'fintech', 'cloud']) {
    try {
      const url = `https://www.eventbrite.com/d/${slug}/${keyword}--events/`;
      const res = await safeFetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      });
      
      if (!res.ok) { continue; }
      
      const html = await res.text();
      
      // Extract JSON-LD
      const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
      for (const match of jsonLdMatches) {
        try {
          const jsonStr = match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
          const parsed = JSON.parse(jsonStr);
          const items = Array.isArray(parsed) ? parsed : (parsed?.itemListElement?.map(i => i.item) || [parsed]);
          
          for (const item of items) {
            if (item?.['@type'] !== 'Event') continue;
            const name = item.name || '';
            if (!name || !isTechEvent(name, item.description || '')) continue;
            
            const startAt = item.startDate ? new Date(item.startDate) : null;
            const endAt = item.endDate ? new Date(item.endDate) : null;
            if (startAt && startAt < new Date(TODAY)) continue;
            
            events.push({
              name: name.trim(),
              dateStart: startAt ? startAt.toISOString().split('T')[0] : '',
              dateEnd: endAt ? endAt.toISOString().split('T')[0] : '',
              country, city,
              venue: item.location?.name || item.location?.address?.addressLocality || '',
              category: 'Event',
              focusAreas: '',
              size: '',
              ticketType: item.isAccessibleForFree ? 'Free' : 'Paid',
              url: item.url || '',
              source: 'Eventbrite',
              notes: (item.description || '').substring(0, 120).replace(/[\n\r]/g, ' ').trim(),
            });
          }
        } catch (_) {}
      }
      
      await new Promise(r => setTimeout(r, 800)); // rate limit
    } catch (err) {
      // skip this keyword
    }
  }
  
  // Dedupe within source
  const seen = new Set();
  const unique = events.filter(e => {
    const key = e.name.toLowerCase().replace(/\s+/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  console.log(`    Found ${unique.length} tech events from Eventbrite ${city}`);
  return unique;
}

// ═══════════════════════════════════════════
// 3. 10TIMES — JSON-LD extraction
// ═══════════════════════════════════════════
async function scrape10Times(location, city, country) {
  console.log(`  [10times] Fetching events in ${city}...`);
  const events = [];
  
  for (const category of ['technology', 'startups', 'artificial-intelligence']) {
    try {
      const res = await safeFetch(`https://10times.com/${location}/${category}`, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });
      if (!res.ok) continue;
      
      const html = await res.text();
      const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
      
      for (const match of jsonLdMatches) {
        try {
          const jsonStr = match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
          const parsed = JSON.parse(jsonStr);
          const items = Array.isArray(parsed) ? parsed : (parsed?.itemListElement?.map(i => i.item) || [parsed]);
          
          for (const item of items) {
            if (!item || (item['@type'] !== 'Event' && item['@type'] !== 'BusinessEvent')) continue;
            const name = item.name || '';
            if (!name) continue;
            
            const startAt = item.startDate ? new Date(item.startDate) : null;
            if (startAt && startAt < new Date(TODAY)) continue;
            
            events.push({
              name: name.trim(),
              dateStart: startAt ? startAt.toISOString().split('T')[0] : '',
              dateEnd: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
              country,
              city: item.location?.address?.addressLocality || city,
              venue: item.location?.name || '',
              category: 'Conference/Expo',
              focusAreas: '',
              size: item.maximumAttendeeCapacity ? `${item.maximumAttendeeCapacity} capacity` : '',
              ticketType: '',
              url: item.url || '',
              source: '10times',
              notes: (item.description || '').substring(0, 120).replace(/[\n\r]/g, ' ').trim(),
            });
          }
        } catch (_) {}
      }
      
      await new Promise(r => setTimeout(r, 500));
    } catch (_) {}
  }
  
  const seen = new Set();
  const unique = events.filter(e => {
    const key = e.name.toLowerCase().replace(/\s+/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  console.log(`    Found ${unique.length} events from 10times ${city}`);
  return unique;
}

// ═══════════════════════════════════════════
// 4. MEETUP — HTML scrape for upcoming events
// ═══════════════════════════════════════════
async function scrapeMeetup(city, country) {
  console.log(`  [Meetup] Fetching events for ${city}...`);
  const events = [];
  
  for (const keyword of ['tech', 'ai-artificial-intelligence', 'blockchain', 'startup', 'software-development', 'web3', 'data-science', 'cloud-computing']) {
    try {
      const slug = city.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.meetup.com/find/?keywords=${keyword}&location=${encodeURIComponent(city)}&source=EVENTS&eventType=inPerson`;
      const res = await safeFetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
        redirect: 'follow',
      });
      
      if (!res.ok) continue;
      
      const html = await res.text();
      
      // Extract JSON-LD
      const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
      for (const match of jsonLdMatches) {
        try {
          const jsonStr = match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
          const parsed = JSON.parse(jsonStr);
          const items = Array.isArray(parsed) ? parsed : (parsed?.itemListElement?.map(i => i.item) || [parsed]);
          
          for (const item of items) {
            if (item?.['@type'] !== 'Event') continue;
            const name = item.name || '';
            if (!name || !isTechEvent(name, item.description || '')) continue;
            
            const startAt = item.startDate ? new Date(item.startDate) : null;
            if (startAt && startAt < new Date(TODAY)) continue;
            
            events.push({
              name: name.trim(),
              dateStart: startAt ? startAt.toISOString().split('T')[0] : '',
              dateEnd: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
              country, city,
              venue: item.location?.name || '',
              category: 'Meetup',
              focusAreas: '',
              size: '',
              ticketType: 'Free',
              url: item.url || '',
              source: 'Meetup.com',
              notes: item.organizer?.name ? `Group: ${item.organizer.name}` : '',
            });
          }
        } catch (_) {}
      }
      
      // Also extract from __NEXT_DATA__
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (nextDataMatch) {
        try {
          const nd = JSON.parse(nextDataMatch[1]);
          const results = nd?.props?.pageProps?.searchResults?.edges || nd?.props?.pageProps?.results || [];
          for (const edge of results) {
            const node = edge?.node || edge;
            const name = node?.title || node?.name || '';
            if (!name || !isTechEvent(name, node?.description || '')) continue;
            
            const startAt = node?.dateTime ? new Date(node.dateTime) : null;
            if (startAt && startAt < new Date(TODAY)) continue;
            
            events.push({
              name: name.trim(),
              dateStart: startAt ? startAt.toISOString().split('T')[0] : '',
              dateEnd: node?.endTime ? new Date(node.endTime).toISOString().split('T')[0] : '',
              country, city,
              venue: node?.venue?.name || '',
              category: 'Meetup',
              focusAreas: '',
              size: node?.going ? `${node.going} RSVPs` : '',
              ticketType: 'Free',
              url: node?.eventUrl || '',
              source: 'Meetup.com',
              notes: node?.group?.name ? `Group: ${node.group.name}` : '',
            });
          }
        } catch (_) {}
      }
      
      await new Promise(r => setTimeout(r, 800));
    } catch (_) {}
  }
  
  const seen = new Set();
  const unique = events.filter(e => {
    const key = e.name.toLowerCase().replace(/\s+/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  console.log(`    Found ${unique.length} events from Meetup ${city}`);
  return unique;
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
async function main() {
  console.log(`\n🔍 Tech Events Scraper v2 — Singapore & Malaysia`);
  console.log(`   Today: ${TODAY}\n`);
  
  const locations = [
    { city: 'Singapore', country: 'Singapore', lumaSlug: 'singapore', ebSlug: 'singapore--singapore', ttSlug: 'singapore' },
    { city: 'Kuala Lumpur', country: 'Malaysia', lumaSlug: 'kuala-lumpur', ebSlug: 'malaysia--kuala-lumpur', ttSlug: 'malaysia' },
  ];
  
  for (const loc of locations) {
    console.log(`\n📍 ${loc.city}, ${loc.country}`);
    console.log('─'.repeat(40));
    
    const [lumaEvents, eventbriteEvents, tenTimesEvents, meetupEvents] = await Promise.allSettled([
      scrapeLuma(loc.lumaSlug, loc.city, loc.country),
      scrapeEventbrite(loc.ebSlug, loc.city, loc.country),
      scrape10Times(loc.ttSlug, loc.city, loc.country),
      scrapeMeetup(loc.city, loc.country),
    ]);
    
    for (const result of [lumaEvents, eventbriteEvents, tenTimesEvents, meetupEvents]) {
      if (result.status === 'fulfilled' && result.value) {
        allEvents.push(...result.value);
      }
    }
  }
  
  // Global deduplicate by name+date
  const seen = new Set();
  const unique = [];
  for (const evt of allEvents) {
    const key = `${evt.name.toLowerCase().replace(/[^a-z0-9]/g, '')}|${evt.dateStart}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(evt);
    }
  }
  
  unique.sort((a, b) => (a.dateStart || '9999').localeCompare(b.dateStart || '9999'));
  
  // Write CSV
  const headers = ['Event Name', 'Date Start', 'Date End', 'Country', 'City', 'Venue', 'Category', 'Focus Areas', 'Estimated Size', 'Ticket Type', 'Website URL', 'Source Platform', 'Notes'];
  const rows = unique.map(e => [
    e.name, e.dateStart, e.dateEnd, e.country, e.city, e.venue,
    e.category, e.focusAreas, e.size, e.ticketType, e.url, e.source, e.notes,
  ].map(csvEscape).join(','));
  
  const csv = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(CSV_PATH, csv);
  
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ Scraped ${unique.length} unique tech events`);
  console.log(`   File: ${CSV_PATH}`);
  
  const bySrc = {};
  for (const e of unique) { bySrc[e.source] = (bySrc[e.source] || 0) + 1; }
  console.log(`\n   By source:`);
  for (const [src, count] of Object.entries(bySrc).sort((a,b) => b[1] - a[1])) {
    console.log(`     ${src}: ${count}`);
  }
  
  const byCountry = {};
  for (const e of unique) { byCountry[e.country] = (byCountry[e.country] || 0) + 1; }
  console.log(`\n   By country:`);
  for (const [c, count] of Object.entries(byCountry)) {
    console.log(`     ${c}: ${count}`);
  }
}

main().catch(console.error);
