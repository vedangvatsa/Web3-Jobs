'use server';

import type { Company, Job } from '@/types';
import { getJobs } from './jobs';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

/**
 * Company content interface for markdown files
 */
interface CompanyContent {
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
}

/**
 * Known ATS/job board hostnames that should NOT be used as company websites
 */
const ATS_HOSTNAMES = new Set([
 'jobs.lever.co', 'jobs.ashbyhq.com', 'job-boards.greenhouse.io',
 'boards.greenhouse.io', 'coinbase.getro.com', 'jobs.multicoin.capital',
 'jobs.solana.com', 'jobs.dragonfly.xyz', 'www.linkedin.com',
 'circle.wd1.myworkdayjobs.com', 'apply.workable.com',
 'jobs.smartrecruiters.com', 'getro.com',
]);

/**
 * Create a URL-safe slug from company name
 */
function createSlug(companyName: string): string {
 return companyName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
}

/**
 * Load company content from markdown file if exists
 */
async function loadCompanyContent(slug: string): Promise<Partial<CompanyContent> | null> {
 try {
  const companiesDir = path.join(process.cwd(), 'content', 'companies');
  const filePath = path.join(companiesDir, `${slug}.md`);
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  return {
   ...data,
   about: content.trim(),
  } as Partial<CompanyContent>;
 } catch (error) {
  // No content file exists, return null
  return null;
 }
}

/**
 * Normalize company name for matching
 */
function normalizeCompanyName(name: string): string {
 return name
  .toLowerCase()
  .replace(/\s+inc\.?$/i, '')
  .replace(/\s+ltd\.?$/i, '')
  .replace(/\s+llc\.?$/i, '')
  .replace(/\s+corp\.?$/i, '')
  .replace(/\s+labs?$/i, '')
  .replace(/[^a-z0-9]/g, '')
  .trim();
}

/**
 * Extract unique companies from job listings
 */
export async function getCompanies(): Promise<Company[]> {
 const jobs = await getJobs();
 
 // Group jobs by company with normalized matching
 const companyMap = new Map<string, Job[]>();
 const nameMap = new Map<string, string>(); // normalized -> original name
 
 jobs.forEach(job => {
  const companyName = job.company.trim();
  const normalized = normalizeCompanyName(companyName);
  
  // Use the first occurrence as the canonical name
  if (!nameMap.has(normalized)) {
   nameMap.set(normalized, companyName);
   companyMap.set(companyName, []);
  }
  
  const canonicalName = nameMap.get(normalized)!;
  companyMap.get(canonicalName)!.push(job);
 });
 
 // Create company objects
 const companies: Company[] = [];
 
 companyMap.forEach((companyJobs, companyName) => {
  const slug = createSlug(companyName);
  
  // Extract website from job links, filtering out ATS platforms
  const firstJobLink = companyJobs[0]?.link || '';
  let website = '';
  try {
   const url = new URL(firstJobLink);
   if (!ATS_HOSTNAMES.has(url.hostname)) {
    website = `${url.protocol}//${url.hostname}`;
   }
  } catch (e) {
   // Invalid URL, leave empty
  }
    // Use most recent job date as lastUpdated instead of build time
   const latestJobDate = companyJobs.reduce((latest, j) => {
    const d = new Date(j.date);
    return d > latest ? d : latest;
   }, new Date(0));

   companies.push({
    slug,
    name: companyName,
    website,
    jobCount: companyJobs.length,
    jobs: companyJobs,
    lastUpdated: latestJobDate.toISOString(),
   });
 });
 
 // Load enriched content for each company
 await Promise.all(
  companies.map(async (company) => {
   const content = await loadCompanyContent(company.slug);
   if (content) {
    Object.assign(company, {
     ...(content.website && { website: content.website }),
     description: content.description,
     founded: content.founded,
     category: content.category,
     headquarters: content.headquarters,
     about: content.about,
     mission: content.mission,
     culture: content.culture,
     benefits: content.benefits,
     techStack: content.techStack,
    });
   }
  })
 );
 
 // Sort by job count (most jobs first)
 companies.sort((a, b) => b.jobCount - a.jobCount);
 
 return companies;
}

/**
 * Get a single company by slug
 */
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
 const jobs = await getJobs();
 
 // Find all jobs for the target company without computing everything
 const companyMap = new Map<string, Job[]>();
 const nameMap = new Map<string, string>();
 let targetCanonicalName: string | null = null;
 
 jobs.forEach(job => {
  const companyName = job.company.trim();
  const normalized = normalizeCompanyName(companyName);
  
  if (!nameMap.has(normalized)) {
   nameMap.set(normalized, companyName);
   companyMap.set(companyName, []);
  }
  
  const canonicalName = nameMap.get(normalized)!;
  companyMap.get(canonicalName)!.push(job);
  
  if (createSlug(canonicalName) === slug) {
   targetCanonicalName = canonicalName;
  }
 });
 
 if (!targetCanonicalName) return null;
 
 const companyJobs = companyMap.get(targetCanonicalName) || [];
 const firstJobLink = companyJobs[0]?.link || '';
 let website = '';
 try {
  const url = new URL(firstJobLink);
  if (!ATS_HOSTNAMES.has(url.hostname)) {
   website = `${url.protocol}//${url.hostname}`;
  }
 } catch (e) {}

 const latestJobDate = companyJobs.reduce((latest, j) => {
  const d = new Date(j.date);
  return d > latest ? d : latest;
 }, new Date(0));

 const company: Company = {
  slug,
  name: targetCanonicalName,
  website,
  jobCount: companyJobs.length,
  jobs: companyJobs,
  lastUpdated: latestJobDate.toISOString(),
 };
 
 // Try to load enriched content
 const content = await loadCompanyContent(slug);
 if (content) {
  Object.assign(company, {
   ...(content.website && { website: content.website }),
   description: content.description,
   founded: content.founded,
   category: content.category,
   headquarters: content.headquarters,
   about: content.about,
   mission: content.mission,
   culture: content.culture,
   benefits: content.benefits,
   techStack: content.techStack,
  });
 }
 
 return company;
}

/**
 * Get company statistics — all computed from real job data
 */
export async function getCompanyStats() {
 const companies = await getCompanies();
 const totalJobs = companies.reduce((sum, c) => sum + c.jobCount, 0);

 // Category distribution (from enriched company profiles)
 const categoryMap = new Map<string, number>();
 companies.forEach(c => {
  const cat = c.category || 'Other';
  categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
 });
 const categoryBreakdown = Array.from(categoryMap.entries())
  .map(([category, count]) => ({ category, count, pct: Math.round((count / companies.length) * 100) }))
  .sort((a, b) => b.count - a.count);

 // Source distribution (RSS vs Greenhouse vs Lever vs Ashby)
 const sourceMap = new Map<string, number>();
 const jobs = await getJobs();
 jobs.forEach(j => {
  const src = j.source?.split(':')[0]?.trim() || 'RSS';
  sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
 });
 const sourceBreakdown = Array.from(sourceMap.entries())
  .map(([source, count]) => ({ source, count, pct: Math.round((count / jobs.length) * 100) }))
  .sort((a, b) => b.count - a.count);

 // Companies with enriched profiles
 const enrichedCount = companies.filter(c => c.description || c.about).length;

 return {
  totalCompanies: companies.length,
  totalJobs,
  averageJobsPerCompany: Math.round(totalJobs / companies.length),
  topCompanies: companies.slice(0, 10),
  categoryBreakdown,
  sourceBreakdown,
  enrichedCount,
 };
}
