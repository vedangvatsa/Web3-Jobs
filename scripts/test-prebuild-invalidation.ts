import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { recordCompletedSteps, recordStep, shouldRunStep, stepInputHash, type HashManifest } from './lib/prebuild-manifest';
import { PREBUILD_DATA_STEPS, SITEMAP_STEP } from './lib/prebuild-steps';
import { appRootPageSlugs, publicRootFiles } from './lib/public-page-files';

const articleStep = PREBUILD_DATA_STEPS.find(step => step.id === 'articles-index')!;
const eventStep = PREBUILD_DATA_STEPS.find(step => step.id === 'events-runtime')!;
const project = process.cwd();

function fixture(t: { after: (callback: () => void) => void }) {
  fs.mkdirSync('.cache', { recursive: true });
  const root = fs.mkdtempSync(path.resolve('.cache/prebuild-invalidation-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (file: string, content: string) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  };
  for (const script of ['generate-articles-index.ts', 'generate-latest-articles.ts']) write(`scripts/${script}`, fs.readFileSync(`scripts/${script}`, 'utf8'));
  const article = (slug: string, date = '2026-10-01') => write(`content/articles/${slug}.md`, `---\ntitle: ${slug}\ndescription: Source-bound report\ncategory: News\npublishedDate: '${date}'\nimage: /images/news/${slug}.jpg\n---\nReporting.\n`);
  const generate = () => {
    for (const script of ['generate-articles-index.ts', 'generate-latest-articles.ts']) execFileSync(process.execPath, ['--import', 'tsx', path.join(project, 'scripts', script)], { cwd: root, stdio: 'pipe' });
  };
  article('old-story'); generate();
  const manifest: HashManifest = { version: 1, steps: {} };
  recordStep(manifest, articleStep, root);
  return { root, write, article, generate, manifest };
}

test('event hash updates cannot mark a newly added article as already generated', t => {
  const { root, write, article, generate, manifest } = fixture(t);
  const previous = manifest.steps['articles-index'].inputHash;
  article('new-story', '2026-10-11');
  write('content/events/example.json', '{}');
  for (const output of eventStep.outputs) write(output, '{}');
  recordCompletedSteps(manifest, ['events-runtime'], root);
  assert.equal(manifest.steps['articles-index'].inputHash, previous);
  assert.equal(shouldRunStep(articleStep, manifest, true, undefined, root), true);
  generate(); recordStep(manifest, articleStep, root);
  const index = JSON.parse(fs.readFileSync(path.join(root, 'content/articles-index.json'), 'utf8'));
  const latest = JSON.parse(fs.readFileSync(path.join(root, 'content/latest-articles.json'), 'utf8'));
  assert.deepEqual(index.map((item: { slug: string }) => item.slug).sort(), ['new-story', 'old-story']);
  assert.equal(latest[0].slug, 'new-story');
  assert.equal(shouldRunStep(articleStep, manifest, true, undefined, root), false);
});

test('article edits, deletions, generator changes and a missing latest index invalidate fast builds', t => {
  const { root, write, article, generate, manifest } = fixture(t);
  article('old-story', '2026-10-02');
  assert.equal(shouldRunStep(articleStep, manifest, true, undefined, root), true);
  generate(); recordStep(manifest, articleStep, root);
  fs.unlinkSync(path.join(root, 'content/latest-articles.json'));
  assert.equal(shouldRunStep(articleStep, manifest, true, undefined, root), true);
  generate(); recordStep(manifest, articleStep, root);
  write('scripts/generate-articles-index.ts', 'Changed generator fingerprint');
  assert.equal(shouldRunStep(articleStep, manifest, true, undefined, root), true);
  generate(); recordStep(manifest, articleStep, root);
  fs.unlinkSync(path.join(root, 'content/articles/old-story.md'));
  assert.equal(shouldRunStep(articleStep, manifest, true, undefined, root), true);
  generate();
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'content/articles-index.json'), 'utf8')), []);
});

test('hash acknowledgements fail atomically for missing outputs, unknown IDs and implicit all-step refreshes', t => {
  const { root, manifest } = fixture(t);
  const before = structuredClone(manifest);
  assert.throws(() => recordCompletedSteps(manifest, [], root), /--step/);
  assert.throws(() => recordCompletedSteps(manifest, ['articles-index', 'unknown'], root), /Unknown/);
  assert.throws(() => recordCompletedSteps(manifest, ['articles-index', 'events-runtime'], root), /outputs are missing/);
  assert.throws(() => recordCompletedSteps(manifest, ['articles-index', 'articles-index'], root), /once/);
  assert.deepEqual(manifest, before);
  assert.equal(manifest.steps['articles-index'].inputHash, stepInputHash(articleStep, root));
});

