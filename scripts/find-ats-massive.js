const fs = require('fs');

const fetchScript = fs.readFileSync('process.cwd() + '/scripts/fetch-new-jobs.mjs', 'utf8');

// Rough regex to find string literals in arrays
const existingStrings = new Set();
const matches = fetchScript.match(/'[^']+'/g);
if (matches) {
  matches.forEach(m => existingStrings.add(m.replace(/'/g, '')));
}

const newCandidates = [
  'yugalabs', 'yuga', 'dapperlabs', 'dapper', 
  'consensys', 'metamask', 'infura', 'truffle', 'linea', // wait consensys is there, let's just spam
  'starknet', 'starkware', 'zksync', 'matterlabs',
  'arbitrum', 'optimism', 'base', 'coinbase',
  'kraken', 'gemini', 'crypto', 'kucoin', 'huobi', 'okx', 'bybit', 'bitget', 'mexc',
  'binance', 'trustwallet', 'coinmarketcap',
  'tether', 'circle', 'paxos', 'trueusd',
  'makerdao', 'aave', 'compound', 'uniswap', 'sushiswap', 'pancakeswap', 'curve', 'balancer',
  'yearn', 'synthetix', 'frax', 'lido', 'rocketpool', 'eigenlayer',
  'chainlink', 'thegraph', 'pyth', 'api3', 'bandprotocol',
  'polygon', 'solana', 'avalanche', 'avalabs', 'near', 'dfinity', 'algorand', 'hedera', 'aptos', 'sui', 'mysten', 'mystenlabs',
  'celestia', 'sei', 'monad', 'berachain', 'movement',
  'layerzero', 'wormhole', 'axelar',
  'ledger', 'trezor', 'safe', 'gnosis', 'argent', 'phantom',
  'magic', 'privy', 'web3auth', 'biconomy',
  'alchemy', 'quicknode', 'infura', 'moralis', 'thirdweb', 'tenderly',
  'nansen', 'dune', 'duneanalytics', 'messari', 'arkham', 'arkhamintelligence', 'glassnode', 'kaiko', 'tokenterminal', 'defillama',
  'certik', 'halborn', 'trailofbits', 'immunefi', 'hacken', 'consensysdiligence', 'openzepplin', 'openzeppelin',
  'animoca', 'animocabrands', 'skymavis', 'axie', 'immutable', 'mythical', 'gala', 'galagames', 'stepn',
  'blur', 'opensea', 'magiceden', 'looksrare', 'x2y2', 'rarible', 'superrare', 'foundation',
  'multicoin', 'polychain', 'dragonfly', 'paradigm', 'a16z', 'a16zcrypto', 'pantera', 'panteracapital', 'framework', 'variant', 'electriccapital', 'hashed',
  'ripple', 'stellar', 'tron', 'eos', 'neo',
  'filecoin', 'arweave', 'protocol', 'protocollabs', 'ipfs',
  'helium', 'theta', 'livepeer', 'render', 'akash',
  'worldcoin', 'toolsforhumanity',
  'chiliz', 'socios',
  'enjin', 'decentraland', 'sandbox',
  '1inch', 'paraswap', 'cowswap',
  'dydx', 'gmx', 'perpetual', 'gains',
  'rocketpool', 'stakewise', 'swell', 'puffer', 'renzo', 'kelp', 'etherfi',
  'wintermute', 'gsr', 'jump', 'jumpcrypto', 'jane', 'janestreet', 'cumberland', 'drw', 'b2c2', 'dvtrading', 'dvchain', 'falconx', 'copper',
  'nydig', 'galaxy', 'galaxydigital', 'dcg', 'grayscale', 'genesis', 'foundry',
  'coindesk', 'theblock', 'blockworks', 'decrypt', 'bankless',
  'gitcoin', 'aragon', 'radicle',
  'brave', 'status',
  // Random other massive web3 names
  'zapper', 'zerion', 'debank',
  '1kx', 'blockchaincapital', 'spartan', 'spartangroup', 'alameda', 'ftx',
  'celsius', 'voyager', 'blockfi', 'nexo', // mostly dead but worth checking
  'moonpay', 'ramp', 'rampnetwork', 'banxa', 'transak', 'simplex',
  'ankr', 'pokt', 'pocketnetwork',
  'ens', 'unstoppable', 'unstoppabledomains',
  'galxe', 'cyberconnect', 'lens', 'farcaster', 'warpcast',
  'audius', 'royal', 'soundxyz',
  'audius', 'royal', 'soundxyz'
];

// Filter out existing
const toCheck = [...new Set(newCandidates)].filter(c => !existingStrings.has(c));

console.log(`Found ${toCheck.length} new slugs to brute-force...`);

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
  const found = [];
  
  // parallel chunks
  const concurrency = 20;
  for (let i = 0; i < toCheck.length; i += concurrency) {
    const chunk = toCheck.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (slug) => {
      for (const platform of platforms) {
        const url = platform.url(slug);
        const exists = await checkUrl(url);
        if (exists) {
          found.push({ platform: platform.name, slug });
          // Stop checking other platforms for this slug
          break; 
        }
      }
    }));
    process.stdout.write(`\rChecked ${Math.min(i + concurrency, toCheck.length)} / ${toCheck.length}`);
  }

  console.log('\n=== DISCOVERED NEW ATS ===');
  console.log(JSON.stringify(found, null, 2));
}

main();
