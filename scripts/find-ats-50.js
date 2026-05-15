const fs = require('fs');

async function main() {
  console.log('Fetching top 300 crypto coins from CoinGecko...');
  let coins = [];
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1');
    const res2 = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=2');
    const d = await res.json();
    const d2 = await res2.json();
    coins = [...d, ...d2].map(c => c.id);
    
    // Fallback to static list if coingecko fails or blocks
    if (coins.length < 10) throw new Error("Need more");
  } catch (e) {
    // Top 200 Web3 protocols, defi, infra, gaming
    coins = [
      'bitcoin', 'ethereum', 'tether', 'bnb', 'solana', 'usdc', 'xrp', 'dogecoin', 'toncoin', 'cardano', 'shiba-inu', 'avalanche', 'polkadot', 'bitcoin-cash', 'chainlink', 'tron', 'polygon', 'near', 'internet-computer', 'litecoin', 'uniswap', 'aptos', 'ethereum-classic', 'mantle', 'stacks', 'filecoin', 'arbitrum', 'render', 'first-digital-usd', 'stellar', 'maker', 'the-graph', 'cosmos', 'injective', 'optimism', 'sui', 'thorchain', 'vechain', 'lido-dao', 'floki', 'fantom', 'arweave', 'theta-network', 'gala', 'fetch-ai', 'bonk', 'kucoin-token', 'bitget-token', 'flow', 'aave', 'helium', 'quant', 'algorand', 'bittensor', 'dydx', 'sei', 'multiversx', 'jito', 'conflux', 'synthetix', 'neo', 'eos', 'mina', 'sandbox', 'axelar', 'chiliz', 'decentraland', 'kava', 'ronin', 'frax', 'osmosis', 'pendle', 'oasis-network', 'gnosis', 'gmx', 'wootrade', 'pancakeswap', 'curve-dao-token', '1inch', 'compound', 'zcash', 'dash', 'nexus-mutual', 'ens', 'trust-wallet-token', 'nexo', 'superfarm', 'illuvium', 'convex-finance', 'yield-guild-games', 'ribbon-finance', 'stepn', 'biconomy', 'gelato', 'ocean-protocol', 'audius', 'api3', 'cartesi', 'myneighboralice', 'chromia', 'civic', 'storj', 'skale', 'orion-protocol', 'alpha-venture-dao', 'raydium', 'mango-markets', 'serum', 'radium', 'tomo', 'loom', 'wanchain', 'aion', 'icon', 'zilliqa', 'ontology', 'qtum', 'komodo', 'steem', 'hive', 'ark', 'lisk', 'waves', 'stratis', 'syscoin', 'digibyte', 'siacoin', 'bytecoin', 'monero', 'zencash', 'horizen', 'decred', 'pivx', 'navcoin', 'viacoin', 'vertcoin', 'peercoin', 'namecoin', 'feathercoin', 'primecoin', 'novacoin', 'terracoin', 'megacoin', 'infinitecoin', 'quark', 'zeta', 'layerzero', 'starknet', 'zksync', 'scroll', 'linea', 'taiko', 'berachain', 'monad', 'movement', 'altlayer', 'dymension', 'celestia', 'eigenlayer', 'etherfi', 'renzo', 'puffer', 'kelp', 'swell', 'safe', 'argent', 'backpack', 'phantom', 'metamask', 'consensys', 'infura', 'alchemy', 'quicknode', 'moralis', 'tenderly', 'nansen', 'dune', 'messari', 'arkham', 'tokenterminal', 'defillama', 'glassnode', 'kaiko', 'certik', 'trailofbits', 'halborn', 'immunefi', 'hacken', 'opensea', 'blur', 'magiceden', 'looksrare', 'rarible', 'superrare', 'foundation', 'yuga', 'dapper', 'animoca', 'skymavis', 'mythical', 'sorare', 'a16z', 'paradigm', 'multicoin', 'polychain', 'dragonfly', 'pantera', 'framework', 'variant', 'electric', 'hashed', 'spartan', 'wintermute', 'gsr', 'jump', 'jane', 'cumberland', 'drw', 'b2c2', 'dvtrading', 'falconx', 'copper', 'binance', 'coinbase', 'kraken', 'gemini', 'crypto', 'kucoin', 'bybit', 'okx', 'bitget', 'mexc', 'bitfinex', 'bitstamp', 'bitpanda', 'luno', 'moonpay', 'ramp', 'transak', 'banxa', 'stripe', 'circle', 'paxos', 'blockworks', 'coindesk', 'theblock', 'decrypt', 'bankless', 'farcaster', 'merkle', 'warpcast', 'cyberconnect', 'galxe', 'guild', 'snapshot'
    ];
  }

  // Parse existing
  const fetchScript = fs.readFileSync('/Users/vedang/web3jobs/Web3-Jobs/scripts/refresh-jobs-cache.ts', 'utf8');
  const existingStrings = new Set();
  const matches = fetchScript.match(/'[^']+'/g);
  if (matches) {
    matches.forEach(m => existingStrings.add(m.replace(/'/g, '').toLowerCase()));
  }

  // Generate 3 variations per coin: e.g. "bitcoin", "bitcoinnetwork", "bitcoinlabs"
  const allSlugs = new Set();
  for (let c of coins) {
    let base = c.toLowerCase().replace(/[^a-z0-9]/g, '');
    allSlugs.add(base);
    allSlugs.add(base + 'labs');
    allSlugs.add(base + 'network');
    allSlugs.add(base + 'foundation');
    allSlugs.add(base + 'protocol');
  }

  const toCheck = [...allSlugs].filter(c => !existingStrings.has(c));
  console.log(`Testing ${toCheck.length} unique slugs across 3 ATS APIs...`);

  const platforms = [
    { name: 'greenhouse', url: (slug) => `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs` },
    { name: 'ashby', url: (slug) => `https://api.ashbyhq.com/posting-api/job-board/${slug}` },
    { name: 'lever', url: (slug) => `https://api.lever.co/v0/postings/${slug}?mode=json` }
  ];

  const found = [];
  let checked = 0;
  
  const concurrency = 200; // super fast
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
    process.stdout.write(`\rChecked ${checked} / ${toCheck.length} | Found: ${found.length} `);
    
    // Stop early if we hit 50 new companies!
    if (found.length >= 50) {
       console.log('\n\nFound 50 Web3 Companies! Stopping scan early to save time.');
       break;
    }
  }

  console.log('\n\n=== DISCOVERED NEW ATS ===');
  console.log(JSON.stringify(found, null, 2));
}

main();
