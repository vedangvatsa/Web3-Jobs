import { normalizePopupDashes } from '@/lib/popup-dashes';

function norm(line: string): string {
  return line.replace(/\s+/g, ' ').trim();
}

/** Generic filler added during bulk enrichment — not project-specific facts. */
const GENERIC_FILLER = [
  /^Use the official website as the source of truth for open applications/i,
  /^Directory summaries here are for orientation/i,
  /^When a project runs both permanent hubs and popups/i,
  /^Confirm dates, pricing, and applications on the official site at/i,
];

const SCRAPE_MARKERS = [
  /\bHome About\b/i,
  /\bGet involved Contact\b/i,
  /\bLearn More Deep-tech\b/i,
  /\bSkip to content\b/i,
  /\bPosts Timeline\b/i,
  /\bWho it's for\b/i,
  /\bResource links\b/i,
  /\bFrequently asked questions\b/i,
  /\bPowered by\b/i,
  /\bContinue with Google\b/i,
  /\bRequest Access\b/i,
  /\bJoin the chat\b/i,
  /Collective've\b/i,
  /\bBusiness Residence Publications\b/i,
  /\bGO check out\b/i,
  /\bEvent Gallery\b/i,
  /\bRecurring Event\b/i,
  /\bRead .+Manifesto\b/i,
  /\bBecome an Afropolitan\b/i,
  /\bView All Episodes\b/i,
  /\bSubscribe to The Frontier\b/i,
  /\bTerms of Service Built by\b/i,
  /\bManifesto Community Events Podcast\b/i,
  /\bHand crafted by\b/i,
  /\bJoin Us Founding\b/i,
  /\bJoin Praxis Join Praxis\b/i,
  /\bMembership Content Market Magazine\b/i,
  /\bFlip Reset Enlarge\b/i,
  /\bHow to become a Praxian\b/i,
  /\bText Locky\b/i,
  /\bJoin Residency Text Locky\b/i,
  /\bLearn how you can have an impact\b/i,
  /\bSee what's on Become part of it\b/i,
  /\bWhy Nomad Nation\b/i,
  /\bApply To Join\b/i,
  /\bBecome part of the nomad nation\b/i,
  /\bPieces to the puzzle Themes\b/i,
  /^AI AI is\b/i,
  /^Crypto Viva are\b/i,
  /^Special jurisdictions Viva are\b/i,
  /\bApplications \d+ Population\b/i,
  /\bGNP \(Est\.\)/i,
  /\bmedia coverage from\b/i,
  /^Space [A-Z0-9]/i,
  /^What is [A-Z0-9]+\s+A cultural hub/i,
];

const SLOP_WORDS =
  /\b(seamless(?:ly)?|revolutionary|unlock(?:ing)?|empower(?:ing)?|delve|testament|game-changer|cutting-edge|holistic|comprehensive|pivotal|next-level|without further ado|at its core|dive into|beacon|tapestry|embark|elevate|vibrant|flourishing|maximize human flourishing|lived, daily reality|pioneering concepts)\b/i;

export function isPopupGenericFiller(line: string): boolean {
  const t = norm(line);
  return GENERIC_FILLER.some((re) => re.test(t));
}

/** Hero/nav text split letter-by-letter during HTML scrape. */
export function isPopupSpacedLetterScrape(line: string): boolean {
  const t = norm(line);
  if (/(?:[A-Za-zÀ-ÿ] ){6,}[A-Za-zÀ-ÿ]/.test(t)) return true;
  if (/(?:[A-Z] ){4,}[A-Z]/.test(t) && /LIVE ANYWHERE|N O D E S|L O G I N/i.test(t)) return true;
  return false;
}

export function isPopupSocialMetricScrape(line: string): boolean {
  const t = norm(line);
  return /\d+\s+Views\b/.test(t) || /^\d{1,2}:\d{2}\s+AM\s*·/i.test(t);
}

export function isPopupScrapeCopy(line: string): boolean {
  const t = norm(line);
  if (t.length < 12) return true;
  if (isPopupSpacedLetterScrape(t)) return true;
  if (isPopupSocialMetricScrape(t)) return true;
  if (SCRAPE_MARKERS.some((re) => re.test(t))) return true;
  // Nav-stuffed lines: many short Title Case tokens in a row
  if (/\b(About|Events|Explore|Contact)\b.*\b(About|Events|Explore|Contact)\b/.test(t)) return true;
  return false;
}

export function isPopupSlopCopy(line: string): boolean {
  const t = norm(line);
  if (SLOP_WORDS.test(t)) return true;
  if (/building the future of community, work, and coordination/i.test(t)) return true;
  if (/bridging cutting-edge tech with dense human connection/i.test(t)) return true;
  if (/keeps the copy short on purpose/i.test(t)) return true;
  if (/^\w+ keeps the copy /i.test(t)) return true;
  return false;
}

