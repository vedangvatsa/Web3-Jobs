import { getCompanies } from '@/lib/companies';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';
import { CompaniesBoard } from '@/components/companies-board';
import { resolveCompanyLogo, getCompanyFaviconUrl } from '@/lib/company-logo';

export const metadata: Metadata = {
 title: 'Top Web3 Companies',
 description: 'Explore Web3 companies actively hiring. Find jobs at leading blockchain, DeFi, NFT, and crypto companies. Updated daily with latest positions.',
 alternates: {
  canonical: 'https://hashtagweb3.com/companies',
 },
 openGraph: {
  type: 'website',
  title: 'Top Web3 Companies | Hashtag Web3',
  description: 'Explore Web3 companies actively hiring. Find jobs at leading blockchain, DeFi, and crypto companies.',
  url: 'https://hashtagweb3.com/companies',
  images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Companies', width: 1200, height: 630, alt: 'Web3 Companies hiring in crypto and blockchain' }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Top Web3 Companies | Hashtag Web3',
  description: 'Explore Web3 companies actively hiring in blockchain, DeFi, and crypto.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Companies'],
 },
};

export const revalidate = 3600;

export default async function CompaniesPage() {
  const companies = await getCompanies();
  const totalJobs = companies.reduce((sum, company) => sum + company.jobCount, 0);
  const topCompanies = companies.slice(0, 10);

  // Build logo map server-side (shared pattern with homepage JobBoard)
  const companyLogos: Record<string, { logo: string | null; favicon: string | null }> = {};
  for (const c of companies) {
    companyLogos[c.slug] = {
      logo: resolveCompanyLogo(c.slug),
      favicon: getCompanyFaviconUrl(c.website),
    };
  }

  // Find max job count for bar chart scaling
  const maxJobCount = topCompanies[0]?.jobCount || 1;

  return (
   <div className="flex flex-col min-h-screen">
     <main className="flex-1">
       <PageShell>
         <section className="text-center mb-8">
           <div className="site-container">
             <PageHeader
               title="Web3 Companies Hiring Now"
               description={`Browse ${companies.length} companies with ${totalJobs} open roles across exchanges, DeFi, infrastructure, and more.`}
             />
           </div>
           <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center mt-8">
             <div className="flex flex-col">
               <span className="text-4xl font-bold text-foreground mb-1">{companies.length}</span>
               <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Companies</span>
             </div>
             <div className="hidden md:block h-16 w-px bg-border" />
             <div className="flex flex-col">
               <span className="text-4xl font-bold text-foreground mb-1">{totalJobs}</span>
               <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Open Roles</span>
             </div>
           </div>
         </section>

         {/* Top Hiring - Horizontal Bar Chart (shared pattern, same card style as homepage) */}
         <section className="site-container mb-8">
           <div className="p-4 sm:p-5 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm">
             <div className="mb-6">
               <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                 <BarChart3 className="h-5 w-5 text-primary" />
                 Top companies hiring right now
               </h2>
               <p className="text-sm text-muted-foreground">Companies with the most active job openings</p>
             </div>
             <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
               {topCompanies.map((company, index) => (
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

         {/* Company Directory — reuses JobBoard/EventsBoard filter + grid pattern */}
         <section className="site-container">
           <CompaniesBoard initialCompanies={companies} companyLogos={companyLogos} />
         </section>
       </PageShell>
     </main>
   </div>
  );
}
