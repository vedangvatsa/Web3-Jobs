import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import sharp from 'sharp';
import { countryGet, pageEvidence, type CountryPage } from './lib/country-source-http';
import { links } from './lib/country-local-sources';
import { postings } from './lib/country-local-feeds';

const boardUrl = 'https://jobs.ashbyhq.com/kamino';
const website = 'https://kamino.com';
const organizationId = '04a17be0-2c28-41ad-b45b-4bf703b8d84b';
const sha256 = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
function appData(page: CountryPage) {
  assert.equal(page.status, 200);
  const match = page.body.match(/window\.__appData\s*=\s*(\{[^\n\r]*\});/);
  assert.ok(match, 'Ashby public organization data required');
  return JSON.parse(match[1]) as {
    organization: { organizationId: string; name: string; publicWebsite: string; hostedJobsPageSlug: string; isDemoOrg: boolean };
    jobBoard?: { jobPostings: { id: string }[] };
    posting?: { id: string; title: string; isListed: boolean };
  };
}

async function main() {
  const preserved = ['jobs-cache.json', 'jobs-runtime.json', 'job-date-history.json', 'job-date-provenance.json', 'legacy-slugs-archive.json'];
  const hashes = Object.fromEntries(preserved.map(file => [`content/${file}`, sha256(fs.readFileSync(`content/${file}`))]));
  const home = await countryGet(website);
  const docs = await countryGet(`${website}/docs`);
  const board = await countryGet(boardUrl);
  const { organizationId: id, name, publicWebsite, hostedJobsPageSlug, isDemoOrg } = appData(board).organization;
  const organization = { organizationId: id, name, publicWebsite, hostedJobsPageSlug, isDemoOrg };
  assert.equal(home.status, 200);
  assert.equal(home.finalUrl, website);
  assert.deepEqual(organization, {
    organizationId, name: 'Kamino', publicWebsite: website, hostedJobsPageSlug: 'kamino', isDemoOrg: false,
  });
  const api = await countryGet('https://api.ashbyhq.com/posting-api/job-board/kamino?includeCompensation=true');
  assert.equal(api.status, 200);
  const rows = (JSON.parse(api.body) as { jobs: { id: string; title: string; jobUrl: string; applyUrl: string; publishedAt: string; isListed: boolean; location: string }[] }).jobs;
  assert.deepEqual(new Set(rows.filter(row => row.isListed).map(row => row.id)), new Set(appData(board).jobBoard!.jobPostings.map(row => row.id)));
  const roles = [];
  for (const row of rows) {
    assert.equal(row.jobUrl, `${boardUrl}/${row.id}`);
    const primary = await countryGet(row.jobUrl);
    assert.equal(primary.finalUrl, row.jobUrl);
    const data = appData(primary);
    assert.equal(data.organization.organizationId, organizationId);
    assert.equal(data.posting?.id, row.id);
    assert.equal(data.posting?.title, row.title);
    const structured = postings(primary.body);
    assert.equal(structured.length, 1);
    assert.equal(structured[0].identifier?.value, row.id);
    assert.equal(structured[0].hiringOrganization?.name, 'Kamino');
    roles.push({
      id: row.id, title: row.title, jobUrl: row.jobUrl, applyUrl: row.applyUrl, location: row.location,
      isListed: row.isListed, publishedAt: row.publishedAt,
      primary: pageEvidence(primary), primaryDatePosted: structured[0].datePosted ?? null,
      primaryDateMatchesLastPublished: structured[0].datePosted === row.publishedAt.slice(0, 10),
      originalPostingDate: null, dateVerified: false, outcome: 'quarantined-unverified-original-date',
    });
  }
  const $ = load(home.body);
  const logoUrl = new URL($('link[rel="apple-touch-icon"]').attr('href')!, home.finalUrl).href;
  assert.equal(logoUrl, `${website}/apple-touch-icon.png`);
  const image = await fetch(logoUrl, { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(20000) });
  assert.equal(image.status, 200);
  const bytes = Buffer.from(await image.arrayBuffer());
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.format, 'png');
  const localPath = '/logo/companies/kamino.png';
  if (fs.existsSync(`public${localPath}`)) assert.equal(sha256(fs.readFileSync(`public${localPath}`)), sha256(bytes));
  else fs.writeFileSync(`public${localPath}`, bytes, { flag: 'wx' });
  const socialUrl = 'https://x.com/kamino';
  assert.ok(links(docs).includes(socialUrl));
  const report = {
    checkedAt: new Date().toISOString(), company: 'Kamino', website: pageEvidence(home),
    description: $('meta[name="description"]').attr('content'),
    board: pageEvidence(board), organization, api: pageEvidence(api),
    ownershipBasis: 'User-supplied board and website; pinned public Ashby organization ID, name, hosted slug and publicWebsite. No official-site outbound careers link observed.',
    officialSiteBoardLinkObserved: links(home).some(url => url.startsWith(boardUrl)),
    socials: [{ key: 'twitter', url: socialUrl, source: pageEvidence(docs) }],
    branding: { url: logoUrl, sourceUrl: home.url, kind: 'apple-touch-icon', finalUrl: image.url, checkedAt: new Date().toISOString(), bodySha256: sha256(bytes), localPath, localSha256: sha256(bytes), width: metadata.width, height: metadata.height },
    datePolicy: { maxAgeDays: 30, inclusive: true, documentation: 'https://developers.ashbyhq.com/docs/public-job-posting-api', publishedAtMeaning: 'ISO DateTime when the job was last published', decision: 'Matching primary datePosted and last-published calendar dates do not independently establish original publication. Keep the existing Ashby quarantine; do not write posting dates or date history.' },
    apiJobCount: rows.length, primaryPagesChecked: roles.length, acceptedCount: 0, roles,
    preservationHashes: hashes,
  };
  for (const [file, hash] of Object.entries(hashes)) assert.equal(sha256(fs.readFileSync(file)), hash);
  fs.writeFileSync('content/sources/kamino-source-audit.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ checkedAt: report.checkedAt, apiJobCount: rows.length, primaryPagesChecked: roles.length, acceptedCount: 0, report: 'content/sources/kamino-source-audit.json' }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
