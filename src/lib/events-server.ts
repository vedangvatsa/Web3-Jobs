import fs from 'fs';
import path from 'path';
import { Web3Event, normalizeCountry, getEventBaseSlug, getEventSlug, getEventEcosystems, getEventType } from './events';
import { cleanPublishText } from './noslop';

// Explicitly blocked promotional posts that are not events
const BLOCKED_EVENT_IDS = new Set([
  'luma-host-evt-ueBMP7nPZ9SngEX', // Compass for Bitcoin Asia 2026 Companies & Participant List: promo post, not an event
  // No official event-specific source was available during the September 2026 audit.
  'premier-web3warsaw-2026',
  'premier-modular-summit-2026',
  'premier-ethtokyo-2026',
  'premier-mainnet-2026',
  'premier-enugu',
  'premier-bitcoinberlin',
  'side-desci-singapore-summit-2026',
  'side-sg-arbitrum-stylus-hacker-house',
]);

// Quality gate: drops spam webinars, cancelled listings, and non-web3 meetups
// that leak into the aggregated feed. Curated premier events always pass.
const SPAMMY = /earn (crypto|money|income)|passive income|get rich|financial freedom|trading signal|forex|scam|live zoom|webinar|100x|millionaire|double your|guaranteed (profit|return)/i;
const ONLINE = /\bonline\b|\bvirtual\b/i;
const AMA = /\bAMA\b|ask me anything/i;
const NON_WEB3_NAME = /bodywork|breakup|over your ex|keychains|acting workshop|finissage|culture club|apéro|data jam|electronics and computing|ssis|film festival|wellness & networking|charming|bestie|wind take you|reform room|outdoor workout|pilates|for kids|for families|children|toddler|ripple making|pottery|baking|cooking class/i;
const WEB3_VOCAB = /crypto|bitcoin|btc\b|ethereum|\beth\b|ethglobal|ethcc|ethconf|ethrome|ethtaipei|ethtokyo|eth ?belgrade|blockchain|web ?3|defi|nfts?|solana|dao|token|altcoin|mining|stablecoin|lightning|hacker ?house|builder ?house|hackathon|consensus|token2049|xrp|ripple|zk\b|zksync|zero.?knowledge|superteam|pragma|hyperliquid|onchain|on-chain|lido|polygon|arbitrum|optimism|base chain|coinbase|binance|airdrop|wallet|dapp|smart contract|layer ?2|metaverse|gamefi|staking|yield|digital asset|decentralized|cardano|cosmos|polkadot|monad|aptos|\bsui\b|chainlink|blockcon|founders? dinner|vip dinner|afterparty|rooftop|networking|mixer|side event|coworking|co-working|launchpad|happy hour|lounge|meetup|devcon|breakpoint/i;
const ROOT_ROUTE_SLUGS = new Set([
  'jobs', 'blog', 'glossary', 'companies', 'community', 'learn', 'news',
  'developers', 'api-docs', 'docs', 'auth', 'api-policy', 'resources',
  'events', 'contact', 'privacy', 'ask', 'mcp', 'developer', 'dev',
]);

let rootContentSlugs: Promise<Set<string>> | undefined;

async function getRootContentSlugs(): Promise<Set<string>> {
  if (!rootContentSlugs) {
    rootContentSlugs = (async () => {
      const [{ getAllArticles }, { getAllTerms }, { getAllResourcePages }, { getCompanies }, { getAllJobsWithSlugs }] = await Promise.all([
        import('./articles'),
        import('./glossary'),
        import('./pseo'),
        import('./companies'),
        import('./job-guides'),
      ]);
      const [articles, terms, companies, jobs] = await Promise.all([
        getAllArticles(),
        getAllTerms(),
        getCompanies(),
        getAllJobsWithSlugs(),
      ]);
      return new Set([
        ...ROOT_ROUTE_SLUGS,
        ...articles.map((article) => article.slug),
        ...terms.map((term) => term.slug),
        ...getAllResourcePages().map((resource) => resource.seo.canonicalSlug),
        ...companies.map((company) => company.slug),
        ...jobs.map(({ slug }) => slug),
      ].map((slug) => slug.toLowerCase().trim()));
    })();
  }
  return new Set(await rootContentSlugs);
}

async function assignUniqueEventSlugs(events: Web3Event[]): Promise<Web3Event[]> {
  const reserved = await getRootContentSlugs();
  return events.map((event) => {
    const baseSlug = getEventBaseSlug(event);
    let slug = baseSlug;
    let suffix = 2;
    while (reserved.has(slug)) slug = `${baseSlug}${suffix++}`;
    reserved.add(slug);
    return { ...event, slug };
  });
}

