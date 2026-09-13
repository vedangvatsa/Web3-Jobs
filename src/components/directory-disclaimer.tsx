export function DirectoryDisclaimer({ type }: { type: 'job' | 'event' }) {
  const listing = type === 'job' ? 'job opportunities' : 'events';

  return (
    <aside className="mt-10 rounded-lg border bg-muted/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      Listings are provided for information only. Verify {listing} independently before applying, registering, sharing information, or making a payment. You act at your own discretion; Hashtag Web3 does not endorse, guarantee, or accept responsibility for listings or losses arising from them.
    </aside>
  );
}
