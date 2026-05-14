const fs = require('fs');

const fetchScript = fs.readFileSync('process.cwd() + '/scripts/fetch-new-jobs.mjs', 'utf8');

// Rough regex to find string literals in arrays
const existingStrings = new Set();
const matches = fetchScript.match(/'[^']+'/g);
if (matches) {
  matches.forEach(m => existingStrings.add(m.replace(/'/g, '').toLowerCase()));
}

const newCandidates = [
  'mina', 'minaprotocol', 'kava', 'kavalabs', 'celo', 'ronin', 'evmos', 'mantle', 'taiko', 'manta', 'mantanetwork', 'altlayer', 'obol', 'ssv', 'ssvnetwork', 'flashbots', 'swell', 'swellnetwork', 'karak', 'zkm', 'polyhedra',
  'paraswap', 'cowswap', 'matcha', 'raydium', 'drift', 'driftprotocol', 'mango', 'mangomarkets', 'zeta', 'zetamarkets', 'gmx', 'gains', 'gainsnetwork', 'kwenta', 'snx', 'frax', 'fraxfinance', 'convex', 'convexfinance', 'pendle', 'gearbox', 'spark', 'clearpool', 'truefi', 'ribbon', 'ribbonfinance', 'aevo',
  'defillama', 'glassnode', 'kaiko', 'api3', 'band', 'bandprotocol', 'infura', 'tenderly', 'moralis', 'gelato', 'gelatonetwork',
  'trezor', 'argent', 'rainbow', 'privy', 'web3auth', 'dynamic', 'trailofbits', 'halborn', 'hacken',
  'blur', 'looksrare', 'x2y2', 'rarible', 'superrare', 'yuga', 'yugalabs', 'axie', 'axieinfinity', 'illuvium', 'gala', 'galagames', 'stepn', 'mythical', 'mythicalgames',
  'multicoin', 'multicoincapital', 'dragonfly', 'dragonflycapital', 'framework', 'frameworkventures', 'electric', 'electriccapital', 'hashed', 'drw', 'cumberland',
  'bitget', 'mexc', 'bitfinex', 'bitstamp', 'uphold', 'nexo', 'coincheck',
  'transak', 'banxa', 'stripe', 'tether',
  'coindesk', 'theblock', 'decrypt', 'bankless', 'farcaster', 'merkle', 'merklemanufactory', 'warpcast', 'galxe', 'guild', 'snapshot', 'snapshotlabs',
  'aztec', 'aztecnetwork', 'starknet', 'starkware', 'zksync', 'matterlabs', 'aleph', 'alephzero', 'casper', 'casperlabs', 'concordium', 'kadena', 'nervos', 'oasis', 'oasisnetwork', 'ontology', 'qtum', 'zilliqa',
  'akash', 'akashnetwork', 'arweave', 'filecoin', 'protocollabs', 'siacoin', 'storj', 'theta', 'thetanetwork', 'livepeer', 'audius', 'royal', 'sound', 'soundxyz',
  'gitcoin', 'aragon', 'radicle', 'status', 'zapper', 'zerion', 'debank',
  'pokt', 'pocketnetwork', 'ens', 'unstoppable', 'unstoppabledomains',
  '1kx', 'blockchaincapital', 'spartan', 'spartangroup',
  'outlierventures', 'fabricventures', 'fenbushi', 'fenbushicapital', 'kinetic', 'kineticcapital', 'ngc', 'ngcventures', 'plum', 'plumventures', 'signum', 'signumcapital', 'snz', 'snzholding', 'token', 'tokenfund',
  'bittrex', 'poloniex', 'shapeshift', 'changelly', 'changenow', 'simpleswap', 'stealthex', 'godex', 'fixedfloat',
  'ledger', 'trezor', 'keepkey', 'bitbox', 'coldcard', 'cobo', 'elliptic', 'chainalysis', 'ciphertrace', 'scorechain', 'coinfirm',
  // Try some weird combos
  'matter-labs', 'dapper-labs', 'polygon-technology', 'circle-internet-financial', 'kraken-digital-asset-exchange', 'gemini-trust-company', 'okcoin', 'paxos-trust-company', 'ripple-labs', 'stellar-development-foundation', 'tezos-foundation', 'tron-foundation', 'ethereum-foundation', 'litecoin-foundation', 'dogecoin-foundation', 'bitcoin-foundation'
];

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
  
  const concurrency = 20;
  for (let i = 0; i < toCheck.length; i += concurrency) {
    const chunk = toCheck.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (slug) => {
      for (const platform of platforms) {
        const url = platform.url(slug);
        const exists = await checkUrl(url);
        if (exists) {
          found.push({ platform: platform.name, slug });
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
