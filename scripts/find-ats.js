const https = require('https');

const candidates = {
  'Coins.ph': ['coinsph', 'coins', 'coins-ph'],
  'FalconX': ['falconx', 'falcon-x'],
  'GSR Markets': ['gsr', 'gsr-markets', 'gsrmarkets'],
  'NYDIG': ['nydig'],
  'Jump Crypto': ['jumpcrypto', 'jump-crypto', 'jumptrading'],
  'DV Trading': ['dvtrading', 'dvchain', 'dv-trading'],
  'Alpaca': ['alpaca', 'alpacamarkets', 'alpaca-markets'],
  'DFINITY': ['dfinity', 'dfinityfoundation'],
  'IOHK': ['iohk', 'inputoutput', 'iog'],
  'Flashbots': ['flashbots'],
  'Biconomy': ['biconomy'],
  'Arkham Intelligence': ['arkham', 'arkhamintelligence'],
  'Kaiko': ['kaiko', 'kaiko-data'],
  'Tenderly': ['tenderly', 'tenderlyco'],
  'CertiK': ['certik'],
  'Trail of Bits': ['trailofbits', 'trail-of-bits'],
  'Halborn': ['halborn'],
  'Immunefi': ['immunefi'],
  'Frax Finance': ['frax', 'fraxfinance'],
  'ICN Protocol': ['icn', 'icnprotocol'],
  'Argent': ['argent', 'argenthq'],
  'Kiln': ['kiln', 'kiln-fi'],
  'Chorus One': ['chorusone', 'chorus-one'],
  'Dapper Labs': ['dapperlabs', 'dapper-labs'],
  'Multicoin Capital': ['multicoin', 'multicoincapital'],
  'Polychain Capital': ['polychain', 'polychaincapital'],
  'Dragonfly Capital': ['dragonfly', 'dragonflycapital'],
  'Framework Ventures': ['framework', 'frameworkventures']
};

const platforms = [
  { name: 'greenhouse', url: (slug) => `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs` },
  { name: 'ashby', url: (slug) => `https://api.ashbyhq.com/posting-api/job-board/${slug}` },
  { name: 'lever', url: (slug) => `https://api.lever.co/v0/postings/${slug}?mode=json` }
];

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

async function main() {
  const found = {};
  
  for (const [company, slugs] of Object.entries(candidates)) {
    console.log(`Checking ${company}...`);
    let companyFound = false;
    for (const slug of slugs) {
      if (companyFound) break;
      for (const platform of platforms) {
        const url = platform.url(slug);
        const exists = await checkUrl(url);
        if (exists) {
          console.log(`  ✅ FOUND: ${company} -> ${platform.name} -> ${slug}`);
          found[company] = { platform: platform.name, slug };
          companyFound = true;
          break;
        }
      }
    }
  }

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(found, null, 2));
}

main();
