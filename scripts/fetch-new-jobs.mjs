import fs from 'fs';

// ─── Web3 Company Board Registry ───
const GREENHOUSE_BOARDS = [
  // Existing
  'aptoslabs','b2c2','basejobs','bcbgroup','bitgo','bitmex','bitpanda','blockchain',
  'breezecash','bybit','digitalcurrencygroup','embed','fireblocks','flowtraders',
  'galaxydigitalservices','grayscaleinvestments','layerzerolabs','luno','m0dbathenextthingltd',
  'mesh','nexus','okx','paradigm','rampnetwork','robinhood','securitize','shakepay','taxbit','xapo61',
  // New Web3 companies
  'a16z','coinbase','ripple','consensys','chainanalysis','hedera','brave','complyadvantage',
  'figment','dydx','immutable','blockfi','kraken','bitstamp','gemini','circle',
  'chainalysis','thesis','curv','anchorage','celestia','eigenlabs',
  'aztecnetwork','matterlabs','starkware','zksync','scrollio','aabornetwork',
  'makerdao','compoundfinance','yearnfinance','sushi','aavegrants',
  'arbitrum','optimism','polygon','avalabs','solanalabs','nearprotocol',
  'filecoin','arweave','thetatoken','heliumnetwork','render',
  'openai','huggingface',
  'worldcoin','wormholecrypto','jupiterexchange',
  'hashgraph','algorand','stellar','iota','tezos','polkadot',
  'binance','kucoin','gateio','crypto','ftx','huobi',
];

const ASHBY_ORGS = [
  // Existing
  '0x','Base','Bastion','Blockdaemon','Conduit','Elliptic','Gelato','Helius','Injective',
  'LI.FI','Lido.fi','MagicEden','Maple','Morpho','Nascent','Notabene','Parity','Paxos',
  'Phantom','Polymarket','QuickNode','Render','Safe','Sardine','SkyMavis','Socket',
  'Solana%20Foundation','Sorare','SpruceID','Stacks','Stellar','Talos-Trading',
  'Tools%20for%20Humanity','alchemy','artemis','ashby','blackbird-labs-inc','cantina',
  'chainalysis-careers','delphi','eigen-labs','flipsidecrypto','kalshi','lightspark',
  'monad.foundation','mystenlabs','noise-labs','phantom','polygon-labs','seifoundation',
  'sentient','skymavis','tempo-xyz','trust-wallet','walrus',
  // New
  'uniswap','aave','compound','sushiswap','curve','synthetix','balancer',
  'chainlink','thegraph','ceramic','arweave','protocol-labs',
  'dydx','blur','opensea','rarible','foundation',
  'worldcoin','wormhole','layerzero','celestia','monad',
  'aztec','zksync','scroll','starknet','risc-zero',
  'aptos','sui','near','flow','mina','cosmos','osmosis',
  'ondo-finance','maple-finance','goldfinch','centrifuge',
  'immutable','animoca','sky-mavis','yuga-labs',
  'fireblocks','anchorage','bitgo','copper','cobo',
  'nansen','messari','dune','flipside','token-terminal',
  'eigenlayer','etherfi','renzo','puffer','kelp-dao',
];

const LEVER_COMPANIES = [
  // Existing
  '1inch','anchorage','animocabrands','binance','coingecko','ethena','gate',
  'jito','moonpay','offchainlabs','wintermute-trading',
  // New
  'kraken','chainlink','dydx','immutable','opensea','consensys',
  'polygon','avalabs','near','solana','filecoin',
  'makerdao','aave','uniswap','synthetix',
  'fireblocks','bitgo','anchorage-digital',
  'chainalysis','elliptic','comply-advantage',
  'messari','dune-analytics','nansen',
  'axie-infinity','sandbox','decentraland',
  'bitstamp','gemini','blockchain-com',
  'ledger','trezor','metamask',
  'worldcoin','starkware','matter-labs','scroll',
  'celestia','monad','berachain','movement-labs',
  'wormhole','layerzero-labs','axelar',
  'eigen-labs','etherfi','puffer','renzo',
];

