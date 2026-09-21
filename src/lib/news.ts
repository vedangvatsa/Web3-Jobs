import type { NewsItem } from '@/types';
import type { Article } from '@/types';
import { sameEvent } from '@/lib/news-story-dedup';
import { loadStaticJson } from './load-static-json';
import { getAllArticles } from '@/lib/articles';
export const NEWS_FEEDS = [
 { url: 'https://decrypt.co/feed', source: 'Decrypt' },
 { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph' },
 { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'Coindesk' },
 { url: 'https://blockchain.news/RSS/', source: 'Blockchain.News' },
 { url: 'https://www.theblock.co/rss.xml', source: 'The Block' },
 { url: 'https://dailyhodl.com/feed/', source: 'Daily Hodl' }
];

const NEWS_CACHE_TTL_MS = 60 * 1000;
const RSS_TIMEOUT_MS = 8000;
const RSS_CONCURRENCY = 3;

let newsCache: { timestamp: number; items: NewsItem[] } | null = null;

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

const PREDICTION_TICKER_RE = /^([A-Z0-9]{2,10})\s+Price\s+Prediction\b/i;

function extractPredictionTicker(title: string): string | null {
  const match = PREDICTION_TICKER_RE.exec(title);
  return match ? match[1].toUpperCase() : null;
}

function isNativeNewsItem(item: NewsItem): boolean {
  return item.source === 'Hashtag Web3' || item.link.startsWith('/');
}

/** Native Hashtag Web3 stories first, then syndicated feeds; newest first within each group. */
export function sortNewsListingItems(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => {
    const aNative = isNativeNewsItem(a);
    const bNative = isNativeNewsItem(b);
    if (aNative !== bNative) return aNative ? -1 : 1;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });
}

function textsLikelySameStory(a: string, b: string): boolean {
  if (!a.trim() || !b.trim()) return false;
  if (isDuplicate(a, b)) return true;
  return sameEvent(a, b);
}

/** True when two feed rows cover the same story (including native vs RSS wording). */
export function isSameNewsStory(a: NewsItem, b: NewsItem): boolean {
  const tickA = extractPredictionTicker(a.title);
  const tickB = extractPredictionTicker(b.title);
  if (tickA && tickB && tickA !== tickB) return false;

  if (textsLikelySameStory(a.title, b.title)) return true;

  const nativePair = isNativeNewsItem(a) !== isNativeNewsItem(b);
  if (nativePair) {
    const native = isNativeNewsItem(a) ? a : b;
    const external = isNativeNewsItem(a) ? b : a;
    if (textsLikelySameStory(native.title, external.title)) return true;
    if (textsLikelySameStory(native.title, external.contentSnippet)) return true;
    if (
      textsLikelySameStory(
        `${native.title} ${native.contentSnippet}`,
        `${external.title} ${external.contentSnippet}`,
      )
    ) {
      return true;
    }
  }

  return false;
}

export function deduplicateNewsItems(items: NewsItem[]): NewsItem[] {
  const uniqueItems: NewsItem[] = [];

  for (const item of items) {
    const matchIndex = uniqueItems.findIndex((existing) => isSameNewsStory(item, existing));
    if (matchIndex === -1) {
      uniqueItems.push(item);
      continue;
    }

    const existing = uniqueItems[matchIndex];
    if (isNativeNewsItem(item) && !isNativeNewsItem(existing)) {
      uniqueItems[matchIndex] = item;
    }
  }

  return uniqueItems;
}

const WEB3_CRYPTO_KEYWORDS = [
  'web3', 'crypto', 'cryptocurrency', 'blockchain', 'bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol',
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
  'vault', 'vaults', 'hashrate', 'halving', 'node', 'nodes', 'coin', 'coins', 'satoshi',
  'vitalik', 'cz', 'saylor', 'microstrategy', 'bull market', 'bear market', 'market cap',
  'tvl', 'gas fee', 'gwei', 'mempool', 'ordinals', 'inscriptions', 'runes'
];

const EXCLUDED_NON_WEB3_TOPICS = [
  'openai', 'sam altman', 'chatgpt', 'anthropic', 'claude', 'midjourney', 'sora',
  'nvidia', 'apple', 'microsoft', 'google', 'tesla', 'intel', 'amd', 'meta', 'zuckerberg',
  'elon musk', 'x.ai', 'grok', 'spacex', 's&p 500', 'dow jones', 'mortgage rates',
  'housing market', 'oil prices', 'brent crude'
];

