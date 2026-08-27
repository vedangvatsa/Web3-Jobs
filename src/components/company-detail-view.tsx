import { getCompanyBySlug } from '@/lib/companies';
import { resolveCompanyLogo, getCompanyFaviconUrl } from '@/lib/company-logo';
import { CompanyLogo } from '@/components/company-logo';
import { Briefcase, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Organization, BreadcrumbList, WithContext } from 'schema-dts';
import { CompanyViewTracker } from '@/components/tracking/company-view-tracker';
import { OutboundLink } from '@/components/tracking/outbound-link';
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

  const logoSrc = resolveCompanyLogo(company.slug);
  const faviconUrl = getCompanyFaviconUrl(company.website);

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
          <div className="container mx-auto px-4 page-section md:py-12 max-w-6xl">
            {/* Breadcrumbs */}
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Home</Link>
              {' / '}
              <Link href="/companies" className="hover:text-primary">Companies</Link>
              {' / '}
              <span className="text-foreground">{displayName}</span>
            </nav>

            {/* Company Header */}
            <header className="mb-8 border border-border/60 bg-muted/10 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative h-20 w-20 flex items-center justify-center p-3 bg-background rounded-2xl shadow-sm border border-border/80 shrink-0">
                  <CompanyLogo logoSrc={logoSrc} faviconUrl={faviconUrl} name={displayName} />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    {displayName} Careers
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Briefcase className="h-4 w-4" />
                      {company.jobCount} Active Role{company.jobCount !== 1 ? 's' : ''}
                    </span>
                    {company.website && (
                      <OutboundLink
                        href={company.website}
                        label={`${displayName} website`}
                        className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Website
                      </OutboundLink>
                    )}
                  </div>
                  {company.description && (
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {company.description}
                    </p>
                  )}
                </div>
              </div>
            </header>

            {/* Open Roles Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Open Roles</h2>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {company.jobCount} Job{company.jobCount !== 1 ? 's' : ''} Found
              </span>
            </div>

            {/* 2-Column Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {company.jobs.map((job) => (
                <Link
                  key={getJobSlug(job)}
                  href={`/${getJobSlug(job)}`}
                  aria-label={`View ${job.title} at ${displayName} and apply`}
                  className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-md border border-border/70 bg-background p-1.5 shrink-0 flex items-center justify-center">
                      <CompanyLogo
                        logoSrc={logoSrc}
                        faviconUrl={faviconUrl}
                        name={displayName}
                        size="h-full w-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{job.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{company.name}</span>
                        {job.dateVerified !== false && (
                          <>
                            <span aria-hidden="true">-</span>
                            <span>{new Date(job.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="self-center shrink-0 text-sm font-medium text-primary">
                    Apply
                  </span>
                </Link>
              ))}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
