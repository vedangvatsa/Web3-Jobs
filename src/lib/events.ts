export { buildSourceBackedEventEditorial as getEventEditorialGuide } from './event-content';
import { hasDetailedStreetAddress } from './event-address';
import { isGoogleEventSchemaEligible } from './event-schema';
import { getVerifiedEventDescription } from './event-description-source';

export type EventType = 'conference' | 'hackathon' | 'meetup' | 'workshop' | 'online';
export type EventFormat = 'in-person' | 'online';

export type EventSpeaker = {
  name: string;
  title?: string;
  organization?: string;
};

export type EventParty = {
  name: string;
  type: 'Organization' | 'Person' | 'PerformingGroup';
  url?: string;
};

export type EventTicketOffer = {
  name?: string;
  url: string;
  price: number;
  priceCurrency?: string;
  availability?: 'InStock' | 'SoldOut' | 'PreOrder';
  validFrom?: string;
};

export interface Web3Event {
  id: string;
  name: string;
  description: string;
  descriptionSource?: {
    url: string;
    fetchedAt: string;
    method: 'event-jsonld' | 'official-section' | 'official-meta' | 'matched-organizer-record';
    pageTitle: string;
    sha256: string;
  };
  startDate: string;
  endDate?: string;
  city?: string;
  country?: string;
  location: string;
  month?: string;
  category?: string;
  price?: string;
  registrationUrl?: string;
  venueName?: string;
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
  organizer?: EventParty;
  performer?: EventParty;
  /** Host names from the source page (e.g. Luma hosts). */
  hosts?: string[];
  /** IANA timezone from the source page (e.g. Asia/Singapore). */
  timezone?: string;
  /** True when the source page requires approval to attend. */
  approvalRequired?: boolean;
  attendanceMode?: 'offline' | 'online' | 'mixed';
  visibility?: 'public' | 'private' | 'unlisted';
  locationHidden?: boolean;
  registrationAvailability?: string;
  ticketOffers?: EventTicketOffer[];
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventRescheduled';
  previousStartDate?: string;
  coordinates?: { latitude: number; longitude: number };
  sourceVerification?: {
    url: string;
    eventId: string;
    fetchedAt: string;
    method: 'apify' | 'luma-page' | 'luma-api';
    apifyRunId?: string;
  };
  /** Neighborhood/district from the source page (e.g. Orchard). */
  neighborhood?: string;
  token2049SideEvent?: boolean;
  sideEventFor?: string[];
  url: string;
  website?: string | null;
  coverImage: string | null;
  speakers?: string[];
  speakerDetails?: EventSpeaker[];
  twitter?: string | null;
  source?: string;
  slug?: string;
  partnerOffer?: {
    text: string;
    url?: string;
  };
}

export type PublicWeb3Event = Omit<Web3Event, 'source' | 'sourceVerification' | 'url' | 'website' | 'registrationUrl' | 'partnerOffer'> & {
  url?: string;
  partnerOffer?: {
    text: string;
    url?: string;
  };
};

// Country code to clean name mapping
export const COUNTRY_NAMES: Record<string, string> = {
  AE: 'United Arab Emirates', AF: 'Afghanistan', AR: 'Argentina', AT: 'Austria',
  AU: 'Australia', AZ: 'Azerbaijan', BD: 'Bangladesh', BE: 'Belgium', BG: 'Bulgaria',
  BN: 'Brunei', BO: 'Bolivia', BR: 'Brazil', BS: 'Bahamas', CA: 'Canada',
  CH: 'Switzerland', CL: 'Chile', CN: 'China', CO: 'Colombia', CR: 'Costa Rica',
  CY: 'Cyprus', CZ: 'Czech Republic', DE: 'Germany', DK: 'Denmark',
  DO: 'Dominican Republic', EC: 'Ecuador', EE: 'Estonia', EG: 'Egypt', ES: 'Spain',
  ET: 'Ethiopia', FI: 'Finland', FR: 'France', GB: 'United Kingdom', GE: 'Georgia',
  GF: 'French Guiana', GH: 'Ghana', GR: 'Greece', GT: 'Guatemala', HK: 'Hong Kong',
  HN: 'Honduras', HR: 'Croatia', HU: 'Hungary', ID: 'Indonesia', IE: 'Ireland',
  IL: 'Israel', IN: 'India', IS: 'Iceland', IT: 'Italy', JM: 'Jamaica', JO: 'Jordan',
  JP: 'Japan', KE: 'Kenya', KR: 'South Korea', KW: 'Kuwait', KZ: 'Kazakhstan',
  LB: 'Lebanon', LK: 'Sri Lanka', LT: 'Lithuania', LU: 'Luxembourg', LV: 'Latvia',
  MA: 'Morocco', MC: 'Monaco', MG: 'Madagascar', MW: 'Malawi', MX: 'Mexico',
  MY: 'Malaysia', NG: 'Nigeria', NL: 'Netherlands', NO: 'Norway', NP: 'Nepal',
  NZ: 'New Zealand', PA: 'Panama', PE: 'Peru', PH: 'Philippines', PK: 'Pakistan',
  PL: 'Poland', PR: 'Puerto Rico', PT: 'Portugal', QA: 'Qatar', RO: 'Romania',
  RS: 'Serbia', RU: 'Russia', RW: 'Rwanda', SA: 'Saudi Arabia', SE: 'Sweden',
  SG: 'Singapore', SI: 'Slovenia', SK: 'Slovakia', TH: 'Thailand', TN: 'Tunisia',
  TR: 'Turkey', TW: 'Taiwan', TZ: 'Tanzania', UA: 'Ukraine', UG: 'Uganda',
  US: 'United States', UY: 'Uruguay', UZ: 'Uzbekistan', VE: 'Venezuela',
  VN: 'Vietnam', ZA: 'South Africa',
};

