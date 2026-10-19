import Link from 'next/link';
import { ArrowRight, Clock, DollarSign, ExternalLink, MapPin } from 'lucide-react';
import type { Company, Job } from '@/types';
import { CompanyLogo } from '@/components/company-logo';
import { JobApplicationButton } from '@/components/tracking/job-application-button';
import { DirectoryDisclaimer } from '@/components/directory-disclaimer';
import { DetailPageHeader } from '@/components/detail-page-header';
import { getCompanySlug, getJobSlug } from '@/lib/job-slugs';
import { getJobSalaryInfo } from '@/lib/job-salary';
import { resolveJobLocation } from '@/lib/job-location';
import { buildJobPostingSchema } from '@/lib/job-posting-schema';
import { isGenericJobTemplateHtml } from '@/lib/job-guides';
import { getImageVariants } from '@/lib/responsive-images-server';
import { isJobAgeEligible } from '@/lib/job-age-policy.mjs';
import { notFound } from 'next/navigation';

export { parseJobAddress, ensureAddressCountry, toAddressCountryCode } from '@/lib/job-posting-location';

interface JobDetailViewProps {
  job: Job;
  contentHtml: string;
  company: Partial<Company> | null;
  siteUrl: string;
  logoSrc?: string | null;
  faviconUrl?: string | null;
}

function getPostedLabel(date: string): string | null {
  const postedAt = new Date(date);
  if (Number.isNaN(postedAt.getTime())) return null;

  const daysAgo = Math.max(0, Math.floor((Date.now() - postedAt.getTime()) / 86_400_000));
  if (daysAgo === 0) return 'Posted today';
  if (daysAgo === 1) return 'Posted yesterday';
  return `Posted ${daysAgo} days ago`;
}

export function JobDetailView({
  job,
  contentHtml,
  company,
  siteUrl,
  logoSrc = null,
  faviconUrl = null,
}: JobDetailViewProps) {
  if (!isJobAgeEligible(job)) notFound();
  const slug = getJobSlug(job);
  const companySlug = getCompanySlug(job.company);
  const canonicalUrl = `${siteUrl}/${slug}`;
  const companyUrl = `${siteUrl}/${companySlug}`;
  const postedLabel = job.dateVerified === false ? null : getPostedLabel(job.date);
  const websiteHostname = (() => {
    // A malformed company.website must never 500 the whole page.
    if (!company?.website) return null;
    try {
      const value = company.website.startsWith('http') ? company.website : `https://${company.website}`;
      return new URL(value).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  })();
  const absoluteLogoUrl = logoSrc
    ? logoSrc.startsWith('http')
      ? logoSrc
      : `${siteUrl}${logoSrc.startsWith('/') ? '' : '/'}${logoSrc}`
    : null;

  const rawLocation = resolveJobLocation(job);
  const salaryInfo = getJobSalaryInfo(job, contentHtml);
  const { schema: jobPostingSchema, reasons: schemaOmissionReasons } = buildJobPostingSchema({
    job,
    contentHtml,
    descriptionIsFallback: isGenericJobTemplateHtml(contentHtml),
    company,
    siteUrl,
    logoUrl: absoluteLogoUrl,
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: `${siteUrl}/jobs` },
      { '@type': 'ListItem', position: 3, name: job.company, item: companyUrl },
      { '@type': 'ListItem', position: 4, name: job.title, item: canonicalUrl },
    ],
  };

  return (
    <article
      className="site-container py-10 sm:py-14"
      data-job-page
      data-job-posting-schema={jobPostingSchema ? 'eligible' : 'suppressed'}
      data-job-posting-schema-reasons={schemaOmissionReasons.length ? schemaOmissionReasons.join(',') : undefined}
    >
      {jobPostingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema).replace(/</g, '\\u003c') }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />

      <DetailPageHeader
        breadcrumbs={[
          { href: '/', label: 'Home' },
          { href: '/jobs', label: 'Jobs' },
          { href: `/${companySlug}`, label: job.company },
        ]}
        icon={
            <CompanyLogo
              logoSrc={logoSrc ?? faviconUrl}
              imageVariants={getImageVariants(logoSrc ?? faviconUrl)}
              faviconUrl={faviconUrl}
              name={job.company}
              size="h-full w-full"
            />
        }
        title={job.title}
        subtitle={<Link href={`/${companySlug}`} className="inline-block font-medium hover:text-primary">{job.company}</Link>}
        metadata={
          <>
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {rawLocation}
                </span>
              )}
              {salaryInfo.display && (
                <span className="flex items-center gap-1.5 font-medium text-foreground/90">
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  {salaryInfo.display}
                </span>
              )}
              {postedLabel && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {postedLabel}
                </span>
              )}
          </>
        }
        actions={
          <JobApplicationButton
            jobId={job.id}
            jobTitle={job.title}
            companyName={job.company}
            jobUrl={job.link}
            source={job.source}
            date={job.dateVerified === false ? undefined : job.date}
          >
            Apply
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </JobApplicationButton>
        }
      />

      <section
        className="prose prose-slate mt-10 min-w-0 max-w-none break-words [overflow-wrap:anywhere] dark:prose-invert prose-headings:tracking-tight prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {company?.description && (
        <section className="mt-12 border-t pt-8">
          <h2 className="text-lg font-bold tracking-tight mb-3">About {company.name}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {websiteHostname && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium hover:text-primary">
                {websiteHostname}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            <Link href={`/${companySlug}`} className="inline-flex items-center gap-1.5 font-medium hover:text-primary">
              View all {company.jobCount} roles at {company.name}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}
      <DirectoryDisclaimer />
    </article>
  );
}
