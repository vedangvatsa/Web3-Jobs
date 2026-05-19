#!/usr/bin/env node
/**
 * Expanded scraper — more Eventbrite keywords, Luma categories, Peatix, AllEvents
 */
import fs from 'fs';

const TODAY = '2026-05-19';
const CSV_PATH = '/Users/vedang/web3jobs/Web3-Jobs/scratch/extra-events.csv';

// Load existing URLs
const existing = fs.readFileSync('scratch/tech-events-sg-my.csv', 'utf8');
const seenUrls = new Set();
const seenNames = new Set();
for (const line of existing.split('\n').slice(1)) {
  const m = line.match(/https?:\/\/[^,"\s]+/g);
  if (m) m.forEach(u => seenUrls.add(u));
  const name = line.split(',')[0]?.replace(/"/g,'').toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,40);
  if (name) seenNames.add(name);
}
console.log(`Existing: ${seenUrls.size} URLs, ${seenNames.size} names\n`);

function esc(v) { if (!v) return ''; const s = String(v).replace(/"/g, '""'); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s; }

const TECH_KW = ['tech','ai','artificial intelligence','machine learning','blockchain','web3','crypto','developer','devops','cloud','data','startup','fintech','cybersecurity','saas','api','engineering','coding','python','javascript','react','kubernetes','docker','aws','defi','nft','solidity','ethereum','bitcoin','token','hackathon','open source','robotics','iot','quantum','llm','gpt','genai','product','agile','software','hardware','security','infosec','digital','innovation','deep tech','venture','founder','pitch','agent','agentic','semiconductor','computing','neural','code','automation','infrastructure','protocol','wallet','dao','solana','layer','zk','rollup','database','sql','full stack','backend','frontend','microservice','serverless','terraform','ansible','cicd','pipeline','scrum','kanban','ux','ui design','figma','wireframe'];

function isTech(n, d='') { return TECH_KW.some(k => (n+' '+d).toLowerCase().includes(k)); }

const allNew = [];

// ═══ 1. More Eventbrite keyword pages ═══
async function scrapeEB() {
  const keywords = [
    'technology-conference', 'artificial-intelligence', 'software-development',
    'data-engineering', 'cloud-summit', 'cybersecurity-conference',
    'product-management', 'ux-design', 'agile-scrum', 'devops-conference',
    'fintech-conference', 'startup-pitch', 'venture-capital',
    'quantum-computing', 'robotics-conference', 'iot-conference',
    'digital-transformation', 'networking-tech', 'coding-bootcamp',
    'fullstack', 'frontend', 'backend', 'kubernetes', 'terraform',
    'generative-ai', 'llm', 'semiconductor', 'chip-design',
    'embedded-systems', 'open-source', 'linux', 'database',
    'payment', 'insurtech', 'regtech', 'proptech', 'edtech',
    'healthtech', 'greentech', 'cleantech', 'smart-city',
    'innovation-summit', 'tech-week', 'developer-conference',
  ];
  
  for (const loc of ['singapore', 'malaysia']) {
    for (const kw of keywords) {
      const url = `https://www.eventbrite.com/d/${loc}/${kw}/`;
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html' },
          signal: AbortSignal.timeout(10000), redirect: 'follow',
        });
        if (!res.ok) continue;
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
              
              const name = (item.name || '').trim();
              const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,40);
              if (seenNames.has(nameKey)) continue;
              
              const startDate = item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '';
              if (startDate && startDate < TODAY) continue;
              if (!isTech(name, item.description || '')) continue;
              
              seenUrls.add(eventUrl);
              seenNames.add(nameKey);
              allNew.push([name, startDate,
                item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
                loc === 'singapore' ? 'Singapore' : 'Malaysia',
                loc === 'singapore' ? 'Singapore' : 'Kuala Lumpur',
                item.location?.name || '', 'Event', '', '', '',
                eventUrl, 'Eventbrite', '']);
              added++;
            }
          } catch (_) {}
        }
        if (added > 0) process.stdout.write(`  [EB] ${loc}/${kw}: +${added}\n`);
      } catch (_) {}
      await new Promise(r => setTimeout(r, 400));
    }
  }
}

