import fs from 'fs';
import path from 'path';

const COMPANY_LOGO_ALIASES: Record<string, string> = {
  '1inch-network': '1inch',
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
  'ritual-ai-web3': 'ritual',
  'ritual': 'ritual',
  'nomic-foundation': 'nomic-foundation',
  'nomic': 'nomic-foundation',
  'nomicfoundation': 'nomic-foundation',
  'hyperliquid': 'hyperliquid-labs',
  'hyperliquid-labs': 'hyperliquid-labs',
  'hyperliquidlabs': 'hyperliquid-labs',
  'a16z-crypto': 'a16z',
  'a16zcrypto': 'a16z',
  'a16z': 'a16z',
  'grass': 'wynd-labs',
  'bob': 'bob-build-on-bitcoin',
  'bob-build-on-bitcoin': 'bob-build-on-bitcoin',
  'provable': 'provable-aleo',
  'provable-aleo': 'provable-aleo',
  'wincent': 'wincent-market-maker',
  'wincent-market-maker': 'wincent-market-maker',
  'grayscale': 'grayscale-investments',
  'grayscale-investments': 'grayscale-investments',
  'offchain-labs': 'arbitrum',
  'offchainlabs': 'arbitrum',
  'arbitrum': 'arbitrum',
  'arbitrum-offchain-labs': 'arbitrum',
  'dune-analytics': 'dune',
  'duneanalytics': 'dune',
  'arbitrum-opco': 'arbitrum',
};

const COMPANY_FAVICON_DOMAINS: Record<string, string> = {
  '6sense': '6sense.com',
  'affirm': 'affirm.com',
  'airbnb': 'airbnb.com',
  'algolia': 'algolia.com',
  'alpaca': 'alpaca.markets',
  'anthropic': 'anthropic.com',
  'axios': 'axios.com',
  'bitwarden': 'bitwarden.com',
  'bugcrowd': 'bugcrowd.com',
  'bybit': 'bybit.com',
  'censys': 'censys.com',
  'cloudflare': 'cloudflare.com',
  'coinbase': 'coinbase.com',
  'collibra': 'collibra.com',
  'cresta': 'cresta.com',
  'cribl': 'cribl.io',
  'databricks': 'databricks.com',
  'datadog': 'datadoghq.com',
  'descript': 'descript.com',
  'dropbox': 'dropbox.com',
  'fivetran': 'fivetran.com',
  'five9': 'five9.com',
  'fleetio': 'fleetio.com',
  'gemini': 'gemini.com',
  'gitlab': 'gitlab.com',
  'gofundme': 'gofundme.com',
  'hopskipdrive': 'hopskipdrive.com',
  'hubspot': 'hubspot.com',
  'instacart': 'instacart.com',
  'jetbrains': 'jetbrains.com',
  'jfrog': 'jfrog.com',
  'jumio': 'jumio.com',
  'justworks': 'justworks.com',
  'karat': 'karat.com',
  'launchdarkly': 'launchdarkly.com',
  'leaflink': 'leaflink.com',
  'life360': 'life360.com',
  'liftoff': 'liftoff.io',
  'mercury': 'mercury.com',
  'mixpanel': 'mixpanel.com',
  'monzo': 'monzo.com',
  'mozilla': 'mozilla.org',
  'natera': 'natera.com',
  'neo4j': 'neo4j.com',
  'nextiva': 'nextiva.com',
  'openai': 'openai.com',
  'pagerduty': 'pagerduty.com',
  'pandadoc': 'pandadoc.com',
  'pinterest': 'pinterest.com',
  'qualtrics': 'qualtrics.com',
  'reddit': 'redditinc.com',
  'salesloft': 'salesloft.com',
  'samsara': 'samsara.com',
  'seatgeek': 'seatgeek.com',
  'sezzle': 'sezzle.com',
  'shakepay': 'shakepay.com',
  'shieldai': 'shield.ai',
  'skydio': 'skydio.com',
  'smartsheet': 'smartsheet.com',
  'snorkel-ai': 'snorkel.ai',
  'stockx': 'stockx.com',
  'tailscale': 'tailscale.com',
  'typeform': 'typeform.com',
  'upstart': 'upstart.com',
  'vercel': 'vercel.com',
  'veriff': 'veriff.com',
  'waymo': 'waymo.com',
  'webflow': 'webflow.com',
  'ziprecruiter': 'ziprecruiter.com',
};

function faviconUrlForDomain(domain: string): string {
  return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
}

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
    const targetHost = host.includes('franklintempleton.com') ? 'careers.franklintempleton.com' : host;
    return faviconUrlForDomain(targetHost);
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
  const normalizedSlug = companySlug.toLowerCase();
  const alias = COMPANY_LOGO_ALIASES[normalizedSlug];
  const domain = COMPANY_FAVICON_DOMAINS[normalizedSlug] ?? (alias ? COMPANY_FAVICON_DOMAINS[alias] : null);
  if (domain) return faviconUrlForDomain(domain);

  if (companySlug === 'franklin-templeton' || companySlug === 'franklintempleton') {
    return faviconUrlForDomain('careers.franklintempleton.com');
  }
  if (['arbitrum', 'offchain-labs', 'offchainlabs', 'arbitrum-offchain-labs'].includes(companySlug)) {
    return faviconUrlForDomain('arbitrum.io');
  }
  // Convert slug back to a plausible domain (slug without hyphens + .com)
  return faviconUrlForDomain(companySlug.replace(/-/g, '') + '.com');
}