function cleanHtml(html) {
  let t = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  t = t.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/li>/gi, '\n').replace(/<li[^>]*>/gi, '• ');
  t = t.replace(/<\/h[1-6]>/gi, '\n\n').replace(/<[^>]+>/g, ' ');
  t = t.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/&rsquo;/g,"'").replace(/&lsquo;/g,"'").replace(/&rdquo;/g,'"').replace(/&ldquo;/g,'"').replace(/&mdash;/g,'—').replace(/&ndash;/g,'–').replace(/&bull;/g,'•').replace(/&hellip;/g,'…');
  return t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function parseCSV(text) {
  const rows = []; let cur = []; let field = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"' && text[i+1] === '"') { field += '"'; i++; } else if (ch === '"') inQ = false; else field += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { cur.push(field); field = ''; } else if (ch === '\n' || (ch === '\r' && text[i+1] === '\n')) { cur.push(field); field = ''; if (cur.length >= 14) rows.push(cur); cur = []; if (ch === '\r') i++; } else field += ch; }
  }
  if (cur.length >= 14) rows.push(cur);
  return rows;
}

function extractLevel(title) {
  const t = title.toLowerCase();
  if (/\bintern(ship)?\b/.test(t)) return 'Internship';
  if (/\b(principal|distinguished|fellow)\b/.test(t)) return 'Principal';
  if (/\bstaff\b/.test(t)) return 'Staff';
  if (/\b(director|vp|vice president|head of|chief)\b/.test(t)) return 'Director';
  if (/\b(lead|team lead|tech lead)\b/.test(t)) return 'Lead';
  if (/\b(senior|sr\.?)\b/.test(t)) return 'Senior';
  if (/\b(junior|jr\.?|entry[- ]level|associate)\b/.test(t)) return 'Junior';
  return '-';
}

const SKILL_KEYWORDS = [
  'Python','JavaScript','TypeScript','Java','Go','Golang','Rust','C++','Solidity','Vyper','Move','Cairo',
  'React','Next.js','Vue','Angular','Node.js','Django','Flask','FastAPI','Spring',
  'PostgreSQL','MySQL','MongoDB','Redis','Elasticsearch','DynamoDB','Kafka','GraphQL',
  'AWS','GCP','Azure','Docker','Kubernetes','Terraform','Linux','Git',
  'Machine Learning','Deep Learning','NLP','TensorFlow','PyTorch','LLM',
  'Blockchain','Ethereum','DeFi','Web3','Smart Contracts','Hardhat','Foundry',
  'Solana','Polygon','Arbitrum','Cosmos','Substrate','Polkadot',
  'IPFS','Chainlink','TheGraph',
];

