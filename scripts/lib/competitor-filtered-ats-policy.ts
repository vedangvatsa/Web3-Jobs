/**
 * Boards from competitor REJECT list that are safe for web3-titles-only ingest
 * (correct employer on the ATS board; not a slug collision).
 * See refresh-jobs-cache.ts GREENHOUSE/LEVER/ASHBY entries with web3TitlesOnly.
 */
export const FILTERED_ATS_BLOCK_REASONS = [
  /Careers site/i,
  /slug collision/i,
  /not the crypto employer/i,
  /does not match/i,
  /robotics/i,
  /banking IT/i,
  /Partial ATS/i,
  /Duplicate provider/i,
  /Space Programs/i,
] as const;

/** Employers to skip even when title-filtered (staffing aggregator or all-role keyword noise). */
export const FILTERED_ATS_SKIP_SLUGS = new Set([
  'wealthsimple',
  'onhires',
  'binance',
  'layerzero-labs',
  'consensys-diligence',
  'consensys-mesh',
  'space-id',
  'roofstacks',
]);