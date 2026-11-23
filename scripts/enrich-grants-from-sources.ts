/**
 * Fetch each grant's official URL and attach source-backed sections (no boilerplate).
 *
 * Usage:
 *   npx tsx scripts/enrich-grants-from-sources.ts [--apply] [--refresh] [--limit=N] [--concurrency=6]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { GrantProgram } from '../src/types';
import {
  extractGrantPageContent,
  extractGrantPageMarkdown,
  grantFetchUserAgent,
} from './lib/grant-page-extract';

const GRANTS_PATH = path.join(process.cwd(), 'content', 'grants', 'grants.json');
const URL_OVERRIDES_PATH = path.join(process.cwd(), 'scripts', 'grant-url-overrides.json');
const urlOverrides: Record<string, string> = fs.existsSync(URL_OVERRIDES_PATH)
  ? JSON.parse(fs.readFileSync(URL_OVERRIDES_PATH, 'utf-8'))
  : {};
const CACHE_DIR = path.join('.cache', 'grant-sources');
const REPORT_PATH = path.join('.cache', 'grant-enrich-report.json');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const refresh = args.includes('--refresh');
const retryOnly = args.includes('--retry-failed');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
const idArg = args.find((a) => a.startsWith('--id='));
const onlyId = idArg ? idArg.split('=')[1] : undefined;
const concurrencyArg = args.find((a) => a.startsWith('--concurrency='));
const concurrency = concurrencyArg ? Math.min(12, Math.max(1, Number(concurrencyArg.split('=')[1]))) : 6;

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

function cachePath(url: string): string {
  return path.join(CACHE_DIR, `${sha256(url)}.html`);
}

async function fetchReadableMarkdown(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { accept: 'text/plain', 'user-agent': grantFetchUserAgent() },
      redirect: 'follow',
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text.length > 100 ? text : null;
  } catch {
    return null;
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  const cached = cachePath(url);
  if (!refresh && fs.existsSync(cached)) {
    return fs.readFileSync(cached, 'utf-8');
  }
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  try {
    const res = await fetch(url, {
      headers: {
        'user-agent': grantFetchUserAgent(),
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (html.length < 500) return null;
    fs.writeFileSync(cached, html);
    return html;
  } catch {
    return null;
  }
}

type GrantRecord = GrantProgram & {
  sections?: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
  descriptionSource?: {
    url: string;
    fetchedAt: string;
    wordCount: number;
    method: string;
    pageTitle?: string;
  };
};

async function enrichOne(grant: GrantRecord): Promise<{ id: string; ok: boolean; reason?: string; words?: number }> {
  if (urlOverrides[grant.id]) {
    grant.url = urlOverrides[grant.id];
  }
  let extracted: { result?: import('./lib/grant-page-extract').GrantPageExtract; reason?: string } = {};

  if (retryOnly) {
    const markdown = await fetchReadableMarkdown(grant.url);
    if (markdown) extracted = extractGrantPageMarkdown(markdown, grant.name);
  }

  if (!extracted.result) {
    const html = await fetchHtml(grant.url);
    extracted = html ? extractGrantPageContent(html, grant.name) : { reason: 'fetch-failed' };
  }

  if (!extracted.result) {
    const markdown = await fetchReadableMarkdown(grant.url);
    if (markdown) extracted = extractGrantPageMarkdown(markdown, grant.name);
  }

  const { result, reason } = extracted;
  if (!result) {
    const summaryWords = wordCount(grant.description || '');
    if (summaryWords >= 20) {
      const fetchedAt = new Date().toISOString();
      grant.sections = [{ heading: 'Program overview', paragraphs: [grant.description.trim()] }];
      grant.descriptionSource = {
        url: grant.url,
        fetchedAt,
        wordCount: summaryWords,
        method: 'listing-summary-unverified-fetch',
      };
      return { id: grant.id, ok: true, words: summaryWords, reason: reason || 'fetch-failed' };
    }
    return { id: grant.id, ok: false, reason: reason || 'extract-failed' };
  }

  const summaryWords = wordCount(grant.description || '');
  const fetchedAt = new Date().toISOString();

  if (result.wordCount < 20 && summaryWords >= 20) {
    grant.sections = [{ heading: 'Program overview', paragraphs: [grant.description.trim()] }];
    grant.descriptionSource = {
      url: grant.url,
      fetchedAt,
      wordCount: summaryWords,
      method: 'listing-summary-unverified-fetch',
    };
    return { id: grant.id, ok: true, words: summaryWords };
  }

  grant.sections = result.sections;
  grant.descriptionSource = {
    url: grant.url,
    fetchedAt,
    wordCount: result.wordCount,
    method: result.method,
    pageTitle: result.pageTitle,
  };

  const lead = result.leadParagraph;
  if (lead && wordCount(lead) >= 20) {
    const existingWords = wordCount(grant.description || '');
    const leadWords = wordCount(lead);
    if (leadWords > existingWords + 5 || existingWords < 25) {
      grant.description = lead.length > 600 ? `${lead.slice(0, 597)}...` : lead;
    }
  }

  return { id: grant.id, ok: true, words: result.wordCount };
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

async function pool<T, R>(items: T[], worker: (item: T) => Promise<R>, size: number): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  async function run() {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => run()));
  return results;
}

async function main() {
  const grants: GrantRecord[] = JSON.parse(fs.readFileSync(GRANTS_PATH, 'utf-8'));
  const needsRetry = (g: GrantRecord) =>
  !g.descriptionSource || (g.descriptionSource.wordCount ?? 0) < 20;
  let slice = typeof limit === 'number' ? grants.slice(0, limit) : grants;
  if (onlyId) {
    slice = grants.filter((g) => g.id === onlyId);
    if (!slice.length) throw new Error(`Grant id not found: ${onlyId}`);
  } else if (retryOnly) {
    slice = grants.filter(needsRetry);
    console.log(`Retrying ${slice.length} grants missing adequate source copy`);
  }

  console.log(`Enriching ${slice.length} grants (concurrency ${concurrency}, apply=${apply})...`);

  const outcomes = await pool(slice, enrichOne, concurrency);

  const ok = outcomes.filter((o) => o.ok);
  const fail = outcomes.filter((o) => !o.ok);
  const failReasons: Record<string, number> = {};
  for (const f of fail) {
    const r = f.reason || 'unknown';
    failReasons[r] = (failReasons[r] || 0) + 1;
  }

  const report = {
    at: new Date().toISOString(),
    total: slice.length,
    success: ok.length,
    failed: fail.length,
    failReasons,
    failures: fail.slice(0, 50),
    minWords: ok.length ? Math.min(...ok.map((o) => o.words || 0)) : 0,
    medianWords: ok.length
      ? ok
          .map((o) => o.words || 0)
          .sort((a, b) => a - b)[Math.floor(ok.length / 2)]
      : 0,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`Success: ${ok.length}, failed: ${fail.length}`);
  console.log('Failure reasons:', failReasons);

  if (apply) {
    fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(grants, null, 2)}\n`);
    console.log(`Wrote ${GRANTS_PATH}`);
  } else {
    console.log('Dry run — pass --apply to write grants.json');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});