/**
 * Promote short canonical grant slugs (≤12 chars): grants.json + legacy-slugs.json.
 * Usage: npx tsx scripts/shorten-grant-canonical-slugs.ts [--apply]
 */
import fs from 'node:fs';
import { loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';

const APPLY = process.argv.includes('--apply');
const MAX_LEN = 12;

const WORD_ABBREV: Record<string, string> = {
  startups: 'stu',
  startup: 'stu',
  grants: 'g',
  grant: 'g',
  marketing: 'mkt',
  ecosystem: 'eco',
  foundation: 'fnd',
  program: 'prg',
  programmes: 'prg',
  programme: 'prg',
  accelerator: 'accel',
  community: 'comm',
  developer: 'dev',
  developers: 'dev',
  builders: 'bld',
  builder: 'bld',
  funding: 'fund',
  financial: 'fin',
  finance: 'fin',
  innovation: 'inno',
  incubator: 'inc',
  incubation: 'inc',
  fellowship: 'fellow',
  fellowships: 'fellow',
  research: 'r',
  security: 'sec',
  audit: 'aud',
  credits: 'cred',
  network: 'net',
  blockchain: 'bc',
  growth: 'gr',
  catalyst: 'cat',
  mentorship: 'ment',
  stablecoin: 'stab',
  treasury: 'treas',
  onchain: 'och',
  quadratic: 'qf',
  matching: 'match',
  academic: 'acad',
  hardware: 'hw',
  engineering: 'eng',
  agentic: 'agent',
  agents: 'agent',
  cloud: 'cld',
  enterprise: 'ent',
  for: '',
  the: '',
  and: '',
  with: '',
  labs: 'lab',
  open: 'op',
  source: 'src',
};

const STOP = new Set(['a', 'an', 'of', 'in', 'to', 'by', 'or', 'our', 's']);

export function isLongGrantSlug(slug: string): boolean {
  return Boolean(slug) && slug.length > MAX_LEN;
}

function abbrevPart(part: string): string {
  if (!part) return '';
  const lower = part.toLowerCase();
  if (WORD_ABBREV[lower] !== undefined) return WORD_ABBREV[lower];
  if (/^\d/.test(lower) && lower.length > 5) return lower.replace(/^(\d+)([a-z]+).*/, '$1$2').slice(0, 5);
  if (lower.length <= 4 || /^\d/.test(lower)) return lower;
  if (lower.endsWith('ies') && lower.length > 5) return `${lower.slice(0, lower.length - 3)}y`.slice(0, 4);
  if (lower.endsWith('ing') && lower.length > 6) return lower.slice(0, 4);
  if (lower.endsWith('tion') && lower.length > 7) return lower.slice(0, 4);
  return lower.slice(0, 4);
}

function compressSlug(slug: string): string {
  const parts = slug
    .toLowerCase()
    .split('-')
    .map((p) => p.trim())
    .filter((p) => p && !STOP.has(p));

  const abbreviated = parts.map(abbrevPart).filter(Boolean);
  let candidate = abbreviated.join('-');
  if (candidate.length <= MAX_LEN && candidate.length >= 2) return candidate;

  const tight = abbreviated.join('');
  if (tight.length <= MAX_LEN && tight.length >= 2) return tight;

  const hybrid =
    (abbreviated[0] ?? slug.slice(0, 6)) +
    abbreviated
      .slice(1)
      .map((p) => p.slice(0, 2))
      .join('');
  if (hybrid.length <= MAX_LEN && hybrid.length >= 2) return hybrid;

  const first = (parts[0] ?? slug).slice(0, 6);
  const tail = parts
    .slice(1)
    .map((p) => abbrevPart(p).slice(0, 2))
    .join('');
  candidate = `${first}${tail}`.replace(/-+$/, '');
  if (candidate.length <= MAX_LEN && candidate.length >= 2) return candidate;

  return slug.replace(/-/g, '').slice(0, MAX_LEN);
}

function enforceMaxLen(slug: string, parts: string[]): string {
  if (slug.length <= MAX_LEN) return slug;
  const head = abbrevPart(parts[0] ?? slug).slice(0, 5);
  const tail = parts
    .slice(1)
    .map((p) => abbrevPart(p))
    .filter(Boolean)
    .join('');
  const compact = `${head}-${tail}`.replace(/-+$/, '').replace(/^-+/, '');
  if (compact.length <= MAX_LEN && compact.length >= 2) return compact;
  const tight = `${head}${tail}`.slice(0, MAX_LEN);
  if (tight.length >= 2) return tight;
  return slug.replace(/-/g, '').slice(0, MAX_LEN);
}

function isValidGrantSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug) && slug.length <= MAX_LEN && slug.length >= 2;
}

function uniqueSlug(candidate: string, taken: Set<string>, ownSlugs: Set<string>): string {
  const normalized = candidate.toLowerCase();
  if (!taken.has(normalized) || ownSlugs.has(normalized)) return normalized;
  let suffix = 2;
  while (suffix < 100) {
    const base = normalized.slice(0, Math.max(2, MAX_LEN - String(suffix).length));
    const next = `${base}${suffix}`;
    if (!taken.has(next) || ownSlugs.has(next)) return next;
    suffix += 1;
  }
  return normalized.slice(0, MAX_LEN);
}

