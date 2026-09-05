/**
 * Authoritative guard rules for identifying general applications, talent pools,
 * ATS placeholder / test job postings, and non-Web3/unrelated domain roles
 * that must never be published as standalone roles.
 */

const GENERAL_APP_REGEX = /(general application|general interest|general opening|general opportunity|expression of interest|talent community|talent pool|talent network|future opportunities|future consideration|future builders|future roles|join our talent|dream job|spontaneous application|open position|open application|speculative application|unsolicited application|general pool|general submission|register your interest|submit your (?:cv|resume)|create your own role|don.?t see (?:a|your|the|any) role|role that fits|can.?t find (?:a|your) role|looking for something else|stay in touch|keep in touch|connect with us|work with us|join our team\s*\(general\)|general candidate pool)/i;

const PLACEHOLDER_TITLE_PATTERNS = [
  'default template',
  'new job template',
  'test job',
  '(sample)',
  'test',
  'testextrenal',
  '[template] default template',
];

/**
 * Disqualifies completely non-tech / non-Web3 roles that indicate a wrong ATS slug
 * was configured (e.g. biotech, clinical labs, dental, agriculture).
 */
const NON_WEB3_DISQUALIFIED_REGEX = /\b(flow cytometry|profiling lab|wet lab|histology|assay development|molecular biology|in vitro|in vivo|clinical trial|physician|surgeon|dentist|dental hygienist|registered nurse|pharmacist|pharmacology|medical doctor|veterinarian|livestock|agronomist)\b/i;

export function isGeneralOrPlaceholderJobTitle(title: string | null | undefined): boolean {
  if (!title) return true;
  const t = title.toLowerCase().trim();

  if (PLACEHOLDER_TITLE_PATTERNS.some((p) => t.includes(p) || t === p)) {
    return true;
  }

  return GENERAL_APP_REGEX.test(t);
}

export function isUnrelatedOrNonWeb3JobTitle(title: string | null | undefined): boolean {
  if (!title) return false;
  return NON_WEB3_DISQUALIFIED_REGEX.test(title);
}

/**
 * Rejects invalid search result URLs, generic ATS portal roots, or broken query links.
 */
export function isInvalidJobLink(link: string | null | undefined): boolean {
  if (!link || !link.trim()) return true;
  const l = link.toLowerCase().trim();
  if (
    l.includes('/search-results') ||
    l.includes('keywords=') ||
    l.includes('search_query=') ||
    l.includes('search-jobs')
  ) {
    return true;
  }
  return false;
}

const KNOWN_COMPANY_CLEAN_MAP: Record<string, string> = {
  'ritual (ai + web3)': 'Ritual',
  'hyperbolic (ai + web3)': 'Hyperbolic',
  'consensys (metamask)': 'Consensys',
  'arbitrum (offchain labs)': 'Arbitrum',
  'aztec labs (privacy l2)': 'Aztec Labs',
  'helius (solana infra)': 'Helius',
  'grass (wynd labs depin)': 'Grass',
  'optimism (op labs)': 'Optimism',
  'mysten labs (sui)': 'Mysten Labs',
  'bob (build on bitcoin)': 'BOB',
  'wincent (market maker)': 'Wincent',
  'provable (aleo)': 'Provable',
  'zerogravity (0g ai)': '0G Labs',
  'succinct labs (zk)': 'Succinct Labs',
  'sky (makerdao)': 'Sky',
  'symbiotic restaking': 'Symbiotic',
};

/**
 * Normalizes company names, stripping descriptive ATS parenthetical tags,
 * legal suffixes, and maps to clean canonical brand names.
 */
export function cleanCompanyName(company: string | null | undefined): string {
  if (!company) return 'Web3';
  const raw = company.trim();
  const lower = raw.toLowerCase();
  if (KNOWN_COMPANY_CLEAN_MAP[lower]) {
    return KNOWN_COMPANY_CLEAN_MAP[lower];
  }

  return raw
    .replace(/\s*\((?:ai\s*\+?\s*web3|solana\s*infra|privacy\s*l2|depin|zk|aleo|sui|market\s*maker|build\s*on\s*bitcoin|makerdao|op\s*labs|offchain\s*labs)\)/gi, '')
    .replace(/\s+(?:inc\.?|llc\.?|ltd\.?|corp\.?)$/i, '')
    .trim();
}

/**
 * Universal job opening validator used during ingestion and pre-render.
 */
export function isConcreteJobOpening(title: string | null | undefined, link?: string | null): boolean {
  if (!title) return false;
  if (isGeneralOrPlaceholderJobTitle(title)) return false;
  if (isUnrelatedOrNonWeb3JobTitle(title)) return false;
  if (link && isInvalidJobLink(link)) return false;
  return true;
}

export function validateJobPosting(job: {
  title?: string | null;
  company?: string | null;
  link?: string | null;
}): { valid: boolean; reason?: string } {
  if (!job.title || !job.title.trim()) {
    return { valid: false, reason: 'Missing job title' };
  }
  if (isGeneralOrPlaceholderJobTitle(job.title)) {
    return { valid: false, reason: `General application or placeholder title: ${job.title}` };
  }
  if (isUnrelatedOrNonWeb3JobTitle(job.title)) {
    return { valid: false, reason: `Non-Web3 / unrelated domain title: ${job.title}` };
  }
  if (isInvalidJobLink(job.link)) {
    return { valid: false, reason: `Invalid or search-result application link: ${job.link}` };
  }
  return { valid: true };
}
