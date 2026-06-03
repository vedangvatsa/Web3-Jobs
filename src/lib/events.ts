import fs from 'fs';
import path from 'path';

export interface Web3Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  city?: string;
  country?: string;
  location: string;
  month?: string;
  url: string;
  website?: string | null;
  coverImage: string | null;
  twitter?: string | null;
  source?: string;
}
// Keywords that indicate an event is Web3/crypto related
const WEB3_KEYWORDS = [
  'web3', 'blockchain', 'crypto', 'bitcoin', 'btc', 'ethereum', 'eth',
  'solidity', 'defi', 'nft', 'dao', 'token', 'solana', 'layer2', 'l2',
  'rollup', 'zk', 'zero knowledge', 'smart contract', 'dapp', 'decentralized',
  'onchain', 'on-chain', 'chainlink', 'uniswap', 'aave', 'polygon', 'arbitrum',
  'optimism', 'stablecoin', 'wallet', 'consensus', 'mining', 'staking',
  'validator', 'metaverse', 'gamefi', 'ethglobal', 'devcon', 'pragma',
  'hackathon', 'aptos', 'sui', 'cosmos', 'polkadot', 'near', 'avax',
  'avalanche', 'bnb', 'binance', 'coinbase', 'ledger', 'dex', 'cex',
  'yield', 'liquidity', 'mica', 'superteam', 'iotex', 'libertum',
  'coinfest', 'blockcon', 'web 3', 'block chain', 'icp', 'internet computer',
];

function isWeb3Related(event: Web3Event): boolean {
  const text = `${event.name} ${event.description || ''} ${event.url || ''}`.toLowerCase();
  return WEB3_KEYWORDS.some(kw => text.includes(kw));
}

export async function getEvents(): Promise<Web3Event[]> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'events-cache.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const events: Web3Event[] = JSON.parse(fileContents);
    
    // Filter to Web3-related events only
    const relevant = events.filter(isWeb3Related);

    // Sort by date (upcoming first)
    const sorted = relevant.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    // Deduplicate by name + startDate
    const seen = new Set<string>();
    return sorted.filter(e => {
      const key = `${e.name.toLowerCase().trim()}|${e.startDate}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (error) {
    console.error('Error reading events cache:', error);
    return [];
  }
}
