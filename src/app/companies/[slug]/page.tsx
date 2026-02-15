import { Header } from '@/components/header';
import { getCompanyBySlug, getCompanies } from '@/lib/companies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Briefcase, ExternalLink, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { JobPosting, Organization, WithContext } from 'schema-dts';

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const companies = await getCompanies();
  return companies.map((company) => ({
    slug: company.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug);
  
  if (!company) {
    return {
      title: 'Company Not Found',
    };
  }

  return {
    title: `${company.name} Jobs & Careers - ${company.jobCount} Open Positions`,
    description: `Find ${company.jobCount} current job openings at ${company.name}. Explore Web3, blockchain, and crypto career opportunities. Updated ${new Date(company.lastUpdated).toLocaleDateString()}.`,
    alternates: {
      canonical: `/companies/${company.slug}`,
    },
    openGraph: {
      title: `${company.name} Jobs & Careers - ${company.jobCount} Open Positions`,
      description: `Find ${company.jobCount} current job openings at ${company.name}. Explore Web3 career opportunities.`,
      url: `https://hashtagweb3.com/companies/${company.slug}`,
      images: [
        {
          url: 'https://hashtagweb3.com/og-image.png',
          width: 1200,
          height: 630,
          alt: `${company.name} Jobs`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${company.name} Jobs - ${company.jobCount} Open Positions`,
      description: `Find current job openings at ${company.name} in Web3 and blockchain.`,
      images: ['https://hashtagweb3.com/og-image.png'],
    },
  };
}

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const company = await getCompanyBySlug(params.slug);

  if (!company) {
    notFound();
  }

  // Generate schema markup for organization and job postings
  const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    ...(company.website && { url: company.website }),
  };

  const jobPostingsSchema: WithContext<JobPosting>[] = company.jobs.slice(0, 10).map(job => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: `${job.title} position at ${company.name}`,
    datePosted: new Date(job.date).toISOString(),
    hiringOrganization: {
      '@type': 'Organization',
      name: company.name,
      ...(company.website && { url: company.website }),
    },
    employmentType: 'FULL_TIME',
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Remote'
      }
    },
    url: job.link,
    validThrough: new Date(new Date(job.date).setDate(new Date(job.date).getDate() + 30)).toISOString(),
  }));

  // Group jobs by category (simple categorization based on title keywords)
  const categorizeJob = (title: string): string => {
    const lower = title.toLowerCase();
    if (lower.includes('engineer') || lower.includes('developer') || lower.includes('software')) return 'Engineering';
    if (lower.includes('marketing') || lower.includes('growth')) return 'Marketing';
    if (lower.includes('product') || lower.includes('manager')) return 'Product';
    if (lower.includes('design')) return 'Design';
    if (lower.includes('sales') || lower.includes('business development')) return 'Sales';
    if (lower.includes('analyst') || lower.includes('data')) return 'Data';
    return 'Other';
  };

  const jobsByCategory = company.jobs.reduce((acc, job) => {
    const category = categorizeJob(job.title);
    if (!acc[category]) acc[category] = [];
    acc[category].push(job);
    return acc;
  }, {} as Record<string, typeof company.jobs>);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {jobPostingsSchema.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-16">
            {/* Breadcrumbs */}
            <nav className="text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-primary">Home</Link>
              {' / '}
              <Link href="/companies" className="hover:text-primary">Companies</Link>
              {' / '}
              <span className="text-foreground">{company.name}</span>
            </nav>

            {/* Company Header */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
                  <p className="text-xl text-muted-foreground">
                    Jobs & Careers at {company.name}
                  </p>
                </div>
              </div>

              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{company.jobCount} Active Position{company.jobCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Updated {new Date(company.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {company.website && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-primary" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm hover:text-primary transition-colors"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* About Section */}
            <div className="max-w-4xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-4">About {company.name}</h2>
              <Card>
                <CardContent className="pt-6">
                  {company.description && (
                    <p className="text-lg font-medium mb-4">{company.description}</p>
                  )}
                  
                  {(company.founded || company.category || company.headquarters) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                      {company.founded && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Founded</div>
                          <div className="font-semibold">{company.founded}</div>
                        </div>
                      )}
                      {company.category && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Category</div>
                          <div className="font-semibold">{company.category}</div>
                        </div>
                      )}
                      {company.headquarters && (
                        <div className="flex items-start gap-2">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Headquarters</div>
                            <div className="font-semibold">{company.headquarters}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {company.about && (
                    <div className="prose prose-sm max-w-none mb-4">
                      <div 
                        className="text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: company.about
                            .split('\n\n')
                            .map(para => `<p class="mb-3">${para.replace(/\n/g, '<br />')}</p>`)
                            .join('') 
                        }} 
                      />
                    </div>
                  )}

                  {!company.about && (
                    <p className="text-muted-foreground mb-4">
                      {company.name} is actively hiring across multiple positions in the Web3 space. 
                      This page lists all current job openings at {company.name}, updated in real-time 
                      from our job aggregation system.
                    </p>
                  )}
                  
                  {Object.keys(jobsByCategory).length > 1 && (
                    <div>
                      <h3 className="font-semibold mb-2">Hiring by Department:</h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(jobsByCategory)
                          .sort(([, a], [, b]) => b.length - a.length)
                          .map(([category, jobs]) => (
                            <Badge key={category} variant="secondary">
                              {category}: {jobs.length}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Job Listings */}
            <div className="max-w-4xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-6">Open Positions ({company.jobCount})</h2>
              <div className="space-y-4">
                {company.jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                          <CardDescription className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(job.date).toLocaleDateString()}
                            </span>
                            <Badge variant="outline">{categorizeJob(job.title)}</Badge>
                          </CardDescription>
                        </div>
                        <Link href={job.link} target="_blank" rel="noopener noreferrer">
                          <Button>
                            Apply Now
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* How to Apply Section */}
            <div className="max-w-4xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-4">How to Apply to {company.name}</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    Click the "Apply Now" button on any position above to be redirected to the official 
                    application page on {company.name}'s website or their hiring platform.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> Make sure your resume highlights relevant Web3 experience 
                    and includes links to your GitHub, portfolio, or previous blockchain projects.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* About This Page */}
            <div className="max-w-4xl mx-auto">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">About This Page</h3>
                  <p className="text-sm text-muted-foreground">
                    This company page aggregates all current job openings at {company.name} from various 
                    sources including official career pages and job boards. Information is updated regularly 
                    to ensure accuracy. Last updated: {new Date(company.lastUpdated).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
