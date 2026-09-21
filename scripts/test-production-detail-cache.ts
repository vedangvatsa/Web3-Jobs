import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import jobs from '../content/jobs-runtime.json';
import events from '../content/events-runtime.json';
import articles from '../content/articles-index.json';
import { classifySlug } from '../src/lib/slug-classifier';

const origin = process.env.PRODUCTION_TEST_URL || 'http://127.0.0.1:3130';

async function main() {
  const job = jobs.find((entry) => entry.slug && classifySlug(entry.slug) === 'job');
  const event = events.find((entry) => entry.slug === 'token2049') ?? events[0];
  const article = articles.find((entry) => classifySlug(entry.slug) === 'article');
  assert.ok(job?.slug && event.slug && article?.slug);
  for (const [slug, marker] of [[job.slug, 'data-job-page'], [event.slug, 'data-event-page'], [article.slug, '<h1']] as const) {
    const response = await fetch(`${origin}/${slug}`, { signal: AbortSignal.timeout(30_000) });
    assert.equal(response.status, 200, `Unbuilt detail /${slug} must render successfully`);
    assert.ok((await response.text()).includes(marker), `Missing content on /${slug}`);
    const first = response.headers.get('x-nextjs-cache');
    let cached = false;
    for (let attempt = 0; attempt < 10 && !cached; attempt++) {
      const next = await fetch(`${origin}/${slug}`, { signal: AbortSignal.timeout(30_000) });
      assert.equal(next.status, 200);
      await next.text();
      cached = next.headers.get('x-nextjs-cache') === 'HIT';
      if (!cached) await delay(100);
    }
    assert.ok(cached, `/${slug} must be cached after its first production request`);
    console.log(`/${slug}: 200, first cache=${first}, subsequent cache=HIT`);
  }
  console.log('Production ISR checks passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
