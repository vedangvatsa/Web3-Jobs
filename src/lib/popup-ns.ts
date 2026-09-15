/** Hashtag Web3 slug → ns.com dashboard path segment */
const NS_DASHBOARD_PATH: Record<string, string> = {
  ns: 'network-school',
  edge: 'edge-city',
  forma: 'forma-city',
  creci: 'crecimiento',
  ft: 'frontier-tower',
  zucity: 'zujapan',
  akiya: 'akiya-collective',
  amagi: 'amagi-life',
  arc: 'arc-city',
  blc: 'bitcoin-learning-center',
  cc: 'cafe-cursor',
  morazan: 'ciudad-morazan',
  commons: 'commons-hub',
  gelephu: 'gmc',
  ipe: 'ipe-city',
  noma: 'noma-collective',
  proto: 'proto-town',
  rns: 'rns-id',
  shw: 'shanhaiwoo',
  mu: 'the-mu',
  tdf: 'traditional-dream-factory',
  vibe: 'vibecamp',
  zugrama: 'zu-grama',
  zui: 'zuitzerland',
};

const NS_DASHBOARD_DIRECT = new Set([
  'prospera',
  '4seas',
  'arkpad',
  'culdesac',
  'zuberlin',
  'hrg',
  'infinita',
  'mtndao',
  'nomad',
  'starbase',
  'zanzalu',
  'zuafrique',
  'zukas',
  'zuzalu',
]);

export function getNsDashboardUrl(slug: string): string | null {
  const path = NS_DASHBOARD_PATH[slug] ?? (NS_DASHBOARD_DIRECT.has(slug) ? slug : null);
  return path ? `https://ns.com/dashboard/${path}` : null;
}
