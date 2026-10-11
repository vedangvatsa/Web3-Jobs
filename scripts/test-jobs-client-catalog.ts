import assert from 'node:assert/strict';
import { fetchJobsPage } from '../src/lib/jobs-client-catalog';
import type { Job } from '../src/types';

async function main() {
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  let now = originalNow();
  Date.now = () => now;
  const catalog: Job[] = Array.from({ length: 120 }, (_, index) => ({
    id: String(index), slug: `role${index}`, title: index % 2 ? 'Engineer' : 'Account Executive',
    company: 'Example Labs', source: 'test', link: `https://example.com/jobs/${index}`, date: '2026-09-20',
  }));
  let calls = 0;
  globalThis.fetch = async (input, init) => {
    if (input === '/data/company-image-variants.json') return Response.json({});
    assert.equal(input, '/data/jobs-runtime.json');
    assert.equal(init?.cache, calls >= 3 ? 'no-cache' : undefined, 'Only expired snapshots revalidate the HTTP cache');
    calls++;
    if (calls === 1) return new Response('{"error":"Not Found"}', { status: 404 });
    if (calls === 2) return Response.json([{ id: 'malformed' }]);
    return Response.json(catalog);
  };
  try {
    await assert.rejects(fetchJobsPage({ limit: 50, offset: 50 }), /HTTP 404/);
    await assert.rejects(fetchJobsPage({ limit: 50, offset: 50 }), /Invalid jobs catalog/);
    const [second, third] = await Promise.all([
      fetchJobsPage({ limit: 50, offset: 50 }), fetchJobsPage({ limit: 50, offset: 100 }),
    ]);
    assert.equal(calls, 3, 'Concurrent requests share one catalog load');
    assert.equal(second.data.length, 50);
    assert.equal(second.data[0].id, '50');
    assert.equal(third.data.length, 20);
    assert.equal(third.meta.total, 120);
    const search = await fetchJobsPage({ search: 'Engineer', limit: 50, offset: 0 });
    assert.equal(search.meta.total, 60);
    assert.equal(calls, 3, 'Pagination and search reuse the successful catalog');
    now += 5 * 60 * 1000 + 1;
    catalog.unshift({ ...catalog[0], id: 'new-role', slug: 'new-role' });
    const refreshed = await fetchJobsPage({ limit: 50, offset: 0 });
    assert.equal(calls, 4);
    assert.equal(refreshed.meta.total, 121);
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(fetchJobsPage({ limit: 50, offset: 0, signal: controller.signal }), { name: 'AbortError' });
    console.log('Jobs catalog passed: recovery from 404/malformed data, pagination, search, request deduplication and cancellation.');
  } finally { globalThis.fetch = originalFetch; Date.now = originalNow; }
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
