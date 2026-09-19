import { cleanPublishText } from '@/lib/noslop';
import { isThinEventListingDescription } from '@/lib/event-editorial-facts';
import { EVENT_GUIDES } from './event-guides';
import { isGoogleEventSchemaEligible } from './event-schema';

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

export interface Web3Event {
  id: string;
  name: string;
  description: string;
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

export type PublicWeb3Event = Omit<Web3Event, 'source' | 'url' | 'website' | 'registrationUrl' | 'partnerOffer'> & {
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
  // City-states (Singapore, Dubai reports, etc.): never render "X, X".
  if (city && country && city.toLowerCase() === country.toLowerCase()) return city;
  const preferred = city && country && !city.includes(',') ? `${city}, ${country}` : '';
  const raw = (event.location || '').trim();
  // Drop placeholder segments ("Global, SG" → "SG") before dedup.
  const rawParts = raw.split(',').map((part) => part.trim()).filter(Boolean);
  const cleanedParts = rawParts.filter(
    (part) => !GENERIC_CITIES.has(part.toLowerCase()) && !PLACEHOLDER_SEGMENT.test(part),
  );
  const strippedGeneric = cleanedParts.length < rawParts.length;
  const cleaned = cleanedParts.join(', ');
  const deduped = cleaned ? dedupeEventLocation(cleaned) : '';

  if (preferred) {
    if (!deduped || deduped.toLowerCase() === `${preferred}, ${preferred}`.toLowerCase()) {
      return preferred;
    }
    const cityCount = deduped.toLowerCase().split(city.toLowerCase()).length - 1;
    if (cityCount > 1) return preferred;
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

export function formatEventDate(startDate: string, endDate?: string): string {
  if (!startDate) return 'TBA';
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return 'TBA';

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const startYear = start.getFullYear();

  if (!endDate) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  const end = new Date(endDate);
  if (isNaN(end.getTime()) || start.getTime() === end.getTime()) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();
  const endYear = end.getFullYear();

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

export function getEventDatePill(startDate: string): { month: string; day: string; dayName: string } {
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return { month: 'TBA', day: '-', dayName: '' };
  return {
    month: start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(start.getDate()),
    dayName: start.toLocaleDateString('en-US', { weekday: 'short' }),
  };
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
  const dates = start && end ? `${start}/${end}` : start;

  const title = encodeURIComponent(event.name);
  const details = encodeURIComponent(
    `${event.description || 'Web3 Event'}\n\nOfficial Link: ${externalUrl || 'https://hashtagweb3.com/events'}\n\nDiscovered via Hashtag Web3 (https://hashtagweb3.com/events)`
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
  ticketPricing?: string;
  speakers?: string;
  expectedAttendance?: string;
}

export function getEventEditorialGuide(event: Web3Event): EventEditorialArticle {
  const slug = (event.slug || getEventSlug(event) || '').toLowerCase().trim();
  if (slug && EVENT_GUIDES[slug]) return EVENT_GUIDES[slug];


  const name = event.name.toLowerCase();
  const resolvedPlace = formatEventLocation(event);
  const locationStr = resolvedPlace === 'Virtual / TBA' ? 'online' : `in ${resolvedPlace}`;
  const formattedDates = formatEventDate(event.startDate, event.endDate);

  // Editorial guide for Solana Breakpoint
  if (name.includes('breakpoint')) {
    return {
      summaryLead: `Solana Breakpoint 2026 takes place November 15 to 17 at Olympia London, the same Victorian exhibition hall that has hosted European design, fashion, and science expos for over a century. The Solana Foundation chose London deliberately: under the theme "The future of money, in the city that invented modern finance," Breakpoint is positioning itself at the intersection of legacy financial infrastructure and the next generation of internet-native capital markets. More than 6,000 attendees from over 100 countries are expected, spanning protocol developers, institutional fund managers, policy researchers, and founders at every stage.`,
      ticketPricing: '$550 General Admission / $250 Developer / $100 Student',
      speakers: 'Solana Foundation core engineers, Jump Crypto (Firedancer team), top SVM founders, payments & finance executives',
      expectedAttendance: '6,000+ attendees',
      sections: [
        {
          heading: 'Why London, why now',
          content: [
            'Solana now settles over $650 billion in stablecoin volume each month. That number has drawn serious attention from banks, asset managers, and payment networks that have been watching from the sidelines. London is where much of that institutional decision-making happens, and Breakpoint 2026 is built around that reality.',
            'The main stage will feature sessions with teams from J.P. Morgan, Goldman Sachs, BlackRock, and Citigroup alongside core Solana builders. The agenda is not about explaining what blockchain is. It is about what tokenized treasuries, automated liquidity venues, and real-world asset settlement actually look like at production scale.',
          ],
        },
        {
          heading: 'What is actually on stage',
          content: [
            'Firedancer gets significant airtime. The Jump Crypto-built validator client promises to push Solana throughput far beyond its current ceiling, and Breakpoint is where the Frankendancer hybrid implementation will be stress-tested and discussed in technical depth.',
            'DeFi sessions go deep on next-generation exchange mechanics, on-chain derivatives risk models, and dynamic liquidity routing. DePIN tracks feature live showcases from Helium, Render Network, Hivemapper, and Teleport, all building real-world infrastructure coordinated by Solana smart contracts.',
            'The consumer and payments track covers Solana Pay integrations, the Solana Mobile Stack, and consumer gaming. If you are building something that touches normal people and their money, this is where the relevant work is being shown.',
          ],
        },
        {
          heading: 'The week around the conference',
          content: [
            'Breakpoint week in London is as much about what happens off-stage as on. Superteam, Colosseum, Jito, Phantom, Backpack, and Pyth each host their own technical side events, pitch sessions, and developer workshops across the city.',
            'Community hacker houses, builder co-working hubs, and investor dinners run throughout the week in central London. Most of the best conversations at Breakpoint happen in those rooms, not the main hall. Plan to attend at least two or three side events, and check the satellite event calendar as soon as it opens.',
          ],
        },
        {
          heading: 'Getting your ticket',
          content: [
            'Tickets are sold through the official Solana Breakpoint portal, with Luma handling ticketing. Developer passes are $250 with application verification. Student passes are $100 with valid credentials. General admission starts at $550 early bird and rises to $800 closer to the event.',
            'Olympia London is at Hammersmith Road, London W14 8UX. The nearest stations are Kensington (Olympia) on the overground, West Kensington and Barons Court on the District line. Book accommodation early as the surrounding Kensington hotels fill up fast during large conference weeks.',
          ],
        },
      ],
    };
  }

  // Editorial guide for TOKEN2049
  if (name.includes('token2049')) {
    const isDubai = name.includes('dubai');
    const venue = isDubai ? 'Madinat Jumeirah in Dubai, UAE' : 'Marina Bay Sands in Singapore';
    const city = isDubai ? 'Dubai' : 'Singapore';
    const regBody = isDubai ? 'Dubai Virtual Assets Regulatory Authority (VARA)' : 'Monetary Authority of Singapore (MAS)';
    return {
      summaryLead: `TOKEN2049 is one of the largest gatherings in crypto. The ${city} edition draws more than 15,000 attendees to ${venue}, where the guest list reads like a directory of the industry: exchange founders, fund partners, layer-1 core teams, stablecoin issuers, and the journalists who cover all of them. It is not a niche developer conference. TOKEN2049 is where the business of crypto gets done out in the open.`,
      ticketPricing: 'From $399 (Early Bird) to $999+ (Late Access)',
      speakers: 'Top Web3 founders, sovereign wealth fund partners, major layer-1 teams, crypto exchange executives',
      expectedAttendance: '15,000+ attendees',
      sections: [
        {
          heading: `${city} as a crypto hub`,
          content: [
            `${isDubai ? 'Dubai has moved faster on crypto regulation than almost any other financial center. VARA has created clear licensing frameworks for exchanges, custodians, and asset managers, and the city has attracted major industry relocations as a result.' : 'Singapore has long been the operational base for many of crypto\'s largest institutions. The MAS regulatory framework is among the most mature in Asia, and the city\'s position as a global financial hub means TOKEN2049 draws institutional capital and builders in equal measure.'}`,
            `${event.name} pulls together founders, institutional allocators, core protocol developers, and international media for two dense days of keynotes, fireside sessions, and exhibition floor conversations. The side event ecosystem around the conference spans the entire week.`,
          ],
        },
        {
          heading: 'What the program covers',
          content: [
            'Institutional capital and macro: Allocators, sovereign wealth funds, and hedge funds discussing market structure, bitcoin liquidity, and how digital assets fit into a modern portfolio.',
            'Layer 1, Layer 2, and modular architecture: Technical roadmaps from the major blockchain teams covering rollups, zero-knowledge verification, data availability layers, and cross-chain messaging.',
            'DeFi and real-world assets: Yield protocols, tokenized treasuries, private credit on-chain, and what institutional compliance actually looks like when you bring TradFi onto a public blockchain.',
            `Regulatory clarity: Policy panels examining compliance frameworks, institutional custody standards, and the latest developments from ${regBody}.`,
          ],
        },
        {
          heading: 'What happens around the conference',
          content: [
            `TOKEN2049 week in ${city} has become as well-known for its satellite ecosystem as for the main event. More than 400 side events, community meetups, developer workshops, VIP roundtables, and protocol dinners run across the city during conference week.`,
            `Side events range from technical deep dives hosted by layer-1 foundations to yacht dinners and early-morning runs organized by investor groups. The satellite event calendar often fills up weeks in advance, so register early for the ones that matter to you.`,
            'The official conference app includes networking tools, session scheduling, and a way to request meetings directly with other attendees. Use it.',
          ],
        },
        {
          heading: 'Venue and registration',
          content: [
            `The conference is held at ${venue}. Passes consistently sell out well before the event, so register through the official TOKEN2049 website as soon as tickets open. Full conference passes include access to both main days, the exhibition hall, networking spaces, catering, and evening receptions.`,
            `Hotels near the venue fill up fast. If you are traveling internationally, book accommodation in the first week after tickets go on sale. Prices rise significantly the closer you get to the event.`,
          ],
        },
      ],
    };
  }

  // Editorial guide for ETHGlobal Tokyo
  if (name.includes('ethglobal') && (name.includes('tokyo') || slug === 'ethglobal')) {
    return {
      summaryLead: `ETHGlobal Tokyo 2026 runs September 25 to 27 at Toranomon Hills Forum in Minato City. It is a three-day Ethereum hackathon for builders who want workshops, mentors, and a weekend to ship something real - with 800+ attendees, 10+ protocols, 29+ workshops, and $75,000 in prizes listed on the official event page.`,
      ticketPricing: 'Free (application / RSVP via ETHGlobal)',
      speakers: 'Judges, mentors, and speakers from ETHGlobal, Ethereum Foundation, Backpack, MetaMask, ENS, bitFlyer, and more',
      expectedAttendance: '800+ attendees',
      sections: [
        {
          heading: 'What the weekend is for',
          content: [
            'ETHGlobal frames the event simply: come build a decentralized future. Teams get access to protocol workshops, on-site mentors, and a judging track for working demos — not pitch decks.',
            'The listed program includes 29+ workshops and 10+ protocols. Use the official agenda to pick tracks that match what you are shipping, then leave room for mentor office hours.',
          ],
        },
        {
          heading: 'Venue and location',
          content: [
            'The hackathon is at Toranomon Hills Forum on the 5th floor of Toranomon Hills Mori Tower (1-23-3 Toranomon, Minato City, Tokyo 105-0001). It sits in central Tokyo with good transit access to the rest of the city.',
            'Book lodging early if you are flying in for the weekend. Minato and nearby wards fill quickly when large Ethereum events land in Tokyo.',
          ],
        },
        {
          heading: 'Who shows up',
          content: [
            'The published speaker, judge, and mentor list spans Japanese and international crypto teams: Kartik Talwar (ETHGlobal), Armani Ferrante (Backpack), Yuzo Kano (bitFlyer), Nuno Loureiro and Tomo Saito (Ethereum Foundation), Francesco Andreoli (MetaMask), Kevin Krone (ENS), and many more mentors from protocol and tooling teams.',
            'Pragma Tokyo and other side gatherings often run around the same dates. Check ETHGlobal and Luma calendars for satellite sessions once they open.',
          ],
        },
        {
          heading: 'How to register',
          content: [
            'Apply and register through the official ETHGlobal Tokyo page at ethglobal.com/events/tokyo2026. Hackathon entry is typically free with an application; confirm current requirements on that page before you travel.',
            'Prize pool is listed at $75,000. Sponsor bounties and judging criteria publish closer to the event — watch the ETHGlobal site and Discord for updates.',
          ],
        },
      ],
    };
  }

  // Editorial guide for ETHDenver
  if (name.includes('ethdenver')) {
    return {
      summaryLead: `ETHDenver is the largest Ethereum hackathon in the world and, by most measures, the one that has produced more real protocols than any other. Hosted at the National Western Complex in Denver, Colorado, it runs for a full week under SporkDAO's community governance model, drawing over 20,000 developers, researchers, artists, and open-source contributors. Admission is free for verified builders, which says something about what the event is trying to be.`,
      ticketPricing: 'Free (application required for verified builders) / SporkDAO passes optional',
      speakers: 'Ethereum Foundation researchers, EVM builders, Layer-2 core teams, ZK cryptographers, DAO governors',
      expectedAttendance: '20,000+ developers & creators',
      sections: [
        {
          heading: 'A hackathon that actually ships protocols',
          content: [
            'ETHDenver is not a conference with a hackathon bolted on. The hacking is the main event. Teams form from scratch or show up with ideas already in hand, work through the week on 24/7 access to the venue, and submit working prototypes by the end. Mentors from core Ethereum teams circulate through the space and are genuinely available.',
            'The tracks for 2026 cover Layer 2 infrastructure, account abstraction, zero-knowledge cryptography, decentralized identity, public goods funding, and on-chain governance. Sponsors post individual bounties on top of the main prizes, so a well-targeted submission can win multiple times.',
            'The lineage of protocols that started at ETHDenver is long and verifiable. If you are building something on Ethereum, there is a reasonable chance you are using tooling or infrastructure that was first prototyped in Denver.',
          ],
        },
        {
          heading: 'What the week looks like',
          content: [
            'SporkDAO and community sponsors run hundreds of workshops, live deployment sessions, security bootcamps, and research talks throughout the week. These are not recorded content played off a projector. They are working sessions with hands-on exercises, code reviews, and real-time feedback from contributors who built the tools being discussed.',
            'Technical stages cover rollups, based sequencing, zero-knowledge proofs, state proofs, and decentralized identity in depth. The schedule is dense, and the best approach is to pick two or three focus areas rather than try to catch everything.',
          ],
        },
        {
          heading: 'Outside the main venue',
          content: [
            'Denver during ETHDenver week fills up with hacker houses, co-working sessions, and community dinners that run parallel to the official event. Some of the most productive conversations happen in those spaces, away from the noise of the main hall.',
            'Rocky Mountain ski resorts are a short drive from the city, and developer groups regularly organize informal day trips between working sessions. Colorado in February is cold, so plan accordingly.',
            'Side summits during the week tend to focus on niche technical areas: MEV mitigation, DeFi risk modeling, decentralized AI, and regenerative finance all have recurring gatherings that draw serious researchers.',
          ],
        },
        {
          heading: 'Getting in',
          content: [
            'Admission is free for verified developers, creators, and community builders. You apply through the ETHDenver portal and get approved based on your background and project focus. The process is real but accessible. Apply early.',
            'The venue is the National Western Complex at 4655 Humboldt St, Denver, CO 80216. It is large enough to handle the crowd, with round-the-clock hacking spaces, hardware labs, food trucks, and art installations spread across the facility.',
            'If you are flying in from another time zone, plan to arrive a day early and give yourself time to adjust to the altitude. Denver sits at 5,280 feet and the dehydration effect is real, especially if you are planning to work through nights.',
          ],
        },
      ],
    };
  }

  const type = getEventType(event);
  const format = getEventFormat(event);
  const ecosystems = getEventEcosystems(event);
  const ecoStr = ecosystems.length === 0
    ? 'Web3 and blockchain'
    : ecosystems.length === 1
      ? ecosystems[0]
      : ecosystems.length === 2
        ? `${ecosystems[0]} and ${ecosystems[1]}`
        : `${ecosystems.slice(0, -1).join(', ')}, and ${ecosystems[ecosystems.length - 1]}`;

  const isHackathon = type === 'hackathon';
  const isConference = type === 'conference';
  const isWorkshop = type === 'workshop';
  const rawDescription = cleanPublishText((event.description || '').trim());
  const ownDescription =
    rawDescription && !isThinEventListingDescription(rawDescription) ? rawDescription : '';
  const socialText = `${event.name} ${rawDescription}`.toLowerCase();
  const isSocial = !isHackathon && /\b(afterparty|after-party|after party|\bparty\b|dinner|gala|mixer|breakfast|brunch|drinks|cocktails?|reception|celebration|soir[eé]e|banquet|luncheon|happy hour|closing (party|night)|after-party)\b/.test(socialText);

  const baseOverview = `${event.name} is scheduled for ${formattedDates} ${locationStr}, bringing together Web3 participants, builders, and ecosystem contributors.`;

  const rawParagraphs = ownDescription
    ? ownDescription
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : [];

  const eventRoleContext = isSocial
    ? 'Organized as an evening social rather than a formal conference program, the gathering centers on food, drinks, and unstructured conversation with founders, builders, investors, and ecosystem operators. Expect introductions and relationship-building over formal stage presentations.'
    : isHackathon
    ? 'As a hackathon, the gathering is structured around active development, prototyping, and mentor-guided building sprints. Teams collaborate under time constraints to design, write smart contracts, and demonstrate functional decentralized applications or infrastructure components.'
    : isConference
      ? 'As a full-scale conference, the program features keynote presentations, panel debates, technical briefings, and exhibition spaces. Attendees connect across institutional allocators, core protocol teams, and emerging startups operating at the forefront of digital asset innovation.'
      : isWorkshop
        ? 'Organized as a technical workshop and hands-on session, the focus is centered on applied development workflows, protocol tooling deep dives, and direct interaction between developers and framework architects.'
        : 'Designed as a high-signal community meetup and networking session, the event facilitates informal technical exchanges, collaborative discussions, and peer networking among regional and visiting blockchain professionals.';

  let aboutContent: string[];
  if (rawParagraphs.length > 1) {
    aboutContent = [...rawParagraphs.slice(0, 4), eventRoleContext];
  } else if (rawParagraphs.length === 1) {
    aboutContent = [rawParagraphs[0], eventRoleContext];
  } else {
    aboutContent = [baseOverview, eventRoleContext];
  }

  const ecosystemDescriptions: Record<string, string> = {
    Ethereum: 'Ethereum and EVM development, smart contract security standards, rollups, and protocol-level execution scaling',
    Solana: 'high-throughput Solana programs, state compression, local fee markets, and the SVM runtime ecosystem',
    Bitcoin: 'Bitcoin development, Lightning Network payment channels, protocol upgrades, and sovereign digital asset custody',
    Base: 'Base L2 integration, on-chain social mechanics, consumer onboarding rails, and developer tooling on the OP Stack',
    Polygon: 'Polygon CDK chains, aggregated liquidity layers, zero-knowledge proofs, and enterprise blockchain rollouts',
    Arbitrum: 'Arbitrum Nitro execution, Stylus multi-language smart contracts, Orbit L3 appchains, and AnyTrust data availability',
    Optimism: 'OP Stack modular rollups, Superchain interoperability, and retroactive public goods funding mechanics',
    Sui: 'Move language object-centric data models, parallel transaction execution, and low-latency digital asset primitives',
    Aptos: 'Aptos Move smart contract safety, Block-STM parallel execution engine, and consumer Web3 UX infrastructure',
    Monad: 'pipelined execution, parallelized EVM throughput, MonadBFT consensus, and high-frequency on-chain trading applications',
    Berachain: 'Proof of Liquidity (PoL) consensus, Polaris EVM architecture, and liquidity-aligned decentralized finance flywheels',
    Avalanche: 'Avalanche Subnets, Avalanche Warp Messaging (AWM), and custom VM execution environments for institutional and gaming chains',
    NEAR: 'Chain Abstraction, sharded Nightshade consensus, user-owned AI runtimes, and frictionless account models',
    TON: 'The Open Network smart contracts, Telegram mini-app integrations, native USDT micropayments, and massive consumer distribution',
    Cosmos: 'Tendermint Byzantine Fault Tolerant consensus, Inter-Blockchain Communication (IBC) protocol, and sovereign application-specific blockchains',
    Polkadot: 'Polkadot parachain architecture, Substrate modular framework, shared economic security, and cross-consensus messaging (XCM)',
    Chainlink: 'Chainlink Cross-Chain Interoperability Protocol (CCIP), decentralized oracle networks, data feeds, and automated compute triggers',
    DeFi: 'decentralized liquidity routing, automated market makers, on-chain lending protocols, and capital-efficient asset models',
    'AI + Web3': 'decentralized artificial intelligence, verifiable agentic computation, DePIN sensor networks, and cryptographic inference verification',
    'ZK / L2': 'zero-knowledge cryptography, succinct validity proofs, state rollups, and privacy-preserving protocol architectures',
    'NFT / Gaming': 'on-chain gaming loops, verifiable asset ownership, autonomous worlds, and digital entertainment primitives',
    Security: 'smart contract formal verification, runtime auditing, bug bounties, and decentralized protocol defense vectors',
    RWA: 'real-world asset tokenization, regulated on-chain treasury vehicles, private debt structures, and institutional compliance rails',
    Web3: 'decentralized web architectures, user-sovereign cryptographic primitives, distributed networks, and open data protocols',
  };

  const focusPoints = ecosystems.map((eco) => ecosystemDescriptions[eco] || `${eco} ecosystem architecture and applications`);
  const formattedFocusList = focusPoints.length === 1
    ? focusPoints[0]
    : focusPoints.length === 2
      ? `${focusPoints[0]}, as well as ${focusPoints[1]}`
      : `${focusPoints.slice(0, -1).join(', ')}, and ${focusPoints[focusPoints.length - 1]}`;

  const technicalFocusIntro = ecosystems.length > 0
    ? `The agenda touches directly on core engineering and business themes across ${ecoStr}. Participants explore ${formattedFocusList}.`
    : 'The program encompasses modern blockchain infrastructure, decentralized software architecture, cryptographic validation, and practical Web3 deployment patterns across distributed networks.';

  const technicalFocusBody = isSocial
    ? 'Conversation ranges across whatever guests are building and backing: protocol launches, fund theses, hiring needs, and ecosystem developments that never reach a formal stage. The value is who is in the room, so skim the co-hosts and sponsors to decide if your colleagues will be there.'
    : isHackathon
    ? 'Builders have opportunities to stress-test frameworks, submit working prototypes to judging panels, and exchange feedback with protocol maintainers. Focus tracks frequently center on user experience improvements, composable protocol layers, and verifiable on-chain mechanics.'
    : isConference
      ? 'Discussions focus on both technical architecture and institutional adoption. Panelists dissect regulatory trajectories, custody infrastructure, and what production-grade throughput looks like across decentralized networks.'
      : 'Discussions provide insight into practical deployment challenges, current trends across global and regional blockchain scenes, and collaborative avenues for open-source software and infrastructure builders looking to deploy scalable solutions.';

  const isOnline = format === 'online';
  const cityName = event.city && event.city !== 'Global' ? event.city : '';
  const cityDescriptions: Record<string, string> = {
    Singapore: 'Singapore serves as a premier global hub for digital asset innovation, supported by the Monetary Authority of Singapore (MAS) regulatory clarity and an extensive international business ecosystem.',
    Seoul: 'Seoul is one of the most vibrant cryptocurrency capital markets globally, characterized by high retail adoption, tech-forward developer communities, and major institutional engagement.',
    London: 'London combines centuries of financial market leadership with a rapidly maturing fintech and Web3 ecosystem, anchoring major European digital asset dialogues.',
    'New York': 'New York represents the epicenter of traditional institutional finance, where Wall Street capital allocators, legal minds, and digital asset protocols meet.',
    'San Francisco': 'San Francisco and the Bay Area remain the technological nucleus for frontier software engineering, decentralized protocol design, and venture investment.',
    Dubai: 'Dubai operates under progressive digital asset frameworks established by the Virtual Assets Regulatory Authority (VARA), attracting global Web3 founders and capital.',
    Tokyo: 'Tokyo offers a sophisticated regulatory framework under Japan Financial Services Agency oversight, paired with global entertainment, gaming, and IP distribution.',
    Mumbai: 'Mumbai serves as the commercial hub of India, driving exceptional developer talent, dynamic developer communities, and fintech engineering innovation.',
    'Hong Kong': "Hong Kong has established comprehensive licensing regimes for digital asset trading platforms and stablecoin initiatives, positioning itself as Asia's bridge for institutional crypto capital.",
    Denver: 'Denver has emerged as the cultural and grassroots spiritual home of the Ethereum developer community, centered around the annual ETHDenver gathering and regional Rocky Mountain builder hubs.',
    Berlin: 'Berlin is a foundational crucible for cypherpunk ethos, open-source cryptography, and decentralized protocol research in Europe.',
    Paris: 'Paris hosts premier European blockchain conferences and a surging institutional tech ecosystem backed by European tech accelerators and university research labs.',
    Lisbon: 'Lisbon has become a top European destination for Web3 digital nomads, decentralized founders, and protocol developer communities.',
    Bangalore: "Bangalore (Bengaluru) serves as India's Silicon Valley, harboring deep engineering talent pools, core protocol contributors, and high-velocity Web3 startups.",
    'New Delhi': 'New Delhi connects regulatory policy discussions with a rapidly growing grassroots Web3 developer and enterprise ecosystem across North India.',
    'Delhi NCR': 'The National Capital Region of Delhi hosts major developer hubs, academic centers, and enterprise blockchain initiatives across northern India.',
    Austin: "Austin pairs Texas's energy innovation and pro-crypto mining stance with a vibrant tech startup scene and dynamic crypto community.",
    Toronto: 'Toronto holds historic significance as an early birthplace of Ethereum development and continues to foster world-class cryptographic research.',
    Miami: 'Miami has established itself as an enthusiastic gateway for North and Latin American cryptocurrency conferences, venture funds, and fintech adoption.',
    'Miami Beach': "Miami Beach frequently hosts premier digital asset gatherings, summits, and executive networking receptions against South Florida's financial backdrop.",
    'Abu Dhabi': 'Abu Dhabi provides strong regulatory backing through Abu Dhabi Global Market (ADGM), attracting institutional crypto firms, custodians, and digital asset funds.',
  };

  const cityContext = cityName && cityDescriptions[cityName]
    ? `${cityDescriptions[cityName]} Hosting the event in ${cityName} enables productive interaction between domestic developer communities and visiting global teams.`
    : isOnline
      ? 'This event is hosted entirely online, allowing developers, founders, and community attendees from around the world to participate remotely without travel constraints or regional visa barriers.'
      : `Held ${locationStr}, this gathering connects regional participants with visiting builders, protocol teams, and investors active in the local and international ecosystem.`;

  const logisticsDetail = isOnline
    ? 'Attendees should confirm the live-stream platform, working time zones, and interactive virtual staging links ahead of the scheduled start. Check whether breakout workshops or mentorship office hours require prior registration.'
    : `Attendees traveling to ${cityName || 'the venue'} should secure hotel reservations and review local transit options well in advance of ${formattedDates}, as accommodations near major conference corridors book quickly during busy event cycles.`;

  const participationNotes = isSocial
    ? 'Entry is typically RSVP or guest-list based with limited capacity, so register early and arrive on time. Dress codes and plus-one rules vary by host; check the event page before heading over.'
    : isHackathon
    ? 'Participants should ensure their development environments, repository access, dependency setups, and team configurations are finalized before the official kickoff. Review official project submission guidelines, judging criteria, and mentor office hour schedules to maximize your project demonstration impact.'
    : isConference
      ? 'Attendees should confirm entry credentials, ticket barcodes, and registration confirmations through the official organizer portal prior to arrival. Reviewing published speaker schedules and satellite side-event calendars in advance helps maximize high-value hallway discussions, technical roundtables, and ecosystem networking sessions.'
      : 'RSVPs and registration passes are typically required due to venue capacity limitations and security protocols. Arriving early during registration check-in is recommended to guarantee admission and connect with fellow community members, protocol engineers, and ecosystem operators.';

  const networkingAdvice = isSocial
    ? 'Evening events reward working the room over collecting contacts: a few real conversations beat a stack of scanned badges. Eat first, introduce people to each other, and follow up the next morning while names are fresh.'
    : isHackathon
    ? 'Hackathons provide a high-signal environment to meet co-founders, protocol developer advocates, and potential grant program evaluators. Engage with protocol mentors circulating through the hacking floor for architectural advice, debugging support, and bounty clarification.'
    : isConference
      ? 'Beyond the keynote stages, major conferences serve as the primary venue where strategic partnerships, venture financing, and cross-chain integrations are initiated. Take advantage of dedicated networking lounges, exhibition demo booths, and side-event forums.'
      : 'Community meetups offer an intimate setting for peer discussions, local project showcases, and grassroots technical collaboration across the regional developer, contributor, and investor ecosystem.';

  const calendarAdvice = `Add ${event.name} to your calendar (${formattedDates}) to plan your schedule, travel window, and follow-up activities. Check the official event link periodically for agenda additions, keynote speaker announcements, and venue entry requirements.`;

  const sections: EditorialSection[] = [
    {
      heading: 'About the event',
      content: aboutContent,
    },
    {
      heading: 'Ecosystem & technical focus',
      content: [technicalFocusIntro, technicalFocusBody],
    },
    {
      heading: isOnline ? 'Virtual format & access' : 'Location & travel logistics',
      content: [cityContext, logisticsDetail],
    },
    {
      heading: 'Participation & planning',
      content: [participationNotes, networkingAdvice, calendarAdvice],
    },
  ];

  const hostNames = Array.isArray(event.hosts)
    ? event.hosts.filter((h): h is string => typeof h === 'string' && !!h.trim()).slice(0, 4)
    : [];
  const organizerName = event.organizer && event.organizer.name ? event.organizer.name : '';
  const hostSummary = hostNames.length
    ? `Hosted by ${hostNames.join(', ')}`
    : organizerName
      ? `Hosted by ${organizerName}`
      : '';

  const factsLine = [
    hostSummary,
    (event.price || '').trim() ? `Tickets ${(event.price || '').trim()}` : '',
    event.approvalRequired ? 'approval required to attend' : '',
    event.timezone ? `(${event.timezone} time)` : '',
  ]
    .filter(Boolean)
    .join('. ');

  const firstSummarySentence = rawParagraphs.length > 0
    ? (rawParagraphs[0].endsWith('.') ? rawParagraphs[0] : `${rawParagraphs[0]}.`)
    : `${event.name} brings together builders and ecosystem contributors.`;

  const summaryLead = factsLine
    ? `${event.name} on ${formattedDates} ${locationStr}. ${factsLine}. ${firstSummarySentence}`
    : `${event.name} on ${formattedDates} ${locationStr}. ${firstSummarySentence}`;

  return {
    summaryLead,
    sections,
    ticketPricing: (event.price || '').trim() || undefined,
  };
}
