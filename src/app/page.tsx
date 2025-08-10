import { JobBoard } from '@/components/job-board';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Hashtag Web3
          </h1>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">Feed</a>
            <a href="https://t.me/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">Discuss</a>
            <a href="https://academy.hashtagweb3.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">Academy</a>
            <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
              <Button>Post a Job</Button>
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <section className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
              Find your next Web3 Job
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The best place for top talent to discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.
            </p>
          </section>

          <JobBoard />
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 mt-12">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-xs text-center text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Hashtag Web3. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
