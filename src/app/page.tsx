import { getJobs } from '@/lib/jobs';
import { JobBoard } from '@/components/job-board';
import { Search, Briefcase, RefreshCw } from 'lucide-react';

export const revalidate = 21600; // Revalidate every 6 hours

export default async function Home() {
  const jobs = await getJobs();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-3 items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Web3 Jobs
            </h1>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="text-center mb-12">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight lg:text-5xl">
              Find Your Next Web3 Opportunity
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              The latest jobs in blockchain, crypto, and Web3, aggregated from top sources so you don't have to.
            </p>
          </section>

          <JobBoard jobs={jobs} />

          <section className="mt-20 py-16 bg-card border rounded-lg">
            <div className="container mx-auto text-center">
                <h3 className="text-3xl font-bold">Why Use Our Aggregator?</h3>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Search className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg">All-in-One Search</h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                    No more juggling tabs. We bring the best web3 jobs to you in one place.
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg">Quality Listings</h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                    Curated feeds ensure you see relevant, high-quality engineering and non-technical roles.
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <RefreshCw className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg">Always Fresh</h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                    Our board is updated every 6 hours so you never miss a new opportunity.
                    </p>
                </div>
                </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-center text-muted-foreground md:text-left">
            Built for the decentralized future.
          </p>
        </div>
      </footer>
    </div>
  );
}
