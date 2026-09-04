import Link from 'next/link';
import { ArrowRight, Clock, ExternalLink, MapPin } from 'lucide-react';
import type { Company, Job } from '@/types';
import { CompanyLogo } from '@/components/company-logo';
import { JobApplicationButton } from '@/components/tracking/job-application-button';
import { getCompanySlug, getJobSlug } from '@/lib/job-slugs';

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
  const slug = getJobSlug(job);
  const companySlug = getCompanySlug(job.company);
  const canonicalUrl = `${siteUrl}/${slug}`;
  const companyUrl = `${siteUrl}/${companySlug}`;
  const postedLabel = job.dateVerified === false ? null : getPostedLabel(job.date);
  const postedDate = new Date(job.date);
  const absoluteLogoUrl = logoSrc
    ? logoSrc.startsWith('http')
      ? logoSrc
      : `${siteUrl}${logoSrc.startsWith('/') ? '' : '/'}${logoSrc}`
    : null;

  const hiringOrganization = {
    '@type': 'Organization',
    name: job.company,
    url: companyUrl,
    ...(company?.website && { sameAs: company.website }),
    ...(absoluteLogoUrl && { logo: absoluteLogoUrl }),
  };

  const isDateValid = !Number.isNaN(postedDate.getTime());
  const datePostedIso = isDateValid ? postedDate.toISOString() : new Date().toISOString();
  const validThroughDate = new Date(
    (isDateValid ? postedDate.getTime() : Date.now()) + 60 * 24 * 60 * 60 * 1000
  ).toISOString();

  const titleLower = job.title.toLowerCase();
  const deptLower = (typeof job.department === 'string' ? job.department : (job.department as any)?.name || '').toLowerCase();
  const locLower = (typeof job.location === 'string' ? job.location : (job.location as any)?.name || '').toLowerCase();

  const descriptionText = contentHtml ? contentHtml.toLowerCase() : '';

  const employmentType = (() => {
    if (titleLower.includes('intern') || deptLower.includes('intern') || descriptionText.includes('internship') || descriptionText.includes('intern position')) return 'INTERN';
    if (titleLower.includes('contract') || titleLower.includes('freelance') || deptLower.includes('contract') || descriptionText.includes('contractor') || descriptionText.includes('contract position') || descriptionText.includes('freelance')) return 'CONTRACTOR';
    if (titleLower.includes('part-time') || titleLower.includes('part time') || descriptionText.includes('part-time') || descriptionText.includes('part time')) return 'PART_TIME';
    if (titleLower.includes('full-time') || titleLower.includes('full time') || descriptionText.includes('full-time') || descriptionText.includes('full time') || descriptionText.includes('permanent')) return 'FULL_TIME';
    return 'FULL_TIME';
  })();

  const isRemote =
    !job.location ||
    locLower.includes('remote') ||
    locLower.includes('anywhere') ||
    locLower.includes('worldwide') ||
    locLower.includes('global') ||
    locLower.includes('virtual');

  const applicantLocationName = (() => {
    if (locLower.includes('us') || locLower.includes('united states') || locLower.includes('usa')) return 'United States';
    if (locLower.includes('emea') || locLower.includes('europe') || locLower.includes('eu')) return 'Europe';
    if (locLower.includes('apac') || locLower.includes('asia')) return 'Asia';
    if (locLower.includes('latam') || locLower.includes('latin america')) return 'Latin America';
    if (locLower.includes('uk') || locLower.includes('united kingdom')) return 'United Kingdom';
    if (locLower.includes('canada')) return 'Canada';
    return 'Worldwide';
  })();

  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: contentHtml,
    ...(job.dateVerified !== false && isDateValid && { datePosted: datePostedIso }),
    validThrough: validThroughDate,
    employmentType,
    directApply: true,
    hiringOrganization,
    industry: 'Web3 / Blockchain / Cryptocurrency',
    ...(job.department && { occupationalCategory: typeof job.department === 'string' ? job.department : (job.department as any)?.name || String(job.department) }),
    ...(isRemote
      ? {
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: {
            '@type': 'Country',
            name: applicantLocationName,
          },
        }
      : {
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.location,
            },
          },
        }),
    url: canonicalUrl,
  };

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
    <article className="site-container px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/jobs" className="hover:text-foreground">Jobs</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${companySlug}`} className="hover:text-foreground">{job.company}</Link>
      </nav>

      <header className="border-b pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-background p-2">
            <CompanyLogo
              logoSrc={logoSrc ?? faviconUrl}
              faviconUrl={faviconUrl}
              name={job.company}
              size="h-full w-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{job.title}</h1>
            <Link href={`/${companySlug}`} className="mt-2 inline-block font-medium hover:text-primary">
              {job.company}
            </Link>

            {(job.location || postedLabel) && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {job.location}
                  </span>
                )}
                {postedLabel && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {postedLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          <JobApplicationButton
            jobId={job.id}
            jobTitle={job.title}
            companyName={job.company}
            jobUrl={job.link}
            source={job.source}
            date={job.dateVerified === false ? undefined : job.date}
          >
            <span className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto">
              Apply
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </span>
          </JobApplicationButton>
        </div>
      </header>

      <section
        className="prose prose-slate mt-10 max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {company?.description && (
        <section className="mt-12 border-t pt-8">
          <h2 className="text-lg font-bold tracking-tight mb-3">About {company.name}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium hover:text-primary">
                {new URL(company.website).hostname.replace(/^www\./, '')}
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
    </article>
  );
}