/** Directory / listicle meta written for editors, not readers. */
const META_DIRECTORY = [
  /\bin this directory\b/i,
  /\blands in this directory\b/i,
  /\bbelongs in this directory\b/i,
  /\bdirectory that often stays deliberately global\b/i,
  /\bin the xyz\.city directory\b/i,
  /\bxyz\.city and Network School directories\b/i,
  /\bon the Network School list\b/i,
  /\bappears in Network School['’]s dashboard\b/i,
  /\bNetwork States dashboard\b/i,
  /\blisted among startup-society experiments\b/i,
  /\badjacent to the network-state conversation\b/i,
  /\bpopup end of the spectrum\b/i,
  /\bcompared with monthlong mega-villages\b/i,
  /\bSydney is the listed base\b/i,
  /\bUse it as a starting point for\b/i,
  /\bgeographically specific in a directory\b/i,
  /\bcultural descendants of that first experiment\b/i,
  /\bone of the clearest (?:South American nodes|US Solana-native entries|African SEZ-style entries)\b/i,
  /\bnot as a coliving brand\b/i,
  /\bon the Network School dashboard\b/i,
  /\bappears on the Network School dashboard\b/i,
  /\bshows up on the Network School dashboard\b/i,
  /\blisted on the Network School dashboard\b/i,
  /\bAlso listed on the\b/i,
  /\bns\.com dashboard\b/i,
  /\bwider startup-society build stack\b/i,
  /\bstartup-society directories\b/i,
  /\bshared across both directories\b/i,
  /\bin the directories\b/i,
  /\blisted in the directories\b/i,
  /\bdirectories place it\b/i,
  /\bnetwork-state adjacency set\b/i,
];

/** Bulk word-count / SEO padding in overview fields. */
const TESTIMONIAL_SCRAPE = [
  /^I['’]m pumped that\b/i,
  /^Their team is always quick to respond\b/i,
  /^A great starting point to get support\b/i,
  /^Additionally, Itana have expatriates\b/i,
];

const METRIC_FRAGMENT = /^(companies incorporated|business setup time|community members)$/i;

const OVERVIEW_PADDING = [
  /^Follow [a-z0-9.-]+\.[a-z]{2,}\b/i,
  /^Check docs\./i,
  /^Cities, pricing, and registration windows are posted on\b/i,
  /^Organizers publish\b/i,
  /^[\wÀ-ÿ][\wÀ-ÿ'’-]* publishes (?:its |master-plan|village documentation)/i,
  /^[\wÀ-ÿ][\wÀ-ÿ'’-]* lists Genesis Program\b/i,
  /^[\wÀ-ÿ][\wÀ-ÿ'’-]* maintains village governance notes\b/i,
  /^[\wÀ-ÿ][\wÀ-ÿ'’-]* experiments with governance tooling and posts active community links\b/i,
  /^Netxstate publishes governance experiments and popup coordination tools\b/i,
  /^Web3 Villages announces incubator popups\b/i,
  /^Hacker Residency Group opens dated application windows\b/i,
  /^Traditional Dream Factory documents land stewardship\b/i,
];

export function isPopupMetaDirectoryCopy(line: string): boolean {
  const t = norm(line);
  return META_DIRECTORY.some((re) => re.test(t));
}

export function isPopupOverviewPadding(line: string): boolean {
  const t = norm(line);
  if (METRIC_FRAGMENT.test(t)) return true;
  return OVERVIEW_PADDING.some((re) => re.test(t));
}

function isPopupTestimonialScrape(line: string): boolean {
  const t = norm(line);
  return TESTIMONIAL_SCRAPE.some((re) => re.test(t));
}

/** Single-line website feature dumps with no real sentence structure. */
function isPopupFeatureListDump(line: string): boolean {
  const t = norm(line);
  if (t.length < 120) return false;
  const periods = (t.match(/[.!?]/g) ?? []).length;
  if (periods >= 1) return false;
  // Real prose usually has conjunctions / relative clauses.
  if (/\b(while|which|that|where|because|with the|for a|from .+ to)\b/i.test(t)) return false;
  const caps = t.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}/g) ?? [];
  return caps.length >= 5;
}

/** Exact-line rewrites before scrub (preserves facts, drops meta framing). */
export const POPUP_LINE_REWRITES: Record<string, string> = {
  'The first v1 cohort ran in Forest City, Malaysia before the program reopened in Kazakhstan. The project sits at the center of the broader Network States dashboard and hosts Layer-2 efforts like Arc.':
    'The first v1 cohort ran in Forest City, Malaysia before the program reopened in Kazakhstan. The campus hosts Layer-2 efforts such as Arc alongside other startup-society projects.',
  'It is one of the clearest South American nodes in both the xyz.city and Network School directories.':
    'Buenos Aires popups and on-chain tooling experiments have made Crecimiento a reference point for Argentina’s crypto builder scene.',
  'It sits on the popup end of the spectrum, closer to community meetups than to jurisdiction experiments.':
    'Editions rotate through cities; see the official Luma calendar for the next Cafe Cursor takeover.',
  'It is one of the clearest US Solana-native entries on the Network School list.':
    'Salt Lake City editions pair dense coworking with summit programming and Demo Day.',
  'It appears in Network School’s dashboard as a national-scale startup city bet.':
    'GMC’s charter ties mindfulness and governance to a long-horizon SEZ buildout in southern Bhutan.',
  'It belongs in this directory as digital jurisdiction infrastructure, not as a coliving brand.':
    'Palau-backed digital residency is the product; rns.id covers enrollment and policy updates.',
  'The Texas aerospace city known as Starbase, listed among startup-society experiments.':
    'The Texas aerospace city known as Starbase, shaping launch operations near Boca Chica.',
  'It lands in this directory as a large-scale startup city adjacent to the network-state conversation.':
    'Starbase is the municipal name for SpaceX’s Boca Chica launch campus in Cameron County, Texas.',
  'Most Zu-named projects in this directory are cultural descendants of that first experiment.':
    'Later Zu-branded villages and fellowships trace much of their culture back to Zuzalu’s Montenegro cohort.',
  'The brand is geographically specific in a directory that often stays deliberately global.':
    'Addis Ababa host teams anchor the brand while conferences and residencies rotate with local partners.',
  'Use it as a starting point for Ethiopia-facing builder gatherings.':
    'Builders use Eth-iopia editions to meet Ethiopia-based founders before committing to longer stays.',
  'Sydney is the listed base, with culture, tech, and governance themes around the edges.':
    'Arrayah runs Sydney-rooted popups and shorter residencies for founders, artists, and researchers.',
  'It is a smaller-scale entry compared with monthlong mega-villages.':
    'Culture, tech, and governance show up across editions rather than as one fixed monthlong campus.',
  'The framing is jurisdictional and commercial more than temporary coliving.':
    'Companies incorporate through Itana’s digital zone rather than joining a temporary coliving cohort.',
  'It is one of the clearest African SEZ-style entries in the xyz.city directory.':
    'Itana targets technology and service companies that want Lagos incorporation with digital-zone tooling.',
  'It appears on the Network School dashboard as part of the wider startup-society build stack.':
    'Samal Island in the Philippines hosts ArkPad’s Reef Resort demo, combining floating units with hexafarm aquaculture.',
  'Da Nang is the current geographic anchor listed on the Network School dashboard.':
    'Da Nang, Vietnam hosts HRG’s monthlong villa residencies for indie hackers.',
  'It shows up on the Network School dashboard as a European permanent node.':
    'The village sits on a former poultry farm in Abela, Portugal, west of Lisbon.',
  'It is more urban development than crypto popup, but it shows up in the same startup-society directories.':
    'Culdesac’s Tempe neighborhood is car-free year-round housing, not a traveling popup calendar.',
  'It is one of the main East African entries shared across both directories.':
    'Fumba Town editions put East African and international builders in the same coliving cohort.',
  'Bangkok is a recurring geography in the directories, with Discord and Telegram as coordination layers.':
    'Bangkok editions anchor much of the programming, with Discord and Telegram coordinating between villages.',
  'The footprint is distributed by design, with small resident counts listed in the directories.':
    'Each city node keeps a small resident count while Alpha coordinates standards across the federation.',
  'The directories place it in the network-state adjacency set because of governance and decentralization goals.':
    'Governance and decentralization tooling are the through-line, not a single coliving campus.',
  'Community Itana Digital Residency A private, curated community for founders, business owners, and professionals who want to build, grow, and invest in Africa.':
    'Itana Digital Residency is a private, curated community for founders, business owners, and professionals who want to build, grow, and invest in Africa.',
};

export function rewritePopupLine(line: string): string {
  const t = norm(line);
  return normalizePopupDashes(POPUP_LINE_REWRITES[t] ?? t);
}

export function shouldDropPopupLine(line: string): boolean {
  const t = norm(line);
  if (/^How (does|do|is|are|can|will|much)\b.+\?$/i.test(t)) return true;
  if (/How can you get involved\?/i.test(t)) return true;
  if (/View in Telegram Preview/i.test(t)) return true;
  if (/^(?:["”]\s*|\u201d\s*)[A-Za-z]/.test(t)) return true;
  if (/^(Find your people|Upgrade your thinking|Live in paradise)\b/i.test(t)) return true;
  if (/Get in touch What are people saying/i.test(t)) return true;
  if (/^full-time residents$/i.test(t)) return true;
  if (isPopupSpacedLetterScrape(t)) return true;
  if (isPopupSocialMetricScrape(t)) return true;
  return (
    isPopupGenericFiller(t) ||
    isPopupScrapeCopy(t) ||
    isPopupSlopCopy(t) ||
    isPopupMetaDirectoryCopy(t) ||
    isPopupOverviewPadding(t) ||
    isPopupTestimonialScrape(t) ||
    isPopupFeatureListDump(t)
  );
}

export function scrubPopupLines(lines: string[] | undefined): string[] {
  if (!lines?.length) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of lines) {
    const t = norm(raw);
    if (!t || shouldDropPopupLine(t)) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export function formatPopupPricingSummary(pricing: string[], fallback?: string | null): string | null {
  const parts = scrubPopupLines(pricing);
  if (parts.length) return parts.join(' · ');
  const fb = fallback ? norm(fallback) : '';
  if (!fb || shouldDropPopupLine(fb)) return null;
  return fb.replace(/\s{2,}/g, ' ').replace(/([.!?])\s*/g, '$1 ').trim();
}
