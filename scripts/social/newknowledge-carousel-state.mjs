import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { CAMPAIGN } from './newknowledge-content.mjs';
import { durableReceipt, REPOSITORY } from './newknowledge-state.mjs';

export { localJournal } from './newknowledge-state.mjs';
export const CAROUSEL_START = '2026-10-21';
export const CAROUSEL_END = '2026-11-16';
export const CAROUSEL_PLATFORMS = Object.freeze(['linkedin', 'instagram']);

export function assertCarouselDate(date) {
  assert.match(date, /^2026-\d{2}-\d{2}$/, 'Invalid carousel date');
  assert.ok(date >= CAROUSEL_START && date <= CAROUSEL_END && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date, 'Unsupported carousel date');
}

export function carouselReceiptPath(date, platform) {
  assertCarouselDate(date);
  assert.ok(CAROUSEL_PLATFORMS.includes(platform), 'Unsupported carousel platform');
  return `scripts/social/newknowledge-carousel-receipts/${CAMPAIGN}/${date}-${platform}.json`;
}

export function githubCarouselReceipt({ date, platform, token, record, fetcher = fetch, readOnly = true }) {
  assert.ok(token, 'GITHUB_TOKEN required for carousel receipts');
  const url = `https://api.github.com/repos/${REPOSITORY}/contents/${carouselReceiptPath(date, platform)}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'X-GitHub-Api-Version': '2022-11-28' };
  const store = durableReceipt({
    record,
    read: async () => {
      const response = await fetcher(`${url}?ref=main&read=${randomUUID()}`, { headers, redirect: 'error', signal: AbortSignal.timeout(30000) });
      if (response.status === 404) return { state: null, text: null, sha: null };
      assert.ok(response.ok, `Carousel receipt read failed: HTTP ${response.status}`);
      const result = await response.json();
      assert.ok(result.sha && result.encoding === 'base64' && result.content, 'Invalid carousel receipt response');
      const text = Buffer.from(result.content, 'base64').toString('utf8');
      return { state: JSON.parse(text), text, sha: result.sha };
    },
    write: async ({ sha, text }) => {
      assert.ok(!readOnly, 'Read-only carousel receipts');
      const response = await fetcher(url, {
        method: 'PUT', headers, redirect: 'error', signal: AbortSignal.timeout(30000),
        body: JSON.stringify({ message: `chore(social): knowledge carousel ${date} ${platform} receipt [skip ci]`, branch: 'main', ...(sha ? { sha } : {}), content: Buffer.from(text).toString('base64') }),
      });
      const result = await response.json();
      if (response.ok) assert.ok(result.content?.sha && result.commit?.sha, 'Missing carousel receipt write acknowledgement; publishing stopped');
      return { ok: response.ok, status: response.status, message: result.message };
    },
  });
  return { load: () => store.load(), save: state => {
    assert.ok(!readOnly, 'Read-only carousel receipts');
    return store.save(state);
  } };
}
