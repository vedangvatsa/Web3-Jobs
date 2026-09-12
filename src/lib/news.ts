
'use server';

import Parser from 'rss-parser';
import type { NewsItem } from '@/types';

const FEEDS = [
 { url: 'https://decrypt.co/feed', source: 'Decrypt' },
 { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph' },
 { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'Coindesk' },
 { url: 'https://blockchain.news/RSS/', source: 'Blockchain.News' },
 { url: 'https://www.theblock.co/rss.xml', source: 'The Block' },
 { url: 'https://dailyhodl.com/feed/', source: 'Daily Hodl' }
];

const parser = new Parser({
  timeout: 8000,
});

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s',
  'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m',
  'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t',
  'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t',
  'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why',
  'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours',
  'yourself', 'yourselves', 'says', 'said', 'will', 'just', 'new', 'crypto', 'web3', 'today', 'report', 'plans', 'amid',
  'ahead', 'via', 'first', 'year', 'over', 'bitcoin', 'ethereum', 'btc', 'eth', 'price', 'prediction', 'market',
  'smart', 'money', 'loading', 'flush', 'next', 'bears', 'bulls', 'tape', 'target', 'targets', 'level', 'levels'
]);

function getKeywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      // Numbers often carry the identifying detail in financial headlines
      // (for example, an issuance size or percentage change).
      .filter((w) => (w.length > 2 || /^\d+$/.test(w)) && !STOP_WORDS.has(w))
  );
}

function isDuplicate(title1: string, title2: string): boolean {
  const norm1 = title1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const norm2 = title2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (norm1 === norm2) return true;

  const w1 = getKeywords(title1);
  const w2 = getKeywords(title2);
  if (w1.size === 0 || w2.size === 0) return false;

  const common: string[] = [];
  for (const w of w1) {
    if (w2.has(w)) common.push(w);
  }

  const minSize = Math.min(w1.size, w2.size);
  const overlap = common.length / minSize;

  // 1. If 3 or more core topic/entity keywords match (e.g. ['metaplanet', 'cuts', '41'] or ['nasdaq', 'kraken', '100m'])
  if (common.length >= 3) return true;

  // 2. High keyword overlap (>= 60%) for headlines with 4+ terms
  if (minSize >= 4 && overlap >= 0.6) return true;

  // 3. High keyword overlap (>= 75%) for short headlines
  if (minSize >= 2 && minSize < 4 && overlap >= 0.75) return true;

  return false;
}

export function deduplicateNewsItems(items: NewsItem[]): NewsItem[] {
  const uniqueItems: NewsItem[] = [];

  for (const item of items) {
    if (!uniqueItems.some((unique) => isDuplicate(item.title, unique.title))) {
      uniqueItems.push(item);
    }
  }

  return uniqueItems;
}

// In-memory cache for news feeds
let newsCache: { timestamp: number; items: NewsItem[] } | null = null;
const NEWS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const WEB3_CRYPTO_KEYWORDS = [
  'web3', 'crypto', 'blockchain', 'bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol',
  'defi', 'dao', 'daos', 'nft', 'nfts', 'token', 'tokens', 'tokenomics', 'stablecoin', 'stablecoins',
  'altcoin', 'memecoin', 'memecoins', 'layer 1', 'layer 2', 'l2', 'rollup', 'rollups',
  'sec', 'cftc', 'mika', 'binance', 'coinbase', 'kraken', 'bybit', 'okx', 'tether', 'usdt', 'usdc',
  'mining', 'validator', 'validators', 'staking', 'restaking', 'airdrop', 'airdrops',
  'smart contract', 'smart contracts', 'dapp', 'dapps', 'dex', 'cex', 'polymarket', 'kalshi',
  'onchain', 'on-chain', 'zk', 'zero-knowledge', 'decentralized', 'wallet', 'wallets', 'ledger',
  'metamask', 'base', 'arbitrum', 'optimism', 'sui', 'aptos', 'cardano', 'ripple', 'xrp',
  'avalanche', 'avax', 'polkadot', 'chainlink', 'near', 'ton', 'monad', 'berachain',
  'hyperliquid', 'eigenlayer', 'blast', 'zksync', 'starknet', 'depin', 'desci', 'rwa', 'rwas',
  'yield', 'protocol', 'protocols', 'liquidity', 'swap', 'swaps', 'bridge', 'bridges',
  'vault', 'vaults', 'hashrate', 'halving', 'node', 'nodes'
];

const GENERAL_NON_WEB3_TOPICS = [
  'openai', 'sam altman', 'chatgpt', 'anthropic', 'claude', 'midjourney', 'sora',
  'nvidia', 'apple', 'microsoft', 'google', 'tesla', 'intel', 'amd'
];

function isWeb3RelevantNews(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase();
  
  // If the news item covers general non-crypto AI/tech topics without any crypto/web3 crossover, filter it out.
  const containsGeneralTech = GENERAL_NON_WEB3_TOPICS.some((topic) => text.includes(topic));
  if (containsGeneralTech) {
    const hasWeb3Keyword = WEB3_CRYPTO_KEYWORDS.some((kw) => {
      const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      return regex.test(text);
    });
    if (!hasWeb3Keyword) {
      return false;
    }
  }

  return true;
}

export async function getNewsFeed(): Promise<NewsItem[]> {
 // Return cached results if fresh
 const now = Date.now();
 if (newsCache && (now - newsCache.timestamp < NEWS_CACHE_TTL_MS)) {
  return newsCache.items;
 }

 const allItems: NewsItem[] = [];

 const feedResults = await Promise.all(
  FEEDS.map(async (feedInfo) => {
   try {
    const feed = await parser.parseURL(feedInfo.url);
    const items: NewsItem[] = [];
    if (feed?.items) {
     feed.items.forEach((item) => {
      if (item.title && item.link && item.pubDate && item.contentSnippet) {
       const snippet = item.contentSnippet.trim();
       const truncated = snippet.length > 150
        ? snippet.substring(0, 150).replace(/\.{1,3}$/, '') + '...'
        : snippet;

       if (!isWeb3RelevantNews(item.title, truncated)) {
        return;
       }
        let creator = item.creator || item.author || feedInfo.source;
        if (typeof creator === 'string') {
         const regex = new RegExp(`^${feedInfo.source}\\s*(?:by|-|:)?\\s*`, 'i');
         creator = creator.replace(regex, '').trim();
         if (creator.toLowerCase().startsWith('by ')) {
          creator = creator.substring(3).trim();
         }
         if (!creator) creator = feedInfo.source;
        }

        items.push({
         title: item.title,
         link: item.link,
         pubDate: item.pubDate,
         creator: creator,
         contentSnippet: truncated,
         source: feedInfo.source,
        });
      }
     });
    }
    return items;
   } catch (error) {
    console.warn(`Could not fetch or parse news feed: ${feedInfo.url}`, error);
    return [];
   }
  })
 );

 // Flatten results
 for (const items of feedResults) {
  allItems.push(...items);
 }

 // Sort all items by publication date, descending
 allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

 // Deduplicate news items against all accumulated unique items
  const uniqueItems = deduplicateNewsItems(allItems);

 // Update cache
 newsCache = { timestamp: Date.now(), items: uniqueItems };

 return uniqueItems;
}
