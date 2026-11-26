import type { FreeCryptoApiCatalog, FreeCryptoApiCategory, FreeCryptoApiListing } from '@/types';
import catalogJson from '../../content/crypto-apis/listings.json';

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

export const FREE_CRYPTO_APIS_SOURCE = 'https://freecryptoapis.com';

export function getFreeCryptoApiCatalogSync(): FreeCryptoApiCatalog {
  return catalog;
}

export function getFreeCryptoApisSync(): FreeCryptoApiListing[] {
  return catalog.listings;
}

export function getFreeCryptoApiCategories(): FreeCryptoApiCategory[] {
  return catalog.categories;
}

export function getFreeCryptoApisVerifiedOn(): string {
  return catalog.verifiedOn;
}

export function freeCryptoApiDetailUrl(listing: FreeCryptoApiListing): string {
  return `${FREE_CRYPTO_APIS_SOURCE}${listing.path}`;
}

export function freeCryptoApiPageDescription(total: number): string {
  return `Browse ${total} crypto data, RPC, and execution APIs with documented free tiers. Filter by category, keyless access, MCP, and x402. Data from freecryptoAPIs.`;
}