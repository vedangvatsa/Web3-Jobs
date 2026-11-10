export interface Top100Scores {
  hiringVolume: number;       // Scaled score based on verified active job count (0-60)
  departmentBreadth: number;  // Score based on count of hiring functional departments (0-20)
  remoteFlexibility: number;  // Score based on percentage of roles available remotely (0-10)
  salaryTransparency: number; // Score based on percentage of roles disclosing pay (0-10)
  composite: number;          // Total score (0-100)
}

export interface Top100Employer {
  rank: number;
  slug: string;
  name: string;
  category: string;
  website: string;
  headquarters: string;
  founded?: number;
  activeJobs: number;
  departmentCount: number;
  remotePercentage: number;
  salaryTransparencyPct: number;
  salaryBenchmark?: string;
  scores: Top100Scores;
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
