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
  const responsivePath = path.join(root, 'content/responsive-images.json');
  const nomadsPath = path.join(root, 'content/nomads/cities.json');
  if (fs.existsSync(nomadsPath)) {
    assets.add('public/nomad-data-notices.txt');
    const cities = JSON.parse(fs.readFileSync(nomadsPath, 'utf8')) as Array<{ slug: string; image: string | null; thumbnail: string | null }>;
    for (const city of cities) {
      addLocalImage(city.image);
      addLocalImage(city.thumbnail);
      if (city.thumbnail) addLocalImage(city.thumbnail.replace(/-480\.webp$/, '-128.webp'));
      assets.add(`public/data/nomads/cities/${city.slug}.json`);
    }
    for (const file of ['cities', 'places', 'passports']) assets.add(`public/data/nomads/${file}.json`);
    const passports = JSON.parse(fs.readFileSync(path.join(root, 'content/nomads/countries.json'), 'utf8')) as Array<{ id: string }>;
    for (const passport of passports) assets.add(`public/data/nomads/passports/${passport.id}.json`);
    const displays = JSON.parse(fs.readFileSync(path.join(root, 'content/nomad-display-images.json'), 'utf8')) as Record<string, { base: string; width: number }>;
    for (const image of Object.values(displays)) for (const width of [480, image.width]) addLocalImage(`${image.base}-${width}.webp`);
    const toolPaths = JSON.parse(fs.readFileSync(path.join(root, 'content/nomads/tool-paths.json'), 'utf8')) as Record<string, string>;
    for (const href of [...Object.values(toolPaths), ...cities.map(city => `/${city.slug}`)]) {
      addLocalImage(`/og/pages${href}.png`);
      assets.add(`public/preview${href}.html`);
    }
  }
  if (fs.existsSync(responsivePath)) {
    const responsive = JSON.parse(fs.readFileSync(responsivePath, 'utf8')) as Record<string, { src: string; files: string[] }>;
    for (const image of Object.values(responsive)) {
      addLocalImage(image.src);
      image.files.forEach(addLocalImage);
    }
  }
  const socialPath = path.join(root, 'content/social-image-info.json');
  if (fs.existsSync(socialPath)) {
    const social = JSON.parse(fs.readFileSync(socialPath, 'utf8')) as Record<string, { url: string }>;
    for (const image of Object.values(social)) {
      const url = new URL(image.url);
      if (['hashtagweb3.com', 'www.hashtagweb3.com'].includes(url.hostname)) addLocalImage(url.pathname);
    }
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
