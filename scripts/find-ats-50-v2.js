const platforms = [
  { name: 'greenhouse', url: (slug) => `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs` },
  { name: 'ashby', url: (slug) => `https://api.ashbyhq.com/posting-api/job-board/${slug}` },
  { name: 'lever', url: (slug) => `https://api.lever.co/v0/postings/${slug}?mode=json` }
];

const slugs = [
  // A16z crypto portfolio & prominent web3
  'ironfish', 'aztecnetwork', 'starkware', 'flashbots', 'syndicate', 'soundxyz', 'goldfinch', 'nori', 'axiom', 'dynamicxyz',
  'biconomy', 'scroll', 'taikoxyz', 'mantlenetwork', 'eigenlayer', 'monad', 'berachain', 'movementlabs', 'fuel', 'celestia',
  'avail', 'espresso', 'astria', 'altlayer', 'gelato', 'conduit', 'caldera', 'ritual', 'bittensor', 'giza',
  'modulus', 'succinct', 'risczero', 'axiomcrypto', 'lagrangedev', 'hyperlane', 'layerzero', 'wormhole', 'axelar', 'polynetwork',
  'li-fi', 'socket', 'debridge', 'symbiosis', 'synapse', 'hop', 'connext', 'stargate', 'across', 'cbridge',
  'uniswap', 'sushiswap', 'pancakeswap', 'curve', 'balancer', 'bancor', 'kyber', 'dodo', 'hashflow', '1inch',
  'paraswap', 'cowswap', 'matcha', 'jupiter', 'raydium', 'orca', 'drift', 'mango', 'zeta', 'gmx',
  'gains', 'synthetix', 'kwenta', 'aave', 'compound', 'maker', 'frax', 'convex', 'yearn', 'pendle',
  'gearbox', 'morpho', 'spark', 'ethena', 'ondo', 'maple', 'clearpool', 'truefi', 'centrifuge', 'ribbon',
  'aevo', 'nansen', 'dune', 'messari', 'arkham', 'glassnode', 'kaiko', 'tokenterminal', 'defillama', 'coingecko',
  'coinmarketcap', 'thegraph', 'chainlink', 'pyth', 'api3', 'band', 'alchemy', 'infura', 'quicknode', 'tenderly',
  'moralis', 'trezor', 'ledger', 'safe', 'argent', 'rainbow', 'phantom', 'backpack', 'magic', 'privy',
  'web3auth', 'certik', 'trailofbits', 'halborn', 'immunefi', 'hacken', 'openzeppelin', 'opensea', 'blur', 'magiceden',
  'looksrare', 'rarible', 'superrare', 'foundation', 'zora', 'yuga', 'dapper', 'animoca', 'skymavis', 'axie',
  'illuvium', 'gala', 'stepn', 'mythical', 'sorare', 'a16z', 'paradigm', 'multicoin', 'polychain', 'dragonfly',
  'pantera', 'framework', 'variant', 'electric', 'hashed', 'spartan', 'wintermute', 'gsr', 'jump', 'jane',
  'cumberland', 'drw', 'b2c2', 'dvtrading', 'falconx', 'copper', 'binance', 'coinbase', 'kraken', 'gemini',
  'crypto', 'kucoin', 'bybit', 'okx', 'bitget', 'mexc', 'bitfinex', 'bitstamp', 'bitpanda', 'luno',
  'moonpay', 'ramp', 'transak', 'banxa', 'stripe', 'circle', 'paxos', 'blockworks', 'coindesk', 'theblock',
  'decrypt', 'bankless', 'farcaster', 'merkle', 'warpcast', 'cyberconnect', 'galxe', 'guild', 'snapshot',
  // new
  'cleanspark', 'marathondigital', 'riotplatforms', 'hut8', 'bitfarms', 'core-scientific', 'irisenergy', 'terawulf', 'bitdigital', 'ciphermining',
  'storyprotocol', 'fhenix', 'zama', 'inco', 'mindnetwork', 'phala', 'litprotocol', 'biconomy', 'pimlico', 'zerodev',
  'alchemy', 'moonshot', 'pumpfun', 'dexscreener', 'dextools', 'geckoterminal', 'birdeye', 'solscan', 'etherscan', 'basescan',
  // Try combinations
  'syndicateprotocol', 'goldfinchfinance', 'axiom-crypto', 'dynamic-xyz', 'scroll-tech', 'taiko-xyz', 'mantle-network', 'eigen-layer', 'monad-labs', 'berachain-foundation'
];

// Let's brute force them
async function main() {
  const fs = require('fs');
  const fetchScript = fs.readFileSync('/Users/vedang/web3jobs/Web3-Jobs/scripts/refresh-jobs-cache.ts', 'utf8');
  const existingStrings = new Set();
  const matches = fetchScript.match(/'[^']+'/g);
  if (matches) {
    matches.forEach(m => existingStrings.add(m.replace(/'/g, '').toLowerCase()));
  }

  const toCheck = [...new Set(slugs)].filter(c => !existingStrings.has(c));

  const found = [];
  const concurrency = 100;
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
    if (found.length >= 50) break;
  }
  
  fs.writeFileSync('found-50.json', JSON.stringify(found, null, 2));
}
main();