// Generic words such as "base", "protocol", "token", and "swap" appear in
// ordinary technology coverage. When an item is otherwise about AI or big tech,
// require a term that identifies a crypto or Web3 subject directly.
const STRONG_WEB3_CRYPTO_KEYWORDS = [
  'web3', 'crypto', 'cryptocurrency', 'blockchain', 'bitcoin', 'btc', 'ethereum', 'eth',
  'solana', 'defi', 'nft', 'stablecoin', 'binance', 'coinbase', 'kraken', 'tether',
  'usdt', 'usdc', 'mining', 'validator', 'staking', 'smart contract', 'dapp', 'dex',
  'polymarket', 'kalshi', 'metamask', 'arbitrum', 'optimism', 'cardano', 'ripple',
  'xrp', 'avalanche', 'polkadot', 'chainlink', 'eigenlayer', 'zksync', 'starknet',
  'onchain', 'on-chain', 'mempool', 'ordinals', 'satoshi'
];

function includesKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => {
    const regex = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });
}

/** Daily roundup stubs (e.g. Cointelegraph "what happened in crypto today") are not real stories. */
const EXCLUDED_NEWS_TITLE_PATTERNS = [
  /what\s+happened\s+in\s+crypto\s+today/i,
  /crypto\s+news\s+recap/i,
  /daily\s+crypto\s+roundup/i,
  /\bprice\s+prediction\b/i,
];

const EXCLUDED_NEWS_LINK_PATTERNS = [
  /cointelegraph\.com\/news\/what-happened-in-crypto-today/i,
  /blockchain\.news\/news\/\d+-price-prediction-/i,
];

