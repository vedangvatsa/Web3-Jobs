'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground flex items-center justify-center min-h-screen p-4 font-sans">
        <div className="text-center p-8 max-w-md w-full rounded-2xl border bg-card/50 shadow-lg space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
          <p className="text-sm text-muted-foreground">
            An unexpected application error occurred. Please try reloading the page.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              type="button"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="px-4 py-2 border rounded-md font-medium text-sm hover:bg-accent transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
