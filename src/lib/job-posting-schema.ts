import type { Company, Job } from '../types';
import { jobAgeExclusionReason } from './job-age-policy.mjs';
import { getJobPostingLocation } from './job-posting-location';
import { getCompanySlug, getJobSlug } from './job-slugs';
import { resolveJobLocation } from './job-location';

interface JobPostingInput {
  job: Job;
  contentHtml: string;
  descriptionIsFallback?: boolean;
  company?: Partial<Company> | null;
  siteUrl: string;
  logoUrl?: string | null;
  now?: number;
}

function httpUrl(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Return diagnostics instead of publishing incomplete or inferred job claims. */
export function buildJobPostingSchema({ job, contentHtml, descriptionIsFallback = false, company, siteUrl, logoUrl, now = Date.now() }: JobPostingInput) {
  const reasons: string[] = [];
  const ageReason = jobAgeExclusionReason(job, now);
  if (ageReason) reasons.push(ageReason);
  if (!job.title.trim()) reasons.push('missing-title');
  if (!job.company.trim()) reasons.push('missing-hiring-organization');
  if (!httpUrl(job.link)) reasons.push('missing-application-url');

  const descriptionText = contentHtml.replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|#160);/g, ' ').replace(/\s+/g, ' ').trim();
  if (!descriptionText || descriptionText === job.title.trim() || descriptionIsFallback) reasons.push('incomplete-description');

  const location = getJobPostingLocation(job);
  if (location.reason) reasons.push(location.reason);
  if (reasons.length) return { schema: null, reasons };

  const sameAs = httpUrl(company?.website);
  const logo = httpUrl(logoUrl);
  return {
    reasons,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      // The same location appears in the visible header, including remote eligibility.
      description: `<p>Location: ${escapeHtml(resolveJobLocation(job))}</p>${contentHtml}`,
      identifier: { '@type': 'PropertyValue', name: 'hashtagweb3.com', value: job.id },
      datePosted: job.date,
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company,
        url: `${siteUrl}/${getCompanySlug(job.company)}`,
        ...(sameAs && { sameAs }),
        ...(logo && { logo }),
      },
      // The catalog has no verified employment type, application flow, employer
      // deadline, or salary units/currency. Optional claims stay absent.
      ...location.fields,
      url: `${siteUrl}/${getJobSlug(job)}`,
    },
  };
}