function normalizeNewsMatchText(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u2018\u2019`´]/g, "'")
    .toLowerCase();
}

export function isExcludedNewsItem(item: Pick<NewsItem, 'title' | 'link' | 'contentSnippet'>): boolean {
  const title = normalizeNewsMatchText(item.title || '');
  const snippet = normalizeNewsMatchText(item.contentSnippet || '');
  const link = (item.link || '').toLowerCase();

  if (EXCLUDED_NEWS_LINK_PATTERNS.some((pattern) => pattern.test(link))) return true;
  if (EXCLUDED_NEWS_TITLE_PATTERNS.some((pattern) => pattern.test(title))) return true;
  if (/need to know what happened in crypto today/.test(snippet)) return true;

  return false;
}

function isWeb3RelevantNews(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase();
  
  // 1. Check if article contains any known off-topic / non-crypto tech or finance keywords
  const containsExcludedTopic = EXCLUDED_NON_WEB3_TOPICS.some((topic) => text.includes(topic));
  
  // 2. Check if article contains explicit Web3/crypto keywords
  const hasWeb3Keyword = includesKeyword(text, WEB3_CRYPTO_KEYWORDS);
  const hasStrongWeb3Keyword = includesKeyword(text, STRONG_WEB3_CRYPTO_KEYWORDS);

  // If it mentions an off-topic subject (e.g. OpenAI, Apple, S&P 500), generic
  // words are insufficient. It must explicitly identify a crypto/Web3 subject.
  if (containsExcludedTopic && !hasStrongWeb3Keyword) {
    return false;
  }

  // Double-check: ensure the news item has at least basic relevance context
  if (!hasWeb3Keyword && !containsExcludedTopic) {
    // Weak/generic headlines with zero web3 terms in title or snippet get filtered out
    return false;
  }

  return true;
}

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  creator?: string;
  author?: string;
};

type RssFeed = { items?: RssItem[] };

function normalizeNewsItems(feed: RssFeed, source: string): NewsItem[] {
  const items: NewsItem[] = [];

  for (const item of feed.items || []) {
    if (!item.title || !item.link || !item.pubDate || !item.contentSnippet) continue;

    const snippet = item.contentSnippet.trim();
    const truncated = snippet.length > 150
      ? `${snippet.substring(0, 150).replace(/\.{1,3}$/, '')}...`
      : snippet;

    if (!isWeb3RelevantNews(item.title, truncated)) continue;

    const draft: NewsItem = {
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      creator: item.creator || item.author || source,
      contentSnippet: truncated,
      source,
    };
    if (isExcludedNewsItem(draft)) continue;

    let creator = item.creator || item.author || source;
    if (typeof creator === 'string') {
      const regex = new RegExp(`^${source}\\s*(?:by|-|:)?\\s*`, 'i');
      creator = creator.replace(regex, '').trim();
      if (creator.toLowerCase().startsWith('by ')) {
        creator = creator.substring(3).trim();
      }
      if (!creator) creator = source;
    } else {
      creator = source;
    }

    items.push({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      creator,
      contentSnippet: truncated,
      source,
    });
  }

  return items;
}

export type NewsRefreshResult = {
  items: NewsItem[];
  successfulFeeds: number;
};

/** Fetch and normalize RSS items for the offline snapshot refresh job. */
export async function fetchNewsFeedItems(): Promise<NewsRefreshResult> {
  const { default: Parser } = await import('rss-parser');
  const allItems: NewsItem[] = [];
  let successfulFeeds = 0;

  for (let index = 0; index < NEWS_FEEDS.length; index += RSS_CONCURRENCY) {
    const batch = await Promise.all(NEWS_FEEDS.slice(index, index + RSS_CONCURRENCY).map(async (feedInfo) => {
      try {
        const response = await fetch(feedInfo.url, {
          headers: { 'User-Agent': 'HashtagWeb3NewsCache/1.0' },
          signal: AbortSignal.timeout(RSS_TIMEOUT_MS),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const parser = new Parser();
        const feed = await parser.parseString(await response.text()) as RssFeed;
        return { items: normalizeNewsItems(feed, feedInfo.source), succeeded: true };
      } catch (error) {
        console.warn(`Could not fetch or parse news feed: ${feedInfo.url}`, error);
        return { items: [], succeeded: false };
      }
    }));

    for (const result of batch) {
      allItems.push(...result.items);
      if (result.succeeded) successfulFeeds++;
    }
  }

  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return { items: deduplicateNewsItems(allItems), successfulFeeds };
}

function isNewsItem(value: unknown): value is NewsItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return ['title', 'link', 'pubDate', 'creator', 'contentSnippet', 'source']
    .every((key) => typeof item[key] === 'string');
}

let newsSnapshotCache: NewsItem[] | null = null;
let newsSnapshotLoad: Promise<NewsItem[]> | null = null;

function isNewsSnapshot(value: unknown): value is { generatedAt: string; items: NewsItem[] } {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as { generatedAt?: unknown; items?: unknown };
  return typeof snapshot.generatedAt === 'string' && Number.isFinite(Date.parse(snapshot.generatedAt))
    && Array.isArray(snapshot.items) && snapshot.items.every(isNewsItem);
}

export function parseNewsSnapshot(value: unknown): NewsItem[] {
  return isNewsSnapshot(value) ? value.items.filter(item => !isExcludedNewsItem(item)) : [];
}

async function loadNewsSnapshot(): Promise<NewsItem[]> {
  if (newsSnapshotCache) return newsSnapshotCache;
  if (!newsSnapshotLoad) {
    newsSnapshotLoad = loadStaticJson<{ generatedAt: string; items: NewsItem[] }>('news-cache.json', isNewsSnapshot)
      .then((snapshot) => {
        newsSnapshotCache = parseNewsSnapshot(snapshot);
        return newsSnapshotCache;
      })
      .finally(() => { newsSnapshotLoad = null; });
  }
  return newsSnapshotLoad;
}

export function readNewsSnapshot(): NewsItem[] {
  if (newsSnapshotCache) return newsSnapshotCache;
  return [];
}

export async function getNewsFeed(): Promise<NewsItem[]> {
  const now = Date.now();
  if (newsCache && (now - newsCache.timestamp < NEWS_CACHE_TTL_MS)) {
    return newsCache.items;
  }

  try {
    const items = await loadNewsSnapshot();
    newsCache = { timestamp: now, items };
    return items;
  } catch (error) {
    console.error('[news] Snapshot unavailable:', error);
    return [];
  }
}

type ArticleListing = Omit<Article, 'content' | 'rawContent'>;

/** Map native `category: News` articles to listing rows (on-site URLs, Hashtag Web3 source). */
export function nativeArticlesToNewsItems(articles: ArticleListing[]): NewsItem[] {
  return articles
    .filter((article) => article.category === 'News')
    .map((article) => {
      const pubMs = article.publishedDate ? Date.parse(article.publishedDate) : 0;
      return {
        title: article.title,
        link: `/${article.slug}`,
        pubDate: pubMs ? new Date(pubMs).toISOString() : new Date().toISOString(),
        creator: 'Hashtag Web3',
        contentSnippet: article.description,
        source: 'Hashtag Web3',
      };
    });
}

/** RSS syndication plus native news articles, deduped with native winning over matching RSS rows. */
export async function getNewsListingItems(): Promise<NewsItem[]> {
  const [feedItems, articles] = await Promise.all([getNewsFeed(), getAllArticles()]);
  return sortNewsListingItems(
    deduplicateNewsItems([...nativeArticlesToNewsItems(articles), ...feedItems]),
  );
}
