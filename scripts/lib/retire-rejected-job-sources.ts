import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../../src/types';
import { getJobContentKey, getJobIdentity, type LegacySlugRecord } from '../../src/lib/job-slugs';
import { getJobSourceIssue, getJobRetirementReason } from '../../src/lib/job-source-policy';
import { readJobDescriptionStore, writeJobDescriptionStore } from './job-description-store';

export function retireRejectedJobSources(root = process.cwd()) {
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const archivePath = path.join(root, 'content/legacy-slugs-archive.json');
  const jobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const archive = JSON.parse(fs.readFileSync(archivePath, 'utf8')) as Record<string, LegacySlugRecord>;
  const rejected = jobs.filter(job => getJobSourceIssue(job));
  const kept = jobs.filter(job => !getJobSourceIssue(job));
  const liveSlugs = new Set(kept.map(job => job.slug));
  const retiredSlugs = new Set<string>();
  const recoveredSlugs = new Set<string>();
  const descriptionKeys = new Set(rejected.map(getJobContentKey));
  let changedArchive = false;

  for (const job of rejected) {
    if (!job.slug || liveSlugs.has(job.slug)) continue;
    const existing = archive[job.slug];
    if (existing && getJobIdentity(existing as Job) !== getJobIdentity(job)) {
      existing.recoveredFromMisattribution = true;
      recoveredSlugs.add(job.slug);
      changedArchive = true;
      continue;
    }
    archive[job.slug] = { id: job.id, title: job.title, company: job.company, link: job.link, retiredReason: getJobRetirementReason(job) };
    changedArchive = true;
  }
  for (const [slug, record] of Object.entries(archive)) {
    if (record.recoveredFromMisattribution) recoveredSlugs.add(slug);
    if (!getJobSourceIssue(record)) continue;
    const reason = getJobRetirementReason(record);
    if (record.retiredReason !== reason) {
      record.retiredReason = reason;
      changedArchive = true;
    }
    if (record.newSlug) { delete record.newSlug; changedArchive = true; }
    retiredSlugs.add(slug);
    descriptionKeys.add(getJobContentKey(record as Job));
  }

  const store = readJobDescriptionStore(root);
  const protectedKeys = new Set(kept.map(getJobContentKey));
  let removedDescriptions = 0;
  for (const key of descriptionKeys) {
    if (store.descriptions[key] && !protectedKeys.has(key)) { delete store.descriptions[key]; removedDescriptions++; }
  }
  for (const [alias, key] of Object.entries(store.aliases)) {
    if (!store.descriptions[key]) delete store.aliases[alias];
  }
  if (rejected.length) fs.writeFileSync(cachePath, `${JSON.stringify(kept, null, 2)}\n`);
  if (changedArchive) fs.writeFileSync(archivePath, `${JSON.stringify(archive, null, 2)}\n`);
  if (removedDescriptions) writeJobDescriptionStore(store, root);
  let removedImages = 0;
  for (const slug of new Set([...retiredSlugs, ...recoveredSlugs])) {
    if (liveSlugs.has(slug) || !/^[a-z0-9][a-z0-9_-]*$/i.test(slug)) continue;
    for (const extension of ['png', 'jpg', 'webp']) {
      const file = path.join(root, 'public/og/jobs', `${slug}.${extension}`);
      if (fs.existsSync(file)) { fs.unlinkSync(file); removedImages++; }
    }
  }
  return { removedJobs: rejected.length, remainingJobs: kept.length, retiredSlugs: [...retiredSlugs], recoveredSlugs: [...recoveredSlugs], removedDescriptions, removedImages, byCompany: Object.fromEntries([...new Set(rejected.map(job => job.company))].sort().map(company => [company, rejected.filter(job => job.company === company).length])) };
}
