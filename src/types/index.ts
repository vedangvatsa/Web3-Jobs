

export interface Job {
 id: string;
 title: string;
 company: string;
 link: string;
 /** Canonical employer ATS apply URL when distinct from listing link. */
 applyUrl?: string;
 date: string; // Original source posting date, serialized with an explicit timezone (or UTC date-only).
 dateVerified?: boolean; // false when the source exposes discovery time only
 dateSource?: string;
 dateEvidence?: JobPostingDateEvidence;
 source: string;
 slug?: string;
  location?: string;
  isRemote?: boolean;
  workplaceType?: string;
  department?: string;
  salary?: string;
  description?: string;
 active?: boolean;
}

export interface JobPostingDateEvidence {
  provider: 'breezy';
  url: string;
  checkedAt: string;
  bodySha256: string;
  datePosted: string;
}

import type { ArticleTweetEmbed } from '@/lib/article-tweet-embed';

export interface Article {
 slug: string;
 title: string;
 ogTitle?: string;
 image: string;
 imageCaption?: string;
 imageCreditUrl?: string;
 description: string;
 content: string;
 tweetEmbeds?: ArticleTweetEmbed[];
 rawContent?: string;
  category: string;
  ['data-ai-hint']?: string;
  imageFit?: 'contain' | 'cover';
  publishedDate?: string; // ISO date string e.g."2025-06-01"
 lastUpdated?: string;  // ISO date string, updated on each deploy
}

export interface NewsItem {
 title: string;
 link: string;
 pubDate: string;
 creator: string;
 contentSnippet: string;
 source: string;
}

export interface DigitalNomadVisa {
 country: string;
 continent: 'Europe' | 'Asia' | 'North America' | 'South America' | 'Africa' | 'Oceania';
 minIncome: number; // Monthly income in USD
 visaLength?: string; // Add optional visaLength
 description: string;
 requirements: string[];
}

export interface QuizQuestion {
 id: number;
 question: string;
 options: {
  a: string;
  b: string;
 };
 weights: {
  a: { [key: string]: number };
  b: { [key:string]: number };
 };
}

export interface Web3RoleProfile {
  title: string;
  description: string;
}

export interface QuizResult {
  archetype: string;
  description: string;
  traits: string[];
  roles: Web3RoleProfile[];
}

export interface ResumeData {
 name: string;
 title: string;
 email: string;
 phone?: string;
 website?: string;
 github?: string;
 twitter?: string;
 handle?: string;
 summary: string;
 contributions: {
  project: string;
  role: string;
  description: string;
  link?: string;
 }[];
 experience: {
  company: string;
  role: string;
  date: string;
  description: string;
 }[];
 education: {
  institution: string;
  degree: string;
  date: string;
 }[];
 technicalSkills: string;
 generalSkills: string;
}

export interface JobDescriptionData {
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  salaryRange?: string;
  aboutCompany: string;
  aboutRole: string;
  responsibilities: { value: string }[];
  qualifications: { value: string }[];
  preferredQualifications?: { value?: string }[];
}

export interface Company {
 slug: string;
 name: string;
 website?: string;
 description?: string;
 founded?: string;
 category?: string;
 headquarters?: string;
 about?: string;
 mission?: string;
 culture?: string[];
 benefits?: string[];
 techStack?: string[];
 jobCount: number;
 jobs: Job[];
 lastUpdated: string;
 socialLinks?: {
  linkedin?: string;
  twitter?: string;
  crunchbase?: string;
 };
}

/**
 * Lean projection for client components (search grid). The full Company
 * carries every job posting + long-form copy, which ballooned /companies
 * to 27MB of RSC payload. Only ship what the board renders/searches.
 */
export interface CompanySummary {
 slug: string;
 name: string;
 description?: string;
 jobCount: number;
}

export type GrantCategory =
  | 'All'
  | 'Web3 Ecosystem'
  | 'Global Tech & Open Source'
  | 'Cloud & AI Credits'
  | 'Developer Infra & Tooling';

export type FundingType = 'All' | 'Grant' | 'Credit / Perk' | 'Fellowship' | 'Subsidy';

export interface GrantSourceSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GrantDescriptionSource {
  url: string;
  fetchedAt: string;
  wordCount: number;
  method: string;
  pageTitle?: string;
}

export interface GrantUrlLive {
  checkedAt: string;
  ok: boolean;
  status?: number;
  finalUrl?: string;
  error?: string;
}

export interface FreeCryptoApiCategory {
  slug: string;
  label: string;
}

export interface FreeCryptoApiCatalog {
  verifiedOn: string;
  categories: FreeCryptoApiCategory[];
  listings: FreeCryptoApiListing[];
}

export interface FreeCryptoApiListing {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  freeTier: string;
  freePath: string;
  keyRequired?: string;
  cardRequired?: string;
  chains?: string;
  chainList?: string[];
  allChains?: boolean;
  transports?: {
    rest?: { status: string; sourceUrl?: string; notes?: string };
    websocket?: { status: string; sourceUrl?: string; notes?: string };
  };
  mcp?: { status: string; docsUrl?: string | null; endpoint?: string | null; notes?: string | null };
  x402?: { status: string; url?: string | null; notes?: string | null };
  pricingUrl?: string;
  websiteUrl?: string;
  xProfileUrl?: string;
  path: string;
  notes?: string;
  alsoServes?: string[];
  verifiedOn?: string;
  status?: string;
}

export interface GrantProgram {
  id: string;
  name: string;
  provider: string;
  category: string;
  type: string;
  amount: string;
  description: string;
  url: string;
  domain?: string;
  logo?: string;
  ecosystem?: string;
  tags: string[];
  deadline?: string;
  featured?: boolean;
  /** Source-backed body sections from the official program page (no generated filler). */
  sections?: GrantSourceSection[];
  descriptionSource?: GrantDescriptionSource;
  /** Last HTTP reachability check for the program URL (live catalog gate). */
  urlLive?: GrantUrlLive;
}

export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  url: string;
  prizePool: string;
  submissionPeriod: string;
  location: string;
  ecosystem: string;
  format: string;
  description: string;
  tags: string[];
  featured?: boolean;
}

export interface CbdcProfile {
  id: string;
  slug: string;
  country: string;
  countryCode?: string;
  digitalCurrency: string;
  centralBank: string;
  status: 'Launched' | 'Pilot' | 'Proof of concept' | 'Research' | 'Paused' | 'Cancelled' | string;
  type: string;
  dlt: string;
  announcementYear: string;
  goals: string;
  announcementLink: string;
  crossBorderProject: boolean;
  verifiedOn: string;
}

