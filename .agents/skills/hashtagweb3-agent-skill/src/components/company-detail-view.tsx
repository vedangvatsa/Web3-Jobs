import { getCompanyBySlug } from '@/lib/companies';
import { resolveCompanyLogo, getCompanyFaviconUrl } from '@/lib/company-logo';
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
          <article className="site-container px-4 py-10 sm:py-14">
            <nav className="mb-8 flex flex-wrap gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/companies" className="hover:text-foreground">Companies</Link>
              <span aria-hidden="true">/</span>
              <span className="text-foreground">{displayName}</span>
            </nav>

            <header className="border-b pb-8">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center">
                  <CompanyLogo logoSrc={logoSrc} faviconUrl={faviconUrl} name={displayName} size="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{displayName}</h1>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {company.jobs.map((job) => (
                  <JobCard key={getJobSlug(job)} job={job} logoUrl={logoSrc} faviconUrl={faviconUrl} />
                ))}
              </div>
            </section>
          </article>
        </main>
      </div>
    </>
  );
}
