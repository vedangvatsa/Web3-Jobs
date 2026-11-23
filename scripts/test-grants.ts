import fs from 'fs';
import path from 'path';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords } from '../src/lib/grant-editorial';
import { grantApplicationStatus } from './lib/grant-application-status';

const GRANTS_PATH = path.join(process.cwd(), 'content', 'grants', 'grants.json');
const GRANTS_META_PATH = path.join(process.cwd(), 'content', 'grants-meta.json');
const SLUG_TYPES_PATH = path.join(process.cwd(), 'content', 'slug-types.json');

function runTests() {
  console.log('--- Testing Grants Dataset Integrity ---');

  if (!fs.existsSync(GRANTS_PATH)) {
    throw new Error(`Grants file not found at ${GRANTS_PATH}`);
  }

  const raw = fs.readFileSync(GRANTS_PATH, 'utf-8');
  const grants = JSON.parse(raw);

  if (!Array.isArray(grants) || grants.length === 0) {
    throw new Error('Grants dataset must be a non-empty array');
  }

  console.log(`Loaded ${grants.length} grants from content/grants/grants.json`);

  if (fs.existsSync(GRANTS_META_PATH)) {
    const meta = JSON.parse(fs.readFileSync(GRANTS_META_PATH, 'utf-8')) as { total?: number };
    if (meta.total !== grants.length) {
      throw new Error(
        `grants-meta.json total (${meta.total}) does not match grants.json length (${grants.length}). Run npx tsx scripts/generate-slug-types.ts`,
      );
    }
  }

  if (fs.existsSync(SLUG_TYPES_PATH)) {
    const slugTypes = JSON.parse(fs.readFileSync(SLUG_TYPES_PATH, 'utf-8')) as { grants?: string[] };
    const grantSlugs = slugTypes.grants ?? [];
    if (grantSlugs.length !== grants.length) {
      throw new Error(
        `slug-types.json grants (${grantSlugs.length}) does not match grants.json length (${grants.length}). Run npx tsx scripts/generate-slug-types.ts`,
      );
    }
  }

  const seenIds = new Set<string>();
  const bannedUrls = [
    'app.optimism.io/retropgf',
    'sui.io/grants',
    'grants.gitcoin.co',
    'chain.link/community/grants',
    'coliseum.org',
  ];
  const bannedSourceMethods = ['listing-summary-unverified-fetch', 'listing-description-live-url'];

  for (let i = 0; i < grants.length; i++) {
    const g = grants[i];

    if (!g.id || typeof g.id !== 'string') {
      throw new Error(`Grant at index ${i} missing valid id`);
    }

    if (seenIds.has(g.id)) {
      throw new Error(`Duplicate grant id found: ${g.id}`);
    }
    seenIds.add(g.id);

    if (!g.name || typeof g.name !== 'string') {
      throw new Error(`Grant ${g.id} missing name`);
    }

    if (!g.url || !g.url.startsWith('http')) {
      throw new Error(`Grant ${g.id} missing valid http(s) url: ${g.url}`);
    }

    if (!g.description || typeof g.description !== 'string') {
      throw new Error(`Grant ${g.id} missing description`);
    }

    if (!g.category || typeof g.category !== 'string') {
      throw new Error(`Grant ${g.id} missing category`);
    }

    if (!g.type || typeof g.type !== 'string') {
      throw new Error(`Grant ${g.id} missing type`);
    }

    for (const banned of bannedUrls) {
      if (g.url.includes(banned)) {
        throw new Error(`Grant ${g.id} contains banned/stale URL: ${g.url}`);
      }
    }

    const method = (g as { descriptionSource?: { method?: string } }).descriptionSource?.method;
    if (method && bannedSourceMethods.includes(method)) {
      throw new Error(
        `Grant ${g.id} uses unverified listing copy (${method}). Remove it or fix the official URL, then re-run enrich after liveness passes.`,
      );
    }

    const urlLive = (g as { urlLive?: { ok?: boolean } }).urlLive;
    if (!urlLive?.ok) {
      throw new Error(
        `Grant ${g.id} is not URL-live. Run: npx tsx scripts/verify-grant-liveness.ts --apply (and remove dead programs from the catalog).`,
      );
    }
  }

  const MIN_SOURCE_WORDS = 120;
  const thinPages: string[] = [];
  for (const g of grants) {
    if (countStoredGrantWords(g as GrantProgram) < MIN_SOURCE_WORDS) {
      thinPages.push((g as GrantProgram).id);
    }
  }
  if (thinPages.length > 0) {
    throw new Error(
      `${thinPages.length} grant pages are thin (< ${MIN_SOURCE_WORDS} stored words). ` +
        `Run: npx tsx scripts/enrich-grants-from-sources.ts --apply --thin-only --min-words=120 --refresh; then npx tsx scripts/prune-thin-grants.ts --apply. ` +
        `First ids: ${thinPages.slice(0, 10).join(', ')}`,
    );
  }

  const notAccepting: string[] = [];
  for (const g of grants) {
    const status = grantApplicationStatus(g as GrantProgram);
    if (!status.ok) notAccepting.push(`${g.id} (${status.reason})`);
  }
  if (notAccepting.length > 0) {
    throw new Error(
      `${notAccepting.length} grants are not accepting applications. Run: npx tsx scripts/prune-closed-grants.ts --apply. ${notAccepting.join(', ')}`,
    );
  }

  console.log(`✓ All ${grants.length} grants passed integrity, slug, source-body, and application-open checks!`);
}

runTests();
