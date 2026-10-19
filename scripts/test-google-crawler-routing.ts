import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
import { isLinkPreviewCrawlerRequest, linkPreviewPreviewPath } from '../src/lib/social-share';

test('Google search and inspection receive full detail pages, not metadata-only preview shells', async () => {
  for (const ua of ['Googlebot/2.1', 'Googlebot-Smartphone', 'Google-InspectionTool/1.0', 'Google-PageRenderer']) {
    assert.equal(isLinkPreviewCrawlerRequest({ headers: new Headers({ 'user-agent': ua }), method: 'GET' }), false);
    assert.equal(linkPreviewPreviewPath('/devcon', ua, true), null);
    assert.equal(linkPreviewPreviewPath('/devcon/x', ua, true), null);
    for (const method of ['GET', 'HEAD']) {
      const request = new NextRequest('https://hashtagweb3.com/devcon/x?utm_campaign=preserved', { method, headers: { 'user-agent': ua } });
      const response = await middleware(request);
      assert.equal(response.headers.get('x-middleware-rewrite'), null);
      assert.equal(response.status, 307);
      assert.equal(response.headers.get('location'), 'https://hashtagweb3.com/devcon?utm_campaign=preserved&utm_source=x&utm_medium=social');
    }
  }
});

test('social previews still receive their dedicated metadata shells', () => {
  for (const ua of ['Twitterbot/1.0', 'LinkedInBot/1.0', 'facebookexternalhit/1.1']) {
    assert.equal(linkPreviewPreviewPath('/devcon', ua, true), '/preview/devcon.html');
    assert.equal(linkPreviewPreviewPath('/devcon/x', ua, true), '/preview/devcon.html');
  }
});
