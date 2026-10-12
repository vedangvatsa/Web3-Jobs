/**
 * Guard: linkPreviewPreviewPath matches middleware bot-preview behavior for suffixed URLs.
 */
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
import { isLinkPreviewCrawlerRequest, linkPreviewPreviewPath } from '../src/lib/social-share';
import assert from 'node:assert/strict';
import jobs from '../content/jobs-runtime.json';
import { isJobAgeEligible } from '../src/lib/job-age-policy.mjs';

async function main(): Promise<void> {
  const job = jobs.find(job => job.slug && isJobAgeEligible(job));
  const cases = [
    { path: '/clarity-act/li', ua: 'LinkedInBot/1.0' },
    ...(job ? [
      { path: `/${job.slug}/x`, ua: 'node-fetch/1.0' },
      { path: `/${job.slug}/tg`, ua: 'Twitterbot/1.0' },
    ] : []),
  ];

  for (const { path, ua } of cases) {
    const req = new NextRequest(`https://hashtagweb3.com${path}`, { headers: { 'user-agent': ua } });
    const headless = isLinkPreviewCrawlerRequest({ headers: req.headers, method: 'GET' });
    const expected = linkPreviewPreviewPath(path, ua, headless);
    const res = await middleware(req);
    const rewrite = res.headers?.get?.('x-middleware-rewrite') || '';
    const rewritePath = rewrite ? new URL(rewrite).pathname : null;

    if (expected !== rewritePath) {
      console.error(`[test-link-preview-preview-path] mismatch ${path} ua=${ua}`);
      console.error(`  helper=${expected} middleware=${rewritePath}`);
      process.exit(1);
    }
  }

  for (const path of ['/marketing4/x', '/marketing4/tg']) {
    const response = await middleware(new NextRequest(`https://hashtagweb3.com${path}`, { headers: { 'user-agent': 'Twitterbot/1.0' } }));
    assert.equal(response.status, 410, path);
    assert.equal(response.headers.get('x-middleware-rewrite'), null, 'Retired jobs cannot reach a preview shell');
  }

  console.log('[test-link-preview-preview-path] OK — helper matches middleware for sample bot paths');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
