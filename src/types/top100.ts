export type StabilityTier =
  | 'Public / NASDAQ'
  | 'Institutional Scale ($10B+)'
  | 'Foundation / Protocol Treasury'
  | 'Profitable Cashflow'
  | 'Tier-1 VC Backed'
  | 'Series B/C Growth'
  | 'Series A/B'
  | 'Growth Stage';

export type CandidateDemandLevel =
  | 'Top 1% Demand'
  | 'Very High'
  | 'High'
  | 'Strong';

export interface Top100Employer {
  rank: number;
  slug: string;
  name: string;
  category: string;
  website: string;
  headquarters: string;
  founded?: number;
  activeJobs: number;
  remotePercentage: number;
  salaryTransparencyPct: number;
  salaryBenchmark?: string;
  stabilityTier: StabilityTier;
  candidateDemandLevel: CandidateDemandLevel;
  candidateMetrics: {
    searchIntentIndex: number;
    talentToStaffRatio: string;
    applicationConversionRate: string;
  };
  scores: {
    hiringScale: number;
    candidateDemand: number;
    financialStability: number;
    workplaceQuality: number;
    composite: number;
  };
  highlightBadges: string[];
  summary: string;
}

export interface Top100IndexData {
  generatedAt: string;
  year: number;
  snapshotLabel: string;
  totalEmployers: number;
  totalActiveJobs: number;
  avgRemotePct: number;
  avgSalaryTransparencyPct: number;
  employers: Top100Employer[];
  sectors: Array<{ name: string; count: number }>;
}
