/**
 * Promote short canonical event slugs: update slug-migrations.json and event-slug-history.json.
 * Usage: npx tsx scripts/shorten-event-canonical-slugs.ts [--apply]
 */
import fs from 'node:fs';
import { getEventBaseSlug, type Web3Event } from '../src/lib/events';
import { loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';

const APPLY = process.argv.includes('--apply');

export function isLongEventSlug(slug: string): boolean {
  if (!slug) return false;
  const hyphens = (slug.match(/-/g) || []).length;
  return slug.length > 12 || hyphens > 2 || /^luma-(crypto|evt)-/i.test(slug);
}

export function isShortEventSlug(slug: string): boolean {
  return Boolean(slug) && /^[a-z0-9][a-z0-9_-]*$/i.test(slug) && !isLongEventSlug(slug);
}

const STOP = new Set(
  'a an and at by for from in of on the to with via or our your their this that bbw bangkok mumbai dubai singapore edition week day night'.split(
    ' ',
  ),
);

function acronymFromName(name: string): string {
  const caps = name.match(/\b[A-Z]{2,}(?:\d+)?\b/g);
  if (caps?.length) {
    const merged = caps.join('').toLowerCase();
    if (isShortEventSlug(merged)) return merged;
    if (merged.length > 3 && merged.length <= 12) return merged;
  }
  const words = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['']/g, '')
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOP.has(word) && !/^(2025|2026|2027|2028)$/.test(word));
  const initials = words.map((word) => word[0]).join('');
  if (initials.length >= 3 && initials.length <= 12) return initials;
  return '';
}

function compressSlug(slug: string): string {
  const parts = slug
    .toLowerCase()
    .split('-')
    .filter((part) => part && !STOP.has(part) && !/^\d{4}$/.test(part) && !/^\d{4}-\d{2}-\d{2}$/.test(part));
  if (!parts.length) return slug.slice(0, 12);
  const joined = parts.join('');
  if (isShortEventSlug(joined)) return joined;
  if (parts.length === 1) return parts[0].slice(0, 12);
  const hybrid = parts[0] + parts.slice(1).map((part) => part.slice(0, 2)).join('');
  if (isShortEventSlug(hybrid)) return hybrid;
  return parts[0].slice(0, 8) + String(parts.length);
}

function pickShortAlias(
  slug: string,
  name: string,
  aliases: string[],
  migrations: Record<string, string>,
): string | null {
  const shortAliases = [...new Set(aliases)].filter(isShortEventSlug);
  const meaningful = shortAliases.filter((alias) => !/^[a-z0-9]{8}$/.test(alias));
  const fromAlias = meaningful.sort((a, b) => a.length - b.length)[0]
    ?? shortAliases.sort((a, b) => a.length - b.length)[0];
  if (fromAlias) return fromAlias;

  const inverted = Object.entries(migrations).find(([key, value]) => value === slug && isShortEventSlug(key));
  if (inverted) return inverted[0];

  const forward = migrations[slug];
  if (forward && isShortEventSlug(forward)) return forward;

  if (!slug.includes('-') && slug.length > 12 && slug.length <= 16) {
    const trim = slug.slice(0, 12);
    if (trim.length >= 6 && isShortEventSlug(trim)) return trim;
  }

  const fromName = acronymFromName(name);
  if (fromName && isShortEventSlug(fromName)) return fromName;

  const base = getEventBaseSlug({ name });
  if (isShortEventSlug(base)) return base;

  const compressed = compressSlug(slug);
  if (isShortEventSlug(compressed)) return compressed;

  const truncated = slug.replace(/-/g, '').slice(0, 12);
  if (isShortEventSlug(truncated) && truncated.length >= 3) return truncated;

  return null;
}

function uniqueSlug(candidate: string, taken: Set<string>, ownSlugs: Set<string>): string {
  const normalized = candidate.toLowerCase();
  if (!taken.has(normalized) || ownSlugs.has(normalized)) return normalized;
  let slug = normalized;
  let suffix = 2;
  while (taken.has(slug) && !ownSlugs.has(slug)) slug = `${normalized}${suffix++}`;
  return slug;
}

