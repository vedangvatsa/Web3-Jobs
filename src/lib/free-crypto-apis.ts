import type { FreeCryptoApiCatalog, FreeCryptoApiCategory, FreeCryptoApiListing } from '@/types';
import catalogJson from '../../content/crypto-apis/listings.json';
import logoMapJson from '../../content/crypto-apis/logo-map.json';

const logoMap = logoMapJson as Record<string, string>;

type RawCatalog = {
  verifiedOn: string;
  categories: FreeCryptoApiCategory[] | Record<string, string>;
  listings: FreeCryptoApiListing[];
};

const raw = catalogJson as RawCatalog;

function normalizeCategories(
  categories: RawCatalog['categories'],
): FreeCryptoApiCategory[] {
  if (Array.isArray(categories)) return categories;
  return Object.entries(categories)
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

const catalog: FreeCryptoApiCatalog = {
  verifiedOn: raw.verifiedOn,
  categories: normalizeCategories(raw.categories),
  listings: raw.listings,
};

export const FREE_CRYPTO_APIS_SOURCE = 'https://hashtagweb3.com/freeapis';

export function getFreeCryptoApiCatalogSync(): FreeCryptoApiCatalog {
  return catalog;
}

export function getFreeCryptoApisSync(): FreeCryptoApiListing[] {
  return catalog.listings;
}

export function getFreeCryptoApiBySlug(slug: string): FreeCryptoApiListing | undefined {
  const norm = slug.toLowerCase().trim();
  return catalog.listings.find((item) => item.slug.toLowerCase().trim() === norm);
}

export function getRelatedCryptoApis(current: FreeCryptoApiListing, count = 3): FreeCryptoApiListing[] {
  const others = catalog.listings.filter((item) => item.slug !== current.slug);
  const sameCategory = others.filter((item) => item.category === current.category);
  const combined = [...sameCategory, ...others];
  const unique = Array.from(new Set(combined));
  return unique.slice(0, count);
}

export function getFreeCryptoApiCategories(): FreeCryptoApiCategory[] {
  return catalog.categories;
}

export function getFreeCryptoApisVerifiedOn(): string {
  return catalog.verifiedOn;
}

export function getFreeCryptoApiLogo(slug: string): string | null {
  return logoMap[slug.toLowerCase().trim()] || null;
}

export function freeCryptoApiDetailUrl(listing: FreeCryptoApiListing): string {
  return `/${listing.slug}`;
}

export function freeCryptoApiPageDescription(total: number): string {
  return `Browse ${total} crypto data, RPC, and execution APIs with documented free tiers. Filter by category, keyless access, MCP, and x402.`;
}