// ═══ 2. More Luma categories ═══
async function scrapeLumaCategories() {
  const categories = ['ai', 'crypto', 'startup', 'design', 'science', 'business'];
  const geos = [
    { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore' },
    { lat: 3.139, lng: 101.6869, city: 'Kuala Lumpur', country: 'Malaysia' },
  ];
  
  for (const cat of categories) {
    for (const geo of geos) {
      let cursor = '';
      for (let p = 0; p < 20; p++) {
        const params = new URLSearchParams({
          category: `cat-${cat}`, geo_latitude: String(geo.lat), geo_longitude: String(geo.lng),
          geo_radius: '80mi', pagination_limit: '50',
        });
        if (cursor) params.set('pagination_cursor', cursor);
        
        try {
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
            
            const name = (ev.name || '').trim();
            const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,40);
            if (seenNames.has(nameKey)) continue;
            
            const st = ev.start_at ? new Date(ev.start_at) : null;
            if (st && st < new Date(TODAY)) continue;
            if (!isTech(name, ev.description || '')) continue;
            
            seenUrls.add(url); seenNames.add(nameKey);
            allNew.push([name, st ? st.toISOString().split('T')[0] : '',
              ev.end_at ? new Date(ev.end_at).toISOString().split('T')[0] : '',
              geo.country, geo.city, ev.geo_address_info?.full_address || '',
              'Community Event', '', '', '', url, 'Luma', '']);
            added++;
          }
          
          if (added > 0) process.stdout.write(`  [Luma] ${cat}/${geo.city}: +${added}\n`);
          if (!d.has_more || !d.next_cursor) break;
          cursor = d.next_cursor;
          await new Promise(r => setTimeout(r, 300));
        } catch (_) { break; }
      }
    }
  }
}

