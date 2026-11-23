import grantsMeta from '../../content/grants-meta.json';

/**
 * Published grant count for marketing copy (client-safe JSON import).
 * Regenerate via `npx tsx scripts/generate-slug-types.ts` when grants.json changes.
 */
export function getGrantsCount(): number {
  return typeof grantsMeta.total === 'number' && grantsMeta.total > 0 ? grantsMeta.total : 0;
}

export function getGrantsCountPlusLabel(): string {
  return `${getGrantsCount()}+`;
}

export function getGrantsPageDiscoverDescription(): string {
  return `Discover ${getGrantsCountPlusLabel()} active, verified Web3 ecosystem grants, non-dilutive open-source funding, and builder cloud credits from Ethereum, Solana, Arbitrum, AWS, Google Cloud, and global foundations.`;
}

export function getGrantsOgDiscoverDescription(): string {
  return `Discover ${getGrantsCountPlusLabel()} active, verified Web3 ecosystem grants, non-dilutive open-source funding, and builder credits from top foundations and cloud providers.`;
}

export function getGrantsSitelinkDescription(): string {
  return `Curated directory of ${getGrantsCountPlusLabel()} active Web3 ecosystem grants and builder credits.`;
}