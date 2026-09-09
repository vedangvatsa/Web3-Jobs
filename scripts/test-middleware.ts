import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';

async function runMiddlewareTests() {
  console.log('🧪 Running automated middleware regression & integration tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      passed++;
      console.log(`  ✅ PASS: ${testName}`);
    } else {
      failed++;
      console.error(`  ❌ FAIL: ${testName}`);
      if (detail) console.error(`     Detail: ${detail}`);
    }
  }

  // 1. Test Social UTM Suffix Redirects for Root and Nested Routes
  const socialTests = [
    { input: '/x', expectedBase: '/', utm_source: 'x' },
    { input: '/tg', expectedBase: '/', utm_source: 'telegram' },
    { input: '/li', expectedBase: '/', utm_source: 'linkedin' },
    { input: '/th', expectedBase: '/', utm_source: 'threads' },
    { input: '/bd/tg', expectedBase: '/bd', utm_source: 'telegram' },
    { input: '/trader/x', expectedBase: '/trader', utm_source: 'x' },
    { input: '/jobs/li', expectedBase: '/jobs', utm_source: 'linkedin' },
    { input: '/company/binance/th', expectedBase: '/company/binance', utm_source: 'threads' },
  ];

  console.log('1. Testing Social UTM Suffix Shortcuts...');
  for (const t of socialTests) {
    try {
      const req = new NextRequest(`https://hashtagweb3.com${t.input}`, {
        headers: {
          'user-agent': 'Mozilla/5.0',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-dest': 'document',
          'sec-fetch-user': '?1',
        },
      });
      const res = middleware(req);

      assert(res.status === 307, `Redirect status 307 for ${t.input}`);
      const location = res.headers.get('location');
      const expectedUrl = `https://hashtagweb3.com${t.expectedBase}?utm_source=${t.utm_source}&utm_medium=social&utm_campaign=share`;
      assert(
        location === expectedUrl,
        `Location header for ${t.input}`,
        `Got "${location}", expected "${expectedUrl}"`
      );
    } catch (err: any) {
      assert(false, `No runtime error for ${t.input}`, err?.message || String(err));
    }
  }

  // 2. Test Social Crawlers (Twitterbot, TelegramBot, etc.) receive rewrite 200 without redirect loop
  console.log('\n2. Testing Social Link Preview Bots (Twitterbot, TelegramBot, etc.)...');
  const crawlerBots = [
    { name: 'Twitterbot', ua: 'Twitterbot/1.0' },
    { name: 'TelegramBot', ua: 'TelegramBot (like TwitterBot)' },
    { name: 'LinkedInBot', ua: 'LinkedInBot/1.0' },
    { name: 'Meta-ExternalAgent', ua: 'Meta-ExternalAgent/1.0' },
    { name: 'Meta-ExternalFetcher', ua: 'Meta-ExternalFetcher/1.1' },
    { name: 'BufferBot', ua: 'BufferBot/1.0' },
    { name: 'redditbot', ua: 'redditbot/1.0' },
    { name: 'Applebot', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1)' },
  ];

  for (const bot of crawlerBots) {
    try {
      const req = new NextRequest('https://hashtagweb3.com/bd/tg', {
        headers: { 'user-agent': bot.ua },
      });
      const res = middleware(req);
      assert(
        res.status === 200 && res.headers.get('x-middleware-rewrite')?.includes('/bd'),
        `Social crawler preview rewrite for ${bot.name}`
      );
    } catch (err: any) {
      assert(false, `No runtime error for crawler ${bot.name}`, err?.message || String(err));
    }
  }

  // 3. Test ?mode=agent Rewrite
  console.log('\n3. Testing ?mode=agent rewrite...');
  try {
    const req = new NextRequest('https://hashtagweb3.com/jobs?mode=agent');
    const res = middleware(req);
    assert(
      res.headers.get('x-middleware-rewrite')?.endsWith('/api/agent-view'),
      '?mode=agent rewrites to /api/agent-view'
    );
  } catch (err: any) {
    assert(false, '?mode=agent runtime execution', err?.message || String(err));
  }

  // 4. Test AI Bot UAs and Accept: text/markdown logic
  console.log('\n4. Testing AI Agent / Markdown Content Negotiation...');
  try {
    const knownMdReq = new NextRequest('https://hashtagweb3.com/auth', {
      headers: { 'user-agent': 'GPTBot/1.0' },
    });
    const knownMdRes = middleware(knownMdReq);
    assert(
      knownMdRes.headers.get('x-middleware-rewrite')?.endsWith('/auth.md'),
      'GPTBot on /auth rewrites to /auth.md'
    );

    const unknownMdReq = new NextRequest('https://hashtagweb3.com/bd', {
      headers: { 'user-agent': 'GPTBot/1.0' },
    });
    const unknownMdRes = middleware(unknownMdReq);
    assert(
      unknownMdRes.headers.get('x-middleware-rewrite')?.endsWith('/api/agent-view'),
      'GPTBot on /bd rewrites to /api/agent-view instead of 404ing'
    );
  } catch (err: any) {
    assert(false, 'AI bot markdown negotiation runtime execution', err?.message || String(err));
  }

  // 5. Test /api Route Rate Limiting Headers
  console.log('\n5. Testing /api/ Rate Limiting Headers...');
  try {
    const apiReq = new NextRequest('https://hashtagweb3.com/api/jobs');
    const apiRes = middleware(apiReq);
    assert(
      apiRes.status === 200,
      '/api/jobs passes middleware with status 200'
    );
  } catch (err: any) {
    assert(false, '/api/ jobs middleware runtime execution', err?.message || String(err));
  }

  console.log(`\n========================================`);
  console.log(`Middleware Test Results: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    console.error('💥 Middleware tests failed! Halting build.');
    process.exit(1);
  } else {
    console.log('✅ All middleware tests passed cleanly!');
  }
}

runMiddlewareTests().catch((err) => {
  console.error('Fatal error running middleware tests:', err);
  process.exit(1);
});
