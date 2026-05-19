#!/usr/bin/env node
import fs from 'fs';

// ─── Load existing events to dedup ───
const existing = fs.readFileSync('scratch/tech-events-sg-my.csv', 'utf8');
const seenUrls = new Set();
const seenKeys = new Set();
for (const line of existing.split('\n').slice(1)) {
  const m = line.match(/https?:\/\/[^,"\s]+/g);
  if (m) m.forEach(u => seenUrls.add(u));
  const name = line.split(',')[0]?.replace(/"/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
  if (name) seenKeys.add(name);
}
console.log(`Existing URLs: ${seenUrls.size}`);

// ─── STRICT tech keyword filter ───
const TECH_WORDS = [
  'ai','artificial intelligence','machine learning','deep learning','neural network',
  'blockchain','web3','crypto','defi','nft','dao','solana','ethereum','bitcoin','token',
  'smart contract','onchain','on-chain','layer 2','layer-2','zk','zero knowledge',
  'developer','devops','sre','cloud','aws','azure','gcp','google cloud','alibaba cloud',
  'data science','data engineering','data analytics','big data','data pipeline',
  'python','javascript','typescript','golang','rust','ruby','java','kotlin','swift',
  'react','angular','vue','node','django','flask','fastapi','next.js',
  'kubernetes','docker','terraform','ansible','ci/cd','microservice','serverless',
  'cybersecurity','infosec','penetration test','ethical hacking','malware','threat',
  'information security','iso 27001','soc analyst','vulnerability',
  'software','hardware','semiconductor','computing','computer science',
  'api','graphql','rest api','sdk','open source','linux','git',
  'saas','fintech','proptech','edtech','healthtech','insurtech','regtech',
  'startup','hackathon','demo day','pitch','accelerator','incubator',
  'robotics','iot','internet of things','automation','embedded',
  'quantum','5g','edge computing','digital twin',
  'llm','gpt','genai','generative ai','prompt engineering','langchain',
  'claude','openai','gemini','anthropic','copilot',
  'agile','scrum','product management','ux design','ui design',
  'figma','design system',
  'grafana','mongodb','redis','kafka','elasticsearch','postgresql','mysql',
  'spark','hadoop','airflow','mlflow','kubeflow',
  'wasm','webgl','cuda','fpga','arduino','raspberry pi',
  'pycon','gophercon','rustcon','jsconf','devcon',
  'venture capital','angel invest','seed fund',
  'deep tech','cleantech','greentech',
  'encryption','privacy','gdpr','compliance',
  'observability','monitoring','logging','tracing',
  'test automation','selenium','playwright','cypress',
  'no-code','low-code','power bi','tableau',
  'agentic','agent','coding','code','programmer','engineering',
  'fullstack','full stack','backend','frontend','devrel',
  'network security','firewall','dns','vpn','ssl','tls',
  'cicd','pipeline','deployment','infrastructure',
  'staking','validator','bridge','swap','liquidity','dex','amm',
  'protocol','wallet','consensus','rollup',
];

// Words that DISQUALIFY even if tech word matches
const BLACKLIST = [
  'painting','batik','art workshop','sip and paint','craft','drawing','sculpture',
  'sound healing','singing bowl','gong bath','crystal bowl','meditation','yoga',
  'pilates','reiki','tantra','breathing','mindful','wellness','spiritual',
  'cooking','recipe','food fair','durian','wine tasting','cocktail','cheese',
  'first aid','dental','nursing','surgery','cardiology','oncology','pharma',
  'running club','marathon','cycling','hiking','swimming','badminton','football',
  'fashion week','jewellery','beauty expo','hair','makeup',
  'property showcase','renovation fair','real estate',
  'board game','dating','speed networking','yacht affair',
  'kids camp','ages 4-','ages 5-','ages 6-','ages 7-','ages 8-','ages 9-',
  'children','toddler','parent-child',
  'church','prayer','bible','worship','sermon',
  'sustainability tour','nature tour','garden tour','heritage trail',
  'vending machine','agriculture','fisheries','aquaculture',
  'shipping network','port terminal','dredging','container depot',
  'candle making','terrarium','flower arrangement',
  'concert','ballet','theatre','musical','dance show',
  'astrology','horoscope','tarot',
];

function isTechEvent(name) {
  const nl = name.toLowerCase();
  // Check blacklist first
  if (BLACKLIST.some(b => nl.includes(b))) return false;
  // Must contain at least one real tech word
  return TECH_WORDS.some(t => nl.includes(t));
}

function esc(v) {
  if (!v) return '-';
  const s = String(v).replace(/"/g, '""').trim();
  if (!s) return '-';
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}

const allNew = [];
let totalFetched = 0;

// ─── EVENTBRITE SCRAPER ───
async function fetchEB(url, country, city) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(15000), redirect: 'follow',
    });
    if (!res.ok) return 0;
    const html = await res.text();
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
    let added = 0;
    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, ''));
        const items = Array.isArray(data) ? data : (data?.itemListElement?.map(i => i.item) || [data]);
        for (const item of items) {
          if (item?.['@type'] !== 'Event') continue;
          const eventUrl = item.url || '';
          if (!eventUrl || seenUrls.has(eventUrl)) continue;
          const name = (item.name || '').trim();
          if (!name) continue;
          const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
          if (seenKeys.has(nameKey)) continue;
          const startDate = item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '';
          if (startDate && startDate < '2026-05-19') continue;
          if (!isTechEvent(name)) continue;
          seenUrls.add(eventUrl); seenKeys.add(nameKey);
          allNew.push([name, startDate, item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '-', country, city, item.location?.name || '-', 'Event', '-', '-', '-', eventUrl, 'Eventbrite', '-']);
          added++;
        }
      } catch (_) {}
    }
    totalFetched++;
    return added;
  } catch (_) { return 0; }
}

