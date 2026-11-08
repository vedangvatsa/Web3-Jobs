/**
 * Pure ECMAScript Module for social share path suffixes and public page aliases.
 * Imported safely by next.config.mjs (native Node ESM) and src/lib/social-share.ts.
 */

export const SOCIAL_UTM_MAP = {
  li: { utm_source: 'linkedin', utm_medium: 'social' },
  linkedin: { utm_source: 'linkedin', utm_medium: 'social' },
  x: { utm_source: 'x', utm_medium: 'social' },
  tw: { utm_source: 'twitter', utm_medium: 'social' },
  twitter: { utm_source: 'twitter', utm_medium: 'social' },
  yt: { utm_source: 'youtube', utm_medium: 'social' },
  youtube: { utm_source: 'youtube', utm_medium: 'social' },
  th: { utm_source: 'threads', utm_medium: 'social' },
  threads: { utm_source: 'threads', utm_medium: 'social' },
  ig: { utm_source: 'instagram', utm_medium: 'social' },
  insta: { utm_source: 'instagram', utm_medium: 'social' },
  instagram: { utm_source: 'instagram', utm_medium: 'social' },
  tg: { utm_source: 'telegram', utm_medium: 'social' },
  telegram: { utm_source: 'telegram', utm_medium: 'social' },
  rd: { utm_source: 'reddit', utm_medium: 'social' },
  reddit: { utm_source: 'reddit', utm_medium: 'social' },
  dc: { utm_source: 'discord', utm_medium: 'social' },
  discord: { utm_source: 'discord', utm_medium: 'social' },
  fc: { utm_source: 'farcaster', utm_medium: 'social' },
  warp: { utm_source: 'warpcast', utm_medium: 'social' },
  farcaster: { utm_source: 'farcaster', utm_medium: 'social' },
  bsky: { utm_source: 'bluesky', utm_medium: 'social' },
  bluesky: { utm_source: 'bluesky', utm_medium: 'social' },
  fb: { utm_source: 'facebook', utm_medium: 'social' },
  facebook: { utm_source: 'facebook', utm_medium: 'social' },
  tt: { utm_source: 'tiktok', utm_medium: 'social' },
  tiktok: { utm_source: 'tiktok', utm_medium: 'social' },
  hn: { utm_source: 'hackernews', utm_medium: 'social' },
  wa: { utm_source: 'whatsapp', utm_medium: 'social' },
  whatsapp: { utm_source: 'whatsapp', utm_medium: 'social' },
  nl: { utm_source: 'newsletter', utm_medium: 'email' },
  email: { utm_source: 'email', utm_medium: 'email' },
};

export const SOCIAL_PATH_SUFFIXES = new Set(Object.keys(SOCIAL_UTM_MAP));

export const PUBLIC_PAGE_ALIASES = {
  '/about': '/community',
  '/docs': '/developers',
  '/api-docs': '/developers',
  '/auth': '/developers',
  '/api-policy': '/api-policy.md',
  '/the-shape-of-ethereum-topological-anomaly-detection': '/shape-of-ethereum',
  '/arbitrum-offchain-labs': '/offchain-labs',
  '/arbitrum': '/offchain-labs',
  '/certik-detailed': '/certik',
  '/aztec-labs-privacy-l2': '/aztec',
  '/aztec-labs': '/aztec',
  '/aztec-network': '/aztec',
  '/tools/interview-questions': '/interview-questions',
  '/tools/salary-calculator': '/salary-calculator',
  '/tools/resume-builder': '/resume-builder',
  '/tools': '/',
  '/guides/web3-salaries': '/salary-calculator',
  '/guides': '/',
  '/what-is-bitcoin': '/bitcoin',
  '/what-is-ethereum': '/ethereum',
  '/what-is-solana': '/jobs',
  '/what-is-defi': '/defi',
  '/what-is-nft': '/nft',
  '/what-is-web3': '/web3',
  '/what-is-blockchain': '/blockchain',
  '/where-b2b-stablecoin-money-actually-flows': '/b2b-stablecoin-flows',
  '/what-is-dao': '/dao',
  '/what-is-staking': '/staking',
  '/what-is-a-token': '/token',
  '/how-to-build-a-web3-resume': '/how-to-build-a-web3-resume-that-stands-out',
  '/gas-optimization-guide-for-solidity-developers': '/gas-optimization-techniques-for-solidity-developers',
  '/how-to-be-a-good-community-moderator': '/web3-community-manager-career',
  '/deprecation-policy': '/api-policy.md',
  '/versioning-policy': '/api-policy.md',
  '/popups/ns': '/ns',
  '/popups/logos': '/logos-society',
  '/popups/logos-society': '/logos-society',
  '/crypto-tax-bills': '/tax-bills',
  '/nasdaq-tokenized-stocks': '/nasdaq-tokens',
  '/jio': '/jio-perpetuals',
  '/terms-of-use': '/terms-of-use.md',
  '/terms': '/terms-of-use.md',
  '/tos': '/terms-of-use.md',
};

/**
 * Defangs domain-like company names (e.g. "Blockchain.com", "Crypto.com", "Rhino.fi", "pump.fun")
 * for social media sharing by inserting an invisible Zero-Width Space (\u200B) before the dot.
 * This prevents social platforms (X, Telegram, LinkedIn, Threads, Bluesky, Facebook) from auto-linking
 * the company name and scraping their website preview instead of our job preview.
 */
export function sanitizeCompanyForSocial(company) {
  if (typeof company !== 'string' || !company) return company || '';
  return company.replace(/([a-zA-Z0-9_-]+)\.([a-zA-Z]{2,})\b/g, '$1\u200B.$2');
}

