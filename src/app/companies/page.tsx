import { getCompanies, getCompanyStats } from '@/lib/companies';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
 title: 'Web3 Companies Hiring - Browse Blockchain & Crypto Companies',
 description: 'Explore Web3 companies actively hiring. Find jobs at leading blockchain, DeFi, NFT, and crypto companies. Updated daily with latest positions.',
 alternates: {
  canonical: '/companies',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 Companies Hiring - Browse Top Blockchain Companies',
  description: 'Explore Web3 companies actively hiring. Find jobs at leading blockchain, DeFi, and crypto companies.',
  url: 'https://hashtagweb3.com/companies',
  images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Companies', width: 1200, height: 630, alt: 'Web3 Companies hiring in crypto and blockchain' }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Companies Hiring - Browse Top Blockchain Companies',
  description: 'Explore Web3 companies actively hiring in blockchain, DeFi, and crypto.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Companies'],
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
 

 
 // Find max job count for bar chart scaling
 const maxJobCount = stats.topCompanies[0]?.jobCount || 1;

 return (
  <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
    <section className="border-b bg-muted/10">
     <div className="container mx-auto px-4 page-section max-w-6xl text-center">
      <PageHeader title="Web3 Companies Hiring Now" />
      <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed site-container">
       Browse {stats.totalCompanies} companies with {stats.totalJobs} open roles across exchanges, DeFi, infrastructure, and more.
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
      </div>
     </div>
    </section>

    {/* Top Hiring - Horizontal Bar Chart */}
    <section className="bg-muted/30 border-y">
     <div className="container mx-auto px-4 page-section max-w-6xl">
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
        <Link key={company.slug} href={`/${company.slug}`} className="group">
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

    {/* Company Cards */}
    <section className="container mx-auto px-4 page-section max-w-6xl">
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...companies]
       .sort((a, b) => b.jobCount - a.jobCount)
       .map((company) => (
       <Link key={company.slug} href={`/${company.slug}`}>
        <Card className="group hover:border-primary transition-all h-full bg-muted/20">
         <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
           <h3 className="font-semibold group-hover:text-foreground transition-colors line-clamp-1">
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
   </main>
  </div>
 );
}
