

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
            <Link href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="block w-full group">
                <div className="w-full rounded-lg bg-secondary/70 p-4 transition-all duration-300 group-hover:bg-secondary group-hover:shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Send className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm sm:text-base font-semibold text-secondary-foreground text-left">
                               Get top Web3 jobs in your inbox. 56k+ subscribers.
                            </p>
                        </div>
                    </div>
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
