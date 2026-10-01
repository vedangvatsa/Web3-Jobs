import fs from 'node:fs';
import Parser from 'rss-parser';
import { load } from 'cheerio';
import type { Job } from '../src/types';
import { getAuditPage } from './lib/ats-audit-http';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { assertAtsSourceAllowed } from '../src/lib/job-source-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey, getJobIdentity } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { readJobDescriptionStore, writeJobDescriptionStore, buildJobDescriptionAliases } from './lib/job-description-store';

const VERIFIED_LEVER_REPLACEMENTS = [
  { board: 'toku', company: 'Toku', website: 'toku.com', officialCareersUrl: 'https://www.toku.com/' },
  { board: 'sphere-laboratories', company: 'Sphere', website: 'spherepay.co', officialCareersUrl: 'https://spherepay.co/' },
  { board: 'saga-xyz', company: 'Saga', website: 'saga.xyz', officialCareersUrl: 'https://saga.xyz/' },
];

async function main() {
  const cachePath = 'content/jobs-cache.json';
  const jobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const byIdentity = new Map(jobs.map(job => [getJobIdentity(job), job]));
  const store = readJobDescriptionStore();
  let added = 0;
  function add(job: Job, description: string) {
    if (!isConcreteJobOpening(job.title, job.link) || load(description).text().trim().length < 100) return;
    const identity = getJobIdentity(job), previous = byIdentity.get(identity);
    const next = { ...job, ...(previous?.slug && { slug: previous.slug }) };
    if (!previous) added++;
    byIdentity.set(identity, next);
    store.descriptions[getJobContentKey(next)] = description;
  }
  for (const source of VERIFIED_LEVER_REPLACEMENTS) {
    assertAtsSourceAllowed('lever', source.board);
    const official = await getAuditPage(source.officialCareersUrl);
    if (official.status !== 200 || !official.body.includes(`jobs.lever.co/${source.board}`)) throw new Error(`Official careers link missing: ${source.company}`);
    const page = await getAuditPage(`https://jobs.lever.co/${source.board}`);
    if (page.status !== 200 || !page.body.includes(source.website)) throw new Error(`Employer website mismatch: ${source.company}`);
    const response = await getAuditPage(`https://api.lever.co/v0/postings/${source.board}?mode=json`);
    if (response.status !== 200) throw new Error(`Lever HTTP ${response.status}: ${source.board}`);
    const postings = JSON.parse(response.body) as Array<{ id: string; text: string; hostedUrl: string; createdAt: number; description?: string; descriptionBody?: string; additional?: string; lists?: Array<{ text?: string; content?: string }>; categories?: { location?: string; department?: string; team?: string } }>;
    if (!Array.isArray(postings)) throw new Error(`Invalid Lever postings: ${source.board}`);
    for (const posting of postings) {
      const description = [posting.description || posting.descriptionBody, ...(posting.lists || []).flatMap(list => [list.text ? `<h3>${list.text}</h3>` : '', list.content ? `<ul>${list.content}</ul>` : '']), posting.additional].filter(Boolean).join('\n');
      add({ id: posting.id, title: posting.text, company: source.company, link: posting.hostedUrl, date: new Date(posting.createdAt).toISOString(), source: `Lever: ${source.company} [${source.board}]`, location: posting.categories?.location, department: posting.categories?.department || posting.categories?.team, active: true }, description);
    }
    console.log(`${source.company}: ${postings.length} employer postings checked`);
  }
  const feedResponse = await getAuditPage('https://careers.ethena.fi/jobs.rss');
  if (feedResponse.status !== 200) throw new Error(`Ethena RSS HTTP ${feedResponse.status}`);
  const feed = await new Parser().parseString(feedResponse.body);
  for (const item of feed.items) {
    if (!item.title || !item.link || !item.isoDate || new URL(item.link).hostname !== 'careers.ethena.fi') continue;
    add({ id: item.guid || item.link, title: item.title, company: 'Ethena Labs', link: item.link, date: item.isoDate, source: 'Teamtailor: Ethena Labs [ethena]', active: true }, item.content || '');
  }
  const merged = [...byIdentity.values()];
  const archive = loadJobLegacyArchive();
  assignJobSlugsAndSyncLegacyArchive(merged, archive, loadReservedRootSlugsSync(), loadPublishedRootSlugsSync());
  writeJobLegacyArchive(archive);
  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);
  writeJobDescriptionStore({ descriptions: store.descriptions, aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, store.descriptions) } });
  console.log(`Imported ${added} verified replacement roles; ${merged.length} total jobs`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
