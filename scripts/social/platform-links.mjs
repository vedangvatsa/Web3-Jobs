import assert from 'node:assert/strict';

export const SITE_ORIGIN = 'https://hashtagweb3.com';
export const PLATFORM_SUFFIXES = Object.freeze({
  x: 'x', twitter: 'x', tw: 'x', threads: 'th', th: 'th',
  linkedin: 'li', li: 'li', telegram: 'tg', tg: 'tg',
  facebook: 'fb', fb: 'fb', instagram: 'ig', insta: 'ig', ig: 'ig',
  bluesky: 'bsky', bsky: 'bsky', farcaster: 'fc', warpcast: 'fc', warp: 'fc', fc: 'fc',
  reddit: 'rd', rd: 'rd', discord: 'dc', dc: 'dc', youtube: 'yt', yt: 'yt',
  tiktok: 'tt', tt: 'tt', whatsapp: 'wa', wa: 'wa', hackernews: 'hn', hn: 'hn',
  newsletter: 'nl', nl: 'nl', email: 'email',
});

export function platformLink(value, platform) {
  const suffix = PLATFORM_SUFFIXES[platform?.toLowerCase()];
  assert.ok(suffix, `Unknown link platform: ${platform}`);
  assert.equal(typeof value, 'string');
  const relative = value.startsWith('/') && !value.startsWith('//');
  const bare = /^(?:www\.)?hashtagweb3\.com(?:[/?#]|$)/i.test(value);
  let url;
  try { url = new URL(relative ? value : bare ? `https://${value}` : value, relative ? SITE_ORIGIN : undefined); }
  catch { return value; }
  if (!['hashtagweb3.com', 'www.hashtagweb3.com'].includes(url.hostname.toLowerCase())) return value;
  assert.ok(['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.port, 'Invalid own-site URL');
  assert.ok(!/[\\\s]/.test(value), 'Invalid own-site URL');
  const parts = url.pathname.split('/').filter(Boolean);
  while (parts.length && Object.hasOwn(PLATFORM_SUFFIXES, parts.at(-1).toLowerCase())) parts.pop();
  // Repair the old publisher's /th/<page> prefix when rendering a future post.
  if (parts.length > 1 && Object.hasOwn(PLATFORM_SUFFIXES, parts[0].toLowerCase())) parts.shift();
  return `${bare ? 'hashtagweb3.com' : SITE_ORIGIN}/${[...parts, suffix].join('/')}${url.search}${url.hash}`;
}

export function assertCanonicalLinkPath(value) {
  assert.match(value, /^\/[a-z0-9]+(?:[/-][a-z0-9]+)*$/, 'Use a canonical own-site page path');
  const parts = value.slice(1).split('/');
  assert.ok(!Object.hasOwn(PLATFORM_SUFFIXES, parts[0]) && !Object.hasOwn(PLATFORM_SUFFIXES, parts.at(-1)), 'Canonical paths must not contain tracking prefixes or suffixes');
}

export function renderOwnSiteLinks(text, platform) {
  assert.ok(PLATFORM_SUFFIXES[platform?.toLowerCase()], `Unknown link platform: ${platform}`);
  // Consume external URLs as whole tokens so an own-site name inside a query stays untouched.
  return text.replace(/https?:\/\/[^\s<>"']+|(?<![\w@./:-])(?:www\.)?hashtagweb3\.com(?=[/?#\s.,!;:)\]}]|$)[^\s<>"']*/gi, token => {
    const ending = token.match(/[.,!;:)\]}]+$/)?.[0] || '';
    const url = ending ? token.slice(0, -ending.length) : token;
    return platformLink(url, platform) + ending;
  });
}
