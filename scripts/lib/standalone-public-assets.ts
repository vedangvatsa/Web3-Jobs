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
    'public/data/citizenship.json',
    'public/preview/citizenship.html',
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
    const legacyTools = JSON.parse(fs.readFileSync(path.join(root, 'content/nomads/legacy-routes.json'), 'utf8')) as Record<string, string>;
    for (const href of [...Object.values(toolPaths).filter(href => !legacyTools[href]), ...cities.map(city => `/${city.slug}`)]) {
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

function staticFiles(directory: string): string[] {
  assert.ok(fs.existsSync(directory), `Missing generated static directory: ${directory}`);
  assert.ok(fs.lstatSync(directory).isDirectory(), `Expected a real static directory: ${directory}`);
  const files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...staticFiles(file).map(relative => path.join(entry.name, relative)));
    } else {
      assert.ok(entry.isFile(), `Generated static asset must be a regular file: ${file}`);
      files.push(entry.name);
    }
  }
  return files.sort();
}

export function requiredBuildStaticAssets(root: string): string[] {
  const nextRoot = path.join(root, '.next');
  const assets = new Set(staticFiles(path.join(nextRoot, 'static')).map(file => path.join('.next/static', file)));
  assert.ok(assets.size > 0, 'Generated .next/static is empty');
  const addReference = (value: unknown): void => {
    if (typeof value === 'string') {
      if (!/^(?:\/_next\/)?static\//.test(value)) return;
      const relative = decodeURIComponent(value.replace(/^\/_next\//, ''));
      const file = path.resolve(nextRoot, relative);
      assert.ok(!relative.includes('\\') && !relative.includes('\0') && file.startsWith(`${path.resolve(nextRoot, 'static')}${path.sep}`), `Invalid generated static reference: ${value}`);
      assets.add(path.relative(root, file));
    } else if (Array.isArray(value)) {
      value.forEach(addReference);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(addReference);
    }
  };
  for (const manifest of ['build-manifest.json', 'app-build-manifest.json', 'react-loadable-manifest.json', 'server/next-font-manifest.json']) {
    const file = path.join(nextRoot, manifest);
    if (manifest === 'build-manifest.json') assert.ok(fs.existsSync(file), 'Missing .next/build-manifest.json');
    if (fs.existsSync(file)) addReference(JSON.parse(fs.readFileSync(file, 'utf8')));
  }
  for (const manifest of fs.globSync('server/app/**/*_client-reference-manifest.js', { cwd: nextRoot })) {
    const text = fs.readFileSync(path.join(nextRoot, manifest), 'utf8');
    for (const match of text.matchAll(/"(?:static\/|\/_next\/static\/)[^"\r\n]+"/g)) addReference(JSON.parse(match[0]));
  }
  assert.ok([...assets].some(file => file.endsWith('.js')), 'Generated .next/static has no JavaScript');
  for (const relative of assets) {
    const source = path.join(root, relative);
    assert.ok(fs.existsSync(source), `Referenced build static asset missing from source: ${relative}`);
    assert.ok(fs.lstatSync(source).isFile(), `Generated static asset must be a regular file: ${relative}`);
    assert.ok(fs.statSync(source).size > 0, `Empty build static asset: ${relative}`);
  }
  return [...assets].sort();
}

function assertIdenticalAsset(root: string, standalone: string, relative: string, kind: string): void {
  const source = path.join(root, relative);
  const target = path.join(standalone, relative);
  assert.ok(fs.existsSync(source), `Referenced ${kind} asset missing from source: ${relative}`);
  assert.ok(fs.existsSync(target), `Standalone missing ${relative}`);
  assert.ok(fs.lstatSync(source).isFile() && fs.lstatSync(target).isFile(), `Expected regular ${kind} asset: ${relative}`);
  const sourceBytes = fs.readFileSync(source);
  assert.ok(sourceBytes.length > 0, `Empty ${kind} asset: ${relative}`);
  assert.ok(sourceBytes.equals(fs.readFileSync(target)), `Incomplete standalone asset (bytes differ): ${relative}`);
}

export function assertStandaloneBuildStaticAssets(root: string, standalone: string): void {
  const required = requiredBuildStaticAssets(root);
  for (const relative of required) assertIdenticalAsset(root, standalone, relative, 'build static');
  const copied = staticFiles(path.join(standalone, '.next/static')).map(file => path.join('.next/static', file));
  assert.deepEqual(copied, required, 'Standalone static files differ from the current build (stale files present)');
  if (fs.existsSync(path.join(root, '.next/BUILD_ID'))) assertIdenticalAsset(root, standalone, '.next/BUILD_ID', 'build');
}

export function assertStandalonePublicAssets(root: string, standalone: string, options: { requireBuildStatic?: boolean } = {}): void {
  const buildExpected = options.requireBuildStatic || [root, standalone].some(directory =>
    ['static', 'BUILD_ID', 'build-manifest.json'].some(file => fs.existsSync(path.join(directory, '.next', file))));
  if (buildExpected) assertStandaloneBuildStaticAssets(root, standalone);
  for (const relative of requiredPublicAssets(root)) {
    assertIdenticalAsset(root, standalone, relative, 'public');
  }
}
