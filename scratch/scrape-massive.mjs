#!/usr/bin/env node
/**
 * Massive expansion scraper — Eventbrite pagination + e27 + more EB keywords + Eventbrite.sg
 */
import fs from 'fs';

const TODAY = '2026-05-19';

// Load existing
const existing = fs.readFileSync('scratch/tech-events-sg-my.csv', 'utf8');
const seenUrls = new Set();
const seenNames = new Set();
for (const line of existing.split('\n').slice(1)) {
  const m = line.match(/https?:\/\/[^,"\s]+/g);
  if (m) m.forEach(u => seenUrls.add(u));
  const name = line.split(',')[0]?.replace(/"/g,'').toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,40);
  if (name) seenNames.add(name);
}
console.log(`Existing: ${seenUrls.size} URLs\n`);

function esc(v) { if (!v) return ''; const s = String(v).replace(/"/g, '""'); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s; }

const TECH_KW = ['tech','ai','artificial intelligence','machine learning','blockchain','web3','crypto','developer','devops','cloud','data','startup','fintech','cybersecurity','saas','api','engineering','coding','python','javascript','react','kubernetes','docker','aws','defi','nft','solidity','ethereum','bitcoin','token','hackathon','open source','robotics','iot','quantum','llm','gpt','genai','product','agile','software','hardware','security','infosec','digital','innovation','deep tech','venture','founder','pitch','agent','agentic','semiconductor','computing','code','automation','infrastructure','protocol','wallet','dao','solana','layer','zk','rollup','database','sql','backend','frontend','serverless','terraform','ansible','pipeline','scrum','figma','conference','summit','expo','meetup','workshop','demo day','pycon','gophercon','grafana','mongodb','claude','openai','gemini','anthropic','google cloud','azure','network','cyber','malware','threat','devsecops','embedded','ux','ui design'];

function isTechName(n) { return TECH_KW.some(k => n.toLowerCase().includes(k)); }

const allNew = [];

async function fetchEB(url, country, city) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(12000), redirect: 'follow',
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
          const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,40);
          if (seenNames.has(nameKey)) continue;
          const startDate = item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '';
          if (startDate && startDate < TODAY) continue;
          if (!isTechName(name)) continue;
          seenUrls.add(eventUrl); seenNames.add(nameKey);
          allNew.push([name, startDate, item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '', country, city, item.location?.name || '', 'Event', '', '', '', eventUrl, 'Eventbrite', '']);
          added++;
        }
      } catch (_) {}
    }
    return added;
  } catch (_) { return 0; }
}

