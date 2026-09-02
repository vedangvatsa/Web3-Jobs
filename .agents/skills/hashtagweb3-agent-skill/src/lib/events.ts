import { EVENT_GUIDES } from './event-guides';

export type EventType = 'conference' | 'hackathon' | 'meetup' | 'workshop' | 'online';
export type EventFormat = 'in-person' | 'online';

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
  slug?: string;
}

// Country code to clean name mapping
export const COUNTRY_NAMES: Record<string, string> = {
  AE: 'United Arab Emirates', AF: 'Afghanistan', AR: 'Argentina', AT: 'Austria',
  AU: 'Australia', BD: 'Bangladesh', BE: 'Belgium', BG: 'Bulgaria', BN: 'Brunei',
  BO: 'Bolivia', BR: 'Brazil', BS: 'Bahamas', CA: 'Canada', CH: 'Switzerland',
  CL: 'Chile', CN: 'China', CO: 'Colombia', CR: 'Costa Rica', CZ: 'Czechia',
  DE: 'Germany', DK: 'Denmark', DO: 'Dominican Republic', EC: 'Ecuador',
  EE: 'Estonia', EG: 'Egypt', ES: 'Spain', FI: 'Finland', FR: 'France',
  GB: 'United Kingdom', GE: 'Georgia', GF: 'French Guiana', GH: 'Ghana',
  GR: 'Greece', GT: 'Guatemala', HK: 'Hong Kong', HR: 'Croatia', HU: 'Hungary',
  ID: 'Indonesia', IE: 'Ireland', IL: 'Israel', IN: 'India', IS: 'Iceland',
  IT: 'Italy', JM: 'Jamaica', JO: 'Jordan', JP: 'Japan', KE: 'Kenya',
  KR: 'South Korea', KW: 'Kuwait', KZ: 'Kazakhstan', LB: 'Lebanon', LK: 'Sri Lanka',
  LT: 'Lithuania', LU: 'Luxembourg', LV: 'Latvia', MA: 'Morocco', MC: 'Monaco',
  MX: 'Mexico', MY: 'Malaysia', NG: 'Nigeria', NL: 'Netherlands', NO: 'Norway',
  NZ: 'New Zealand', PA: 'Panama', PE: 'Peru', PH: 'Philippines', PK: 'Pakistan',
  PL: 'Poland', PR: 'Puerto Rico', PT: 'Portugal', QA: 'Qatar', RO: 'Romania',
  RS: 'Serbia', RU: 'Russia', RW: 'Rwanda', SA: 'Saudi Arabia', SE: 'Sweden',
  SG: 'Singapore', SI: 'Slovenia', SK: 'Slovakia', TH: 'Thailand', TN: 'Tunisia',
  TR: 'Turkey', TW: 'Taiwan', TZ: 'Tanzania', UA: 'Ukraine', UG: 'Uganda',
  US: 'United States', UY: 'Uruguay', UZ: 'Uzbekistan', VE: 'Venezuela',
  VN: 'Vietnam', ZA: 'South Africa',
};

export function normalizeCountry(raw?: string): string {
  if (!raw) return '';
  const upper = raw.trim().toUpperCase();
  if (COUNTRY_NAMES[upper]) return COUNTRY_NAMES[upper];
  return raw.trim();
}

export function getEventType(event: Web3Event): EventType {
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
  if (loc.includes('online') || loc.includes('virtual') || text.includes('webinar') || text.includes('ama ') || text.includes('twitter space')) {
    return 'online';
  }
  return 'meetup';
}

