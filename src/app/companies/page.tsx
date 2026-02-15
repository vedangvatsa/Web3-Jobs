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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Discover Web3 companies building the future
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {stats.totalCompanies} companies • {stats.totalJobs} open positions • Updated daily
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Cryptocurrency Exchanges</span>
                <span>•</span>
                <span>DeFi Protocols</span>
                <span>•</span>
                <span>NFT Platforms</span>
                <span>•</span>
                <span>Layer 1/2 Solutions</span>
                <span>•</span>
                <span>Infrastructure</span>
              </div>
            </div>
          </div>
        </section>

        {/* Top Companies */}
        {stats.topCompanies && stats.topCompanies.length > 0 && (
          <section className="container mx-auto px-4 py-12 md:py-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Top hiring companies</h2>
              <p className="text-muted-foreground">Companies with the most open positions right now</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.topCompanies.slice(0, 6).map((company) => (
                <Link key={company.slug} href={`/companies/${company.slug}`}>
                  <Card className="group hover:border-primary transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                            {company.name}
                          </CardTitle>
                          {company.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {company.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {company.category && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                {company.category}
                              </span>
                            )}
                            {company.headquarters && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {company.headquarters}
                              </span>
                            )}
                            {company.founded && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Founded {company.founded}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="default" className="shrink-0">
                          {company.jobCount} jobs
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
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
