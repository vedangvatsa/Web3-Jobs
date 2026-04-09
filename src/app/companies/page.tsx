import { Header } from '@/components/header';
import { getCompanies, getCompanyStats } from '@/lib/companies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Calendar, ExternalLink, TrendingUp, Database, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Companies Hiring - Browse Blockchain & Crypto Companies',
  description: 'Explore Web3 companies actively hiring. Find jobs at leading blockchain, DeFi, NFT, and crypto companies. Updated daily with latest positions.',
  alternates: {
    canonical: '/companies',
  },
  openGraph: {
    title: 'Web3 Companies Hiring - Browse Top Blockchain Companies',
    description: 'Explore Web3 companies actively hiring. Find jobs at leading blockchain, DeFi, and crypto companies.',
    url: 'https://hashtagweb3.com/companies',
    images: [{ url: 'https://hashtagweb3.com/og-image.png', width: 1200, height: 630, alt: 'Web3 Companies' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Companies Hiring - Browse Top Blockchain Companies',
    description: 'Explore Web3 companies actively hiring in blockchain, DeFi, and crypto.',
    images: ['https://hashtagweb3.com/og-image.png'],
  },
};

export const revalidate = 3600;

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
  
  // Find max job count for bar chart scaling
  const maxJobCount = stats.topCompanies[0]?.jobCount || 1;

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
                  shaping the decentralized future. Aggregated from {stats.totalCompanies} companies 
                  with {stats.totalJobs} active positions.
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
                    <span className="text-2xl font-bold">{stats.enrichedCount}</span>
                    <span className="text-muted-foreground">Company profiles</span>
                  </div>
                </div>
              </div>
              
              {/* Data Sources Card */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Data sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Jobs aggregated from {stats.sourceBreakdown.length} data sources via 
                    Greenhouse, Lever, Ashby APIs, and RSS feeds.
                  </p>
                  <div className="space-y-2">
                    {stats.sourceBreakdown.slice(0, 5).map((src) => (
                      <div key={src.source} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{src.source}</span>
                            <span className="text-muted-foreground">{src.count} jobs ({src.pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${src.pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Top Hiring — Horizontal Bar Chart */}
        <section className="bg-muted/30 border-y">
          <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <BarChart3 className="h-7 w-7 text-primary" />
                Top hiring right now
              </h2>
              <p className="text-muted-foreground">Companies with the most active job openings</p>
            </div>
            
            {/* Horizontal bar chart */}
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              {stats.topCompanies.map((company, index) => (
                <Link key={company.slug} href={`/companies/${company.slug}`} className="group">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-5 text-right shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {company.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">
                          {company.jobCount}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/80 rounded-full transition-all group-hover:bg-primary"
                          style={{ width: `${Math.max((company.jobCount / maxJobCount) * 100, 4)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Companies with Rich Profiles */}
        {featuredCompanies.length > 0 && (
          <section className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Company profiles</h2>
              <p className="text-muted-foreground">
                {featuredCompanies.length} companies with verified profiles
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredCompanies.map((company) => (
                <Link key={company.slug} href={`/companies/${company.slug}`}>
                  <Card className="group hover:border-primary transition-all h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                          {company.name}
                        </h3>
                        <Badge variant="default" className="shrink-0 text-xs">
                          {company.jobCount}
                        </Badge>
                      </div>
                      {company.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {company.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {company.category && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {company.category}
                          </span>
                        )}
                        {company.headquarters && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {company.headquarters.split(',')[0]}
                          </span>
                        )}
                        {company.founded && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {company.founded}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Category Distribution */}
        {stats.categoryBreakdown.length > 1 && (
          <section className="border-t">
            <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Company categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.categoryBreakdown.filter(c => c.category !== 'Other').slice(0, 8).map((cat) => (
                        <div key={cat.category} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">{cat.category}</span>
                              <span className="text-muted-foreground">{cat.count} companies</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary/70 rounded-full"
                                style={{ width: `${cat.pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>About this directory</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                    <p>
                      This directory tracks companies actively hiring across the Web3 ecosystem. 
                      Job postings are aggregated from company career pages via Greenhouse, Lever, 
                      and Ashby APIs, plus RSS feeds from Web3 job boards.
                    </p>
                    <p>
                      Listings are refreshed every 8 hours. Company profiles include available 
                      positions, founding information, headquarters, and business category.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

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
