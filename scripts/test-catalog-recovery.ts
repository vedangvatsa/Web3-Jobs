import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadStaticJson } from '../src/lib/load-static-json';
import { getEvents, getEventBySlug } from '../src/lib/events-server';
import { getAllTerms, getTerm } from '../src/lib/glossary';
import { getNewsFeed } from '../src/lib/news';
import { getJobs } from '../src/lib/jobs';
import { WASET_ICBT_SERIES_ID } from '../src/lib/waset-icbt';
import { getAdjacentLessons } from '../src/lib/learn';

async function main() {
  const cwd = process.cwd();
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-recovery-'));
  const originalFetch = globalThis.fetch;
  const calls = new Map<string, number>();
  const event = { id: WASET_ICBT_SERIES_ID, slug: 'waset-icbt', name: 'Conference', startDate: '2027-01-01', location: 'London', description: 'Source description.', url: 'https://example.com', coverImage: null };
  const term = { slug: 'example', term: 'Example', category: 'defi', difficulty: 'Beginner', description: 'An example.' };
  const item = { title: 'Bitcoin protocol update ships', link: 'https://example.com/news', pubDate: '2026-09-20', creator: 'Author', contentSnippet: 'Protocol update', source: 'Example' };
  const job = { id: '1', slug: 'role1', title: 'Engineer', company: 'Example', link: 'https://example.com/job', source: 'test', date: '2026-09-20' };
  const values: Record<string, unknown> = {
    'events-runtime.json': [event], 'glossary-runtime.json': [term], 'jobs-runtime.json': [job],
    'news-cache.json': { generatedAt: '2026-09-20', items: [item] }, 'dedup-test.json': { ok: true },
  };
  globalThis.fetch = async input => {
    const filename = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url).pathname.split('/').pop()!;
    const count = (calls.get(filename) || 0) + 1;
    calls.set(filename, count);
    if (count === 1 && filename !== 'dedup-test.json') {
      if (filename === 'glossary-runtime.json') return Response.json([null]);
      return new Response('Temporary failure', { status: 503 });
    }
    return Response.json(values[filename]);
  };
  try {
    process.chdir(temporary);
    await assert.rejects(getEvents(), /503/);
    assert.deepEqual(await getEvents(), [event]);
    assert.equal(await getEventBySlug('pbw'), null, 'A missing event alias must not resolve to an unrelated conference');
    assert.equal((await getEventBySlug('icbti'))?.id, event.id);
    await assert.rejects(getAllTerms(), /invalid catalog/);
    assert.deepEqual(await getAllTerms(), [term]);
    assert.equal((await getTerm('example'))?.term, 'Example');
    await assert.rejects(getJobs(), /503/);
    assert.deepEqual(await getJobs(), [job]);
    assert.deepEqual(await getNewsFeed(), []);
    assert.deepEqual(await getNewsFeed(), [item]);
    await Promise.all(Array.from({ length: 10 }, () => loadStaticJson('dedup-test.json')));
    assert.equal(calls.get('dedup-test.json'), 1);
    for (const filename of Object.keys(values).filter(name => name !== 'dedup-test.json')) assert.equal(calls.get(filename), 2, filename);
    assert.deepEqual(getAdjacentLessons('fundamentals', 'not-a-lesson'), { prev: null, next: null });
    console.log('Catalog recovery passed: events, glossary, jobs, news, invalid payloads, request deduplication and alias isolation.');
  } finally {
    process.chdir(cwd);
    globalThis.fetch = originalFetch;
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
