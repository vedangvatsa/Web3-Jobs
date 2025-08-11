

import { JobBoard } from '@/components/job-board';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';

export default async function Home() {
  const initialJobs = await getJobs();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="text-center mb-10 max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary">
              Find your next Web3 Job
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              The best place for top talent to discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.
            </p>
          </section>

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