/** Lowercase aliases / informal names → canonical COUNTRY_NAMES value. */
const COUNTRY_ALIASES: Record<string, string> = {
  usa: 'United States',
  us: 'United States',
  'u.s': 'United States',
  'u.s.': 'United States',
  'u.s.a': 'United States',
  'u.s.a.': 'United States',
  'united states of america': 'United States',
  america: 'United States',
  uk: 'United Kingdom',
  'u.k': 'United Kingdom',
  'u.k.': 'United Kingdom',
  'great britain': 'United Kingdom',
  britain: 'United Kingdom',
  england: 'United Kingdom',
  scotland: 'United Kingdom',
  wales: 'United Kingdom',
  'northern ireland': 'United Kingdom',
  uae: 'United Arab Emirates',
  'u.a.e': 'United Arab Emirates',
  'u.a.e.': 'United Arab Emirates',
  emirates: 'United Arab Emirates',
  dubai: 'United Arab Emirates',
  'abu dhabi': 'United Arab Emirates',
  korea: 'South Korea',
  rok: 'South Korea',
  'republic of korea': 'South Korea',
  'south korea': 'South Korea',
  czechia: 'Czech Republic',
  'czech republic': 'Czech Republic',
  czech: 'Czech Republic',
  türkiye: 'Turkey',
  turkiye: 'Turkey',
  turkey: 'Turkey',
  'hong kong sar': 'Hong Kong',
  'hong kong, china': 'Hong Kong',
  hkg: 'Hong Kong',
  'viet nam': 'Vietnam',
  'russian federation': 'Russia',
  'the netherlands': 'Netherlands',
  holland: 'Netherlands',
  deutschland: 'Germany',
  espania: 'Spain',
  'españa': 'Spain',
  italia: 'Italy',
  brasil: 'Brazil',
  'méxico': 'Mexico',
  mexico: 'Mexico',
  swiss: 'Switzerland',
  suisse: 'Switzerland',
  oesterreich: 'Austria',
  'österreich': 'Austria',
  polska: 'Poland',
  ind: 'India',
  aus: 'Australia',
  can: 'Canada',
  prc: 'China',
  "people's republic of china": 'China',
  'chinese taipei': 'Taiwan',
  roc: 'Taiwan',
  'republic of china': 'Taiwan',
  ksa: 'Saudi Arabia',
  'kingdom of saudi arabia': 'Saudi Arabia',
  rsa: 'South Africa',
  singapura: 'Singapore',
  eire: 'Ireland',
};

function aliasKeysForCountry(raw: string): string[] {
  const base = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  const noDots = base.replace(/\./g, '');
  return base === noDots ? [base] : [base, noDots];
}

export function normalizeCountry(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const upper = trimmed.toUpperCase();
  if (COUNTRY_NAMES[upper]) return COUNTRY_NAMES[upper];

  for (const aliasKey of aliasKeysForCountry(trimmed)) {
    if (COUNTRY_ALIASES[aliasKey]) return COUNTRY_ALIASES[aliasKey];
  }

  const aliasKey = trimmed.toLowerCase().replace(/\s+/g, ' ');
  const canonical = Object.values(COUNTRY_NAMES).find(
    (name) => name.toLowerCase() === aliasKey,
  );
  if (canonical) return canonical;

  return trimmed;
}

