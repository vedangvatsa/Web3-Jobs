import fs from 'fs';
import path from 'path';
import { Web3Event, normalizeCountry, getEventSlug, getEventEcosystems, getEventType } from './events';
import { cleanPublishText } from './noslop';

// Explicitly blocked promotional posts that are not events
const BLOCKED_EVENT_IDS = new Set([
  'luma-host-evt-ueBMP7nPZ9SngEX', // Compass for Bitcoin Asia 2026 Companies & Participant List — promo post, not an event
]);

// Quality gate: drops spam webinars, cancelled listings, and non-web3 meetups
// that leak into the aggregated feed. Curated premier events always pass.
const SPAMMY = /earn (crypto|money|income)|passive income|get rich|financial freedom|trading signal|forex|scam|live zoom|webinar|100x|millionaire|double your|guaranteed (profit|return)/i;
const ONLINE = /\bonline\b|\bvirtual\b/i;
const AMA = /\bAMA\b|ask me anything/i;
const NON_WEB3_NAME = /bodywork|breakup|over your ex|keychains|acting workshop|finissage|culture club|apéro|data jam|electronics and computing|ssis|film festival|wellness & networking|charming|bestie|wind take you|reform room|outdoor workout|pilates|for kids|for families|children|toddler|ripple making|pottery|baking|cooking class/i;
const WEB3_VOCAB = /crypto|bitcoin|btc\b|ethereum|\beth\b|ethglobal|ethcc|ethconf|ethrome|ethtaipei|ethtokyo|eth ?belgrade|blockchain|web ?3|defi|nfts?|solana|dao|token|altcoin|mining|stablecoin|lightning|hacker ?house|hackathon|consensus|token2049|xrp|ripple|zk\b|zksync|zero.?knowledge|superteam|pragma|hyperliquid|onchain|on-chain|lido|polygon|arbitrum|optimism|base chain|coinbase|binance|airdrop|wallet|dapp|smart contract|layer ?2|metaverse|gamefi|staking|yield|digital asset|decentralized|cardano|cosmos|polkadot|monad|aptos|\bsui\b|chainlink|blockcon|founders? dinner|coworking|co-working|launchpad|happy hour/i;

function isQualityEvent(e: Web3Event): boolean {
  if (e.source === 'curated-premier') return true;
  const text = `${e.name} ${e.description ?? ''}`;
  if (SPAMMY.test(text)) return false;
  if (/cancel/i.test(text)) return false;
  if (NON_WEB3_NAME.test(e.name)) return false;
  if (AMA.test(e.name)) return false;
  // All online/virtual feed events are low quality; curated events are exempt
  if (ONLINE.test(e.name) || ONLINE.test(e.location ?? '')) return false;
  return WEB3_VOCAB.test(text);
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

    // Combine all events
    const rawAll = [...curatedEvents, ...cachedEvents];

    // Clean & normalize
    const seen = new Set<string>();
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

      // Normalization key for deduplication
      const dedupKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
      const datePart = e.startDate.slice(0, 10);
      const key = `${dedupKey}|${datePart}`;

      if (seen.has(key)) continue;
      seen.add(key);

      const d = new Date(e.startDate);
      const monthStr = !isNaN(d.getTime())
        ? d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        : e.month || 'Upcoming';

      cleaned.push({
        ...e,
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

    // Only return future/ongoing events
    const now = new Date();
    const upcoming = cleaned.filter(e => {
      const endDate = e.endDate ? new Date(e.endDate) : new Date(e.startDate);
      return isNaN(endDate.getTime()) || endDate >= now;
    });

    return upcoming;
  } catch (error) {
    console.error('Error reading events:', error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Web3Event | null> {
  const events = await getEvents();
  const normalized = slug.toLowerCase().trim();

  // Try exact slug match
  let found = events.find(e => getEventSlug(e) === normalized);
  if (found) return found;

  // Try ID match
  found = events.find(e => e.id.toLowerCase() === normalized || e.id.replace(/^premier-/, '').toLowerCase() === normalized);
  if (found) return found;

  // Fallback: prefix match
  found = events.find(e => getEventSlug(e).startsWith(normalized) || normalized.startsWith(getEventSlug(e)));
  return found || null;
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
