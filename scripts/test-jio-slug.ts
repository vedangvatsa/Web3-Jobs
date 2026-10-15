import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { load } from 'cheerio';
import { SOCIAL_UTM_MAP } from '../src/lib/social-share';

async function main() {
  let origin = process.env.TEST_BASE_URL;
  let server: ReturnType<typeof spawn> | undefined;
  let logs = '';
  try {
    if (!origin) {
      const socket = net.createServer().listen(0, '127.0.0.1');
      await once(socket, 'listening');
      const port = (socket.address() as net.AddressInfo).port;
      await new Promise<void>(resolve => socket.close(() => resolve()));
      origin = `http://127.0.0.1:${port}`;
      server = spawn(process.execPath, ['.next/standalone/server.js'], { env: { ...process.env, PORT: String(port), HOSTNAME: '127.0.0.1', NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
      server.stdout?.on('data', data => logs += data);
      server.stderr?.on('data', data => logs += data);
      for (let attempt = 0; ; attempt++) {
        assert.equal(server.exitCode, null, logs);
        try { if ((await fetch(`${origin}/favicon.ico`)).ok) break; } catch {}
        assert.ok(attempt < 100, logs);
        await delay(200);
      }
    }
    const request = (path: string, crawler = false) => fetch(origin + path, {
      redirect: 'manual', signal: AbortSignal.timeout(60000),
      headers: crawler ? { 'User-Agent': 'Twitterbot/1.0', Accept: 'text/html' } : { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' },
    });
    const article = await request('/jio-perpetuals');
    assert.equal(article.status, 200);
    const $ = load(await article.text());
    assert.equal($('link[rel="canonical"]').attr('href'), 'https://hashtagweb3.com/jio-perpetuals');
    assert.equal($('.article-tweet-card').length, 2);
    for (const id of ['2110561653758816627', '2110313996469633507']) assert.ok($(`.article-tweet-card a[href*="/status/${id}"]`).length);
    const schemas = $('script[type="application/ld+json"]').toArray().map(el => JSON.parse($(el).text()));
    const schema = schemas.find(value => value['@type'] === 'NewsArticle');
    assert.ok(schema);
    assert.ok(JSON.stringify(schema).includes('https://hashtagweb3.com/jio-perpetuals'));
    const news = await request('/news');
    assert.equal(news.status, 200);
    const listing = load(await news.text());
    assert.ok(listing('a[href="/jio-perpetuals"]').length);
    assert.equal(listing('a[href="/jio"]').length, 0);
    for (const crawler of [false, true]) for (const previous of ['/jio']) {
      const old = await request(`${previous}?utm_campaign=slug-fix&ref=kept`, crawler);
      assert.equal(old.status, 308);
      const target = new URL(old.headers.get('location')!, origin);
      assert.equal(target.pathname, '/jio-perpetuals');
      assert.equal(target.searchParams.get('utm_campaign'), 'slug-fix');
      assert.equal(target.searchParams.get('ref'), 'kept');
      const page = await request(target.pathname + target.search, crawler);
      assert.equal(page.status, 200);
      assert.equal(load(await page.text())('link[rel="canonical"]').attr('href'), 'https://hashtagweb3.com/jio-perpetuals');
    }
    for (const [suffix, utm] of Object.entries(SOCIAL_UTM_MAP)) {
      let response = await request(`/jio/${suffix}?utm_campaign=slug-fix&ref=kept`);
      assert.equal(response.status, 308, suffix);
      let target = new URL(response.headers.get('location')!, origin);
      assert.equal(target.pathname, `/jio-perpetuals/${suffix}`);
      response = await request(target.pathname + target.search);
      assert.equal(response.status, 307, suffix);
      target = new URL(response.headers.get('location')!, origin);
      assert.equal(target.pathname, '/jio-perpetuals');
      assert.equal(target.searchParams.get('utm_source'), utm.utm_source);
      assert.equal(target.searchParams.get('utm_medium'), utm.utm_medium);
      assert.equal(target.searchParams.get('utm_campaign'), 'slug-fix');
      assert.equal(target.searchParams.get('ref'), 'kept');
      if (suffix === 'tg') assert.equal((await request(target.pathname + target.search)).status, 200);
    }
    const preview = await request('/preview/jio.html');
    assert.equal(preview.status, 200);
    assert.equal(load(await preview.text())('link[rel="canonical"]').attr('href'), 'https://hashtagweb3.com/jio-perpetuals');
    console.log(JSON.stringify({ origin, article: 200, canonical: '/jio-perpetuals', newsListing: true, tweets: 2, oldRoot: 308, socialRedirects: Object.keys(SOCIAL_UTM_MAP).length, queryPreserved: true, crawlerCanonical: '/jio-perpetuals' }));
  } finally {
    if (server && server.exitCode === null) {
      const exited = once(server, 'exit');
      server.kill('SIGTERM');
      await exited;
    }
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
