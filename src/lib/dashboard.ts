import dashboardData from '../../content/dashboard-metrics.json';

export interface DashboardMetrics {
  updatedAt: string;
  overview: {
    totalStablecoinMarketCap: string;
    tokenizedTreasuriesMarketCap: string;
    visaAdjustedVolume30d: string;
    activePaymentAddresses30d: string;
  };
  topStablecoins: Array<{
    name: string;
    symbol: string;
    amount: string;
    rawAmount: number;
    share: number;
    chains: number;
  }>;
  topSettlementChains: Array<{
    name: string;
    amount: string;
    rawAmount: number;
    share: number;
  }>;
  tokenizedTreasuries: Array<{
    name: string;
    issuer: string;
    symbol: string;
    tvl: string;
    share: number;
    chains: string;
  }>;
  visaAnalytics: {
    adjustedMonthlyVolume: string;
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