// ─── LUMA SCRAPER ───
async function fetchLuma(lat, lng, country, city) {
  let added = 0;
  let cursor = null;
  for (let page = 0; page < 20; page++) {
    try {
      let url = `https://api.lu.ma/discover/get-paginated-events?latitude=${lat}&longitude=${lng}&source=geo`;
      if (cursor) url += `&pagination_cursor=${encodeURIComponent(cursor)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) break;
      const json = await res.json();
      const entries = json?.entries || [];
      if (entries.length === 0) break;
      for (const entry of entries) {
        const ev = entry?.event;
        if (!ev) continue;
        const name = (ev.name || '').trim();
        if (!name) continue;
        const eventUrl = ev.url ? `https://lu.ma/${ev.url}` : '';
        if (eventUrl && seenUrls.has(eventUrl)) continue;
        const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
        if (seenKeys.has(nameKey)) continue;
        const startDate = ev.start_at ? new Date(ev.start_at).toISOString().split('T')[0] : '';
        if (startDate && startDate < '2026-05-19') continue;
        if (!isTechEvent(name)) continue;
        if (eventUrl) seenUrls.add(eventUrl);
        seenKeys.add(nameKey);
        allNew.push([name, startDate, ev.end_at ? new Date(ev.end_at).toISOString().split('T')[0] : '-', country, city, ev.geo_address_info?.city || city, 'Event', '-', '-', '-', eventUrl, 'Luma', '-']);
        added++;
      }
      cursor = json?.next_cursor;
      if (!cursor) break;
      await new Promise(r => setTimeout(r, 300));
    } catch (_) { break; }
  }
  totalFetched++;
  return added;
}