function extractSkills(desc) {
  return SKILL_KEYWORDS.filter(s => {
    const re = new RegExp('\\b' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return re.test(desc);
  }).slice(0, 10);
}

async function main() {
  const csvContent = fs.readFileSync('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', 'utf8');
  const csvRows = parseCSV(csvContent);
  const existingUrls = new Set(csvRows.slice(1).map(r => (r[0]||'').trim()));
  console.log(`Existing jobs: ${existingUrls.size}\n`);

  const newJobs = [];

  // ─── Phase 1: Greenhouse ───
  console.log('═══ GREENHOUSE ═══');
  const ghBoards = [...new Set(GREENHOUSE_BOARDS)];
  let ghTotal = 0;
  await Promise.all(ghBoards.map(async board => {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return;
      const d = await res.json();
      const jobs = d.jobs || [];
      let added = 0;
      for (const j of jobs) {
        const url = `https://boards.greenhouse.io/${board}/jobs/${j.id}`;
        if (existingUrls.has(url)) continue;
        const desc = j.content ? cleanHtml(j.content) : '';
        if (desc.length < 200) continue;
        const loc = j.location?.name || '-';
        const skills = extractSkills(desc);
        newJobs.push([url, board, '-', j.title, desc, skills.join('; ')||'-', '-', loc, '-', extractLevel(j.title), '-', '-', `Greenhouse: ${board}`, new Date().toISOString().split('T')[0]]);
        added++;
      }
      if (added > 0) { console.log(`  ✓ ${board}: ${added} new (${jobs.length} total)`); ghTotal += added; }
    } catch(e) {}
  }));
  console.log(`  Total new: ${ghTotal}\n`);

  // ─── Phase 2: Ashby ───
  console.log('═══ ASHBY ═══');
  const ashbyOrgs = [...new Set(ASHBY_ORGS)];
  let ashTotal = 0;
  await Promise.all(ashbyOrgs.map(async org => {
    try {
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${org}`, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return;
      const d = await res.json();
      const jobs = d.jobs || [];
      let added = 0;
      for (const j of jobs) {
        const url = `https://jobs.ashbyhq.com/${org}/${j.id}`;
        if (existingUrls.has(url)) continue;
        const desc = j.descriptionPlain || (j.descriptionHtml ? cleanHtml(j.descriptionHtml) : '');
        if (desc.length < 200) continue;
        const loc = j.location || '-';
        const skills = extractSkills(desc);
        newJobs.push([url, org.replace(/%20/g,' '), '-', j.title, desc, skills.join('; ')||'-', '-', loc, '-', extractLevel(j.title), '-', '-', `Ashby: ${org}`, new Date().toISOString().split('T')[0]]);
        added++;
      }
      if (added > 0) { console.log(`  ✓ ${org}: ${added} new (${jobs.length} total)`); ashTotal += added; }
    } catch(e) {}
  }));
  console.log(`  Total new: ${ashTotal}\n`);

  // ─── Phase 3: Lever ───
  console.log('═══ LEVER ═══');
  const leverCompanies = [...new Set(LEVER_COMPANIES)];
  let levTotal = 0;
  await Promise.all(leverCompanies.map(async company => {
    try {
      const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return;
      const jobs = await res.json();
      if (!Array.isArray(jobs)) return;
      let added = 0;
      for (const j of jobs) {
        const url = j.hostedUrl || `https://jobs.lever.co/${company}/${j.id}`;
        if (existingUrls.has(url)) continue;
        const desc = j.descriptionPlain || (j.description ? cleanHtml(j.description) : '');
        if (desc.length < 200) continue;
        const loc = j.categories?.location || '-';
        const skills = extractSkills(desc);
        newJobs.push([url, company, '-', j.text || j.title || '-', desc, skills.join('; ')||'-', '-', loc, '-', extractLevel(j.text||j.title||''), '-', '-', `Lever: ${company}`, new Date().toISOString().split('T')[0]]);
        added++;
      }
      if (added > 0) { console.log(`  ✓ ${company}: ${added} new (${jobs.length} total)`); levTotal += added; }
    } catch(e) {}
  }));
  console.log(`  Total new: ${levTotal}\n`);

  // Deduplicate by URL
  const seen = new Set([...existingUrls]);
  const unique = newJobs.filter(r => { const u = r[0]; if (seen.has(u)) return false; seen.add(u); return true; });

  console.log(`═══ SUMMARY ═══`);
  console.log(`New unique jobs found: ${unique.length}`);

  if (unique.length > 0) {
    // Append to CSV
    const esc = v => { const s = String(v||'-'); if (s.includes(',')||s.includes('"')||s.includes('\n')) return '"'+s.replace(/"/g,'""')+'"'; return s; };
    const lines = csvContent.split('\n');
    for (const row of unique) lines.push(row.map(v => esc(v)).join(','));
    fs.writeFileSync('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', lines.join('\n'));
    console.log(`CSV updated: ${existingUrls.size} + ${unique.length} = ${existingUrls.size + unique.length} total jobs`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
