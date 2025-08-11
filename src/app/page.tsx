

import { JobBoard } from '@/components/job-board';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';
import Link from 'next/link';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const initialJobs = await getJobs();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <section className="text-center mb-8 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
              Find your next Web3 Job
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              The best place for top talent to discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.
            </p>
          </section>

          <div className="max-w-2xl mx-auto mb-8">
            <Link href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="block">
                <div className="rounded-lg bg-secondary/70 p-4 text-center transition-colors hover:bg-secondary">
                    <p className="text-sm font-semibold text-secondary-foreground">
                       Join 56,000+ subscribers on one of the largest Web3 job feeds on Telegram.
                    </p>
                </div>
            </Link>
          </div>

          <div className="max-w-6xl mx-auto">
            <TrustedBy />
            <JobBoard initialJobs={initialJobs} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
