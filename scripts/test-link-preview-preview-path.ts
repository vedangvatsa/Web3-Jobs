/**
 * Guard: linkPreviewPreviewPath matches middleware bot-preview behavior for suffixed URLs.
 */
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
import { isLinkPreviewCrawlerRequest, linkPreviewPreviewPath } from '../src/lib/social-share';

async function main(): Promise<void> {
  const cases = [
    { path: '/clarity-act/li', ua: 'LinkedInBot/1.0' },
    { path: '/sales386/x', ua: 'node-fetch/1.0' },
    { path: '/bd/tg', ua: 'Twitterbot/1.0' },
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

  console.log('[test-link-preview-preview-path] OK — helper matches middleware for sample bot paths');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
