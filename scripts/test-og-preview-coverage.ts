import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test, { after } from 'node:test';
import { load } from 'cheerio';
import { getAllArticles } from '../src/lib/articles';
import { getCompanies, getCompanyBySlug } from '../src/lib/companies';
import { getEventBySlug, getEvents } from '../src/lib/events-server';
import { getEventSlug } from '../src/lib/events';
import { getAllCategorySlugs, getAllTerms, getCategory as getGlossaryCategory } from '../src/lib/glossary';
import { getAllJobsWithSlugs, getLegacyJobSlugs, resolveJobSlug } from '../src/lib/job-guides';
import { isExpiredJobPath } from '../src/lib/job-age-path';
import { learnRoutes } from '../src/lib/learn-routes';
import { nomadRoutes } from '../src/lib/nomads/metadata';
import { learnPageMetadata } from '../src/lib/learn-meta';
import { getAllResourcePages } from '../src/lib/pseo';
import { getAllPopups, getPopupSlugs } from '../src/lib/popups';
import { getPopupPath, popupPageMetadata } from '../src/lib/popup-seo';
import { generateGlossaryMetaDescription } from '../src/lib/seo-utils';
import { classifySlug } from '../src/lib/slug-classifier';
import { canonicalSocialPagePath, isResourcePath, PUBLIC_PAGE_ALIASES, SOCIAL_PATH_SUFFIXES } from '../src/lib/social-share';
import { isRemovedJobPath } from '../src/lib/removed-job-path';
import { buildOgPreviewHtml, collectOgPreviewPaths, previewAssetPath, resolveKnownOgPreviewMeta, resolveOgPreviewMeta } from '../src/lib/og-preview';
import { assertStaticPagePreviewCoverage, discoverAppPageRoutes } from './lib/og-preview-discovery';
import { precomputeOgPreviews } from './precompute-og-previews';
import slugTypes from '../content/slug-types.json';

const project = process.cwd();
const origin = 'https://hashtagweb3.com';
// Compare catalogs at one instant even when a job expires during the test run.
const originalNow = Date.now;
const now = originalNow();
Date.now = () => now;
after(() => { Date.now = originalNow; });
const previewPaths = collectOgPreviewPaths().then(paths => new Set(paths));
const publicRegistries = Promise.all([
  getAllArticles(), getAllJobsWithSlugs(), getEvents(), getCompanies(true), getAllTerms(), getAllCategorySlugs(),
]).then(([articles, jobs, events, companies, terms, categories]) => ({
  articles: articles.map(article => `/${article.slug}`),
  jobs: jobs.map(({ slug }) => `/${slug}`),
  events: events.map(event => `/${getEventSlug(event)}`),
  eventAliases: events.flatMap(event => (event.aliases || []).map(alias => `/${alias}`)),
  companies: companies.map(company => `/${company.slug}`),
  glossaryTerms: terms.map(term => `/${term.slug}`),
  glossaryCategories: categories.map(category => `/glossary/${category}`),
  resources: getAllResourcePages().map(resource => `/${resource.seo.canonicalSlug}`),
  nomads: nomadRoutes().map(route => route.path),
  popups: getPopupSlugs().map(getPopupPath),
  learning: learnRoutes.map(route => `/${route.slug}`),
}));

test('every public Next page has preview coverage or an explicit dynamic owner', async t => {
  const routes = discoverAppPageRoutes();
  assert.deepEqual(routes.filter(route => route.includes('[')).sort(), [
    '/[slug]',
    '/glossary/[category]',
    '/job-listing-cache/[epoch]/[[...path]]', // Internal rewrite target for job expiry cache boundaries.
    '/learn/[category]', // Redirects to the learning registry's canonical root paths.
    '/learn/[category]/[slug]',
  ].sort(), 'A new dynamic page must add its canonical registry to this coverage test');
  const staticPaths = routes.filter(route => !route.includes('['));
  const collected = await previewPaths;
  const missing = staticPaths.filter(route => !collected.has(route));
  t.diagnostic(`${staticPaths.length} public static pages; missing=${JSON.stringify(missing)}`);
  assert.deepEqual(missing, [], 'Register page-specific preview metadata for every public static page');
  assert.doesNotThrow(() => assertStaticPagePreviewCoverage(collected));
  const generic = await resolveOgPreviewMeta('/unknown-preview-coverage-fixture');
  for (const route of staticPaths) {
    const meta = await resolveOgPreviewMeta(route);
    assert.notEqual(meta.title, generic.title, `${route} must not use generic fallback metadata`);
    assert.equal(meta.canonicalUrl, `https://hashtagweb3.com${route}`);
    assert.ok(meta.description.trim(), `${route} needs a description`);
    const pageCard = `${origin}/og/pages${route}.png`;
    const source = ['page.tsx', 'layout.tsx'].map(file => path.join(project, 'src/app', route, file))
      .filter(file => fs.existsSync(file)).map(file => fs.readFileSync(file, 'utf8')).join('\n');
    if (source.includes(pageCard)) assert.equal(meta.ogImageUrl, pageCard, `${route} should use its dedicated page card`);
  }
});

