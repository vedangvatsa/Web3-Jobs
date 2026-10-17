import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { EXPANSION_SOURCES, expansionCandidates, verifyExpansionSource } from './lib/web3-expansion-feeds';
import type { CountryPage } from './lib/country-source-http';
import audit from '../content/sources/kamino-source-audit.json';
import profiles from '../content/company-profile-overrides.json';
import { buildCompaniesFromJobs } from '../src/lib/companies';
import { getCompanySlug } from '../src/lib/job-slugs';

const source = EXPANSION_SOURCES.find(row => row.company === 'Kamino')!;
function page(url: string, body: string): CountryPage {
  return { url, finalUrl: url, status: 200, checkedAt: audit.checkedAt, body, bodySha256: createHash('sha256').update(body).digest('hex') };
}
const official = page(source.website, `<title>Kamino</title><meta name="description" content="${source.web3.quote}">`);
function board(organization: object = audit.organization) {
  return page(source.boardUrl, `<title>Kamino Jobs</title><script>window.__appData = ${JSON.stringify({ organization })};</script>`);
}
const read = async (url: string) => {
  if (url === source.officialCareersUrl) return official;
  if (url === source.boardUrl) return board();
  throw new Error(`Unexpected GET ${url}`);
};

test('reviewed Kamino identity is recurring and keeps an honest zero-job profile', async () => {
  assert.equal(EXPANSION_SOURCES.filter(row => row.board.toLowerCase() === 'kamino').length, 1);
  assert.equal(source.status, 'recurring');
  assert.equal(source.ownership.kind, 'reviewed-ashby-organization');
  await verifyExpansionSource(source, read);
  const companies = buildCompaniesFromJobs([], { kamino: profiles.kamino });
  assert.equal(companies.length, 1);
  assert.equal(companies[0].slug, getCompanySlug('Kamino'));
  assert.equal(companies[0].website, 'https://kamino.com/');
  assert.equal(companies[0].jobCount, 0);
  assert.deepEqual(companies[0].jobs, []);
});

test('reviewed identity rejects changed organization, employer, domain, slug and demo boards', async () => {
  for (const change of [
    { organizationId: 'foreign-organization' }, { name: 'Another employer' },
    { publicWebsite: 'https://kamino.com.evil.example' }, { publicWebsite: null },
    { hostedJobsPageSlug: 'another-board' }, { isDemoOrg: true },
  ]) {
    await assert.rejects(verifyExpansionSource(source, async url => url === source.boardUrl ? board({ ...audit.organization, ...change }) : read(url)), /identity|changed/);
  }
});

test('explicit review cannot authorize foreign, unavailable or changed official pages', async () => {
  for (const change of [{ finalUrl: 'https://elsewhere.example' }, { status: 503 }, { body: '<title>Unrelated company</title>' }]) {
    await assert.rejects(verifyExpansionSource(source, async url => url === source.officialCareersUrl ? { ...official, ...change } : read(url)));
  }
  await assert.rejects(verifyExpansionSource({ ...source, provider: 'greenhouse' }, read), /Invalid reviewed/);
  await assert.rejects(verifyExpansionSource({ ...source, company: 'Unreviewed company' }, read), /Unreviewed/);
  await assert.rejects(verifyExpansionSource({ ...source, officialCareersUrl: source.boardUrl }, read), /Invalid reviewed/);
  await assert.rejects(verifyExpansionSource({ ...source, ownership: { ...source.ownership, kind: 'outbound' } }, read), /Official outbound/);
});

test('Kamino last-published dates and primary projections never become original-date eligibility', async () => {
  assert.equal(audit.apiJobCount, 10);
  assert.equal(audit.primaryPagesChecked, 10);
  assert.ok(audit.roles.every(row => row.primaryDateMatchesLastPublished && row.originalPostingDate === null && !row.dateVerified));
  for (const publishedAt of [undefined, new Date().toISOString(), '2099-01-01T00:00:00Z']) {
    const jobs = audit.roles.map(row => ({ id: row.id, title: row.title, jobUrl: row.jobUrl, publishedAt, datePosted: row.primaryDatePosted, location: row.location }));
    const snapshot = await expansionCandidates(source, board(), async url => {
      assert.equal(url, source.apiUrl);
      return page(url, JSON.stringify({ jobs }));
    });
    assert.equal(snapshot.apiJobCount, 10);
    assert.equal(snapshot.quarantined, 10);
    assert.deepEqual(snapshot.jobs, []);
  }
});