function renameJsonKeys(filePath: string, idMap: Map<string, string>) {
  if (!fs.existsSync(filePath)) return 0;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  let renames = 0;
  for (const [oldId, newId] of idMap) {
    if (oldId === newId || !(oldId in data)) continue;
    data[newId] = data[oldId];
    delete data[oldId];
    renames += 1;
  }
  if (APPLY && renames > 0) {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  }
  return renames;
}

function renameThinExpansionKeys(filePath: string, idMap: Map<string, string>) {
  if (!fs.existsSync(filePath)) return 0;
  let text = fs.readFileSync(filePath, 'utf8');
  let renames = 0;
  for (const [oldId, newId] of idMap) {
    if (oldId === newId) continue;
    const pattern = new RegExp(`(^|\\n\\s*)\"${oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\":`, 'g');
    const next = text.replace(pattern, `$1"${newId}":`);
    if (next !== text) {
      text = next;
      renames += 1;
    }
  }
  if (APPLY && renames > 0) fs.writeFileSync(filePath, text);
  return renames;
}

function main() {
  const grantsPath = 'content/grants/grants.json';
  const legacyPath = 'content/grants/legacy-slugs.json';
  const grants = JSON.parse(fs.readFileSync(grantsPath, 'utf8')) as Array<{ id: string; name?: string }>;
  const legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf8')) as Record<string, string>;

  const reserved = loadReservedRootSlugsSync();
  for (const file of ['content/glossary-runtime.json', 'content/companies-runtime.json'] as const) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>;
    for (const slug of Object.keys(data)) reserved.add(slug.toLowerCase());
  }
  const slugTypes = JSON.parse(fs.readFileSync('content/slug-types.json', 'utf8')) as {
    events?: string[];
    grants?: string[];
  };
  for (const slug of [...(slugTypes.events ?? []), ...(slugTypes.grants ?? [])]) {
    reserved.add(slug.toLowerCase());
  }

  const taken = new Set<string>();
  for (const g of grants) {
    if (g.id && !isLongGrantSlug(g.id)) taken.add(g.id.toLowerCase());
  }
  for (const value of Object.values(legacy)) taken.add(value.toLowerCase());

  const idMap = new Map<string, string>();
  const changes: Array<{ from: string; to: string; name?: string }> = [];

  for (const grant of grants) {
    const from = grant.id?.toLowerCase().trim();
    if (!from || !isLongGrantSlug(from)) continue;

    const fromParts = from.split('-').filter(Boolean);
    let target = enforceMaxLen(compressSlug(from), fromParts);
    if (!isValidGrantSlug(target)) target = from.replace(/-/g, '').slice(0, MAX_LEN);
    const ownSlugs = new Set([from]);
    target = uniqueSlug(target, taken, ownSlugs);
    while (reserved.has(target) && !ownSlugs.has(target)) {
      target = uniqueSlug(`${target.slice(0, 9)}x`, taken, ownSlugs);
    }
    if (!isValidGrantSlug(target)) {
      console.warn(`No valid short slug for ${from} (got ${target})`);
      continue;
    }
    if (target === from) continue;

    taken.delete(from);
    taken.add(target);
    idMap.set(from, target);
    changes.push({ from, to: target, name: grant.name });
  }

  console.log(`Short slug plan: ${changes.length} grants`);
  console.log(JSON.stringify(changes.slice(0, 30), null, 2));
  if (changes.length > 30) console.log(`... and ${changes.length - 30} more`);

  const stillLong = changes.filter((c) => c.to.length > MAX_LEN);
  if (stillLong.length) {
    console.warn(`${stillLong.length} targets still > ${MAX_LEN}:`, stillLong.slice(0, 10));
    process.exitCode = 1;
    return;
  }

  if (!APPLY) {
    console.log('Dry run only; pass --apply to write files.');
    return;
  }

  for (const grant of grants) {
    const next = idMap.get(grant.id.toLowerCase());
    if (next) grant.id = next;
  }
  fs.writeFileSync(grantsPath, `${JSON.stringify(grants, null, 2)}\n`);

  for (const [oldId, newId] of idMap) {
    legacy[oldId] = newId;
  }
  for (const [key, value] of Object.entries({ ...legacy })) {
    const mapped = idMap.get(value.toLowerCase());
    if (mapped) legacy[key] = mapped;
  }
  const sortedLegacy = Object.fromEntries(Object.entries(legacy).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(legacyPath, `${JSON.stringify(sortedLegacy, null, 2)}\n`);

  const copyeditRenames = renameJsonKeys('content/grants/copyedit-status.json', idMap);
  const thinRenames = renameThinExpansionKeys('scripts/thin-grant-expansions.ts', idMap);

  console.log(
    `Wrote ${changes.length} grant id updates, ${Object.keys(sortedLegacy).length} legacy mappings, ` +
      `${copyeditRenames} copyedit keys, ${thinRenames} thin-expansion keys.`,
  );
}

main();