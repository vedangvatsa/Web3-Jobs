/**
 * Probe a curated slug list against Greenhouse / Lever / Ashby and report boards
 * with live postings that are not already listed in refresh-jobs-cache.ts.
 */
import fs from 'node:fs';
import rejected from '../content/rejected-ats-boards.json';
import { atsBoardKey } from '../src/lib/ats-board-identity';

const CACHE_SRC = fs.readFileSync('scripts/refresh-jobs-cache.ts', 'utf8');
const configured = new Set<string>();
for (const match of CACHE_SRC.matchAll(/\{\s*board:\s*['"]([^'"]+)['"]/g)) {
  configured.add(match[1].toLowerCase());
}

/** High-signal Web3 employers — slug guesses for public ATS APIs. */
const SLUGS = [
  // exchanges & trading
  'bitfinex', 'kraken', 'crypto', 'bitmart', 'phemex', 'deribit', 'bitvavo', 'cumberland', 'cumberlanddrw',
  'wintermute', 'wintermute-trading', 'galaxy', 'galaxydigital', 'galaxyinteractive', 'bccp',
  // infra & devtools
  'infura', 'thirdweb', 'moralis', 'chainstack', 'quicknode', 'nodies', 'blocknative', 'erigon',
  'subsquid', 'goldsky', 'envio', 'artemis', 'covalenthq', 'covalent', 'allium', 'flipsidecrypto',
  // L1/L2
  'celestia', 'celestiaorg', 'initia', 'berachain', 'storyprotocol', 'story', 'linera', 'namada',
  'penumbra', 'fuel', 'fuellabs', 'sovereign', 'sovereignlabs', 'radius', 'celestiafoundation',
  // DeFi
  'maplefinance', 'maple', 'ajna', 'kamino', 'drift', 'jupiter', 'marginfi', 'kamino-finance',
  'spark', 'sparkprotocol', 'fluid', 'instadapp', 'convex', 'frax', 'gearbox', 'idle',
  // wallets & security
  'privy', 'dynamic', 'web3auth', 'cube3', 'openfort', 'squads', 'dynamiclabs', 'cubist',
  'spearbit', 'trailofbits', 'runtimeverification', 'quantstamp', 'hexens', 'zellic',
  // data & compliance
  'glassnode', 'arkham', 'parsec', 'sanbase', 'santiment', 'coinmetrics', 'tokenterminal', 'flipside',
  'chainalysis-careers', 'elliptic', 'solidus', 'merklescience', 'merkle-science',
  // NFT / gaming
  'immutable', 'immutablex', 'limitbreak', 'parallel', 'parallelstudios', 'proof', 'yuga', 'yugalabs',
  // AI x crypto
  'ritual', 'gensyn', 'ionet', 'io-net', 'grass', 'sentient', 'nousresearch', 'primeintellect',
  // misc verified brands
  'circle', 'circleinternetfinancial', 'paxos', 'paxoslabs', 'moonpay', 'transak', 'simplex',
  'anchorage', 'copperco', 'copper', 'bitgo', 'fireblocks', 'custodia', 'bitwise',
  'consensys', 'consensysmesh', 'infstones', 'everstake', 'chorusone', 'chorus-one',
  'polymarket', 'kalshi', 'opensea', 'blur', 'magiceden', 'magicedenlabs',
  'world', 'worldcoin', 'tools-for-humanity', 'tempo', 'tempo-xyz',
  'jumptrading', 'jumpcrypto', 'a16zcrypto', 'paradigm', 'polychain', 'dragonfly',
  '0x', 'cowprotocol', 'cow-dao', 'uniswap', 'aave', 'aavelabs', 'compoundlabs',
  'lido', 'lidofinance', 'eigenlayer', 'eigen-labs', 'teameigen', 'eigenlabs',
  'wormhole', 'wormholelabs', 'layerzero', 'layerzerolabs', 'hyperlane', 'axelar',
  'pendle', 'etherfi', 'ether.fi', 'euler', 'eulerfinance', 'morpho', 'symbiotic',
  'starkware', 'starknet', 'zksync', 'matterlabs', 'matter-labs', 'aztec', 'aztec-labs',
  'succinct', 'risczero', 'aleo', 'provable', 'nomic', 'nomicfoundation',
];

async function greenhouseCount(board: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=false`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { jobs?: unknown[] };
    return data.jobs?.length ?? 0;
  } catch {
    return null;
  }
}

async function leverCount(board: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(board)}?mode=json`);
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? data.length : null;
  } catch {
    return null;
  }
}

async function ashbyCount(board: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { jobs?: unknown[] };
    return data.jobs?.length ?? 0;
  } catch {
    return null;
  }
}

type Hit = { provider: string; board: string; jobs: number };

async function main() {
  const hits: Hit[] = [];
  const seen = new Set<string>();

  for (const slug of [...new Set(SLUGS)]) {
    if (configured.has(slug.toLowerCase())) continue;
    const probes: Array<{ provider: string; fn: (s: string) => Promise<number | null> }> = [
      { provider: 'greenhouse', fn: greenhouseCount },
      { provider: 'lever', fn: leverCount },
      { provider: 'ashby', fn: ashbyCount },
    ];
    for (const { provider, fn } of probes) {
      const jobs = await fn(slug);
      if (!jobs) continue;
      const key = atsBoardKey(provider, slug);
      if (key in rejected) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({ provider, board: slug, jobs });
      console.log(`✅ ${provider}/${slug}: ${jobs} jobs`);
    }
  }

  hits.sort((a, b) => b.jobs - a.jobs);
  fs.mkdirSync('.cache', { recursive: true });
  fs.writeFileSync('.cache/web3-ats-candidate-hits.json', JSON.stringify(hits, null, 2));
  console.log(`\n${hits.length} new boards with live jobs (not in refresh-jobs-cache board list).`);
}

main();