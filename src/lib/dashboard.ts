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
    agenticPaymentsTotalVolume?: string;
    lendingTotalBorrowed?: string;
    cumulativeAdjustedVolume?: string;
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
  agenticPayments?: {
    totalVolume: string;
    organicVolume: string;
    medianTxnSize: string;
    totalTransactions: string;
    buyerWallets: string;
    merchantWallets: string;
    protocolBreakdown: Array<{
      protocol: string;
      totalVolume: string;
      organicVolume: string;
      transactions: string;
      medianTxn: string;
      buyerWallets: string;
      merchantWallets: string;
      share: number;
      color?: string;
    }>;
    serviceCategories: Array<{
      name: string;
      share: number;
      color?: string;
    }>;
    summary: string;
  };
  stablecoinLending?: {
    totalBorrowed: string;
    totalRepaid: string;
    totalBorrowsCount: string;
    avgDailyLoanSize: string;
    outstandingLoans: string;
    topProtocols: Array<{
      name: string;
      volume: string;
      share: number;
      chains: string;
      color?: string;
    }>;
    topStablecoinsBorrowed: Array<{
      symbol: string;
      volume: string;
      share: number;
      color?: string;
    }>;
  };
  transactionsSignal?: {
    totalGrossVolume: string;
    adjustedVolume: string;
    totalGrossTransactions: string;
    adjustedTransactions: string;
    retailAdjustedVolume: string;
    retailAdjustedCount: string;
    botFilteredRatio: string;
    sub100DollarTransferRatio: string;
    topPairsAdjusted: Array<{
      pair: string;
      volume: string;
      txns: string;
      share: number;
      color?: string;
    }>;
  };
  sources: Array<{
    name: string;
    url: string;
  }>;
}

export function getDashboardMetricsSync(): DashboardMetrics {
  return dashboardData as DashboardMetrics;
}
