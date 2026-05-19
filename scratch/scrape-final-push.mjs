#!/usr/bin/env node
/**
 * Final push — EB pages 6-10 for top keywords + more niche keywords
 */
import fs from 'fs';

const TODAY = '2026-05-19';
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

const TECH_KW = ['tech','ai','artificial intelligence','machine learning','blockchain','web3','crypto','developer','devops','cloud','data','startup','fintech','cybersecurity','saas','api','engineering','coding','python','javascript','react','kubernetes','docker','aws','defi','nft','solidity','ethereum','bitcoin','token','hackathon','open source','robotics','iot','quantum','llm','gpt','genai','product','agile','software','hardware','security','infosec','digital','innovation','deep tech','venture','founder','pitch','agent','agentic','semiconductor','computing','code','automation','infrastructure','protocol','wallet','dao','solana','layer','zk','rollup','database','sql','backend','frontend','serverless','terraform','ansible','pipeline','scrum','figma','conference','summit','expo','meetup','workshop','demo day','pycon','grafana','mongodb','claude','openai','gemini','anthropic','google cloud','azure','network','cyber','malware','threat','devsecops','embedded','ux','ui design'];

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
  // High-yield keywords pages 6-10
  const topKW = [
    'technology', 'artificial-intelligence', 'software', 'data-science',
    'cloud-computing', 'cybersecurity', 'startup', 'fintech', 'blockchain',
    'web3', 'hackathon', 'developer', 'machine-learning', 'devops',
    'product-management', 'agile', 'digital-transformation', 'innovation',
    'ai', 'tech', 'coding', 'networking-tech', 'open-source',
    'ux-research', 'ui-design', 'venture-capital', 'startup-pitch',
    'prompt-engineering', 'generative-ai', 'data-engineering',
    'penetration-testing', 'ethical-hacking', 'cloud-security',
    'payment-technology', 'smart-city', 'pcb-design',
  ];
  
  console.log('--- EB Pages 6-10 ---');
  for (const loc of ['singapore', 'malaysia']) {
    const country = loc === 'singapore' ? 'Singapore' : 'Malaysia';
    const city = loc === 'singapore' ? 'Singapore' : 'Kuala Lumpur';
    for (const kw of topKW) {
      for (let page = 6; page <= 10; page++) {
        const url = `https://www.eventbrite.com/d/${loc}/${kw}/?page=${page}`;
        const added = await fetchEB(url, country, city);
        if (added > 0) process.stdout.write(`  [EB] ${loc}/${kw}/p${page}: +${added}\n`);
        if (added === 0) break;
        await new Promise(r => setTimeout(r, 350));
      }
    }
  }
  console.log(`  Pages 6-10: ${allNew.length}\n`);
  
  // More niche keywords not covered before
  console.log('--- EB Niche Keywords ---');
  const nicheKW = [
    'saas-conference', 'api-conference', 'web-development', 'app-development',
    'no-code', 'low-code', 'automation-tools', 'workflow-automation',
    'data-visualization', 'business-intelligence', 'power-bi', 'tableau',
    'salesforce', 'hubspot', 'sap', 'oracle-cloud',
    'web-scraping', 'data-pipeline', 'etl', 'data-warehouse',
    'machine-vision', 'autonomous-vehicle', 'drone-technology',
    'virtual-reality', 'augmented-reality', 'mixed-reality', 'metaverse',
    'social-media-analytics', 'marketing-automation', 'seo-tools',
    'ecommerce-platform', 'shopify', 'woocommerce',
    'crypto-exchange', 'token-launch', 'ico', 'ido',
    'smart-contract', 'dapp', 'layer-2', 'zero-knowledge',
    'cloud-native', 'service-mesh', 'api-gateway', 'ci-cd',
    'infrastructure-as-code', 'site-reliability', 'observability',
    'chaos-engineering', 'performance-testing', 'load-testing',
    'mobile-testing', 'test-automation', 'selenium', 'playwright',
    'ai-ethics', 'responsible-ai', 'ai-governance',
    'edge-computing', '5g-technology', 'network-automation',
    'digital-twin', 'industry-4-0', 'manufacturing-tech',
    'supply-chain-tech', 'logistics-tech', 'warehouse-automation',
  ];
  
  for (const loc of ['singapore', 'malaysia']) {
    const country = loc === 'singapore' ? 'Singapore' : 'Malaysia';
    const city = loc === 'singapore' ? 'Singapore' : 'Kuala Lumpur';
    for (const kw of nicheKW) {
      for (let page = 1; page <= 3; page++) {
        const url = page === 1
          ? `https://www.eventbrite.com/d/${loc}/${kw}/`
          : `https://www.eventbrite.com/d/${loc}/${kw}/?page=${page}`;
        const added = await fetchEB(url, country, city);
        if (added > 0) process.stdout.write(`  [EB] ${loc}/${kw}/p${page}: +${added}\n`);
        if (added === 0) break;
        await new Promise(r => setTimeout(r, 350));
      }
    }
  }
  
  allNew.sort((a, b) => (a[1] || '9999').localeCompare(b[1] || '9999'));
  const headers = ['Event Name','Date Start','Date End','Country','City','Venue','Category','Focus Areas','Estimated Size','Ticket Type','Website URL','Source Platform','Notes'];
  const rows = allNew.map(r => r.map(esc).join(','));
  fs.writeFileSync('scratch/extra-events-3.csv', [headers.join(','), ...rows].join('\n'));
  console.log(`\n✅ ${allNew.length} new events → scratch/extra-events-3.csv`);
}

main().catch(console.error);
