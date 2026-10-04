import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';

export const FEEDS = [
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss' },
  { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
  { name: 'The Block', url: 'https://www.theblock.co/rss.xml' },
  { name: 'Blockworks', url: 'https://blockworks.com/feed' },
  { name: 'Decrypt', url: 'https://decrypt.co/feed' },
  { name: 'Crypto Briefing', url: 'https://cryptobriefing.com/feeds/' },
  { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/' },
  { name: 'BeInCrypto', url: 'https://beincrypto.com/feed/' },
  { name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/feed' },
  { name: 'CoinJournal', url: 'https://coinjournal.net/feed/' },
  { name: 'The Defiant', url: 'https://thedefiant.io/api/feed' },
  { name: 'Unchained', url: 'https://unchainedcrypto.com/feed/' },
  { name: 'Bankless', url: 'https://www.bankless.com/rss/feed' },
  { name: 'SEC Press Releases', url: 'https://www.sec.gov/news/pressreleases.rss' },
  { name: 'Chainwire', url: 'https://chainwire.org/feed/' },
  { name: 'Ethereum Foundation', url: 'https://blog.ethereum.org/en/feed.xml' },
];

export function canonicalNewsUrl(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) if (/^utm_|^(fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
    url.searchParams.sort();
    return `${url.hostname}${url.pathname.replace(/\/$/, '')}${url.search}`;
  } catch { return ''; }
}

const STOP = new Set('a an the and or with for from after amid into over under of to on in at as is are was were its it this that by says said new latest news crypto web3'.split(' '));
const normalizedTitle = title => String(title || '').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const ACTIONS = [
  /\b(approve[sd]?|adopt[sed]*|passes?|passed|wins?)\b/i,
  /\b(reject[sed]*|denie[sd]|blocks?|blocked|dismiss[sed]*)\b/i,
  /\b(propos[ea-z]*|plans?|appl[yi][a-z]*|seeks?)\b/i,
  /\b(recover[a-z]*|return[sed]*|repaid|repays?|refund[a-z]*)\b/i,
  /\b(hack[a-z]*|exploit[a-z]*|stolen|breach[a-z]*|theft)\b/i,
];
function tokens(title) {
  return new Set(normalizedTitle(String(title).replace(/\b(erc|eip|bip)[ -]?(\d+)\b/ig, '$1$2')).split(/\s+/).filter(word => word && !STOP.has(word)));
}

export function sameNewsStory(first, second) {
  if (!first || !second) return false;
  if (normalizedTitle(first) === normalizedTitle(second)) return true;
  const actionsA = ACTIONS.flatMap((pattern, index) => pattern.test(first) ? [index] : []), actionsB = ACTIONS.flatMap((pattern, index) => pattern.test(second) ? [index] : []);
  if (actionsA.length && actionsB.length && actionsA.join(',') !== actionsB.join(',')) return false;
  const a = tokens(first), b = tokens(second);
  const numbersA = [...a].filter(token => /\d/.test(token)), numbersB = [...b].filter(token => /\d/.test(token));
  if (numbersA.length && numbersB.length && !numbersA.some(token => numbersB.includes(token))) return false;
  const shared = [...a].filter(token => b.has(token)).length;
  return shared >= 4 && shared / (a.size + b.size - shared) >= 0.72;
}

export function readNewsArticles(cwd = process.cwd()) {
  const directory = path.join(cwd, 'content/articles');
  return fs.readdirSync(directory).filter(file => file.endsWith('.md') && file !== 'AGENTS.md').flatMap(file => {
    const { data, content } = matter(fs.readFileSync(path.join(directory, file), 'utf8'));
    if (data.category !== 'News' || typeof data.title !== 'string') return [];
    return [{ slug: file.slice(0, -3), title: data.title, published: new Date(data.publishedDate || 0).toISOString(), sourceUrls: [...content.matchAll(/\]\((https?:\/\/[^\s)]+)/g)].map(match => canonicalNewsUrl(match[1])).filter(Boolean) }];
  });
}

export function coveredByArticle(candidate, articles) {
  const urls = [candidate.link, ...(candidate.sources || []).map(source => source.url)].map(canonicalNewsUrl).filter(Boolean);
  return articles.find(article => urls.some(url => article.sourceUrls?.includes(url)) || normalizedTitle(candidate.title) === normalizedTitle(article.title)
    || (Math.abs(Date.parse(candidate.published) - Date.parse(article.published)) <= 7 * 86400000 && sameNewsStory(candidate.title, article.title)));
}

function stripTags(value) {
  return String(value || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => Number(code) <= 0x10ffff ? String.fromCodePoint(Number(code)) : '')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => parseInt(code, 16) <= 0x10ffff ? String.fromCodePoint(parseInt(code, 16)) : '')
    .replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}
function tag(block, names) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
    if (match) return stripTags(match[1]);
  }
  return '';
}
export function parseFeed(xml) {
  return (xml.match(/<(item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(item|entry)>/gi) || []).flatMap(block => {
    const title = tag(block, ['title']);
    const links = [...block.matchAll(/<link\b([^>]*)\/?>/gi)].map(match => ({ href: match[1].match(/\bhref=["']([^"']+)["']/i)?.[1], rel: match[1].match(/\brel=["']([^"']+)["']/i)?.[1] }));
    const link = tag(block, ['link']) || stripTags((links.find(link => link.rel === 'alternate') || links.find(link => !link.rel))?.href);
    const pubDate = tag(block, ['pubDate', 'published', 'updated', 'dc:date']);
    return title && canonicalNewsUrl(link) ? [{ title, link, pubDate }] : [];
  });
}

export function rankScore(title) {
  let score = 0;
  if (/\b(sec|fca|cftc|senate|house|vote|bill|act|lawsuit|court|fine|ban|license|etf|staking|reserve|audit)\b/i.test(title)) score += 3;
  if (/\b(launch|mainnet|upgrade|hardfork|raises|funding|invests|partnership|acquires)\b/i.test(title)) score += 2;
  if (/\b(hack|exploit|breach|drain|phishing|scam|rug)\b/i.test(title)) score += 2;
  if (/\b(bitcoin|ethereum|solana|xrp|blackrock|coinbase|binance|circle|tether)\b/i.test(title)) score++;
  if (/\b(price prediction|price analysis|will .* (hit|reach)|top .* to buy|explain(ed)?|what is|how to|guide)\b/i.test(title)) score -= 4;
  return score;
}

async function fetchFeed(feed, request) {
  try {
    const response = await request(feed.url, { headers: { 'User-Agent': 'HashtagWeb3NewsBot/1.0 (+https://hashtagweb3.com)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' }, signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    if (!/<(?:rss|feed|rdf:RDF)\b/i.test(xml)) throw new Error('Response is not an RSS/Atom feed');
    return { source: feed.name, url: feed.url, ok: true, items: parseFeed(xml) };
  } catch (error) { return { source: feed.name, url: feed.url, ok: false, error: String(error), items: [] }; }
}

export async function discoverNews({ hours = 24, max = Infinity, now = Date.now(), articles = readNewsArticles(), feeds = FEEDS, request = fetch } = {}) {
  if (!Number.isFinite(hours) || hours <= 0 || !(max === Infinity || Number.isInteger(max) && max > 0)) throw new Error('Invalid discovery window or limit');
  const results = await Promise.all(feeds.map(feed => fetchFeed(feed, request)));
  const candidates = [], seen = new Map();
  for (const feed of results) for (const item of feed.items) {
    const time = Date.parse(item.pubDate), url = canonicalNewsUrl(item.link);
    if (!Number.isFinite(time) || time < now - hours * 3600000 || time > now) continue;
    const source = { name: feed.source, url: item.link, published: new Date(time).toISOString() };
    const match = seen.get(url) || candidates.find(candidate => sameNewsStory(candidate.title, item.title));
    if (match) {
      if (!match.sources.some(entry => canonicalNewsUrl(entry.url) === url)) match.sources.push(source);
      if (feed.source !== match.source && !match.alsoCoveredBy.includes(feed.source)) match.alsoCoveredBy.push(feed.source);
      seen.set(url, match);
      continue;
    }
    const candidate = { source: feed.source, title: item.title, link: item.link, published: source.published, score: rankScore(item.title), sources: [source], alsoCoveredBy: [] };
    const covered = coveredByArticle(candidate, articles);
    if (covered) candidate.coveredBy = covered.slug;
    candidates.push(candidate); seen.set(url, candidate);
  }
  for (const candidate of candidates) {
    const covered = coveredByArticle(candidate, articles);
    if (covered) candidate.coveredBy = covered.slug;
  }
  candidates.sort((a, b) => b.score - a.score || b.published.localeCompare(a.published));
  return { candidates: candidates.slice(0, max), feeds: results.map(({ items, ...feed }) => ({ ...feed, items: items.length })), total: candidates.length };
}

async function main() {
  const args = process.argv.slice(2);
  const option = (name, fallback) => args.includes(name) ? Number(args[args.indexOf(name) + 1]) : fallback;
  const result = await discoverNews({ hours: option('--hours', Number(process.env.NEWS_LOOKBACK_HOURS || 24)) });
  const max = option('--max', 40);
  if (!Number.isInteger(max) || max < 1) throw new Error('Invalid --max');
  if (!result.feeds.some(feed => feed.ok)) throw new Error('All news feeds failed; this is not evidence of a slow-news day');
  for (const feed of result.feeds.filter(feed => !feed.ok)) console.error(`${feed.source}: ${feed.error}`);
  console.log(JSON.stringify(result.candidates.filter(candidate => !candidate.coveredBy).slice(0, max), null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
