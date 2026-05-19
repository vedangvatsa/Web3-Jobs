#!/usr/bin/env node
/**
 * Meetup Scraper — curl __NEXT_DATA__ extraction from category/topic pages
 */
import fs from 'fs';

const TODAY = '2026-05-19';
const CSV_PATH = '/Users/vedang/web3jobs/Web3-Jobs/scratch/meetup-events.csv';

const URLS = [
  // Category pages
  ['https://www.meetup.com/find/sg--singapore/technology/', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/my--kuala-lumpur/technology/', 'Kuala Lumpur', 'Malaysia'],
  // Topic + location searches
  ['https://www.meetup.com/find/?topic=technology&source=EVENTS&categoryId=546&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=technology&source=EVENTS&categoryId=546&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=artificial-intelligence&source=EVENTS&categoryId=546&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=artificial-intelligence&source=EVENTS&categoryId=546&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=blockchain&source=EVENTS&categoryId=546&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=blockchain&source=EVENTS&categoryId=546&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=web-development&source=EVENTS&categoryId=546&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=web-development&source=EVENTS&categoryId=546&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=data-science&source=EVENTS&categoryId=546&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=data-science&source=EVENTS&categoryId=546&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=cloud-computing&source=EVENTS&categoryId=546&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=cloud-computing&source=EVENTS&categoryId=546&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=startup&source=EVENTS&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=startup&source=EVENTS&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=cybersecurity&source=EVENTS&categoryId=546&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=cybersecurity&source=EVENTS&categoryId=546&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=python&source=EVENTS&categoryId=546&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=python&source=EVENTS&categoryId=546&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=devops&source=EVENTS&categoryId=546&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=devops&source=EVENTS&categoryId=546&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=javascript&source=EVENTS&categoryId=546&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=javascript&source=EVENTS&categoryId=546&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=software-engineering&source=EVENTS&categoryId=546&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=software-engineering&source=EVENTS&categoryId=546&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=fintech&source=EVENTS&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=fintech&source=EVENTS&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.meetup.com/find/?topic=cryptocurrency&source=EVENTS&location=sg--Singapore', 'Singapore', 'Singapore'],
  ['https://www.meetup.com/find/?topic=cryptocurrency&source=EVENTS&location=my--Kuala-Lumpur', 'Kuala Lumpur', 'Malaysia'],
];

function csvEscape(v) {
  if (!v) return '';
  const s = String(v).replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}

function findEvents(obj, events, depth = 0) {
  if (depth > 15 || !obj) return;
  if (typeof obj !== 'object') return;
  if (obj.title && (obj.dateTime || obj.eventUrl)) {
    events.push(obj);
    return;
  }
  if (Array.isArray(obj)) {
    for (const v of obj) findEvents(v, events, depth + 1);
  } else {
    for (const v of Object.values(obj)) {
      if (typeof v === 'object') findEvents(v, events, depth + 1);
    }
  }
}

async function main() {
  console.log('🔍 Meetup Scraper — __NEXT_DATA__ extraction\n');
  
  const seenUrls = new Set();
  const allEvents = [];
  
  for (const [url, city, country] of URLS) {
    try {
      const topic = url.includes('topic=') ? url.match(/topic=([^&]+)/)[1] : url.split('/').filter(Boolean).pop();
      
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });
      
      if (!res.ok) {
        console.log(`  [${city}] ${topic}: HTTP ${res.status}`);
        continue;
      }
      
      const html = await res.text();
      const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      
      if (!match) {
        console.log(`  [${city}] ${topic}: no __NEXT_DATA__`);
        continue;
      }
      
      const data = JSON.parse(match[1]);
      const events = [];
      findEvents(data, events);
      
      let added = 0;
      for (const evt of events) {
        const eventUrl = evt.eventUrl || '';
        if (!eventUrl || seenUrls.has(eventUrl)) continue;
        seenUrls.add(eventUrl);
        
        const startDate = evt.dateTime ? String(evt.dateTime).substring(0, 10) : '';
        if (startDate && startDate < TODAY) continue;
        
        const endDate = evt.endTime ? String(evt.endTime).substring(0, 10) : '';
        const venueName = evt.venue?.name || '';
        const groupName = evt.group?.name || '';
        const going = evt.going || 0;
        
        allEvents.push([
          (evt.title || '').trim(),
          startDate, endDate, country, city, venueName,
          'Meetup', '', going ? `${going} RSVPs` : '', 'Free',
          eventUrl, 'Meetup.com', groupName ? `Group: ${groupName}` : '',
        ]);
        added++;
      }
      
      console.log(`  [${city}] ${topic}: ${events.length} found, ${added} new`);
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`  Error: ${err.message.substring(0, 60)}`);
    }
  }
  
  // Sort by date
  allEvents.sort((a, b) => (a[1] || '9999').localeCompare(b[1] || '9999'));
  
  // Write CSV
  const headers = ['Event Name','Date Start','Date End','Country','City','Venue','Category','Focus Areas','Estimated Size','Ticket Type','Website URL','Source Platform','Notes'];
  const rows = allEvents.map(r => r.map(csvEscape).join(','));
  fs.writeFileSync(CSV_PATH, [headers.join(','), ...rows].join('\n'));
  
  console.log(`\n✅ Meetup: ${allEvents.length} unique events → ${CSV_PATH}`);
  
  // By city
  const byCity = {};
  for (const e of allEvents) byCity[e[4]] = (byCity[e[4]] || 0) + 1;
  for (const [c, n] of Object.entries(byCity)) console.log(`  ${c}: ${n}`);
}

main().catch(console.error);
