

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
        <div className="container mx-auto px-4 py-8 md:py-16">
          <section className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
              Find your next Web3 Job
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The best place for top talent to discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.
            </p>
          </section>

          <TrustedBy />

          <JobBoard initialJobs={initialJobs} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
