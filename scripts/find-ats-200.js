const fs = require('fs');

async function main() {
  console.log('Fetching top 2000 crypto coins from CoinGecko...');
  let coins = [];
  try {
    for (let page = 1; page <= 8; page++) {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}`);
      if (!res.ok) {
        console.log(`CoinGecko rate limit hit on page ${page}. Breaking early.`);
        break;
      }
      const data = await res.json();
      for (const c of data) {
        coins.push(c.id);
        if (c.symbol) coins.push(c.symbol.toLowerCase());
      }
      await new Promise(r => setTimeout(r, 1000)); // sleep to avoid rate limit
    }
  } catch (e) {
    console.error('CoinGecko fetch failed:', e.message);
  }

  // Backup static list just in case
  if (coins.length < 100) {
    console.log("Using backup large list...");
    // Just a fallback
    coins = ['bitcoin', 'ethereum', 'tether', 'solana', 'binancecoin', 'ripple', 'usdc', 'cardano', 'avalanche-2', 'dogecoin', 'polkadot', 'tron', 'chainlink', 'polygon', 'toncoin', 'shiba-inu', 'internet-computer', 'litecoin', 'bitcoin-cash', 'uniswap', 'cosmos', 'stellar', 'monero', 'okb', 'aptos', 'lido-dao', 'filecoin', 'mantle', 'near', 'arbitrum', 'vechain', 'optimism', 'maker', 'injective', 'the-graph', 'first-digital-usd', 'sei', 'thorchain', 'render-token', 'sui', 'algorand', 'celestia', 'aave', 'fantom', 'bitcoin-sv', 'mina-protocol', 'flow', 'theta-token', 'synthetix-network-token', 'chiliz', 'kucoin-shares', 'arweave', 'tezos', 'axie-infinity', 'helium', 'gala', 'multiversx-egld', 'kava', 'dydx', 'eos', 'pancakeswap-token', 'quant-network', 'iota', 'neo', 'conflux-token', 'akash-network', 'klay-token', 'gmx', 'oasis-network', 'zcash', 'curve-dao-token', 'pendle', 'nexo', '1inch', 'wemix-token', 'woo-network', 'astar', 'trust-wallet-token', 'enjincoin', 'dash', 'compound-governance-token', 'illuvium', 'frax-share', 'loopring', 'gnosis', 'chia', 'zilliqa', 'nem', 'convex-finance', 'bat', 'holo', 'qtum', 'stepn', 'yield-guild-games', 'biconomy', 'ontology', 'theta-fuel', 'audius', 'decentraland', 'sandbox', 'band-protocol', 'api3', 'ocean-protocol', 'cartesi', 'myneighboralice', 'chromia', 'storj', 'skale', 'raydium', 'serum', 'tomo', 'wanchain', 'icon', 'komodo', 'steem', 'hive', 'lisk', 'waves', 'syscoin', 'digibyte', 'siacoin', 'bytecoin', 'zencash', 'horizen', 'decred', 'pivx', 'viacoin', 'vertcoin', 'peercoin', 'namecoin'];
  }

  // Parse existing to NEVER output duplicates
  const fetchScript = fs.readFileSync('LOCAL_PATH/scripts/refresh-jobs-cache.ts', 'utf8');
  const existingSlugs = new Set();
  const matches = fetchScript.match(/board:\s*'([^']+)'/g);
  if (matches) {
    matches.forEach(m => {
      const slug = m.replace(/board:\s*'/, '').replace(/'$/, '').toLowerCase();
      existingSlugs.add(slug);
    });
  }

  // Generate variations
  const allSlugs = new Set();
  for (let c of coins) {
    let base = c.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!base) continue;
    allSlugs.add(base);
    allSlugs.add(base + 'labs');
    allSlugs.add(base + 'network');
    allSlugs.add(base + 'foundation');
    allSlugs.add(base + 'protocol');
  }

  const toCheck = [...allSlugs].filter(c => !existingSlugs.has(c));
  console.log(`Testing ${toCheck.length} unique new slugs across 3 ATS APIs...`);

  const platforms = [
    { name: 'greenhouse', url: (slug) => `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs` },
    { name: 'ashby', url: (slug) => `https://api.ashbyhq.com/posting-api/job-board/${slug}` },
    { name: 'lever', url: (slug) => `https://api.lever.co/v0/postings/${slug}?mode=json` }
  ];

  const found = [];
  let checked = 0;
  
  const concurrency = 1500; 
  for (let i = 0; i < toCheck.length; i += concurrency) {
    const chunk = toCheck.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (slug) => {
      for (const platform of platforms) {
        try {
          const res = await fetch(platform.url(slug), { method: 'HEAD', signal: AbortSignal.timeout(6000) });
          if (res.status === 200) {
            found.push({ platform: platform.name, slug });
            break; 
          }
        } catch (e) {}
      }
    }));
    checked += chunk.length;
    process.stdout.write(`\rChecked ${checked} / ${toCheck.length} | Found strictly new: ${found.length} `);
    
    // Periodically save to avoid losing data
    if (found.length > 0) {
       fs.writeFileSync('LOCAL_PATH/found-200.json', JSON.stringify(found, null, 2));
    }
    
    if (found.length >= 200) {
       console.log('\n\nFound 200 new Web3 Companies! Stopping early.');
       break;
    }
  }

  console.log('\n\n=== FINISHED ===');
  console.log(`Total new discovered: ${found.length}`);
}

main();