/** Collapse repeated place segments like "London, United Kingdom, London, United Kingdom". */
export function dedupeEventLocation(location: string): string {
  const parts = location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return location.trim();

  const withoutConsecutive = parts.filter((part, index) => index === 0 || part.toLowerCase() !== parts[index - 1].toLowerCase());
  if (withoutConsecutive.length >= 2 && withoutConsecutive.length % 2 === 0) {
    const half = withoutConsecutive.length / 2;
    const left = withoutConsecutive.slice(0, half);
    const right = withoutConsecutive.slice(half);
    if (left.join(', ').toLowerCase() === right.join(', ').toLowerCase()) {
      return left.join(', ');
    }
  }

  // "Santa Clara, CA, Santa Clara, United States" → "Santa Clara, CA, United States"
  if (withoutConsecutive.length === 4 && withoutConsecutive[0].toLowerCase() === withoutConsecutive[2].toLowerCase()) {
    return [withoutConsecutive[0], withoutConsecutive[1], withoutConsecutive[3]].join(', ');
  }

  return withoutConsecutive.join(', ');
}

/** Prefer a clean city/country pair when location is missing or duplicated. */
export function formatEventLocation(
  event: Pick<Web3Event, 'location' | 'city' | 'country'>,
): string {
  const rawCity = (event.city || '').trim();
  // Placeholder cities ("Global", "Online", ...) are data noise, not places.
  const GENERIC_CITIES = new Set(['global', 'virtual', 'online', 'tba', 'tbd', 'worldwide', 'remote', 'hybrid', 'various']);
  // Placeholder segments inside location strings ("TBD - Han River").
  const PLACEHOLDER_SEGMENT = /\b(tba|tbd|to be announced|to be determined|unknown|coming soon|venue\s+tba)\b/i;
  const city = GENERIC_CITIES.has(rawCity.toLowerCase()) ? '' : rawCity;
  const country = normalizeCountry(event.country);
  const raw = (event.location || '').trim();
  // Drop placeholder segments ("Global, SG" → "SG") before dedup.
  const rawParts = raw.split(',').map((part) => part.trim()).filter(Boolean);
  const cleanedParts = rawParts.filter(
    (part) => !GENERIC_CITIES.has(part.toLowerCase()) && !PLACEHOLDER_SEGMENT.test(part),
  );
  const strippedGeneric = cleanedParts.length < rawParts.length;
  const cleaned = cleanedParts.join(', ');
  const deduped = cleaned ? dedupeEventLocation(cleaned) : '';

  // City-states (Singapore, Dubai reports, etc.): never render "X, X" —
  // but keep a stated street address instead of collapsing it to the city.
  if (city && country && city.toLowerCase() === country.toLowerCase()) {
    if (deduped && deduped.toLowerCase() !== city.toLowerCase() && hasDetailedStreetAddress(deduped)) {
      return deduped;
    }
    return city;
  }
  const preferred = city && country && !city.includes(',') ? `${city}, ${country}` : '';

  if (preferred) {
    if (!deduped || deduped.toLowerCase() === `${preferred}, ${preferred}`.toLowerCase()) {
      return preferred;
    }
    const cityCount = deduped.toLowerCase().split(city.toLowerCase()).length - 1;
    // Repeated city mentions collapse to "City, Country" — unless the full
    // string carries a stated street address worth preserving.
    if (cityCount > 1 && !hasDetailedStreetAddress(deduped)) return preferred;
  }

  // A bare leftover code from generic-stripping ("SG") resolves to the
  // full country name.
  if (strippedGeneric && deduped && country && deduped.length <= 3) {
    const rawCountry = (event.country || '').trim();
    if (rawCountry.length > 3) return rawCountry;
    if (country.length > 3) return country;
  }

  return deduped || preferred || country || 'Virtual / TBA';
}

export function getEventType(event: Pick<Web3Event, 'name' | 'description' | 'location'>): EventType {
  const text = `${event.name} ${event.description || ''}`.toLowerCase();
  const loc = (event.location || '').toLowerCase();

  if (text.includes('hackathon') || text.includes('buildathon') || text.includes('hacker house') || text.includes('buidlathon')) {
    return 'hackathon';
  }
  if (
    text.includes('conference') ||
    text.includes('summit') ||
    text.includes('token2049') ||
    text.includes('consensus') ||
    text.includes('devcon') ||
    text.includes('breakpoint') ||
    text.includes('ethcc') ||
    text.includes('congress') ||
    text.includes('forum') ||
    text.includes('festival') ||
    text.includes('expo') ||
    text.includes('convention') ||
    text.includes('blockchain week')
  ) {
    return 'conference';
  }
  if (text.includes('workshop') || text.includes('bootcamp') || text.includes('masterclass') || text.includes('developer day') || text.includes('demo day')) {
    return 'workshop';
  }
  if (
    loc.includes('online') ||
    loc.includes('virtual') ||
    loc.includes('discord') ||
    loc.includes('zoom') ||
    loc.includes('google meet') ||
    text.includes('webinar') ||
    text.includes('ama ') ||
    text.includes('twitter space')
  ) {
    return 'online';
  }
  return 'meetup';
}

