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
        <section className="border-b bg-muted/10">
          <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              The definitive directory of Web3 companies
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              From established exchanges to emerging DeFi protocols, explore the organizations 
              shaping the decentralized future. Track active opportunities and hiring trends across the industry.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-foreground mb-1">{stats.totalCompanies}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Companies</span>
              </div>
              <div className="hidden md:block h-16 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-foreground mb-1">{stats.totalJobs}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Open Roles</span>
              </div>
              <div className="hidden md:block h-16 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-foreground mb-1">{stats.enrichedCount}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Profiles</span>
              </div>
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

        {/* Featured / Verified Company Profiles */}
        {featuredCompanies.length > 0 && (
          <section className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Verified Profiles</h2>
              <p className="text-muted-foreground">
                Deep dives into the top organizations shaping the decentralized web.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredCompanies.map((company) => (
                <Link key={company.slug} href={`/companies/${company.slug}`}>
                  <Card className="group hover:border-primary transition-all h-full bg-muted/20">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                          {company.name}
                        </h3>
                        <Badge variant="default" className="shrink-0 text-xs">
                          {company.jobCount} jobs
                        </Badge>
                      </div>
                      {company.description && (
                         <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                           {company.description}
                         </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Minimal All Companies Directory */}
        <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl border-t">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Company Directory</h2>
            <p className="text-muted-foreground">A complete index of all {companies.length} Web3 companies currently actively hiring.</p>
          </div>
          
          <div className="border rounded-lg overflow-hidden bg-background">
            <div className="divide-y">
              {[...companies]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((company) => (
                <Link key={company.slug} href={`/companies/${company.slug}`} className="block hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-foreground truncate">{company.name}</h4>
                        {featuredCompanies.some(c => c.slug === company.slug) && (
                          <Badge variant="outline" className="text-[10px] uppercase px-1.5 py-0 h-4">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="truncate">{company.category || 'Web3'}</span>
                        {company.headquarters && <span className="truncate hidden sm:inline-block md:hidden lg:inline-block">📍 {company.headquarters.split(',')[0]}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                       <span className="text-sm font-medium">{company.jobCount} open roles</span>
                       <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
