import fs from 'fs';
import path from 'path';

const COMPANY_LOGO_ALIASES: Record<string, string> = {
  'kappa-lab-ltd': 'kappa-lab-ltd',
  'kappa-lab': 'kappa-lab-ltd',
  'kappalab': 'kappa-lab-ltd',
  'kappalab-ltd': 'kappa-lab-ltd',
  'chainlink': 'chainlink-labs',
  'ethena-labs': 'ethena',
  'hedera-hashgraph': 'hedera',
  'ava-labs': 'ava',
  'animoca-brands': 'animoca-brands',
  'animocabrands': 'animoca-brands',
  'animoca': 'animoca-brands',
  'bnb-chain': 'bnb-chain',
  'bnbchain': 'bnb-chain',
  'pioneer-services': 'bnb-chain',
  'pancakeswap': 'pancakeswap',
  'aster': 'aster',
  'asterdex': 'aster',
  'aster-dex': 'aster',
  'delta': 'delta-exchange',
  'delta-exchange': 'delta-exchange',
  'coindcx': 'coindcx',
  'coin-dcx': 'coindcx',
  'aztec-labs-privacy-l2': 'aztec',
  'aztec-labs': 'aztec',
  'symbiotic-restaking': 'symbiotic',
  'symbiotic': 'symbiotic',
  'wynd-network': 'wynd-labs',
  'grass-wynd-labs-depin': 'wynd-labs',
  'wynd-labs': 'wynd-labs',
  'helius-solana-infra': 'helius',
  'helius': 'helius',
  'liminal': 'liminal-custody',
  'liminal-custody-tech': 'liminal-custody',
  'liminal-custody': 'liminal-custody',
  'microstrategy': 'strategy',
  'strategy': 'strategy',
  'pricewaterhousecoopers': 'pwc',
  'pwc': 'pwc',
  'franklintempleton': 'franklin-templeton',
  'franklin-templeton': 'franklin-templeton',
};

const LOGO_PATHS = (slug: string): string[] => {
  const candidates = [slug];
  const alias = COMPANY_LOGO_ALIASES[slug.toLowerCase()];

  if (alias) candidates.push(alias);

  return candidates.flatMap((candidate) => {
    const lower = candidate.toLowerCase();
    return [
      `/logo/companies/${candidate}.webp`,
      `/logo/companies/${lower}.webp`,
      `/logo/job/${candidate}.webp`,
      `/logo/job/${lower}.webp`,
      `/logo/partners/${candidate}.webp`,
      `/logo/partners/${lower}.webp`,
      `/logo/companies/${candidate}.png`,
      `/logo/companies/${candidate}.jpg`,
      `/logo/companies/${candidate}.svg`,
      `/logo/companies/${lower}.png`,
      `/logo/job/${candidate}.png`,
      `/logo/job/${candidate}.jpg`,
      `/logo/job/${candidate}.svg`,
      `/logo/job/${lower}.png`,
      `/logo/partners/${candidate}.png`,
      `/logo/partners/${lower}.png`,
    ];
  });
};

export function resolveCompanyLogo(companySlug: string): string | null {
  for (const relPath of LOGO_PATHS(companySlug)) {
    try {
      if (fs.existsSync(path.join(process.cwd(), 'public', relPath))) {
        return relPath;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export function getCompanyFaviconUrl(website: string | null | undefined): string | null {
  if (!website || !website.trim()) return null;
  try {
    const host = new URL(website.startsWith('http') ? website : `https://${website}`).hostname;
    return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${host}&size=128`;
  } catch {
    return null;
  }
}

/**
 * Derives a best-guess favicon URL from a company slug when no website URL is available.
 * e.g. "decent-xyz" -> https://decent.xyz favicon
 *      "coin-metrics" -> https://coinmetrics.io favicon (guessed from .com)
 */
export function getCompanyFaviconUrlBySlug(companySlug: string): string {
  // Convert slug back to a plausible domain (slug without hyphens + .com)
  const domain = companySlug.replace(/-/g, '') + '.com';
  return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
}
