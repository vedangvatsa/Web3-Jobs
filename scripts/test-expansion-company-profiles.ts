import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { buildCompaniesFromJobs, getCompanies, getCompanyBySlug, type CompanyProfileRow } from '../src/lib/companies';
import { getCompanySlug, getJobIdentity } from '../src/lib/job-slugs';
import { resolveCompanyLogo, getCompanyFaviconUrlBySlug } from '../src/lib/company-logo';
import { normalizeOfficialCompanySocial, type CompanySocialLinks } from '../src/lib/company-socials';
import { classifySlug } from '../src/lib/slug-classifier';
import { isJobAgeEligible } from '../src/lib/job-age-policy.mjs';
import { jobAgePageCache } from '../src/lib/job-age-page-cache';
import { loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { collectOgPreviewPaths, resolveOgPreviewMeta } from '../src/lib/og-preview';
import type { Job } from '../src/types';

type Override = CompanyProfileRow & { provenance: { website: { url: string; bodySha256: string }; about: { url: string; bodySha256: string }[]; socials: { key: string; url: string; bodySha256: string }[]; branding: { localSha256: string; url: string } }; gaps: string[] };
const read = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
async function main() {
  const overrides = read('content/company-profile-overrides.json') as Record<string, Override>;
  const profiles = read('content/company-profiles-runtime.json') as Record<string, CompanyProfileRow>;
  const originalProfiles = JSON.parse(execFileSync('git', ['show', 'HEAD:content/company-profiles-runtime.json'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }));
  for (const [slug, row] of Object.entries(originalProfiles)) if (!overrides[slug]) assert.deepEqual(profiles[slug], row, `${slug}: preserve unrelated company profile`);
  const originalSocials = JSON.parse(execFileSync('git', ['show', 'HEAD:content/company-socials.json'], { encoding: 'utf8' }));
  const currentSocials = read('content/company-socials.json');
  for (const [slug, row] of Object.entries(originalSocials)) if (!overrides[slug]) assert.deepEqual(currentSocials[slug], row, `${slug}: preserve unrelated social record`);
  const generated = read('content/companies-runtime.json');
  const preservation = read('content/sources/company-profile-preservation.json');
  for (const [file, hash] of Object.entries(preservation.hashes)) {
    if (['content/jobs-cache.json', 'content/jobs-runtime.json', 'content/legacy-slugs-archive.json'].includes(file)) continue;
    assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'), hash, `Preserve pending source/job data: ${file}`);
  }
  const baseline = read('content/sources/company-profile-job-preservation.json');
  const recordHash = (row: unknown) => createHash('sha256').update(JSON.stringify(row)).digest('hex');
  for (const kind of ['cache', 'runtime']) {
    const current: Job[] = read(`content/jobs-${kind}.json`);
    const identities = new Set(current.map(getJobIdentity));
    for (const job of current) assert.equal(recordHash(job), baseline[kind][getJobIdentity(job)]?.hash, `${kind}: existing job fields remain immutable`);
    for (const [identity, row] of Object.entries(baseline[kind]) as [string, { date: string }][]) if (!identities.has(identity)) assert.ok(!isJobAgeEligible(row), `${kind}: only expired jobs may leave the snapshot`);
  }
  const currentArchive = read('content/legacy-slugs-archive.json');
  for (const [slug, hash] of Object.entries(baseline.archive)) assert.equal(recordHash(currentArchive[slug]), hash, `${slug}: preserve existing aliases`);
  const registry = ['content/country-local-crypto-sources.json', 'content/web3-expansion-sources.json'].flatMap(file => read(file));
  assert.equal(new Set(registry.map(row => getCompanySlug(row.company))).size, Object.keys(overrides).length);
  const reserved = loadReservedRootSlugsSync();
  const previewPaths = new Set(await collectOgPreviewPaths());
  const activeDirectory = new Set((await getCompanies()).map(company => company.slug));
  let zeroJobs = 0; let withSocials = 0;
  for (const [slug, row] of Object.entries(overrides)) {
    assert.equal(getCompanySlug(row.name!), slug);
    assert.equal(profiles[slug].description, row.description);
    assert.equal(generated[slug].description, row.description);
    const company = await getCompanyBySlug(slug);
    assert.ok(company, `${slug}: genuine profile resolves`);
    assert.equal(company.name, row.name);
    assert.equal(company.website, row.website);
    assert.equal(company.description, row.description);
    assert.equal(company.jobs.length, company.jobCount);
    assert.equal(classifySlug(slug), 'company');
    assert.ok(reserved.has(slug));
    assert.ok(previewPaths.has(`/${slug}`));
    assert.ok(jobAgePageCache(`/${slug}`), `${slug}: company job-age scope`);
    assert.ok(!/active roles|Current openings|leading Web3/i.test(company.description!));
     assert.ok(company.website);
     assert.equal(new URL(company.website).pathname, '/');
    assert.match(row.provenance.website.bodySha256, /^[a-f0-9]{64}$/);
    assert.ok(row.provenance.about.length);
    assert.equal(resolveCompanyLogo(slug), row.logo);
    assert.equal(getCompanyFaviconUrlBySlug(slug), row.logo);
    const bytes = fs.readFileSync(`public${row.logo}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), row.provenance.branding.localSha256);
    assert.equal((await sharp(bytes).metadata()).format, 'png');
    const og = await resolveOgPreviewMeta(`/${slug}`);
    assert.ok(og.title.includes(company.name));
    assert.equal(og.description, row.description);
    assert.ok(og.ogImageUrl.includes(`/og/companies/${slug}.png`));
    assert.ok(fs.existsSync(`public/og/companies/${slug}.png`));
    assert.ok(fs.existsSync(`public/preview/${slug}.html`));
    assert.ok(read('content/sitemap-routes.json').some((route: { url: string }) => route.url === `https://hashtagweb3.com/${slug}`));
    for (const job of company.jobs) assert.ok(isJobAgeEligible(job));
    if (!company.jobCount) { zeroJobs++; assert.ok(!activeDirectory.has(slug), 'Zero-job overview must not imply hiring in active directory'); }
    if (Object.keys(row.socialLinks || {}).length) withSocials++;
    assert.deepEqual(company.socialLinks, row.socialLinks);
    for (const [key, value] of Object.entries(row.socialLinks || {})) {
      assert.equal(normalizeOfficialCompanySocial(value)?.key, key);
      assert.ok(row.provenance.socials.some(evidence => evidence.key === key && evidence.url === value));
    }
  }
  assert.equal(withSocials, Object.keys(overrides).length, 'Every researched employer has a verified exact-brand social account');
  assert.deepEqual(overrides['double-jump-tokyo'].socialLinks, { twitter: 'https://x.com/doublejumptokyo', linkedin: 'https://www.linkedin.com/company/doublejump-tokyo' });
  assert.deepEqual(overrides['double-jump-tokyo'].gaps, []);
  const bit2me = await getCompanyBySlug('bit2me');
  assert.equal(bit2me?.website, 'https://bit2me.com/');
  assert.ok(bit2me?.jobs.some(job => job.slug === 'cmp117'), 'Preserve imported Bit2Me job');
  assert.equal((await getCompanyBySlug('bob-build-on-bitcoin'))?.slug, 'bob');
  assert.equal((await getCompanyBySlug('liminal'))?.slug, 'liminal-custody');
  assert.equal((await getCompanyBySlug('kappa-lab-ltd'))?.slug, 'kappa-lab');
  assert.equal(classifySlug('eco'), 'job', 'Do not steal the legacy job path');
  assert.equal(getCompanySlug('Axiom (Onchain Trading)'), 'axiom-onchain-trading');
  assert.notEqual((await getCompanyBySlug('axiom-onchain-trading'))?.website, 'https://www.axiom.xyz/');
  assert.equal(resolveCompanyLogo('axiom-onchain-trading'), null);
  for (const bad of ['https://linkedin.com.evil.test/company/brand', 'https://x.com.evil.test/brand', 'https://x.com/login', 'https://x.com/i/flow/login', 'https://www.linkedin.com/in/person', 'http://x.com/brand', 'https://user:pass@x.com/brand', 'https://x.com:8080/brand']) assert.equal(normalizeOfficialCompanySocial(bad), undefined, bad);
  assert.deepEqual(normalizeOfficialCompanySocial('https://x.com/Bit2Me?utm_source=test#top'), { key: 'twitter', url: 'https://x.com/Bit2Me' });
  const old: Job = { id: 'old', slug: 'old', title: 'Engineer', company: 'Bit2Me', link: 'https://empleo.bit2me.com/old', source: 'test', date: new Date(Date.now() - 31 * 86400000).toISOString() };
  const fixture = buildCompaniesFromJobs([old], { bit2me: profiles.bit2me });
  assert.equal(fixture.length, 1); assert.equal(fixture[0].jobCount, 0); assert.equal(fixture[0].description, overrides.bit2me.description);
  assert.equal(buildCompaniesFromJobs([], { unknown: { name: 'Unverified', published: true } }).length, 0);
  const current = { ...old, id: 'current', slug: 'current', date: new Date().toISOString() };
  const injected: CompanySocialLinks = { twitter: 'https://x.com/wrongbrand' };
  const wins = buildCompaniesFromJobs([current], { bit2me: profiles.bit2me }, { bit2me: injected })[0];
  assert.equal(wins.website, 'https://bit2me.com/'); assert.deepEqual(wins.socialLinks, profiles.bit2me.socialLinks);
  const detail = (await getCompanyBySlug('bit2me'))!;
  const expectedDetail = structuredClone(detail);
  detail.socialLinks!.twitter = 'https://x.com/wrongbrand';
  detail.jobs[0].company = 'Wrong employer';
  detail.jobs[0].active = false;
  detail.jobs.splice(0);
  assert.deepEqual(await getCompanyBySlug('bit2me'), expectedDetail, 'Returned details must not mutate cached company socials, jobs or counts');
  const summaries = await getCompanies(true);
  const summary = summaries.find(company => company.slug === 'coinmotion')!;
  summary.socialLinks!.linkedin = 'https://www.linkedin.com/company/wrongbrand/';
  assert.deepEqual((await getCompanyBySlug('coinmotion'))!.socialLinks, profiles.coinmotion.socialLinks, 'Returned directory socials must not mutate cached profiles');
  assert.deepEqual((await getCompanies(true)).find(company => company.slug === 'coinmotion')!.socialLinks, profiles.coinmotion.socialLinks, 'Subsequent catalog calls retain verified socials');
  console.log(`Expansion company audit passed: ${Object.keys(overrides).length} employers; ${withSocials} with verified socials; ${zeroJobs} honest zero-job overviews; source, original-date and retained-job fields unchanged.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
