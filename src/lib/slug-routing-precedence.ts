/**
 * Mirrors root `/{slug}` resolution in src/app/[slug]/page.tsx (and static app routes).
 * Job posts are never omitted: a shared root URL is a collision, not a shadow.
 */
export type SlugCollisionEntry = { type: string; title: string };

export function applySlugRoutingPrecedence(
  _slug: string,
  entries: SlugCollisionEntry[],
): SlugCollisionEntry[] {
  let out = [...entries];
  const has = (type: string) => out.some((e) => e.type === type);

  // Static app routes never run the [slug] resolver, so a legacy alias there
  // cannot be served. Live job posts stay in the set so the audit fails.
  if (has('Built-in App Route')) {
    out = out.filter((e) => e.type !== 'Legacy Job Alias');
  }

  if (has('Job Post')) {
    out = out.filter((e) => e.type !== 'Legacy Job Alias');
  }

  if (has('Event')) {
    out = out.filter((e) => e.type !== 'Legacy Job Alias');
  }

  return out;
}