async function main() {
  console.log('🚀 Massive expansion scraper\n');
  
  // ═══ 1. Eventbrite with page parameter (page=2,3,4...) ═══
  console.log('--- Eventbrite Pagination ---');
  const ebKeywords = [
    'technology', 'artificial-intelligence', 'software', 'data-science',
    'cloud-computing', 'cybersecurity', 'startup', 'fintech', 'blockchain',
    'web3', 'hackathon', 'developer', 'machine-learning', 'devops',
    'product-management', 'agile', 'digital-transformation', 'innovation',
    'iot', 'robotics', 'quantum-computing', 'semiconductor', 'open-source',
    'networking-tech', 'coding', 'ai', 'tech', 'deep-tech',
    'venture-capital', 'startup-pitch', 'saas', 'api', 'microservices',
    'python', 'javascript', 'react', 'node-js', 'golang', 'rust',
    'aws', 'google-cloud', 'azure', 'terraform', 'kubernetes',
    'data-engineering', 'data-analytics', 'big-data', 'nlp',
    'computer-vision', 'generative-ai', 'llm', 'prompt-engineering',
    'crypto-trading', 'defi', 'nft', 'solana', 'ethereum',
    'gaming-tech', 'game-development', 'unity', 'unreal',
    'mobile-development', 'ios-development', 'android-development',
    'ux-research', 'ui-design', 'design-system', 'accessibility',
    'payment-technology', 'insurtech', 'regtech', 'proptech', 'edtech',
    'healthtech', 'biotech', 'cleantech', 'greentech', 'smart-city',
    'embedded-systems', 'chip-design', 'electronics', 'pcb-design',
    'cloud-security', 'network-security', 'application-security',
    'penetration-testing', 'ethical-hacking', 'bug-bounty',
  ];
  
  for (const loc of ['singapore', 'malaysia']) {
    const country = loc === 'singapore' ? 'Singapore' : 'Malaysia';
    const city = loc === 'singapore' ? 'Singapore' : 'Kuala Lumpur';
    
    for (const kw of ebKeywords) {
      for (let page = 1; page <= 5; page++) {
        const url = page === 1
          ? `https://www.eventbrite.com/d/${loc}/${kw}/`
          : `https://www.eventbrite.com/d/${loc}/${kw}/?page=${page}`;
        
        const added = await fetchEB(url, country, city);
        if (added > 0) process.stdout.write(`  [EB] ${loc}/${kw}/p${page}: +${added}\n`);
        if (added === 0 && page > 1) break; // No more pages
        await new Promise(r => setTimeout(r, 350));
      }
    }
  }
  console.log(`  EB subtotal: ${allNew.length}\n`);
  
  // ═══ 2. Eventbrite.sg domain ═══
  console.log('--- Eventbrite.sg ---');
  for (const kw of ['tech', 'ai', 'blockchain', 'startup', 'developer', 'data', 'cloud', 'hackathon', 'fintech', 'cybersecurity', 'innovation', 'software', 'devops', 'iot', 'robotics']) {
    const url = `https://www.eventbrite.sg/d/singapore/${kw}/`;
    const added = await fetchEB(url, 'Singapore', 'Singapore');
    if (added > 0) process.stdout.write(`  [EB.sg] ${kw}: +${added}\n`);
    await new Promise(r => setTimeout(r, 400));
  }
  console.log(`  Total so far: ${allNew.length}\n`);
  
  // ═══ 3. e27 events ═══
  console.log('--- e27 ---');
  try {
    const e27res = await fetch('https://e27.co/events/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(10000),
    });
    if (e27res.ok) {
      const html = await e27res.text();
      const jsonLdMatches = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
      let added = 0;
      for (const match of jsonLdMatches) {
        try {
          const data = JSON.parse(match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, ''));
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            if (item?.['@type'] !== 'Event') continue;
            const loc = JSON.stringify(item.location || '').toLowerCase();
            if (!loc.includes('singapore') && !loc.includes('malaysia') && !loc.includes('kuala')) continue;
            const eventUrl = item.url || '';
            if (!eventUrl || seenUrls.has(eventUrl)) continue;
            const name = (item.name || '').trim();
            if (!isTechName(name)) continue;
            const startDate = item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '';
            if (startDate && startDate < TODAY) continue;
            const isSG = loc.includes('singapore');
            seenUrls.add(eventUrl);
            allNew.push([name, startDate, '', isSG ? 'Singapore' : 'Malaysia', isSG ? 'Singapore' : 'Kuala Lumpur', '', 'Event', '', '', '', eventUrl, 'e27', '']);
            added++;
          }
        } catch (_) {}
      }
      console.log(`  e27: +${added}`);
    }
  } catch (e) { console.log(`  e27 error: ${e.message.substring(0,50)}`); }
  
  // ═══ 4. Tech In Asia ═══
  console.log('--- Tech in Asia ---');
  try {
    const tiaRes = await fetch('https://www.techinasia.com/events', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(10000),
    });
    if (tiaRes.ok) {
      const html = await tiaRes.text();
      const jsonLdMatches = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
      let added = 0;
      for (const match of jsonLdMatches) {
        try {
          const data = JSON.parse(match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, ''));
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            if (!item?.name) continue;
            const loc = JSON.stringify(item.location || '').toLowerCase();
            if (!loc.includes('singapore') && !loc.includes('malaysia')) continue;
            const eventUrl = item.url || '';
            if (!eventUrl || seenUrls.has(eventUrl)) continue;
            const name = (item.name || '').trim();
            const startDate = item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '';
            if (startDate && startDate < TODAY) continue;
            seenUrls.add(eventUrl);
            allNew.push([name, startDate, '', loc.includes('singapore') ? 'Singapore' : 'Malaysia', loc.includes('singapore') ? 'Singapore' : 'Kuala Lumpur', '', 'Event', '', '', '', eventUrl, 'TechInAsia', '']);
            added++;
          }
        } catch (_) {}
      }
      console.log(`  TIA: +${added}`);
    }
  } catch (e) { console.log(`  TIA error: ${e.message.substring(0,50)}`); }
  
  // ═══ 5. More 10times categories ═══
  console.log('--- 10times ---');
  const tenTimesUrls = [
    ['https://10times.com/singapore/technology', 'Singapore', 'Singapore'],
    ['https://10times.com/kualalumpur/technology', 'Malaysia', 'Kuala Lumpur'],
    ['https://10times.com/singapore/it', 'Singapore', 'Singapore'],
    ['https://10times.com/kualalumpur/it', 'Malaysia', 'Kuala Lumpur'],
    ['https://10times.com/singapore/telecom', 'Singapore', 'Singapore'],
    ['https://10times.com/kualalumpur/telecom', 'Malaysia', 'Kuala Lumpur'],
    ['https://10times.com/singapore/electronics', 'Singapore', 'Singapore'],
    ['https://10times.com/kualalumpur/electronics', 'Malaysia', 'Kuala Lumpur'],
    ['https://10times.com/singapore/startups', 'Singapore', 'Singapore'],
    ['https://10times.com/kualalumpur/startups', 'Malaysia', 'Kuala Lumpur'],
    ['https://10times.com/singapore/blockchain', 'Singapore', 'Singapore'],
    ['https://10times.com/kualalumpur/blockchain', 'Malaysia', 'Kuala Lumpur'],
    ['https://10times.com/singapore/cybersecurity', 'Singapore', 'Singapore'],
    ['https://10times.com/singapore/ai-ml', 'Singapore', 'Singapore'],
    ['https://10times.com/kualalumpur/ai-ml', 'Malaysia', 'Kuala Lumpur'],
    ['https://10times.com/singapore/data-analytics', 'Singapore', 'Singapore'],
    ['https://10times.com/singapore/cloud', 'Singapore', 'Singapore'],
    ['https://10times.com/singapore/iot', 'Singapore', 'Singapore'],
    ['https://10times.com/singapore/fintech', 'Singapore', 'Singapore'],
    ['https://10times.com/singapore/robotics', 'Singapore', 'Singapore'],
  ];
  
  for (const [url, country, city] of tenTimesUrls) {
    try {
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
            const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,40);
            if (seenNames.has(nameKey)) continue;
            if (!isTechName(name)) continue;
            const startDate = item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '';
            if (startDate && startDate < TODAY) continue;
            seenUrls.add(eventUrl); seenNames.add(nameKey);
            allNew.push([name, startDate, item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '', country, city, item.location?.name || '', 'Conference', '', '', '', eventUrl, '10times', '']);
            added++;
          }
        } catch (_) {}
      }
      const cat = url.split('/').pop();
      if (added > 0) process.stdout.write(`  [10t] ${city}/${cat}: +${added}\n`);
    } catch (_) {}
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\nTotal new: ${allNew.length}`);
  
  // Write
  allNew.sort((a, b) => (a[1] || '9999').localeCompare(b[1] || '9999'));
  const headers = ['Event Name','Date Start','Date End','Country','City','Venue','Category','Focus Areas','Estimated Size','Ticket Type','Website URL','Source Platform','Notes'];
  const rows = allNew.map(r => r.map(esc).join(','));
  fs.writeFileSync('scratch/extra-events-2.csv', [headers.join(','), ...rows].join('\n'));
  console.log(`\n✅ ${allNew.length} new events → scratch/extra-events-2.csv`);
}

main().catch(console.error);
