#!/usr/bin/env node
import fs from 'fs';

const existing = fs.readFileSync('scratch/tech-events-sg-my.csv', 'utf8');
const seenUrls = new Set();
const seenNames = new Set();
for (const line of existing.split('\n').slice(1)) {
  const m = line.match(/https?:\/\/[^,"\s]+/g);
  if (m) m.forEach(u => seenUrls.add(u));
  const name = line.split(',')[0]?.replace(/"/g,'').toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,40);
  if (name) seenNames.add(name);
}
console.log(`Existing: ${seenUrls.size}`);

function esc(v) { if (!v) return ''; const s = String(v).replace(/"/g, '""'); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s; }
const TECH_KW = ['tech','ai','artificial intelligence','machine learning','blockchain','web3','crypto','developer','devops','cloud','data','startup','fintech','cybersecurity','saas','api','engineering','coding','python','javascript','react','kubernetes','docker','aws','defi','nft','solidity','ethereum','bitcoin','token','hackathon','open source','robotics','iot','quantum','llm','gpt','genai','product','agile','software','hardware','security','infosec','digital','innovation','deep tech','venture','founder','pitch','agent','agentic','semiconductor','computing','code','automation','infrastructure','protocol','wallet','dao','solana','layer','zk','database','sql','backend','frontend','serverless','terraform','pipeline','scrum','figma','conference','summit','expo','meetup','workshop','demo day','pycon','grafana','mongodb','claude','openai','gemini','anthropic','google cloud','azure','network','cyber','devsecops','embedded','ux','ui design'];
function isTechName(n) { return TECH_KW.some(k => n.toLowerCase().includes(k)); }

const allNew = [];

async function fetchEB(url, country, city) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }, signal: AbortSignal.timeout(12000), redirect: 'follow' });
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
          if (startDate && startDate < '2026-05-19') continue;
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

// Compound keywords — "tech + X" style combos
const combos = [
  'tech-networking', 'tech-talks', 'tech-community', 'tech-career',
  'tech-hiring', 'tech-recruitment', 'tech-talent', 'tech-jobs',
  'ai-workshop', 'ai-meetup', 'ai-networking', 'ai-summit', 'ai-expo',
  'startup-networking', 'startup-event', 'startup-community', 'startup-grind',
  'developer-meetup', 'developer-community', 'developer-networking',
  'coding-workshop', 'coding-meetup', 'coding-challenge', 'coding-competition',
  'data-meetup', 'data-conference', 'data-workshop', 'data-summit',
  'cloud-meetup', 'cloud-conference', 'cloud-workshop',
  'crypto-meetup', 'crypto-conference', 'crypto-networking',
  'blockchain-meetup', 'blockchain-conference', 'blockchain-summit',
  'web3-meetup', 'web3-conference', 'web3-summit', 'web3-networking',
  'fintech-meetup', 'fintech-networking', 'fintech-summit',
  'cybersecurity-meetup', 'cybersecurity-workshop', 'cybersecurity-summit',
  'iot-meetup', 'iot-conference', 'iot-workshop',
  'robotics-meetup', 'robotics-workshop',
  'product-meetup', 'product-conference', 'product-workshop',
  'ux-meetup', 'ux-conference', 'ux-workshop',
  'devops-meetup', 'devops-workshop',
  'agile-meetup', 'agile-workshop', 'agile-conference',
  'digital-marketing-tech', 'martech', 'adtech',
  'deep-learning', 'neural-network', 'computer-science',
  'information-security', 'data-privacy', 'gdpr',
  'saas-meetup', 'saas-summit', 'saas-conference',
  'venture-capital-event', 'investor-meetup', 'angel-investing',
  'tech-demo', 'demo-day', 'pitch-night', 'pitch-competition',
  'science-technology', 'stem-event', 'innovation-hub',
];

async function main() {
  for (const loc of ['singapore', 'malaysia']) {
    const country = loc === 'singapore' ? 'Singapore' : 'Malaysia';
    const city = loc === 'singapore' ? 'Singapore' : 'Kuala Lumpur';
    for (const kw of combos) {
      for (let page = 1; page <= 5; page++) {
        const url = page === 1 ? `https://www.eventbrite.com/d/${loc}/${kw}/` : `https://www.eventbrite.com/d/${loc}/${kw}/?page=${page}`;
        const added = await fetchEB(url, country, city);
        if (added > 0) process.stdout.write(`[EB] ${loc}/${kw}/p${page}: +${added}\n`);
        if (added === 0) break;
        await new Promise(r => setTimeout(r, 350));
      }
    }
  }
  
  allNew.sort((a, b) => (a[1] || '9999').localeCompare(b[1] || '9999'));
  const headers = 'Event Name,Date Start,Date End,Country,City,Venue,Category,Focus Areas,Estimated Size,Ticket Type,Website URL,Source Platform,Notes';
  fs.writeFileSync('scratch/extra-events-5.csv', [headers, ...allNew.map(r => r.map(esc).join(','))].join('\n'));
  console.log(`\n✅ ${allNew.length} new → scratch/extra-events-5.csv`);
}
main().catch(console.error);