export function getEventFormat(event: Pick<Web3Event, 'name' | 'location'>): EventFormat {
  const loc = (event.location || '').toLowerCase();
  const name = event.name.toLowerCase();
  if (
    loc.includes('online') ||
    loc.includes('virtual') ||
    loc.includes('discord') ||
    loc.includes('zoom') ||
    loc.includes('google meet') ||
    name.includes('online') ||
    name.includes('virtual')
  ) {
    return 'online';
  }
  return 'in-person';
}

// Google Event rich results require public, physical events at a detailed venue address.
export function isGoogleEventEligible(event: Web3Event): boolean {
  return isGoogleEventSchemaEligible(event);
}

// Extract chain and category tags
const ECOSYSTEM_RULES: Array<{ tag: string; test: RegExp }> = [
  { tag: 'Ethereum', test: /\b(ethereum|eth|evm|ethglobal|devcon|ethcc|ethdenver)\b/i },
  { tag: 'Solana', test: /\b(solana|sol|superteam|breakpoint)\b/i },
  { tag: 'Bitcoin', test: /\b(bitcoin|btc|lightning|ordinals|brc-20)\b/i },
  { tag: 'Base', test: /\b(base chain|on base|basecamp|base buildathon)\b/i },
  { tag: 'Polygon', test: /\b(polygon|matic)\b/i },
  { tag: 'Arbitrum', test: /\b(arbitrum)\b/i },
  { tag: 'Optimism', test: /\b(optimism|op stack)\b/i },
  { tag: 'Sui', test: /\b(sui network|sui blockchain|sui basecamp)\b/i },
  { tag: 'Aptos', test: /\b(aptos)\b/i },
  { tag: 'Monad', test: /\b(monad)\b/i },
  { tag: 'Berachain', test: /\b(berachain|bera)\b/i },
  { tag: 'Avalanche', test: /\b(avalanche|avax)\b/i },
  { tag: 'NEAR', test: /\b(near protocol|nearcon)\b/i },
  { tag: 'TON', test: /\b(ton blockchain|telegram open network)\b/i },
  { tag: 'Cosmos', test: /\b(cosmos|ibc|cosmoverse)\b/i },
  { tag: 'Polkadot', test: /\b(polkadot|substrate|dot)\b/i },
  { tag: 'Chainlink', test: /\b(chainlink|smartcon)\b/i },
  { tag: 'DeFi', test: /\b(defi|decentralized finance|yield|liquidity|dex|lending|amm|aave|uniswap)\b/i },
  { tag: 'AI + Web3', test: /\b(ai|artificial intelligence|agents|agentic|decentralized ai|depin)\b/i },
  { tag: 'ZK / L2', test: /\b(zk|zero knowledge|zk-snark|starknet|zksync|scroll|rollup|layer 2|l2)\b/i },
  { tag: 'NFT / Gaming', test: /\b(nft|nfts|gamefi|metaverse|gaming|web3 gaming)\b/i },
  { tag: 'Security', test: /\b(security|audit|smart contract security|hackathon)\b/i },
  { tag: 'RWA', test: /\b(rwa|real world asset|institutional crypto|tokenization)\b/i },
];

export function getEventEcosystems(event: Web3Event): string[] {
  const text = `${event.name} ${event.description || ''} ${event.location || ''}`;
  const matched = new Set<string>();

  for (const rule of ECOSYSTEM_RULES) {
    if (rule.test.test(text)) {
      matched.add(rule.tag);
    }
  }

  // Fallback defaults
  if (matched.size === 0) {
    if (event.name.toLowerCase().includes('web3') || event.name.toLowerCase().includes('crypto')) {
      matched.add('Web3');
    }
  }

  return Array.from(matched).slice(0, 3);
}

/** True if the event has not ended yet (matches /events listing filter). */
export function isEventUpcoming(
  event: Pick<Web3Event, 'startDate' | 'endDate'>,
  now: Date = new Date(),
): boolean {
  const rawEnd = event.endDate || event.startDate;
  if (!rawEnd) return false;
  const eventEnd = new Date(rawEnd);
  return !isNaN(eventEnd.getTime()) && eventEnd >= now;
}

