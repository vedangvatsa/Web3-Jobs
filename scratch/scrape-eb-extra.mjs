#!/usr/bin/env node
/**
 * Extra Eventbrite category pages scraper
 */
import fs from 'fs';

const URLS = [
  ['https://www.eventbrite.com/d/singapore/tech-meetup/', 'Singapore', 'Singapore'],
  ['https://www.eventbrite.com/d/malaysia/tech-meetup/', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.eventbrite.com/d/singapore/ai-conference/', 'Singapore', 'Singapore'],
  ['https://www.eventbrite.com/d/malaysia/ai-conference/', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.eventbrite.com/d/singapore/blockchain-crypto/', 'Singapore', 'Singapore'],
  ['https://www.eventbrite.com/d/malaysia/blockchain-crypto/', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.eventbrite.com/d/singapore/web3/', 'Singapore', 'Singapore'],
  ['https://www.eventbrite.com/d/malaysia/web3/', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.eventbrite.com/d/singapore/hackathon/', 'Singapore', 'Singapore'],
  ['https://www.eventbrite.com/d/malaysia/hackathon/', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.eventbrite.com/d/singapore/deep-tech/', 'Singapore', 'Singapore'],
  ['https://www.eventbrite.com/d/malaysia/deep-tech/', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.eventbrite.com/d/singapore/saas/', 'Singapore', 'Singapore'],
  ['https://www.eventbrite.com/d/singapore/devops/', 'Singapore', 'Singapore'],
  ['https://www.eventbrite.com/d/singapore/machine-learning/', 'Singapore', 'Singapore'],
  ['https://www.eventbrite.com/d/malaysia/machine-learning/', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.eventbrite.com/d/singapore/robotics/', 'Singapore', 'Singapore'],
  ['https://www.eventbrite.com/d/singapore/iot/', 'Singapore', 'Singapore'],
  ['https://www.eventbrite.com/d/malaysia/digital-transformation/', 'Kuala Lumpur', 'Malaysia'],
  ['https://www.eventbrite.com/d/singapore/data-analytics/', 'Singapore', 'Singapore'],
];

const seenUrls = new Set();
const existing = fs.readFileSync('scratch/tech-events-sg-my.csv', 'utf8');
for (const line of existing.split('\n').slice(1)) {
  const m = line.match(/https?:\/\/[^,"\s]+/g);
  if (m) m.forEach(u => seenUrls.add(u));
}
console.log(`Existing URLs: ${seenUrls.size}`);

const newEvents = [];

for (const [url, city, country] of URLS) {
  try {
    const slug = url.split('/d/')[1]?.replace(/\/$/, '') || '';
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html' },
      redirect: 'follow', signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) { console.log(`${slug}: HTTP ${res.status}`); continue; }
    
    const html = await res.text();
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
    
    let added = 0;
    for (const match of jsonLdMatches) {
      try {
        const jsonStr = match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
        const parsed = JSON.parse(jsonStr);
        const items = Array.isArray(parsed) ? parsed : (parsed?.itemListElement?.map(i => i.item) || [parsed]);
        
        for (const item of items) {
          if (item?.['@type'] !== 'Event') continue;
          const eventUrl = item.url || '';
          if (!eventUrl || seenUrls.has(eventUrl)) continue;
          seenUrls.add(eventUrl);
          
          const startDate = item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '';
          if (startDate && startDate < '2026-05-19') continue;
          
          const endDate = item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '';
          const locName = item.location?.name || '';
          
          newEvents.push([
            (item.name || '').trim(), startDate, endDate, country, city, locName,
            'Event', '', '', item.isAccessibleForFree ? 'Free' : 'Paid',
            eventUrl, 'Eventbrite', '',
          ]);
          added++;
        }
      } catch (_) {}
    }
    
    console.log(`${slug}: ${added} new`);
    await new Promise(r => setTimeout(r, 800));
  } catch (err) {
    console.log(`Error: ${err.message.substring(0, 60)}`);
  }
}

console.log(`\nNew Eventbrite events: ${newEvents.length}`);

if (newEvents.length > 0) {
  function esc(v) { if (!v) return ''; const s = String(v).replace(/"/g, '""'); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s; }
  const lines = newEvents.map(r => r.map(esc).join(','));
  fs.appendFileSync('scratch/tech-events-sg-my.csv', '\n' + lines.join('\n'));
  console.log('Appended to CSV');
}

// Final count
const final = fs.readFileSync('scratch/tech-events-sg-my.csv', 'utf8').split('\n').filter(l => l.trim()).length - 1;
console.log(`Total events in CSV: ${final}`);
