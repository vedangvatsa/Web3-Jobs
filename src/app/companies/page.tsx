import { Header } from '@/components/header';
import { getCompanies, getCompanyStats } from '@/lib/companies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Companies Hiring - Browse 500+ Blockchain & Crypto Companies',
  description: 'Explore Web3 companies actively hiring. Find jobs at leading blockchain, DeFi, NFT, and crypto companies. Updated daily with latest positions.',
  alternates: {
    canonical: '/companies',
  },
  openGraph: {
    title: 'Web3 Companies Hiring - Browse Top Blockchain Companies',
    description: 'Explore Web3 companies actively hiring. Find jobs at leading blockchain, DeFi, and crypto companies.',
    url: 'https://hashtagweb3.com/companies',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Companies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Companies Hiring - Browse Top Blockchain Companies',
    description: 'Explore Web3 companies actively hiring in blockchain, DeFi, and crypto.',
    images: ['https://hashtagweb3.com/og-image.png'],
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function CompaniesPage() {
  const companies = await getCompanies();
  const stats = await getCompanyStats();
  
  // Group companies by category
  const categorizedCompanies = companies.reduce((acc, company) => {
    const category = company.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(company);
    return acc;
  }, {} as Record<string, typeof companies>);
  
  // Companies with rich content (have markdown files)
  const featuredCompanies = companies.filter(c => c.description || c.about);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="border-b">
          <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                  The definitive directory of Web3 companies
                </h1>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  From established exchanges to emerging DeFi protocols, explore the organizations 
                  shaping the decentralized future. Our directory aggregates job listings from 
                  {stats.totalCompanies}+ companies actively building on blockchain technology.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{stats.totalCompanies}</span>
                    <span className="text-muted-foreground">Companies</span>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{stats.totalJobs}</span>
                    <span className="text-muted-foreground">Open roles</span>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{Object.keys(categorizedCompanies).length}</span>
                    <span className="text-muted-foreground">Categories</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Card className="border-2">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Industry Snapshot</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The Web3 job market continues to expand across infrastructure, applications, 
                      and financial services. Key hiring trends include growth in zero-knowledge 
                      protocols, cross-chain solutions, and institutional DeFi products.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DeFi & Financial Services</span>
                        <span className="font-medium">{categorizedCompanies['DeFi Protocol']?.length || 0} companies</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exchanges & Trading</span>
                        <span className="font-medium">{categorizedCompanies['Cryptocurrency Exchange']?.length || 0} companies</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Infrastructure & Tools</span>
                        <span className="font-medium">{categorizedCompanies['Infrastructure']?.length + (categorizedCompanies['Blockchain Infrastructure']?.length || 0) || 0} companies</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        </section>

        {/* Featured Companies with Rich Profiles */}
        {featuredCompanies.length > 0 && (
          <section className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Featured companies</h2>
              <p className="text-muted-foreground">In-depth profiles of leading Web3 organizations</p>
            </div>
            <div className="space-y-6">
              {featuredCompanies.slice(0, 4).map((company) => (
                <Link key={company.slug} href={`/companies/${company.slug}`}>
                  <Card className="group hover:border-primary transition-all">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                                {company.name}
                              </h3>
                              {company.description && (
                                <p className="text-muted-foreground font-medium">
                                  {company.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="default" className="shrink-0 text-base px-3 py-1">
                              {company.jobCount} open roles
                            </Badge>
                          </div>
                          
                          {company.about && (
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                              {company.about.split('\n\n')[0]}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm">
                            {company.category && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{company.category}</span>
                              </div>
                            )}
                            {company.headquarters && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{company.headquarters}</span>
                              </div>
                            )}
                            {company.founded && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Founded {company.founded}</span>
                              </div>
                            )}
                            {company.website && (
                              <div className="flex items-center gap-2 text-primary">
                                <ExternalLink className="h-4 w-4" />
                                <span>Visit website</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top Hiring Companies */}
        <section className="bg-muted/30 border-y">
          <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Top hiring right now</h2>
              <p className="text-muted-foreground">Companies with the most active job openings</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topCompanies.slice(0, 9).map((company, index) => (
                <Link key={company.slug} href={`/companies/${company.slug}`}>
                  <Card className="group hover:border-primary transition-all h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-1">
                            {company.name}
                          </h3>
                          {company.category && (
                            <p className="text-xs text-muted-foreground">{company.category}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {company.jobCount} positions
                        </Badge>
                        {company.headquarters && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {company.headquarters.split(',')[0]}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Insights */}
        <section className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-2xl">About this directory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  This directory tracks companies actively hiring across the Web3 ecosystem. We aggregate 
                  job postings from cryptocurrency exchanges, DeFi protocols, NFT platforms, blockchain 
                  infrastructure providers, and crypto-native organizations.
                </p>
                <p>
                  Our listings are updated daily through automated feeds from company career pages and 
                  Web3-focused job boards. Each company profile includes available positions, founding 
                  information, headquarters location, and business category.
                </p>
                <p>
                  For select companies, we provide detailed profiles covering their mission, technology 
                  stack, company culture, and employee benefits. These profiles help candidates understand 
                  the organization before applying.
                </p>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Engineering</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product & Design</span>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marketing & Growth</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Operations</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Other</span>
                    <span className="font-medium">10%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Remote work</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    <span className="text-2xl font-bold text-foreground">78%</span> of Web3 
                    companies offer remote or hybrid positions
                  </p>
                  <p className="text-xs">
                    Most organizations embrace distributed teams across global time zones
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* All Companies by Category */}
        <section className="container mx-auto px-4 py-12 md:py-16 border-t">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Browse by category</h2>
            <p className="text-muted-foreground">Explore companies across different sectors of Web3</p>
          </div>
          
          {Object.entries(categorizedCompanies)
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([category, categoryCompanies]) => (
              <div key={category} className="mb-12 last:mb-0">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  {category}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({categoryCompanies.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryCompanies.map((company) => (
                    <Link key={company.slug} href={`/companies/${company.slug}`}>
                      <Card className="group hover:border-primary hover:shadow-sm transition-all h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 flex-1">
                              {company.name}
                            </h4>
                            {company.website && (
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {company.jobCount} {company.jobCount === 1 ? 'position' : 'positions'}
                            </Badge>
                            {company.headquarters && (
                              <span className="text-xs text-muted-foreground truncate">
                                {company.headquarters.split(',')[0]}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </section>
      </main>
    </div>
  );
}
