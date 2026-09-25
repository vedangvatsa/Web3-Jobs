import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

export function requiredPublicAssets(root: string): string[] {
  const assets = new Set([
    'public/logo/HashtagWeb3.png',
    'public/favicon.ico',
    'public/icon.png',
    'public/apple-icon.png',
    'public/og-image.png',
  ]);
  const addLocalImage = (image: unknown): void => {
    if (typeof image !== 'string' || !image.startsWith('/') || image.startsWith('//')) return;
    const relative = `public${decodeURIComponent(image.split(/[?#]/)[0])}`;
    assert.ok(path.resolve(root, relative).startsWith(`${path.resolve(root, 'public')}${path.sep}`), 'Invalid public image path');
    assets.add(relative);
  };
  const events = JSON.parse(fs.readFileSync(path.join(root, 'content/events-runtime.json'), 'utf8'));
  assert.ok(Array.isArray(events), 'Expected events runtime array');
  for (const event of events) addLocalImage(event.coverImage);
  const articles = JSON.parse(fs.readFileSync(path.join(root, 'content/articles-index.json'), 'utf8'));
  assert.ok(Array.isArray(articles), 'Expected articles index array');
  for (const article of articles) {
    if (article.category === 'News') addLocalImage(article.image);
  }
  return [...assets];
}

export function assertStandalonePublicAssets(root: string, standalone: string): void {
  for (const relative of requiredPublicAssets(root)) {
    const source = path.join(root, relative);
    const target = path.join(standalone, relative);
    assert.ok(fs.existsSync(source), `Referenced public asset missing from source: ${relative}`);
    assert.ok(fs.existsSync(target), `Standalone missing ${relative}`);
    const sourceSize = fs.statSync(source).size;
    assert.ok(sourceSize > 0, `Empty public asset: ${relative}`);
    assert.equal(fs.statSync(target).size, sourceSize, `Incomplete standalone asset: ${relative}`);
  }
}