// ─── LUMA PLACE-BASED SCRAPER ───
async function fetchLumaPlace(placeId, country, city) {
  let added = 0;
  try {
    const url = `https://api.lu.ma/discover/get-paginated-events?source=place&place_api_id=${placeId}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return 0;
    const json = await res.json();
    const entries = json?.entries || [];
    for (const entry of entries) {
      const ev = entry?.event;
      if (!ev) continue;
      const name = (ev.name || '').trim();
      if (!name) continue;
      const eventUrl = ev.url ? `https://lu.ma/${ev.url}` : '';
      if (eventUrl && seenUrls.has(eventUrl)) continue;
      const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
      if (seenKeys.has(nameKey)) continue;
      const startDate = ev.start_at ? new Date(ev.start_at).toISOString().split('T')[0] : '';
      if (startDate && startDate < '2026-05-19') continue;
      if (!isTechEvent(name)) continue;
      if (eventUrl) seenUrls.add(eventUrl);
      seenKeys.add(nameKey);
      allNew.push([name, startDate, ev.end_at ? new Date(ev.end_at).toISOString().split('T')[0] : '-', country, city, city, 'Event', '-', '-', '-', eventUrl, 'Luma', '-']);
      added++;
    }
  } catch (_) {}
  return added;
}

// ─── MAIN ───
async function main() {
  // === EVENTBRITE: Strict tech keywords only ===
  const ebKeywords = [
    // Core tech
    'artificial-intelligence','machine-learning','deep-learning','data-science',
    'software-engineering','software-development','web-development','mobile-development',
    'cloud-computing','cybersecurity','information-security','network-security',
    'blockchain','cryptocurrency','bitcoin','ethereum','web3','defi','nft',
    'python','javascript','react','nodejs','golang','rust','java','kotlin',
    'devops','kubernetes','docker','terraform','aws','azure','google-cloud',
    'startup','hackathon','tech-startup','fintech','saas',
    'robotics','iot','internet-of-things','automation',
    'quantum-computing','edge-computing','5g',
    'open-source','linux','github',
    'agile','scrum','product-management',
    'ux-research','ui-ux-design',
    'generative-ai','llm','chatgpt','prompt-engineering',
    'api-development','microservices','serverless',
    'big-data','data-engineering','data-analytics',
    'test-automation','qa-testing','selenium',
    'venture-capital','angel-investing','seed-funding',
    'deep-tech','cleantech',
    // Niche
    'computer-vision','natural-language-processing','reinforcement-learning',
    'embedded-systems','semiconductor','fpga',
    'crypto-trading','crypto-exchange','smart-contract',
    'devsecops','penetration-testing','ethical-hacking',
    'grafana','mongodb','postgresql','redis','kafka','elasticsearch',
    'flutter','swift-programming','typescript',
    'figma','design-system',
    'no-code','low-code',
    'power-bi','tableau','salesforce',
    'site-reliability','observability','monitoring',
  ];

  console.log('=== EVENTBRITE ===');
  for (const loc of ['singapore', 'malaysia--kuala-lumpur', 'malaysia--penang', 'malaysia--johor-bahru']) {
    const country = loc.startsWith('malaysia') ? 'Malaysia' : 'Singapore';
    const city = loc === 'singapore' ? 'Singapore' : loc.includes('penang') ? 'Penang' : loc.includes('johor') ? 'Johor Bahru' : 'Kuala Lumpur';
    for (const kw of ebKeywords) {
      for (let page = 1; page <= 10; page++) {
        const url = page === 1
          ? `https://www.eventbrite.com/d/${loc}/${kw}/`
          : `https://www.eventbrite.com/d/${loc}/${kw}/?page=${page}`;
        const added = await fetchEB(url, country, city);
        if (added > 0) process.stdout.write(`  [EB] ${loc}/${kw}/p${page}: +${added} (total: ${allNew.length})\n`);
        if (added === 0) break;
        await new Promise(r => setTimeout(r, 250));
      }
      if (allNew.length >= 500) break;
    }
    if (allNew.length >= 500) break;
  }

  // === LUMA: Geo-based ===
  if (allNew.length < 500) {
    console.log('\n=== LUMA GEO ===');
    const geoTargets = [
      { lat: 1.3521, lng: 103.8198, country: 'Singapore', city: 'Singapore' },
      { lat: 1.2904, lng: 103.8515, country: 'Singapore', city: 'Singapore' }, // CBD
      { lat: 1.2966, lng: 103.7764, country: 'Singapore', city: 'Singapore' }, // one-north
      { lat: 3.1390, lng: 101.6869, country: 'Malaysia', city: 'Kuala Lumpur' },
      { lat: 3.1579, lng: 101.7116, country: 'Malaysia', city: 'Kuala Lumpur' }, // KLCC
      { lat: 2.9264, lng: 101.6964, country: 'Malaysia', city: 'Cyberjaya' },
      { lat: 5.4141, lng: 100.3288, country: 'Malaysia', city: 'Penang' },
      { lat: 1.4927, lng: 103.7414, country: 'Malaysia', city: 'Johor Bahru' },
    ];
    for (const t of geoTargets) {
      const added = await fetchLuma(t.lat, t.lng, t.country, t.city);
      if (added > 0) console.log(`  [Luma Geo] ${t.city}: +${added} (total: ${allNew.length})`);
    }
  }

  // === LUMA: Place-based ===
  if (allNew.length < 500) {
    console.log('\n=== LUMA PLACES ===');
    const places = [
      { id: 'ChIJdZOLiiMR2jERxPWrUs9peIg', country: 'Singapore', city: 'Singapore' }, // SG
      { id: 'ChIJ5-rvAcdJzDERfSgcL1uO2fQ', country: 'Malaysia', city: 'Kuala Lumpur' }, // KL
    ];
    for (const p of places) {
      const added = await fetchLumaPlace(p.id, p.country, p.city);
      if (added > 0) console.log(`  [Luma Place] ${p.city}: +${added} (total: ${allNew.length})`);
    }
  }

  // === EVENTBRITE: Date ranges ===
  if (allNew.length < 500) {
    console.log('\n=== EB DATE RANGES ===');
    const dateKws = ['ai','blockchain','startup','developer','data','cloud','python','cybersecurity','fintech','hackathon','software','devops','robotics','iot','saas','web3','crypto'];
    const dates = ['next-month','next-3-months'];
    for (const loc of ['singapore','malaysia']) {
      const country = loc === 'singapore' ? 'Singapore' : 'Malaysia';
      const city = loc === 'singapore' ? 'Singapore' : 'Kuala Lumpur';
      for (const kw of dateKws) {
        for (const df of dates) {
          for (let page = 1; page <= 10; page++) {
            const url = page === 1 ? `https://www.eventbrite.com/d/${loc}/${kw}--${df}/` : `https://www.eventbrite.com/d/${loc}/${kw}--${df}/?page=${page}`;
            const added = await fetchEB(url, country, city);
            if (added > 0) process.stdout.write(`  [EB] ${loc}/${kw}/${df}/p${page}: +${added} (total: ${allNew.length})\n`);
            if (added === 0) break;
            await new Promise(r => setTimeout(r, 250));
          }
        }
        if (allNew.length >= 500) break;
      }
      if (allNew.length >= 500) break;
    }
  }

  // Write output
  allNew.sort((a, b) => (a[1] || '9999').localeCompare(b[1] || '9999'));
  const headers = 'Event Name,Date Start,Date End,Country,City,Venue,Category,Focus Areas,Estimated Size,Ticket Type,Website URL,Source Platform,Notes';
  fs.writeFileSync('scratch/new-500-events.csv', [headers, ...allNew.map(r => r.map(esc).join(','))].join('\n'));
  console.log(`\n✅ ${allNew.length} new verified tech events → scratch/new-500-events.csv`);
  console.log(`   Total API calls: ${totalFetched}`);
}

main().catch(console.error);