function main() {
  const runtime = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const history = JSON.parse(fs.readFileSync('content/event-slug-history.json', 'utf8')) as Record<
    string,
    { slug: string; aliases?: string[]; canonicalId?: string }
  >;
  const migrations = JSON.parse(fs.readFileSync('content/events/slug-migrations.json', 'utf8')) as Record<
    string,
    string
  >;

  const reserved = loadReservedRootSlugsSync();
  for (const file of ['content/glossary-runtime.json', 'content/companies-runtime.json'] as const) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>;
    for (const slug of Object.keys(data)) reserved.add(slug.toLowerCase());
  }
  for (const job of JSON.parse(fs.readFileSync('content/jobs-runtime.json', 'utf8')) as Array<{ slug: string }>) {
    if (job.slug) reserved.add(job.slug.toLowerCase());
  }
  for (const article of JSON.parse(fs.readFileSync('content/articles-index.json', 'utf8')) as Array<{ slug: string }>) {
    if (article.slug) reserved.add(article.slug.toLowerCase());
  }
  const ownerBySlug = new Map<string, string>();
  for (const event of runtime) {
    if (event.slug) ownerBySlug.set(event.slug.toLowerCase(), event.id);
    for (const alias of event.aliases || []) ownerBySlug.set(alias.toLowerCase(), event.id);
  }
  const taken = new Set<string>(reserved);
  for (const slug of ownerBySlug.keys()) taken.add(slug);

  const changes: Array<{ id: string; from: string; to: string }> = [];

  for (const event of runtime) {
    const slug = event.slug?.toLowerCase().trim();
    if (!slug || !isLongEventSlug(slug)) continue;

    const record = history[event.id] ?? { slug, aliases: event.aliases ?? [] };
    const aliases = [...new Set([...(record.aliases ?? []), ...(event.aliases ?? [])])];
    let target = pickShortAlias(slug, event.name, aliases, migrations);
    if (!target) {
      console.warn(`No short slug for ${event.id} /${slug}`);
      continue;
    }
    const ownSlugs = new Set(
      [slug, ...aliases].map((value) => value.toLowerCase()).filter(Boolean),
    );
    target = uniqueSlug(target.toLowerCase(), taken, ownSlugs);
    while (reserved.has(target) && !ownSlugs.has(target)) {
      target = uniqueSlug(`${target}x`, taken, ownSlugs);
    }
    if (target === slug) continue;

    for (const old of ownSlugs) taken.delete(old);
    taken.add(target);
    changes.push({ id: event.id, from: slug, to: target });

    const legacy = Object.entries(migrations)
      .filter(([key, value]) => value === slug || key === slug)
      .flatMap(([key, value]) => [key, value]);
    const nextAliases = [...new Set([...aliases, slug, ...legacy])].filter(
      (alias) => alias && alias.toLowerCase() !== target,
    );
    history[event.id] = { ...record, slug: target, aliases: [...new Set([...nextAliases, slug])] };

    delete migrations[target];
    if (migrations[slug] && migrations[slug] !== target) {
      for (const alias of [slug, migrations[slug]]) {
        if (alias && alias !== target) migrations[alias] = target;
      }
    }
    migrations[slug] = target;
    for (const [key, value] of Object.entries({ ...migrations })) {
      if (value === slug && key !== target) migrations[key] = target;
      if (key === target && value !== target && value !== slug) {
        migrations[value] = target;
        delete migrations[key];
      }
    }
  }

  const sortedMigrations = Object.fromEntries(
    Object.entries(migrations).sort(([a], [b]) => a.localeCompare(b)),
  );

  console.log(`Short slug plan: ${changes.length} events`);
  console.log(JSON.stringify(changes.slice(0, 40), null, 2));
  if (changes.length > 40) console.log(`... and ${changes.length - 40} more`);

  if (!APPLY) {
    console.log('Dry run only; pass --apply to write files.');
    return;
  }

  fs.writeFileSync('content/events/slug-migrations.json', `${JSON.stringify(sortedMigrations, null, 2)}\n`);
  fs.writeFileSync('content/event-slug-history.json', `${JSON.stringify(history, null, 2)}\n`);
  console.log(`Wrote ${changes.length} slug migrations and history updates.`);
}

main();