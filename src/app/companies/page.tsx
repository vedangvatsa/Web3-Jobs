import { Header } from '@/components/header';
import { getCompanies, getCompanyStats } from '@/lib/companies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Briefcase, TrendingUp } from 'lucide-react';
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-16">
          {/* Hero Section */}
          <section className="text-center mb-12 max-w-4xl mx-auto">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Web3 Companies Hiring
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore {stats.totalCompanies}+ blockchain and crypto companies with {stats.totalJobs} active job openings
            </p>
          </section>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Total Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalCompanies}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Active Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalJobs}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Avg Jobs/Company
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.averageJobsPerCompany}</div>
              </CardContent>
            </Card>
          </div>

          {/* Companies Grid */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">All Companies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Link key={company.slug} href={`/companies/${company.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span className="line-clamp-2">{company.name}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {company.jobCount} {company.jobCount === 1 ? 'job' : 'jobs'}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        View all open positions at {company.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
