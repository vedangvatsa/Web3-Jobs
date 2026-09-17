import { getCompanyBySlug } from '@/lib/companies';
import { FAVICON_FIRST_SLUGS, resolveCompanyLogo, getCompanyFaviconUrl } from '@/lib/company-logo';
import { CompanyLogo } from '@/components/company-logo';
import { Briefcase, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Organization, BreadcrumbList, WithContext } from 'schema-dts';
import { CompanyViewTracker } from '@/components/tracking/company-view-tracker';
import { OutboundLink } from '@/components/tracking/outbound-link';
import { JobCard } from '@/components/job-card';
import { getJobSlug } from '@/lib/job-slugs';

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

  // Per-company override: Circle shows its circle.com favicon here.
  // (The homepage "companies like" strip keeps using the file logo.)
  const logoFile = resolveCompanyLogo(company.slug);
  const favicon = getCompanyFaviconUrl(company.website);
  const preferFavicon = FAVICON_FIRST_SLUGS.has(company.slug) && !!favicon;
  const logoSrc = preferFavicon ? favicon : logoFile;
  const faviconUrl = preferFavicon ? logoFile : favicon;

  const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: displayName,
    ...(company.website && { url: company.website }),
    ...(company.description && { description: company.description }),
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
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <article className="site-container py-10 sm:py-14">
            <nav className="mb-8 flex flex-wrap gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/companies" className="hover:text-foreground">Companies</Link>
              <span aria-hidden="true">/</span>
              <span className="text-foreground">{displayName}</span>
            </nav>

            <header className="border-b pb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center">
                  <CompanyLogo logoSrc={logoSrc} faviconUrl={faviconUrl} name={displayName} size="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold tracking-tight break-words sm:text-4xl">{displayName}</h1>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" aria-hidden="true" />
                      {company.jobCount} role{company.jobCount !== 1 ? 's' : ''}
                    </span>
                    {company.website && (
                      <OutboundLink
                        href={company.website}
                        label={`${displayName} website`}
                        className="flex items-center gap-1.5 hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        {new URL(company.website).hostname.replace(/^www\./, '')}
                      </OutboundLink>
                    )}
                  </div>
                </div>
              </div>
              {company.description && (
                <p className="mt-6 w-full text-sm leading-relaxed text-muted-foreground">
                  {company.description}
                </p>
              )}
            </header>

            <section className="mt-10">
              <h2 className="text-lg font-bold tracking-tight mb-4">Open roles</h2>
              {company.jobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {company.jobs.map((job) => (
                    <JobCard key={getJobSlug(job)} job={job} logoUrl={logoSrc} faviconUrl={faviconUrl} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border bg-card/50 p-8 text-center sm:p-12">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                    <Briefcase className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">No open roles currently listed</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    {displayName} has no active job postings on Hashtag Web3 at this time. Check back soon or explore open roles across other top Web3 companies.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/jobs"
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
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
