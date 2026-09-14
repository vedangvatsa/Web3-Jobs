import fs from 'fs';
import path from 'path';
import { Web3Event, formatEventLocation, getEventBaseSlug, getEventEcosystems, getEventSlug, getEventType, normalizeCountry } from './events';
import { getEventExternalUrl } from './event-external-url';
import { cleanPublishText } from './noslop';

// Explicitly blocked promotional posts that are not events
const BLOCKED_EVENT_IDS = new Set([
  'luma-host-evt-ueBMP7nPZ9SngEX', // Compass for Bitcoin Asia 2026 Companies & Participant List: promo post, not an event
  // No official event-specific source was available during the September 2026 audit.
  'premier-web3warsaw-2026',
  'premier-modular-summit-2026',
  'premier-mainnet-2026',
  'premier-devconnect-2026', // No official Devconnect scheduled for Bangkok in November 2026
  'premier-cardano-summit-2026', // Organizer cancelled the Singapore edition.
  'premier-ethkl-2026', // Organizer has not announced a 2026 edition.
  'premier-ethlisbon-2026', // Organizer has not announced a 2026 edition.
  'premier-smartcon-2026', // Organizer has not announced a 2026 edition.
  'premier-pbw-2027', // Paris Blockchain Week has been replaced by Signal Week.
  'premier-permissionless-2026', // Official last edition was Permissionless IV (Jun 24–26 2025); no 2026 dates announced.
  'premier-ethindia-2026', // ethindia.co only lists ended ETHIndiaVilla Nov 2025; no Dec 2026 edition announced.
  // Fabricated / unverifiable curated side events (generic parent homepage only, or city mismatch).
  'side-solana-breakpoint-yacht-party-2026',
  'side-monad-builder-lounge-breakpoint-2026',
  'side-token2049-vip-gala-2026',
  'side-solana-superteam-singapore-2026',
  'side-ethereum-singapore-l2-brunch-2026',
  'side-base-builder-house-singapore-2026',
  'side-ethsf-hacker-house-2026',
  'side-sg-hyperliquid-traders-night',
  'side-sg-rwa-institutional-summit',
  'side-sg-ai-agents-onchain',
  'premier-connectseoul',
  'premier-connectsg',
  'side-devcon8-privacy-hack-house-2026',
  'side-ibw2026-media-accelerator',
  'side-ibw2026-ai-economic-forum',
  'side-ibw2026-eip-hub',
  'side-ibw2026-ravecon-bender',
  'side-ibw2026-pragma-mumbai',
  'side-ibw2026-unchained-summit',
  'side-ibw2026-ready-for-the-run',
  'premier-ethbucharest-2027',
  'premier-ethseoul-2027',
  'premier-ethbelgrade-2027',
  'premier-abw-2027',
  'premier-jbw-2027',
  'premier-ethprague-2027',
  'premier-ethdam-2027',
  'side-denver-zk-proofs-summit',
  'side-denver-dao-governance-brunch',
  'side-denver-solana-coworking-hub',
  'side-ethdenver-buidl-afterparty-2027',
  'premier-enugu',
  'premier-bitcoinberlin',
  'side-desci-singapore-summit-2026',
  'side-sg-arbitrum-stylus-hacker-house',
  'ma-european-blockchain-convention-12', // Duplicate of the curated EBC 2026 record
  'w3v-onchain-capital--liquidity-defi--ai', // Duplicate of the curated Onchain Capital & Liquidity Seoul event
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

const KBW_LUMA_IMAGE_OVERRIDES: Record<string, string> = {
  'kbw-luma-coded-kbw-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/io/00a1bb59-2e6b-4dd9-ab3b-78f636a4f6ad.png',
  'kbw-luma-trust404-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/tu/3deb0d72-00fd-4d3e-8049-f7c94230a620.png',
  'kbw-luma-blockfesta-vip-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/g7/d3c1e772-f064-4bbe-93df-bc264a73ab5c.png',
  'kbw-luma-seoul-index-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/57/5386a7bf-9d10-49b8-9020-ab135a8aa6f3.png',
  'kbw-luma-chimaek-chill-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/7z/3176e186-189d-430a-a35a-cfe10e8568b0.png',
  'kbw-luma-capital-forum-canton-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/y1/a3b498b9-a43b-4721-a73d-7bc051693f77.png',
  'kbw-luma-wiring-korea-world-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/zu/412847dd-d22b-485d-84c2-25084cb2e4fa.png',
  'kbw-luma-realfi-ai-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/6h/671a2019-951d-4f52-b91f-f6a9d9aeeb16.png',
  'kbw-luma-ai-payment-carnival-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/i3/fee06417-4f12-4eca-b6e8-ca0fc7f850d9.png',
  'kbw-luma-best-event-sundown-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/5e/474ce3c6-6224-4ef0-8f80-dd1b0768a9e5.png',
  'kbw-luma-stellar-night-seoul-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/nf/50771527-5da9-4f53-9a69-96107dcdcf93.png',
  'kbw-luma-onchain-finance-exchange-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/pa/8a409e97-bf55-41bf-b506-dff8c2f44f66.png',
  'kbw-luma-mining-the-night-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/6a/1a0a0bf6-0996-4cb8-a613-95584e2a8a23.png',
  'kbw-luma-ourbit-after-hours-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/vo/31bda717-30ec-4fc1-ba6e-8bb18c2542ad.png',
  'kbw-luma-beldex-acurast-party-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/cp/fb259655-5d9d-41c3-b89c-79cf943ac168.png',
  'kbw-luma-institutional-privacy-day-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/jr/0dd9ca3d-2fb7-4865-8db6-cf0269d066fa.png',
  'kbw-luma-yellow-korea-workshop-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/4f/eafa38e5-836c-4a25-8def-92c39737b044.png',
  'kbw-luma-sanc-nine-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/zp/ea9830db-4cf9-427a-92e2-a6dad4fb61a2.png',
  'kbw-luma-seoul-on-chain-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/1k/f847e05e-7148-4be8-924a-c85b6d30208a.png',
  'kbw-luma-bridging-finance-onchain-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/w6/5beb1daa-c7f5-463e-ba1b-79f6d14d9d5e.png',
  'kbw-luma-onchain-night-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/n7/8b48175e-6a60-4061-bfd9-a0eece7d3ae6.png',
  'kbw-luma-easycon-seoul-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/8l/754eaae0-8112-4928-b514-497209caab6b.png',
  'kbw-luma-perpdex-night-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/ms/70ab6938-b6b8-4862-8ee0-f6cbdb8a0455.png',
  'kbw-luma-four-pillars-research-awards-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/6x/84dea364-e7c8-4ce1-a340-aea4edaf8685.png',
  'kbw-luma-tradfi-onchain-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/q8/f6db6100-f5b4-4377-9503-fb837c229a4d.png',
  'kbw-luma-ravedao-baddiejuice-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/7f/eafba3d6-2221-4efb-a6d2-79ec7f43e4e5.png',
  'kbw-luma-trader-gathering-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/fm/d8f0a527-850c-4f5f-ad9f-b1b09ae176bf.png',
  'kbw-luma-xrpfi-night-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/b4/dfb06ff6-9f29-4beb-b2a5-f80a2403f7de.png',
  'kbw-luma-lambda256-node-crew-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/jp/af822849-b34e-4a94-88f8-203529cb667c.png',
  'kbw-luma-xrp-afterparty-2026': 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event-social/r1/96efe20d-1f2b-4666-a8b9-1403a160ddc0.png',
};

function loadEventImageOverrides(cwd: string): Record<string, string> {
  const imagePath = path.join(cwd, 'content', 'event-image-overrides.json');
  try {
    return fs.existsSync(imagePath) ? JSON.parse(fs.readFileSync(imagePath, 'utf8')) : {};
  } catch (err) {
    console.error('Failed to read event-image-overrides.json:', err);
    return {};
  }
}

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
    // Prefer explicit curated slugs so premier pages keep stable, human URLs.
    const curatedSlug = event.source === 'curated-premier'
      ? event.slug?.toLowerCase().trim()
      : undefined;
    const baseSlug = curatedSlug || getEventBaseSlug(event);
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

/** Drop scraped blurbs that were cut mid-sentence (e.g. "...learn abo"). */
function isTruncatedEventDescription(description: string): boolean {
  const text = description.trim();
  if (!text) return false;
  if (/\b(abo|an|th|to|fo|wi|a|of|or|and|the)$/i.test(text)) return true;
  if (text.length >= 140 && !/[.!?…]"?$/.test(text)) return true;
  return false;
}

// Luma's grey "add a cover photo" placeholder is not real event art;
// treat it as missing so cards/heroes fall back to the gradient cover.
function isLumaDefaultPlaceholder(img?: string | null): boolean {
  return !!img && /images\.lumacdn\.com\/social-images\/default-\d+\.png/i.test(img);
}

function resolveEventCoverImage(cwd: string, img?: string | null): string | null {
  if (!img || isLumaDefaultPlaceholder(img)) return null;

  if (img.startsWith('/')) {
    return fs.existsSync(path.join(cwd, 'public', img)) ? img : null;
  }

  try {
    const parsed = new URL(img);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') return null;
    return /^https?:$/.test(parsed.protocol) ? img : null;
  } catch {
    return null;
  }
}

function getGeneratedEventCover(name: string): string {
  return `/api/og?type=event&v=2&title=${encodeURIComponent(name)}&location=Web3%20Event`;
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

function getLegacyEventSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[’'"]/g, '')
    .replace(/\b(2025|2026|2027|2028|2029|2030)\b/g, '')
    .replace(/\b(washington|dc|san francisco|sf|new york|nyc|london|tokyo|paris|berlin|singapore|dubai)\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-') || 'web3-event';
}

function getLegacyEventSlug(event: Web3Event): string {
  return getLegacyEventSlugFromName(event.name);
}

function getReadableLegacyEventSlug(event: Web3Event): string {
  const name = event.name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2');
  return getLegacyEventSlugFromName(name);
}

function linkSideEventParents(event: Web3Event): Web3Event {
  const sideEventFor = new Set(event.sideEventFor || []);

  if (event.token2049SideEvent) sideEventFor.add('token2049');
  if (event.id.startsWith('kbw-luma-') || event.id.startsWith('kbw-')) sideEventFor.add('kbw');
  if (event.id.startsWith('side-ibw2026-')) {
    if (event.startDate < '2026-11-03') sideEventFor.add('ibw');
    else if (event.startDate < '2026-11-07') sideEventFor.add('devcon');
  }
  if (event.id === 'side-monad-builder-lounge-breakpoint-2026') sideEventFor.add('breakpoint');

  return sideEventFor.size ? { ...event, sideEventFor: [...sideEventFor] } : event;
}

async function loadEvents(): Promise<Web3Event[]> {
  try {
    const cwd = process.cwd();
    const curatedPath = path.join(cwd, 'content', 'curated-events.json');
    const kbwLumaPath = path.join(cwd, 'content', 'kbw-luma-events.json');
    const ibwSideEventsPath = path.join(cwd, 'content', 'ibw-side-events.json');
    const indiaLumaEventsPath = path.join(cwd, 'content', 'india-luma-events.json');
     const cachePath = path.join(cwd, 'content', 'events-cache.json');
     const eventImageOverrides = loadEventImageOverrides(cwd);

    let curatedEvents: Web3Event[] = [];
    let kbwLumaEvents: Web3Event[] = [];
    let ibwSideEvents: Web3Event[] = [];
    let indiaLumaEvents: Web3Event[] = [];
    let cachedEvents: Web3Event[] = [];

    if (fs.existsSync(curatedPath)) {
      try {
        curatedEvents = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));
      } catch (err) {
        console.error('Failed to read curated-events.json:', err);
      }
    }

    if (fs.existsSync(kbwLumaPath)) {
      try {
        kbwLumaEvents = JSON.parse(fs.readFileSync(kbwLumaPath, 'utf8'));
      } catch (err) {
        console.error('Failed to read kbw-luma-events.json:', err);
      }
    }

    for (const [filePath, target] of [[ibwSideEventsPath, 'ibw'], [indiaLumaEventsPath, 'india']] as const) {
      if (!fs.existsSync(filePath)) continue;
      try {
        const events = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Web3Event[];
        if (target === 'ibw') ibwSideEvents = events;
        else indiaLumaEvents = events;
      } catch (err) {
        console.error(`Failed to read ${path.basename(filePath)}:`, err);
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
    const rawAll = [...curatedEvents, ...kbwLumaEvents, ...ibwSideEvents, ...indiaLumaEvents, ...cachedEvents].map(linkSideEventParents);

    // Clean & normalize
    const seenTitles = new Set<string>();
    const seenUrls = new Set<string>();
    const cleaned: Web3Event[] = [];

    for (const e of rawAll) {
      if (!e.name || !e.startDate) continue;
      if (e.id.startsWith('side-ibw2026-')) continue;
      if (BLOCKED_EVENT_IDS.has(e.id)) continue;
      if (/participant list/i.test(e.name)) continue;
      if (!isQualityEvent(e)) continue;

      let cleanName = cleanPublishText(e.name.replace(/\s+\[\d+\]$/g, '').trim()); // Remove trailing brackets like [4]
      let cleanUrl = cleanPublishText(e.url || '');
      const cleanWebsite = e.website ? cleanPublishText(e.website) : undefined;
      const cleanRegistrationUrl = e.registrationUrl ? cleanPublishText(e.registrationUrl) : undefined;
      let cleanCity = cleanPublishText(e.city || '');
      let cleanCountry = cleanPublishText(e.country || '');
      let cleanLocation = cleanPublishText(e.location || '');
      let cleanDescription = cleanPublishText(e.description || '');
      if (isTruncatedEventDescription(cleanDescription)) {
        cleanDescription = '';
      }

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

      const externalUrl = getEventExternalUrl({
        registrationUrl: cleanRegistrationUrl,
        website: cleanWebsite,
        url: cleanUrl,
      });

      // Normalization check for deduplication
      const datePart = e.startDate.slice(0, 10);
      const normTitle = normalizeEventTitle(cleanName);
      const normUrl = normalizeEventDomainUrl(externalUrl);

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
         coverImage: resolveEventCoverImage(
           cwd,
           eventImageOverrides[e.id] || KBW_LUMA_IMAGE_OVERRIDES[e.id] || e.coverImage
         ) || getGeneratedEventCover(cleanName),
        name: cleanName,
        description: cleanDescription,
        month: monthStr,
        city: cleanCity,
        country: normalizeCountry(cleanCountry),
        location: formatEventLocation({
          location: cleanLocation,
          city: cleanCity,
          country: cleanCountry,
        }),
        registrationUrl: cleanRegistrationUrl,
        website: cleanWebsite,
        url: externalUrl || '',
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

const EVENTS_CACHE_TTL_MS = 5 * 60 * 1000;
let eventsCache: { value: Web3Event[]; expiresAt: number } | null = null;

export async function getEvents(): Promise<Web3Event[]> {
  if (eventsCache && eventsCache.expiresAt > Date.now()) return eventsCache.value;

  const events = await loadEvents();
  eventsCache = { value: events, expiresAt: Date.now() + EVENTS_CACHE_TTL_MS };
  return events;
}

export async function getEventBySlug(slug: string): Promise<Web3Event | null> {
  const events = await getEvents();
  const normalized = slug.toLowerCase().trim();

  // 1. Try exact slug match with current clean generator
  let found = events.find(e => getEventSlug(e) === normalized);
  if (found) return found;

  // Existing event links used descriptive root slugs before abbreviations.
  // Only redirect an old URL when it identifies exactly one current event.
  const legacyMatches = events.filter((event) =>
    getLegacyEventSlug(event) === normalized
    || getReadableLegacyEventSlug(event) === normalized
  );
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

export async function getRelatedEvents(
  currentEvent: Web3Event,
  limit: number = 3,
  allEvents?: Web3Event[]
): Promise<Web3Event[]> {
  const events = allEvents ?? await getEvents();
  const currentEcosystems = getEventEcosystems(currentEvent);
  const currentType = getEventType(currentEvent);

  return events
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