// ═══ 3. Peatix ═══
async function scrapePeatix() {
  for (const country of ['singapore', 'malaysia']) {
    for (const kw of ['tech', 'ai', 'blockchain', 'startup', 'developer', 'data', 'web3', 'cloud', 'hackathon', 'fintech', 'cybersecurity', 'software', 'innovation']) {
      try {
        const url = `https://peatix.com/search?q=${kw}&country=${country === 'singapore' ? 'SG' : 'MY'}&type=event&p=1`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html' },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) continue;
        const html = await res.text();
        
        // Extract JSON-LD
        const jsonLdMatches = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
        let added = 0;
        for (const match of jsonLdMatches) {
          try {
            const data = JSON.parse(match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, ''));
            const items = Array.isArray(data) ? data : [data];
            for (const item of items) {
              if (item?.['@type'] !== 'Event') continue;
              const eventUrl = item.url || '';
              if (!eventUrl || seenUrls.has(eventUrl)) continue;
              const name = (item.name || '').trim();
              if (!isTech(name)) continue;
              const startDate = item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '';
              if (startDate && startDate < TODAY) continue;
              seenUrls.add(eventUrl);
              allNew.push([name, startDate, '', country === 'singapore' ? 'Singapore' : 'Malaysia',
                country === 'singapore' ? 'Singapore' : 'Kuala Lumpur', '',
                'Event', '', '', '', eventUrl, 'Peatix', '']);
              added++;
            }
          } catch (_) {}
        }
        
        // Also try extracting from HTML links
        const eventLinks = html.match(/https:\/\/peatix\.com\/event\/\d+[^"'\s]*/g) || [];
        for (const link of eventLinks) {
          if (seenUrls.has(link)) continue;
          seenUrls.add(link);
          // We'd need to visit each link - skip for now, the JSON-LD should cover it
        }
        
        if (added > 0) process.stdout.write(`  [Peatix] ${country}/${kw}: +${added}\n`);
      } catch (_) {}
      await new Promise(r => setTimeout(r, 300));
    }
  }
}

// ═══ 4. AllEvents ═══
async function scrapeAllEvents() {
  for (const [loc, country, city] of [['singapore', 'Singapore', 'Singapore'], ['kuala-lumpur', 'Malaysia', 'Kuala Lumpur']]) {
    for (const cat of ['technology', 'science-and-tech', 'business', 'startup']) {
      try {
        const url = `https://allevents.in/${loc}/${cat}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html' },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) continue;
        const html = await res.text();
        
        const jsonLdMatches = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
        let added = 0;
        for (const match of jsonLdMatches) {
          try {
            const data = JSON.parse(match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, ''));
            const items = Array.isArray(data) ? data : (data?.itemListElement?.map(i => i.item || i) || [data]);
            for (const item of items) {
              if (!item?.name) continue;
              const eventUrl = item.url || '';
              if (!eventUrl || seenUrls.has(eventUrl)) continue;
              const name = (item.name || '').trim();
              if (!isTech(name, item.description || '')) continue;
              const startDate = item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '';
              if (startDate && startDate < TODAY) continue;
              seenUrls.add(eventUrl);
              allNew.push([name, startDate, '', country, city, item.location?.name || '',
                'Event', '', '', '', eventUrl, 'AllEvents', '']);
              added++;
            }
          } catch (_) {}
        }
        if (added > 0) process.stdout.write(`  [AllEvents] ${loc}/${cat}: +${added}\n`);
      } catch (_) {}
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

// ═══ 5. More Meetup topics ═══
async function scrapeMoreMeetup() {
  const topics = [
    'machine-learning', 'deep-learning', 'react', 'angular', 'vue-js',
    'kubernetes', 'docker', 'aws', 'azure', 'google-cloud',
    'rust', 'golang', 'java', 'csharp', 'ruby',
    'open-source', 'linux', 'agile', 'product-management',
    'ux-design', 'figma', 'mobile-development', 'ios-development',
    'android-development', 'flutter', 'gaming', 'game-development',
    'ethereum', 'solana', 'defi', 'nft',
    'internet-of-things', 'robotics', 'quantum-computing',
    'natural-language-processing', 'computer-vision',
  ];
  
  for (const loc of ['sg--Singapore', 'my--Kuala-Lumpur']) {
    const [code, city] = loc.split('--');
    const country = code === 'sg' ? 'Singapore' : 'Malaysia';
    
    for (const topic of topics) {
      try {
        const url = `https://www.meetup.com/find/?topic=${topic}&source=EVENTS&location=${loc}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html' },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) continue;
        const html = await res.text();
        const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (!match) continue;
        
        const data = JSON.parse(match[1]);
        const events = [];
        const find = (obj, d=0) => {
          if (d > 15 || !obj) return;
          if (typeof obj !== 'object') return;
          if (obj.title && (obj.dateTime || obj.eventUrl)) { events.push(obj); return; }
          if (Array.isArray(obj)) { for (const v of obj) find(v, d+1); }
          else { for (const v of Object.values(obj)) { if (typeof v === 'object') find(v, d+1); } }
        };
        find(data);
        
        let added = 0;
        for (const evt of events) {
          const eventUrl = evt.eventUrl || '';
          if (!eventUrl || seenUrls.has(eventUrl)) continue;
          const name = (evt.title || '').trim();
          const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,40);
          if (seenNames.has(nameKey)) continue;
          
          const startDate = evt.dateTime ? String(evt.dateTime).substring(0,10) : '';
          if (startDate && startDate < TODAY) continue;
          
          seenUrls.add(eventUrl); seenNames.add(nameKey);
          allNew.push([name, startDate, '', country, city, evt.venue?.name || '',
            'Meetup', '', evt.going ? `${evt.going} RSVPs` : '', 'Free',
            eventUrl, 'Meetup.com', evt.group?.name ? `Group: ${evt.group.name}` : '']);
          added++;
        }
        if (added > 0) process.stdout.write(`  [Meetup] ${city}/${topic}: +${added}\n`);
      } catch (_) {}
      await new Promise(r => setTimeout(r, 400));
    }
  }
}

async function main() {
  console.log('🔍 Expanded Scraper\n');
  
  console.log('--- Eventbrite ---');
  await scrapeEB();
  console.log(`  Subtotal: ${allNew.length}\n`);
  
  console.log('--- Luma Categories ---');
  await scrapeLumaCategories();
  console.log(`  Subtotal: ${allNew.length}\n`);
  
  console.log('--- Peatix ---');
  await scrapePeatix();
  console.log(`  Subtotal: ${allNew.length}\n`);
  
  console.log('--- AllEvents ---');
  await scrapeAllEvents();
  console.log(`  Subtotal: ${allNew.length}\n`);
  
  console.log('--- More Meetup ---');
  await scrapeMoreMeetup();
  console.log(`  Subtotal: ${allNew.length}\n`);
  
  allNew.sort((a, b) => (a[1] || '9999').localeCompare(b[1] || '9999'));
  
  const headers = ['Event Name','Date Start','Date End','Country','City','Venue','Category','Focus Areas','Estimated Size','Ticket Type','Website URL','Source Platform','Notes'];
  const rows = allNew.map(r => r.map(esc).join(','));
  fs.writeFileSync(CSV_PATH, [headers.join(','), ...rows].join('\n'));
  
  console.log(`\n✅ New events found: ${allNew.length}`);
  console.log(`   File: ${CSV_PATH}`);
}

main().catch(console.error);