export function getEventFormat(event: Web3Event): EventFormat {
  const loc = (event.location || '').toLowerCase();
  const name = event.name.toLowerCase();
  if (loc.includes('online') || loc.includes('virtual') || name.includes('online') || name.includes('virtual')) {
    return 'online';
  }
  return 'in-person';
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

export function getEventCity(event: Web3Event): string {
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

export function getEventSlug(event: Web3Event): string {
  if (event.slug) return event.slug.toLowerCase().trim();

  // Keep the full event name and calendar date. The old two-word slugger
  // collapsed distinct conferences and side events onto the same root URL.
  const cleanName = event.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const parsedDate = new Date(event.startDate);
  const date = Number.isNaN(parsedDate.getTime())
    ? 'date-tba'
    : parsedDate.toISOString().slice(0, 10);

  return `${cleanName || 'web3-event'}-${date}`;
}

export function generateGoogleCalendarUrl(event: Web3Event): string {
  const formatGCalDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const start = formatGCalDate(event.startDate);
  const end = event.endDate ? formatGCalDate(event.endDate) : start;
  const dates = start && end ? `${start}/${end}` : start;

  const title = encodeURIComponent(event.name);
  const details = encodeURIComponent(
    `${event.description || 'Web3 Event'}\n\nOfficial Link: ${event.url || event.website || 'https://hashtagweb3.com/events'}\n\nDiscovered via Hashtag Web3 (https://hashtagweb3.com/events)`
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
  const slug = (event.slug || '').toLowerCase().trim();
  if (slug && EVENT_GUIDES[slug]) return EVENT_GUIDES[slug];

  const name = event.name.toLowerCase();
  const type = getEventType(event);
  const format = getEventFormat(event);
  const ecosystems = getEventEcosystems(event);
  const ecoStr = ecosystems.length > 0 ? ecosystems.join(', ') : 'Web3 and blockchain';
  const locationStr = event.location || 'Virtual / TBA';
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

  // Dynamic ticket, speakers, and attendance fields based on event type
  const isHackathon = type === 'hackathon';
  const isConference = type === 'conference';

  let ticketPricing = 'Free / RSVP required';
  let speakers = 'Ecosystem contributors, local builders';
  let expectedAttendance = '150+ attendees';

  if (isHackathon) {
    ticketPricing = event.name.toLowerCase().includes('global') || event.name.toLowerCase().includes('online')
      ? 'Free (Open Online)'
      : 'Free (Application / RSVP Required)';
    speakers = `${ecoStr} core contributors, ecosystem mentors, previous buildathon winners`;
    expectedAttendance = '1,000+ developers';
  } else if (isConference) {
    ticketPricing = 'From $199 / Early bird discounts available';
    speakers = `${ecoStr} project leads, smart contract developers, venture partners`;
    expectedAttendance = '1,000+ attendees';
  }

  return {
    summaryLead: event.description
      ? `${event.name} takes place ${formattedDates} in ${locationStr}. ${event.description}`
      : `${event.name} is a ${isHackathon ? 'Web3 hackathon and builder sprint' : isConference ? 'blockchain conference and ecosystem gathering' : 'Web3 community event'} taking place ${formattedDates} in ${locationStr}. The focus is on ${ecoStr}, bringing together developers, founders, and people working in the industry for hands-on learning and direct conversation.`,
    ticketPricing,
    speakers,
    expectedAttendance,
    sections: [
      {
        heading: 'About the event',
        content: [
          `${event.name} is part of a growing calendar of focused ${ecoStr} gatherings where the people actually building protocols, writing contracts, and shipping products meet in person. The format is designed around real exchange, not broadcast.`,
          `Sessions cover practical ground in ${ecoStr}: how protocols are architected, where security assumptions break down, how governance actually gets implemented, and what the current generation of tooling makes possible that was not feasible a year ago.`,
          `The conversation tends to be specific rather than general. This is not an introduction to blockchain. It is a working gathering for people already in it.`,
        ],
      },
      {
        heading: 'What gets covered',
        content: [
          `Smart contract development and tooling: Foundry, Hardhat, Anchor, and the frameworks being used in production across ${ecoStr}, with sessions on testing patterns, deployment workflows, and common failure modes.`,
          `Protocol design and architecture: How to reason about state, composability, liquidity, and incentive design when building on a shared global ledger.`,
          `Security and auditing: Practical approaches to reviewing code, running fuzzing campaigns, setting up bug bounty programs, and learning from recent exploits.`,
          `Governance, DAOs, and treasury: How decentralized organizations make decisions at scale, manage protocol upgrades, and allocate community resources without capturing them.`,
        ],
      },
      {
        heading: 'Talks, demos, and the hallway',
        content: [
          `${isHackathon
            ? `Teams form at the start and have the full event to build and ship something real. Sponsors post bounties and judges evaluate working prototypes, not decks. The best submissions often attract direct grant offers or follow-on investment.`
            : `Sessions run across multiple stages with breakout rooms for smaller technical discussions. The most useful conversations often happen informally, between sessions, when the people running the protocols are accessible for real questions.`
          }`,
          `Side events and evening gatherings run around the main schedule in ${locationStr}. Check the satellite event calendar alongside the official agenda.`,
        ],
      },
      {
        heading: 'Getting there and registering',
        content: [
          `The event is in ${locationStr}. ${format === 'online' ? 'Access is fully virtual, with live streams, interactive breakout rooms, and async content available across time zones.' : 'Register through the official event website. Passes sell out, so do not wait.'}`,
          `Book accommodation early if you are traveling. Conference week hotel prices in most cities spike significantly once the main block of rooms fills.`,
        ],
      },
    ],
  };
}