test('canonical content registries are covered independently of the preview collector', async t => {
  const collected = await previewPaths;
  const missing: Record<string, string[]> = {};
  for (const [registry, routes] of Object.entries(await publicRegistries)) {
    const eligible = routes.filter(route => !isExpiredJobPath(route) && !isRemovedJobPath(route));
    const gaps = eligible.filter(route => !collected.has(route));
    t.diagnostic(`${registry}: ${eligible.length} paths; ${gaps.length} missing`);
    if (gaps.length) missing[registry] = gaps;
  }
  assert.deepEqual(missing, {}, 'Canonical content must be discoverable without relying on old preview files');
});

test('routable company profiles keep previews when they have no active jobs', async t => {
  const companies = await Promise.all(slugTypes.companies.map(getCompanyBySlug));
  const canonical = [...new Set(companies.flatMap(company => company ? [`/${company.slug}`] : []))];
  const collected = await previewPaths;
  const missing = canonical.filter(route => !collected.has(route));
  t.diagnostic(`${canonical.length} routable company profiles; ${missing.length} missing`);
  assert.deepEqual(missing, []);
  for (const company of companies) {
    if (!company || classifySlug(company.slug) !== 'company') continue;
    if (canonicalSocialPagePath(`/${company.slug}`) !== `/${company.slug}`) continue;
    const meta = await resolveOgPreviewMeta(`/${company.slug}`);
    assert.equal(meta.title, `${company.name} Jobs | Hashtag Web3`, company.slug);
    assert.equal(meta.canonicalUrl, `${origin}/${company.slug}`, company.slug);
  }
});

test('registered public aliases share canonical metadata without manufacturing previews for resource URLs', async () => {
  for (const [source, destination] of Object.entries(PUBLIC_PAGE_ALIASES)) {
    const meta = await resolveKnownOgPreviewMeta(source);
    if (isResourcePath(destination)) assert.equal(meta, null, source);
    else {
      assert.ok(meta, `Missing alias destination metadata: ${source}`);
      assert.deepEqual(meta, await resolveKnownOgPreviewMeta(destination), source);
    }
  }
});

test('registered event IDs and historical slugs with live destinations are collected', async t => {
  const aliases = await Promise.all(slugTypes.events.map(async slug => ({ slug, event: await getEventBySlug(slug) })));
  const collected = await previewPaths;
  const live = aliases.filter(entry => entry.event);
  const missing = live.filter(({ slug }) => !collected.has(`/${slug}`)).map(({ slug }) => `/${slug}`);
  t.diagnostic(`${live.length} registered event paths; ${missing.length} missing`);
  assert.deepEqual(missing, []);
  for (const { slug, event } of live) {
    assert.equal((await resolveOgPreviewMeta(`/${slug}`)).canonicalUrl, `${origin}/${getEventSlug(event!)}`, slug);
  }
});

test('eligible historical job aliases resolve to live jobs and retain preview coverage', async t => {
  const aliases = getLegacyJobSlugs().filter(slug => !isExpiredJobPath(`/${slug}`) && !isRemovedJobPath(`/${slug}`));
  const collected = await previewPaths;
  const missing: string[] = [];
  let live = 0;
  for (const slug of aliases) {
    const resolved = await resolveJobSlug(slug);
    if (!resolved.job || !resolved.canonicalSlug) continue;
    live++;
    if (!collected.has(`/${slug}`)) missing.push(`/${slug}`);
    assert.equal((await resolveOgPreviewMeta(`/${slug}`)).canonicalUrl, `${origin}/${resolved.canonicalSlug}`, slug);
  }
  t.diagnostic(`${live} eligible historical job paths; ${missing.length} missing`);
  assert.deepEqual(missing, []);
});

