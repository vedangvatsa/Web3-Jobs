import dashboardData from '../../content/dashboard-metrics.json';

export interface DashboardMetrics {
  updatedAt: string;
  overview: {
    totalStablecoinMarketCap: string;
    tokenizedTreasuriesMarketCap: string;
    visaAdjustedVolume30d: string;
    activePaymentAddresses30d: string;
    totalDeFiTvl: string;
    dex24hVolume: string;
    fees24h: string;
    botFilteredVolume30d: string;
  };
  topStablecoins: Array<{
    name: string;
    symbol: string;
    amount: string;
    rawAmount: number;
    share: number;
    chains: number;
    color?: string;
  }>;
  topSettlementChains: Array<{
    name: string;
    amount: string;
    rawAmount: number;
    share: number;
    color?: string;
  }>;
  topDeFiChains: Array<{
    name: string;
    tokenSymbol: string;
    tvl: string;
    rawTvl: number;
    share: number;
    color?: string;
  }>;
  topSectors: Array<{
    name: string;
    tvl: string;
    rawTvl: number;
    share: number;
    color?: string;
  }>;
  topDexs: Array<{
    name: string;
    volume24h: string;
    raw24h: number;
    change_1d?: number;
    chains: string[];
  }>;
  topFeeGenerators: Array<{
    name: string;
    category: string;
    fee24h: string;
    rawFee: number;
    change_1d?: number;
  }>;
  recentHacks: Array<{
    name: string;
    date: string;
    amount: string;
    technique: string;
    chain: string;
  }>;
  tokenizedTreasuries: Array<{
    name: string;
    issuer: string;
    symbol: string;
    tvl: string;
    share: number;
    chains: string;
    yieldApy?: string;
  }>;
  visaAnalytics: {
    adjustedMonthlyVolume: string;
    rawReportedVolume?: string;
    botFilteredRatio?: string;
    activeAddresses30d: string;
    organicVolumeRatio: string;
    institutionalSettlementRunRate: string;
    summary: string;
  };
  sources: Array<{
    name: string;
    url: string;
  }>;
}

export function getDashboardMetricsSync(): DashboardMetrics {
  return dashboardData as DashboardMetrics;
}