function isQualityEvent(e: Web3Event): boolean {
  if (e.source === 'curated-premier') return true;
  // ConferenceIndex listings do not provide a native organizer destination.
  if (e.source === 'conferenceindex') return false;
  const text = `${e.name} ${e.description ?? ''}`;
  if (SPAMMY.test(text)) return false;
  if (/cancel/i.test(text)) return false;
  if (NON_WEB3_NAME.test(e.name)) return false;
  if (AMA.test(e.name)) return false;
  if (ONLINE.test(e.name) || ONLINE.test(e.location ?? '')) return false;
  return WEB3_VOCAB.test(text);
}

// Luma's grey "add a cover photo" placeholder is not real event art;
// treat it as missing so cards/heroes fall back to the gradient cover.
function isLumaDefaultPlaceholder(img?: string | null): boolean {
  return !!img && /images\.lumacdn\.com\/social-images\/default-\d+\.png/i.test(img);
}

function normalizeEventTitle(name: string): string {
  return name
    .toLowerCase()
    .replace(/[’'"]/g, '')
    .replace(/202[5-9]/g, '')
    .replace(/\b2[5-9]\b/g, '')
    .replace(/\b(conference|summit|expo|forum|festival|week|hackathon|meetup|house|edition)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function normalizeEventDomainUrl(url?: string): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    const domain = u.hostname.replace(/^www\./, '').toLowerCase();
    if (domain.includes('lu.ma') || domain.includes('twitter.com') || domain.includes('x.com') || domain.includes('hashtagweb3.com')) {
      return '';
    }
    return (domain + u.pathname).replace(/\/$/, '');
  } catch {
    return '';
  }
}

function hasEventEnded(event: Web3Event, now = Date.now()): boolean {
  const endDate = new Date(event.endDate || event.startDate);
  return Number.isNaN(endDate.getTime()) || endDate.getTime() < now;
}

function getLegacyEventSlug(event: Web3Event): string {
  return event.name
    .toLowerCase()
    .replace(/[’'"]/g, '')
    .replace(/\b(2025|2026|2027|2028|2029|2030)\b/g, '')
    .replace(/\b(washington|dc|san francisco|sf|new york|nyc|london|tokyo|paris|berlin|singapore|dubai)\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-') || 'web3-event';
}

export async function getEvents(): Promise<Web3Event[]> {
  try {
    const cwd = process.cwd();
    const curatedPath = path.join(cwd, 'content', 'curated-events.json');
    const cachePath = path.join(cwd, 'content', 'events-cache.json');

    let curatedEvents: Web3Event[] = [];
    let cachedEvents: Web3Event[] = [];

    if (fs.existsSync(curatedPath)) {
      try {
        curatedEvents = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));
      } catch (err) {
        console.error('Failed to read curated-events.json:', err);
      }
    }

    if (fs.existsSync(cachePath)) {
      try {
        cachedEvents = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      } catch (err) {
        console.error('Failed to read events-cache.json:', err);
      }
    }

    // Combine all events - curated premier takes precedence
    const rawAll = [...curatedEvents, ...cachedEvents];

    // Clean & normalize
    const seenTitles = new Set<string>();
    const seenUrls = new Set<string>();
    const cleaned: Web3Event[] = [];

    for (const e of rawAll) {
      if (!e.name || !e.startDate) continue;
      if (BLOCKED_EVENT_IDS.has(e.id)) continue;
      if (/participant list/i.test(e.name)) continue;
      if (!isQualityEvent(e)) continue;

      let cleanName = cleanPublishText(e.name.replace(/\s+\[\d+\]$/g, '').trim()); // Remove trailing brackets like [4]
      let cleanUrl = cleanPublishText(e.url || e.website || 'https://hashtagweb3.com/events');
      let cleanCity = cleanPublishText(e.city || '');
      let cleanCountry = cleanPublishText(e.country || '');
      let cleanLocation = cleanPublishText(e.location || '');
      const cleanDescription = cleanPublishText(e.description || '');

      // Fix malformed double https:// url prefix
      if (cleanUrl.includes('https://lu.ma/https://')) {
        cleanUrl = cleanUrl.replace('https://lu.ma/https://', 'https://');
      } else if (cleanUrl.includes('https://lu.ma/http://')) {
        cleanUrl = cleanUrl.replace('https://lu.ma/http://', 'http://');
      }

      // Casing and link corrections for specific events
      if (cleanName.toLowerCase().includes('eth belgrade')) {
        cleanName = 'ETH Belgrade';
        cleanUrl = 'https://ethbelgrade.rs';
        cleanCity = 'Belgrade';
        cleanCountry = 'Serbia';
        cleanLocation = 'Belgrade, Serbia';
      }

      if (cleanUrl.includes('ethglobal.com/events/')) {
        const subslug = cleanUrl.split('/events/')[1]?.replace(/[^a-z0-9]/g, '');
        if (subslug && (subslug.includes('2026') || subslug.includes('2025'))) {
          cleanUrl = 'https://ethglobal.com/events';
        }
      }

      if (cleanUrl.includes('blockworks.co/events/permissionless')) {
        cleanUrl = 'https://blockworks.co/events';
      }

      // Normalization check for deduplication
      const datePart = e.startDate.slice(0, 10);
      const normTitle = normalizeEventTitle(cleanName);
      const normUrl = normalizeEventDomainUrl(cleanUrl);

      // Check URL match (same website domain/path on the same date)
      if (normUrl && seenUrls.has(`${normUrl}|${datePart}`)) {
        continue;
      }

      // Check normalized title + date match
      const titleKey = `${normTitle}|${datePart}`;
      if (normTitle && seenTitles.has(titleKey)) {
        continue;
      }

      if (normTitle) seenTitles.add(titleKey);
      if (normUrl) seenUrls.add(`${normUrl}|${datePart}`);

      const d = new Date(e.startDate);
      const monthStr = !isNaN(d.getTime())
        ? d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        : e.month || 'Upcoming';

      cleaned.push({
        ...e,
        coverImage: isLumaDefaultPlaceholder(e.coverImage) ? null : e.coverImage,
        name: cleanName,
        description: cleanDescription,
        month: monthStr,
        city: cleanCity,
        country: normalizeCountry(cleanCountry),
        location: cleanLocation || (cleanCity && cleanCountry ? `${cleanCity}, ${normalizeCountry(cleanCountry)}` : 'Virtual / TBA'),
        url: cleanUrl,
      });
    }

    // Sort chronologically:
    cleaned.sort((a, b) => {
      const timeA = new Date(a.startDate).getTime();
      const timeB = new Date(b.startDate).getTime();
      if (timeA !== timeB) return timeA - timeB;

      const prioA = a.source === 'curated-premier' ? 0 : 1;
      const prioB = b.source === 'curated-premier' ? 0 : 1;
      return prioA - prioB;
    });

    // Only return future/ongoing events (purging any event that has already concluded)
    const upcoming = await assignUniqueEventSlugs(cleaned.filter(e => !hasEventEnded(e)));

    // Ensure strict slug uniqueness: no two events share the exact same generated slug or title
    const uniqueBySlug: Web3Event[] = [];
    const seenSlugs = new Set<string>();

    for (const e of upcoming) {
      const slug = getEventSlug(e);
      if (!seenSlugs.has(slug)) {
        seenSlugs.add(slug);
        uniqueBySlug.push(e);
      }
    }

    return uniqueBySlug;
  } catch (error) {
    console.error('Error reading events:', error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Web3Event | null> {
  const events = await getEvents();
  const normalized = slug.toLowerCase().trim();

  // 1. Try exact slug match with current clean generator
  let found = events.find(e => getEventSlug(e) === normalized);
  if (found) return found;

  // Existing event links used descriptive root slugs before abbreviations.
  // Only redirect an old URL when it identifies exactly one current event.
  const legacyMatches = events.filter(e => getLegacyEventSlug(e) === normalized);
  if (legacyMatches.length === 1) return legacyMatches[0];

  // 2. Try exact ID match or prefix match
  found = events.find(e => e.id.toLowerCase() === normalized || e.id.replace(/^(premier|side)-/, '').toLowerCase() === normalized);
  if (found) return found;

  // 3. Fallback match ONLY for legacy URLs containing date/location suffixes (e.g. -2026-09-08)
  if (/-\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const baseSlug = normalized.replace(/-\d{4}-\d{2}-\d{2}$/, '');
    found = events.find(e => getEventSlug(e) === baseSlug);
    if (found) return found;
  }

  return null;
}

export async function getRelatedEvents(currentEvent: Web3Event, limit: number = 3): Promise<Web3Event[]> {
  const allEvents = await getEvents();
  const currentEcosystems = getEventEcosystems(currentEvent);
  const currentType = getEventType(currentEvent);

  return allEvents
    .filter(e => e.id !== currentEvent.id && new Date(e.startDate) >= new Date())
    .map(e => {
      let score = 0;
      if (e.city && currentEvent.city && e.city.toLowerCase() === currentEvent.city.toLowerCase()) score += 4;
      if (e.country && currentEvent.country && e.country.toLowerCase() === currentEvent.country.toLowerCase()) score += 2;
      if (getEventType(e) === currentType) score += 2;
      const otherEcosystems = getEventEcosystems(e);
      const shared = otherEcosystems.filter(tag => currentEcosystems.includes(tag));
      score += shared.length * 3;
      return { event: e, score };
    })
    .sort((a, b) => b.score - a.score || new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime())
    .slice(0, limit)
    .map(item => item.event);
}
