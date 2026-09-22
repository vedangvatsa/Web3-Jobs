import type { Job } from '@/types';
import { hasSubstantialJobContent, buildFeedDescription } from './job-guides';
import { preloadDescriptionShardsForJobs } from './job-description-shard-loader';
import { normalizeSingleLocation } from './job-filters';

const US_LOCATION = /\b(?:united states|u\.s\.a?\.?|usa)\b|\b(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i;
const US_CITY = /\b(?:Austin|Atlanta|Boston|Chicago|Denver|Houston|Los Angeles|Miami|New York|San Francisco|Seattle|Washington(?:\s*,?\s*DC)?)\b/i;

export async function preloadFeedJobDescriptions(jobs: Job[]): Promise<void> {
  await preloadDescriptionShardsForJobs(jobs);
}

/** Plain-text excerpt for JSON Feed / syndication summaries (shard-backed). */
export function buildFeedPlainExcerpt(job: Job, maxLen = 500): string {
  const html = buildFeedDescription(job, maxLen);
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getRecentFeedJobs(jobs: Job[], days = 30): Promise<Job[]> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const dated = jobs.filter((job) => {
    const time = Date.parse(job.date);
    return Number.isFinite(time) && time >= cutoff;
  });
  await preloadDescriptionShardsForJobs(dated);
  return dated.filter((job) => hasSubstantialJobContent(job)).slice(0, 500);
}

export function getFeedLocation(job: Job): string {
  return normalizeSingleLocation(job.location);
}

export function getFeedRegion(location: string): string {
  if (/united states|u\.s\.a?\.?|usa/i.test(location)) return 'United States';
  if (/\b(?:canada|toronto|vancouver|montreal)\b/i.test(location)) return 'Canada';
  if (/\b(?:united kingdom|uk|london|manchester)\b/i.test(location)) return 'United Kingdom';
  if (/\b(?:australia|sydney|melbourne)\b/i.test(location)) return 'Australia';
  if (/\b(?:germany|berlin|munich)\b/i.test(location)) return 'Germany';
  if (/\b(?:france|paris)\b/i.test(location)) return 'France';
  if (/\b(?:singapore)\b/i.test(location)) return 'Singapore';
  if (/\b(?:india|bangalore|bengaluru|mumbai|delhi)\b/i.test(location)) return 'India';
  if (US_LOCATION.test(location) || US_CITY.test(location)) return 'United States';
  return location;
}

export function isUsOrRemoteJob(job: Job): boolean {
  const location = getFeedLocation(job);
  return /\bremote\b/i.test(location) || US_LOCATION.test(location) || US_CITY.test(location);
}