test('every collected path resolves explicit metadata rather than a generic successful shell', async t => {
  const paths = await previewPaths;
  for (const route of paths) {
    assert.equal(isExpiredJobPath(route), false, `Expired job was collected: ${route}`);
    assert.equal(isRemovedJobPath(route), false, `Removed job was collected: ${route}`);
    const meta = await resolveKnownOgPreviewMeta(route);
    assert.ok(meta, `No page-specific metadata for ${route}`);
    assert.ok(meta.title.trim() && meta.description.trim(), `Empty metadata for ${route}`);
    assert.equal(new URL(meta.canonicalUrl).origin, origin, route);
    assert.equal(new URL(meta.canonicalUrl).search, '', route);
    assert.match(meta.ogImageUrl, /^https:\/\//, route);
  }
  t.diagnostic(`${paths.size} collected paths have explicit metadata`);
  for (const route of ['/api/email/unsubscribe', '/data/jobs-runtime.json', '/robots.txt', '/jobs/feed.xml', '/job-listing-cache/0', '/blog/not-a-published-article', '/glossary/not-a-category-or-term', '/popups/not-a-popup']) {
    assert.equal(paths.has(route), false, route);
    assert.equal(await resolveKnownOgPreviewMeta(route), null, route);
  }
});

test('popup, glossary and learning previews use their own content and canonical destinations', async t => {
  for (const popup of getAllPopups()) {
    const route = getPopupPath(popup.slug);
    const meta = await resolveOgPreviewMeta(route);
    const page = popupPageMetadata(popup);
    assert.equal(meta.title, page.openGraph?.title, route);
    assert.equal(meta.description, page.description, route);
    assert.equal(meta.canonicalUrl, page.alternates?.canonical, route);
    assert.equal(meta.ogImageUrl, new URL(popup.coverImages?.[0] || '/og-image.png', origin).href, route);
    if (!SOCIAL_PATH_SUFFIXES.has(popup.slug)) assert.deepEqual(await resolveOgPreviewMeta(`/popups/${popup.slug}`), meta);
  }
  assert.deepEqual(await resolveOgPreviewMeta('/popups/logos'), await resolveOgPreviewMeta('/logos-society'));

  const categories = await getAllCategorySlugs();
  for (const slug of categories) {
    const category = await getGlossaryCategory(slug);
    assert.ok(category);
    const meta = await resolveOgPreviewMeta(`/glossary/${slug}`);
    assert.equal(meta.title, `${category.name} - Web3 Glossary`);
    assert.equal(meta.description, category.description);
    assert.equal(meta.canonicalUrl, `${origin}/glossary/${slug}`);
    assert.equal(meta.ogImageUrl, `${origin}/og/pages/glossary.png`);
  }
  let glossaryDefinitions = 0;
  for (const term of await getAllTerms()) {
    const meta = await resolveOgPreviewMeta(`/${term.slug}`);
    if (classifySlug(term.slug) === 'glossary') {
      assert.equal(meta.description, generateGlossaryMetaDescription(term), term.slug);
      glossaryDefinitions++;
    }
    if (!categories.includes(term.slug)) assert.deepEqual(await resolveOgPreviewMeta(`/glossary/${term.slug}`), meta);
  }
  for (const route of learnRoutes) {
    const meta = await resolveOgPreviewMeta(`/${route.slug}`);
    const page = learnPageMetadata(route);
    assert.equal(meta.title, page.openGraph?.title, route.slug);
    assert.equal(meta.description, page.description, route.slug);
    assert.deepEqual(await resolveOgPreviewMeta(`/learn/${route.category}${route.lesson ? `/${route.lesson}` : ''}`), meta);
  }
  t.diagnostic(`${getPopupSlugs().length} popup pages; ${categories.length} categories; ${glossaryDefinitions} glossary definitions; ${learnRoutes.length} learning pages`);
});

test('a new public page fails discovery coverage until its preview is registered', t => {
  const root = fs.mkdtempSync(path.join(project, '.cache/og-preview-discovery-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const file of ['page.tsx', '(tools)/new-tool/page.tsx', 'guides/new-topic/page.tsx', '_private/page.tsx', 'api/check/route.ts']) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, 'export default function Page() {}');
  }
  assert.deepEqual(discoverAppPageRoutes(root).sort(), ['/', '/guides/new-topic', '/new-tool']);
  assert.throws(() => assertStaticPagePreviewCoverage(['/'], root), /Public pages missing OG preview metadata:.*new-tool/);
  assert.doesNotThrow(() => assertStaticPagePreviewCoverage(['/', '/guides/new-topic', '/new-tool'], root));
});

test('generation creates all static, popup and category shells, refreshes aliases, and prunes expired jobs', async t => {
  const root = fs.mkdtempSync(path.join(project, '.cache/og-preview-generation-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'content'));
  const catalogs = await publicRegistries;
  const paths = [...new Set([
    ...discoverAppPageRoutes().filter(route => !route.includes('[')),
    ...catalogs.popups, ...catalogs.glossaryCategories, '/aave', '/logos',
  ])];
  const originalArticle = (await getAllArticles()).find(article => classifySlug(article.slug) === 'article')!;
  const aliases = ['/popups/logos', '/glossary/blockchain', `/blog/${originalArticle.slug}`, '/companies/aave'];
  const metadata = new Map(await Promise.all([...paths, ...aliases].map(async route => [route, await resolveOgPreviewMeta(route)] as const)));
  const images = new Set(['/og-image.png', ...[...metadata.values()].map(meta => new URL(meta.ogImageUrl).pathname)]);
  for (const image of images) {
    const source = path.join(project, 'public', image);
    if (!fs.existsSync(source)) continue;
    const target = path.join(root, 'public', image);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.symlinkSync(source, target);
  }
  const fileFor = (route: string) => path.join(root, 'public', previewAssetPath(route));
  const generate = () => precomputeOgPreviews({ root, paths });
  await generate();
  for (const route of paths) {
    const $ = load(fs.readFileSync(fileFor(route), 'utf8'));
    const meta = metadata.get(route)!;
    assert.equal($('meta[property="og:title"]').attr('content'), meta.title, route);
    assert.equal($('meta[property="og:description"]').attr('content'), meta.description, route);
    assert.equal($('link[rel="canonical"]').attr('href'), meta.canonicalUrl, route);
    assert.equal($('meta[property="og:url"]').attr('content'), meta.canonicalUrl, route);
    assert.equal($('meta[name="twitter:image"]').attr('content'), $('meta[property="og:image"]').attr('content'), route);
  }
  const historical = buildOgPreviewHtml({ title: 'Historical shared page', description: 'Retained shared-page metadata.', canonicalUrl: `${origin}/historical-preview-fixture`, ogImageUrl: `${origin}/og-image.png` });
  for (const route of [...aliases, '/historical-preview-fixture', '/marketing4', '/jobs/marketing4']) {
    fs.mkdirSync(path.dirname(fileFor(route)), { recursive: true });
    fs.writeFileSync(fileFor(route), historical);
  }
  fs.writeFileSync(fileFor('/unregistered-old-job-alias'), historical.replace('/historical-preview-fixture', '/marketing4'));
  const expected = fs.readFileSync(fileFor('/resources'), 'utf8');
  fs.unlinkSync(fileFor('/resources'));
  await generate();
  assert.equal(fs.readFileSync(fileFor('/resources'), 'utf8'), expected, 'A matching manifest must not hide a missing shell');
  assert.equal(fs.readFileSync(fileFor('/historical-preview-fixture'), 'utf8'), historical, 'Unknown historical shells must retain their metadata');
  for (const route of ['/marketing4', '/jobs/marketing4', '/unregistered-old-job-alias']) assert.equal(fs.existsSync(fileFor(route)), false, route);
  for (const route of aliases) {
    const $ = load(fs.readFileSync(fileFor(route), 'utf8'));
    assert.equal($('meta[property="og:title"]').attr('content'), metadata.get(route)!.title, route);
    assert.equal($('link[rel="canonical"]').attr('href'), metadata.get(route)!.canonicalUrl, route);
  }
  const modified = fs.statSync(fileFor('/resources')).mtimeMs;
  await generate();
  assert.equal(fs.statSync(fileFor('/resources')).mtimeMs, modified, 'Unchanged previews should be skipped');
  await assert.rejects(precomputeOgPreviews({ root, paths: ['/api/preview-coverage-fixture'] }), /Missing OG preview metadata/);
  assert.equal(fs.existsSync(fileFor('/api/preview-coverage-fixture')), false);
});
