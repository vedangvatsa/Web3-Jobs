import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="mb-8 text-muted-foreground">
            That page may have moved or the link is outdated. Try the homepage or browse open roles.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Home
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