test('new article metadata reaches data, root-slug and sitemap generation', () => {
  for (const step of [PREBUILD_DATA_STEPS.find(step => step.id === 'articles-data')!, PREBUILD_DATA_STEPS.find(step => step.id === 'slug-types')!, SITEMAP_STEP]) {
    assert.ok(step.inputs.includes('content/articles-index.json'), step.id);
  }
});

test('company metadata updates invalidate the sitemap without changing company slugs', t => {
  const { root, write } = fixture(t);
  write('content/slug-types.json', '{"companies":["coinmotion"]}');
  write('content/companies-runtime.json', '{"coinmotion":{"lastUpdated":"2026-10-13T12:00:00Z"}}');
  for (const output of SITEMAP_STEP.outputs) write(output, '[]');
  const manifest: HashManifest = { version: 1, steps: {} };
  recordStep(manifest, SITEMAP_STEP, root);
  for (const fast of [false, true]) assert.equal(shouldRunStep(SITEMAP_STEP, manifest, fast, undefined, root), false);
  write('content/companies-runtime.json', '{"coinmotion":{"lastUpdated":"2026-10-14T12:00:00Z"}}');
  for (const fast of [false, true]) assert.equal(shouldRunStep(SITEMAP_STEP, manifest, fast, undefined, root), true, 'Company source timestamps must refresh sitemap lastmod even when the slug inventory is unchanged');
});

test('a missing public article index is restored even when all input hashes are unchanged', t => {
  const { root, write } = fixture(t);
  for (const script of ['sync-public-catalog-assets.sh', 'sync-public-catalog-assets.ts']) write(`scripts/${script}`, fs.readFileSync(`scripts/${script}`, 'utf8'));
  for (const file of ['jobs-runtime', 'hiring-report-stats', 'hiring-report-salary-sample', 'hiring-report-analysis-evidence']) write(`content/${file}.json`, '[]');
  const citizenship = '{"programs":[]}';
  write('content/citizenship.json', citizenship);
  const sync = () => execFileSync(process.execPath, ['--import', 'tsx', path.join(project, 'scripts/sync-public-catalog-assets.ts')], { cwd: root, stdio: 'pipe' });
  sync();
  const target = path.join(root, 'public/data/articles-index.json');
  fs.unlinkSync(target);
  sync();
  assert.equal(fs.readFileSync(target, 'utf8'), fs.readFileSync(path.join(root, 'content/articles-index.json'), 'utf8'));
  assert.equal(fs.readFileSync(path.join(root, 'public/data/citizenship.json'), 'utf8'), citizenship);
  fs.unlinkSync(path.join(root, 'content/citizenship.json'));
  assert.throws(sync, /Command failed/, 'A missing citizenship source must fail even when its public mirror exists');
  write('content/citizenship.json', citizenship);
  fs.unlinkSync(path.join(root, 'content/articles-index.json'));
  assert.throws(sync, /Command failed/, 'A missing source catalogue must fail instead of silently preserving a stale mirror');
});

test('root page discovery and fast-build hashes follow new, renamed and deleted routes and public files', t => {
  const { root, write } = fixture(t);
  const step = PREBUILD_DATA_STEPS.find(step => step.id === 'slug-types')!;
  write('content/slug-types.json', '{}');
  write('src/app/existing/page.tsx', 'export default function Page() { return null; }');
  write('public/existing.txt', 'public');
  const manifest: HashManifest = { version: 1, steps: {} };
  recordStep(manifest, step, root);
  const changed = (change: () => void) => {
    change();
    assert.equal(shouldRunStep(step, manifest, true, undefined, root), true);
    recordStep(manifest, step, root);
    assert.equal(shouldRunStep(step, manifest, true, undefined, root), false);
  };
  changed(() => write('src/app/future/page.tsx', 'export default function Page() { return null; }'));
  changed(() => fs.renameSync(path.join(root, 'src/app/future'), path.join(root, 'src/app/renamed')));
  changed(() => fs.rmSync(path.join(root, 'src/app/renamed'), { recursive: true }));
  changed(() => write('src/app/(public)/grouped/page.tsx', 'export default function Page() { return null; }'));
  write('src/app/_private/page.tsx', 'private');
  write('src/app/[slug]/page.tsx', 'dynamic');
  write('src/app/existing/nested/page.tsx', 'nested');
  assert.deepEqual(appRootPageSlugs(root), ['existing', 'grouped']);
  recordStep(manifest, step, root);
  changed(() => write('public/new-file.ico', 'same bytes'));
  changed(() => fs.renameSync(path.join(root, 'public/new-file.ico'), path.join(root, 'public/renamed.ico')));
  changed(() => fs.unlinkSync(path.join(root, 'public/renamed.ico')));
  assert.deepEqual(publicRootFiles(root), ['public/existing.txt']);
  for (const file of ['content/nomads/cities.json', 'content/learn-routes.json', 'scripts/lib/public-page-files.ts']) {
    changed(() => write(file, 'changed source'));
  }
});
