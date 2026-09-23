import { getCompanyBySlug } from '@/lib/companies';
import {
  FAVICON_FIRST_SLUGS,
  resolveCompanyLogo,
  getCompanyFaviconUrl,
  getCompanyFaviconUrlBySlug,
} from '@/lib/company-logo';
import { CompanyLogo } from '@/components/company-logo';
import { Briefcase, ExternalLink, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Organization, BreadcrumbList, WithContext } from 'schema-dts';
import { CompanyViewTracker } from '@/components/tracking/company-view-tracker';
import { OutboundLink } from '@/components/tracking/outbound-link';
import { JobCard } from '@/components/job-card';
import { getJobSlug } from '@/lib/job-slugs';
import { XBrandIcon } from '@/components/x-brand-icon';
import { DetailPageHeader } from '@/components/detail-page-header';

export async function CompanyDetailView({ slug }: { slug: string }) {
  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  // Override display name when the company website belongs to a known brand alias
  const displayName = (() => {
    try {
      if (company.website) {
        const host = new URL(company.website.startsWith('http') ? company.website : `https://${company.website}`).hostname;
        if (host.includes('offchainlabs.com')) return 'Offchain Labs';
      }
    } catch { /* ignore */ }
    return company.name;
  })();

  const websiteHostname = (() => {
    if (!company.website) return null;
    try {
      return new URL(company.website.startsWith('http') ? company.website : `https://${company.website}`).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  })();

  // Per-company override: Circle shows its circle.com favicon here.
  // (The homepage "companies like" strip keeps using the file logo.)
  const logoFile = resolveCompanyLogo(company.slug);
  const favicon =
    getCompanyFaviconUrl(company.website) ?? getCompanyFaviconUrlBySlug(company.slug);
  const preferFavicon = FAVICON_FIRST_SLUGS.has(company.slug) && !!favicon;
  const logoSrc = preferFavicon ? favicon : logoFile;
  const faviconUrl = preferFavicon ? logoFile : favicon;
  const social = company.socialLinks;

  const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: displayName,
    ...(company.website && { url: company.website }),
    ...(company.description && { description: company.description }),
    ...(social?.linkedin && { sameAs: [social.linkedin, social.twitter, social.crunchbase].filter(Boolean) as string[] }),
  };

  const breadcrumbSchema: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hashtagweb3.com' },
      { '@type': 'ListItem', position: 2, name: 'Companies', item: 'https://hashtagweb3.com/companies' },
      { '@type': 'ListItem', position: 3, name: displayName, item: `https://hashtagweb3.com/${company.slug}` },
    ],
  };

  return (
    <>
      <CompanyViewTracker slug={company.slug} name={displayName} jobCount={company.jobCount} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="flex min-w-0 flex-col min-h-screen">
        <main className="min-w-0 flex-grow overflow-x-clip">
          <article className="site-container min-w-0 py-8 sm:py-14">
            <DetailPageHeader
              breadcrumbs={[
                { href: '/', label: 'Home' },
                { href: '/companies', label: 'Companies' },
              ]}
              currentPageLabel={displayName}
              icon={
                <CompanyLogo logoSrc={logoSrc} faviconUrl={faviconUrl} name={displayName} size="h-full w-full" />
              }
              title={displayName}
              metadata={
                <>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Briefcase className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {company.jobCount} role{company.jobCount !== 1 ? 's' : ''}
                  </span>
                  {company.website && websiteHostname && (
                    <OutboundLink
                      href={company.website}
                      label={`${displayName} website`}
                      className="flex min-w-0 max-w-full items-center gap-1.5 hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{websiteHostname}</span>
                    </OutboundLink>
                  )}
                  {social?.linkedin && (
                    <OutboundLink
                      href={social.linkedin}
                      label={`${displayName} on LinkedIn`}
                      className="inline-flex items-center gap-1.5 hover:text-foreground"
                    >
                      <Linkedin className="h-4 w-4 shrink-0" aria-hidden="true" />
                      LinkedIn
                    </OutboundLink>
                  )}
                  {social?.twitter && (
                    <OutboundLink
                      href={social.twitter}
                      label={`${displayName} on X`}
                      className="inline-flex items-center gap-1.5 hover:text-foreground"
                    >
                      <XBrandIcon className="h-4 w-4 shrink-0" />
                      X
                    </OutboundLink>
                  )}
                  {social?.crunchbase && (
                    <OutboundLink
                      href={social.crunchbase}
                      label={`${displayName} on Crunchbase`}
                      className="inline-flex items-center gap-1.5 hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Crunchbase
                    </OutboundLink>
                  )}
                </>
              }
              footer={
                company.description ? (
                  <p className="text-sm leading-relaxed text-muted-foreground break-words [overflow-wrap:anywhere]">
                    {company.description}
                  </p>
                ) : undefined
              }
            />

            <section className="mt-8 min-w-0 sm:mt-10">
              <h2 className="mb-4 text-lg font-bold tracking-tight">Open roles</h2>
              {company.jobs.length > 0 ? (
                <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
                  {company.jobs.map((job) => (
                    <JobCard key={getJobSlug(job)} job={job} logoUrl={logoSrc} faviconUrl={faviconUrl} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border bg-card/50 p-6 text-center sm:p-12">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Briefcase className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">No open roles currently listed</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    {displayName} has no active job postings on Hashtag Web3 at this time. Check back soon or explore open roles across other top Web3 companies.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/jobs"
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Browse All Web3 Jobs
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </article>
        </main>
      </div>
    </>
  );
}
