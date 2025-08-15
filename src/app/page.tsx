
import { JobBoard } from '@/components/job-board';
import { Header } from '@/components/header';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { TransitioningHeadline } from '@/components/transitioning-headline';

export default async function Home() {
  const initialJobs = await getJobs();
  const headlines = [
      "Find Your Next Web3 Job",
      "Discover Top Crypto Roles",
      "Work in Blockchain",
      "Explore DeFi Careers",
      "Join a DAO Today"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
            <section className="text-center mb-8">
                <div className="max-w-6xl mx-auto">
                    <TransitioningHeadline phrases={headlines} />
                </div>
            </section>
            <div className="max-w-6xl mx-auto">
                <TrustedBy />
                <div className="text-center my-4 space-y-2">
                    <Link
                    href="https://t.me/web3hiring"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors group inline-flex items-center gap-2"
                    >
                    <Rss className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>Join our hiring feed with <strong className="text-primary">56,000+</strong> subscribers.</span>
                    </Link>
                </div>
                <JobBoard initialJobs={initialJobs} />
            </div>
        </div>
      </main>
    </div>
  );
}
