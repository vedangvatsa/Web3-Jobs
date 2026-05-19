#!/usr/bin/env node
import fs from 'fs';

const existing = fs.readFileSync('scratch/tech-events-sg-my.csv', 'utf8');
const seenUrls = new Set();
for (const line of existing.split('\n').slice(1)) {
  const m = line.match(/https?:\/\/lu\.ma\/[^,"\s]+/g);
  if (m) m.forEach(u => seenUrls.add(u));
}
console.log(`Existing Luma URLs: ${seenUrls.size}`);

const catRes = await fetch('https://api.lu.ma/url?url=crypto', { headers: { accept: 'application/json', 'x-luma-client-type': 'web' } });
const catData = JSON.parse((await catRes.text()).replace(/[\x00-\x1F\x7F]/g, ' '));
const catId = catData?.data?.category?.api_id || 'cat-crypto';
console.log('Category:', catId);

const geos = [
  { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore' },
  { lat: 3.1390, lng: 101.6869, city: 'Kuala Lumpur', country: 'Malaysia' },
];

const newEvents = [];

for (const geo of geos) {
  let cursor = '';
  console.log(`\n📍 ${geo.city}:`);
  
  for (let p = 0; p < 20; p++) {
    const params = new URLSearchParams({
      category: catId,
      geo_latitude: String(geo.lat), geo_longitude: String(geo.lng),
      geo_radius: '80mi', pagination_limit: '50',
    });
    if (cursor) params.set('pagination_cursor', cursor);
    
    const res = await fetch(`https://api.lu.ma/discover/get-paginated-events?${params}`, {
      headers: { accept: 'application/json', 'x-luma-client-type': 'web' },
      signal: AbortSignal.timeout(10000),
    });
    const d = JSON.parse((await res.text()).replace(/[\x00-\x1F\x7F]/g, ' '));
    const entries = d.entries || [];
    
    let added = 0;
    for (const e of entries) {
      const ev = e?.event;
      if (!ev) continue;
      const url = ev.url ? `https://lu.ma/${ev.url}` : '';
      if (!url || seenUrls.has(url)) continue;
      
      const st = ev.start_at ? new Date(ev.start_at) : null;
      if (st && st < new Date('2026-05-19')) continue;
      
      seenUrls.add(url);
      newEvents.push([
        (ev.name||'').trim(),
        st ? st.toISOString().split('T')[0] : '',
        ev.end_at ? new Date(ev.end_at).toISOString().split('T')[0] : '',
        geo.country, geo.city,
        ev.geo_address_info?.full_address || '', 'Community Event', '', '', '',
        url, 'Luma', '',
      ]);
      added++;
    }
    
    console.log(`  Page ${p+1}: ${entries.length} entries, ${added} new ${d.has_more ? '→' : '✓'}`);
    if (!d.has_more || !d.next_cursor) break;
    cursor = d.next_cursor;
    await new Promise(r => setTimeout(r, 300));
  }
}

console.log(`\nNew crypto Luma events: ${newEvents.length}`);
for (const e of newEvents) console.log(`  ${e[1]} | ${e[3].substring(0,5)} | ${e[0].substring(0,70)}`);

if (newEvents.length > 0) {
  function esc(v) { if (!v) return ''; const s = String(v).replace(/"/g, '""'); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s; }
  fs.appendFileSync('scratch/tech-events-sg-my.csv', '\n' + newEvents.map(r => r.map(esc).join(',')).join('\n'));
  console.log('Appended to CSV');
}

const total = fs.readFileSync('scratch/tech-events-sg-my.csv', 'utf8').split('\n').filter(l => l.trim()).length - 1;
console.log(`Total events: ${total}`);