function eventDateParts(value: string, timezone?: string) {
  let timeZone = /^\d{4}-\d{2}-\d{2}$/.test(value) ? 'UTC' : timezone || 'UTC';
  try { new Intl.DateTimeFormat('en-US', { timeZone }).format(); } catch { timeZone = 'UTC'; }
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric', year: 'numeric', weekday: 'short' }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || '';
  return { month: part('month'), day: part('day'), year: part('year'), weekday: part('weekday') };
}

export function formatEventDate(startDate: string, endDate?: string, timezone?: string): string {
  if (!startDate) return 'TBA';
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return 'TBA';

  const { month: startMonth, day: startDay, year: startYear } = eventDateParts(startDate, timezone);

  if (!endDate) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  const end = new Date(endDate);
  if (isNaN(end.getTime()) || start.getTime() === end.getTime()) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  const { month: endMonth, day: endDay, year: endYear } = eventDateParts(endDate, timezone);

  if (startYear === endYear && startMonth === endMonth) {
    if (startDay === endDay) {
      return `${startMonth} ${startDay}, ${startYear}`;
    }
    return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
}

export function getEventDatePill(startDate: string, timezone?: string): { month: string; day: string; dayName: string } {
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return { month: 'TBA', day: '-', dayName: '' };
  const parts = eventDateParts(startDate, timezone);
  return { month: parts.month.toUpperCase(), day: parts.day, dayName: parts.weekday };
}

export function getEventCity(event: Pick<Web3Event, 'city' | 'location'>): string {
  if (event.city && event.city.trim()) {
    const c = event.city.split(',')[0].trim();
    if (c) return c;
  }
  const loc = event.location || '';
  if (!loc || loc.toLowerCase().includes('virtual') || loc.toLowerCase().includes('online') || loc.toLowerCase().includes('tba')) {
    return 'Online';
  }
  const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) {
    return parts[0];
  }
  if (parts.length >= 3) {
    return parts[parts.length - 2];
  }
  return loc;
}

export function getRelativeBadge(startDate: string): string | null {
  const now = new Date();
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diffDays = Math.round((eventStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays > 7 && diffDays <= 14) return 'Next Week';
  return null;
}

export function getEventBaseSlug(event: Pick<Web3Event, 'name'>): string {
  const eventName = event.name.split(/[:|]/, 1)[0];
  const words = eventName
    .toLowerCase()
    .replace(/[’'"]/g, '')
    .replace(/\b(2025|2026|2027|2028|2029|2030)\b/g, '')
    .replace(/\b(washington|dc|san francisco|sf|new york|nyc|london|tokyo|paris|berlin|singapore|dubai)\b/g, '')
    .split(/[^a-z0-9]+/)
    .filter((word) => word && !['a', 'an', 'and', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'the', 'to', 'with'].includes(word));

  if (words.length >= 3) return words.map((word) => word[0]).join('');
  return words.join('-') || 'web3-event';
}

export function getEventSlug(event: Pick<Web3Event, 'name' | 'slug'>): string {
  if (event.slug) return event.slug.toLowerCase().trim();

  return getEventBaseSlug(event);
}

export function generateGoogleCalendarUrl(event: Web3Event, externalUrl?: string): string {
  const formatGCalDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const start = formatGCalDate(event.startDate);
  const end = event.endDate ? formatGCalDate(event.endDate) : start;
  let dates = start && end ? `${start}/${end}` : start;
  if (/^\d{4}-\d{2}-\d{2}$/.test(event.startDate) && (!event.endDate || /^\d{4}-\d{2}-\d{2}$/.test(event.endDate))) {
    const exclusiveEnd = new Date(`${event.endDate || event.startDate}T00:00:00Z`);
    if (!Number.isNaN(exclusiveEnd.getTime())) {
      exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
      dates = `${event.startDate.replace(/-/g, '')}/${exclusiveEnd.toISOString().slice(0, 10).replace(/-/g, '')}`;
    }
  }

  const title = encodeURIComponent(event.name);
  const details = encodeURIComponent(
    `${getVerifiedEventDescription(event) || event.name}\n\nOfficial Link: ${externalUrl || 'https://hashtagweb3.com/events'}\n\nDiscovered via Hashtag Web3 (https://hashtagweb3.com/events)`
  );
  const location = encodeURIComponent(event.location || 'Virtual / TBA');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

export interface EditorialSection {
  heading: string;
  content: string[];
}

export interface EventEditorialArticle {
  summaryLead: string;
  sections: EditorialSection[];
  descriptionStatus?: 'source-backed' | 'unavailable';
  descriptionSource?: { url: string; fetchedAt: string };
  ticketPricing?: string;
  speakers?: string;
  expectedAttendance?: string;
}
