import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../../src/types';
import { jobAgeExclusionReason } from '../../src/lib/job-age-policy.mjs';
import { hasRequiredJobDateProvenance, normalizeSourcePostingDate, preserveOriginalJobDate } from '../../src/lib/job-source-date';
import { getJobContentKey, getJobIdentity, type LegacySlugRecord } from '../../src/lib/job-slugs';
import { getJobSourceIssue } from '../../src/lib/job-source-policy';
import { loadReservedRootSlugsSync } from '../../src/lib/reserved-root-slugs';
import { buildJobDescriptionAliases, readJobDescriptionStore, writeJobDescriptionStore } from './job-description-store';
import { readJobDateHistory, writeJobDateHistory } from './job-ingestion-policy';

export function retireIneligibleJobs(root = process.cwd(), now = Date.now()) {
  const read = <T,>(name: string): T => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
  const write = (name: string, value: unknown) => {
    const file = path.join(root, name);
    const json = `${JSON.stringify(value, null, 2)}\n`;
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== json) fs.writeFileSync(file, json);
  };
  const original = read<Job[]>('content/jobs-cache.json');
  const provenanceFile = path.join(root, 'content/job-date-provenance.json');
  const provenance = fs.existsSync(provenanceFile) ? read<{ records: Record<string, Pick<Job, 'date' | 'dateVerified' | 'dateSource' | 'dateEvidence'>> }>('content/job-date-provenance.json').records : {};
  const history = readJobDateHistory(root);
  const archive = read<Record<string, LegacySlugRecord>>('content/legacy-slugs-archive.json');
  const reserved = loadReservedRootSlugsSync();
  const reasons: Record<string, number> = {};
  const removed: Array<{ id: string; slug?: string; link: string; date: string; reason: string }> = [];
  const kept: Job[] = [];
  for (const raw of original) {
    let job = { ...raw, date: normalizeSourcePostingDate(raw.date) };
    const verified = provenance[getJobIdentity(job)];
    if (verified && (!job.dateSource || !hasRequiredJobDateProvenance(job))) job = { ...job, ...verified };
    // These importers wrote update/discovery time without marking it unverified.
    if (!job.dateSource && /^(Comeet:|Amazon\.jobs$|Google Careers$|Apple Careers$)/.test(job.source)) {
      job.dateVerified = false;
      job.dateSource = job.source.startsWith('Comeet:') ? 'legacy-updated-time' : 'legacy-discovery-time';
    }
    job = preserveOriginalJobDate(job, history);
    const sourceReason = getJobSourceIssue(job);
    const reason = sourceReason || jobAgeExclusionReason(job, now);
    if (!reason) { kept.push(job); continue; }
    reasons[reason] = (reasons[reason] || 0) + 1;
    removed.push({ id: job.id, slug: job.slug, link: job.link, date: job.date, reason });
    if (job.slug && !reserved.has(job.slug)) {
      const previous = archive[job.slug];
      if (!previous || getJobIdentity(previous as Job) === getJobIdentity(job)) {
        archive[job.slug] = { ...previous, id: job.id, link: job.link, title: job.title, company: job.company, ...(sourceReason && { retiredReason: sourceReason }) };
      }
    }
  }
  const keys = new Set(kept.map(getJobContentKey));
  const liveSlugs = new Set(kept.map(job => job.slug));
  const liveIdentities = new Set(kept.map(getJobIdentity));
  const store = readJobDescriptionStore(root);
  const descriptionCount = Object.keys(store.descriptions).length;
  const descriptions = Object.fromEntries(Object.entries(store.descriptions).filter(([key]) => keys.has(key)));
  const aliases = { ...Object.fromEntries(Object.entries(store.aliases).filter(([, key]) => keys.has(key))), ...buildJobDescriptionAliases(kept, descriptions) };
  if (descriptionCount !== Object.keys(descriptions).length || JSON.stringify(aliases) !== JSON.stringify(store.aliases)) writeJobDescriptionStore({ descriptions, aliases }, root);
  const retiredSlugs = new Set(removed.flatMap(job => [job.slug, job.id]).filter((slug): slug is string => Boolean(slug)));
  for (const [slug, record] of Object.entries(archive)) {
    const sourceReason = getJobSourceIssue(record);
    if (sourceReason && !record.retiredReason) record.retiredReason = sourceReason;
    if (!liveSlugs.has(slug) && (!record.link || !liveIdentities.has(getJobIdentity(record as Job)))) retiredSlugs.add(slug);
  }
  let removedAssets = 0;
  for (const slug of retiredSlugs) {
    if (liveSlugs.has(slug) || reserved.has(slug) || !/^[a-z0-9_-]+$/i.test(slug)) continue;
    for (const relative of [`public/preview/${slug}.html`, `public/preview/jobs/${slug}.html`, ...['png', 'jpg', 'webp'].map(ext => `public/og/jobs/${slug}.${ext}`)]) {
      const file = path.join(root, relative);
      if (fs.existsSync(file)) { fs.unlinkSync(file); removedAssets++; }
    }
  }
  write('content/jobs-cache.json', kept);
  write('content/legacy-slugs-archive.json', archive);
  writeJobDateHistory(history, root);
  return { checkedAt: new Date(now).toISOString(), initialJobs: original.length, remainingJobs: kept.length, removedJobs: removed.length, reasons, removedDescriptions: descriptionCount - Object.keys(descriptions).length, removedAssets, removed };
}
