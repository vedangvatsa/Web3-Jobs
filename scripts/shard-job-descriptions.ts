#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { getJobContentKey } from '../src/lib/job-slugs';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

const ROOT = path.resolve(import.meta.dirname, '..');
const MONOLITH_PATH = path.join(ROOT, 'content', 'job-descriptions.json');
const JOBS_PATH = path.join(ROOT, 'content', 'jobs-cache.json');

function main(): void {
  if (!fs.existsSync(MONOLITH_PATH)) {
    throw new Error(`Legacy description monolith not found: ${MONOLITH_PATH}`);
  }

  const legacy: unknown = JSON.parse(fs.readFileSync(MONOLITH_PATH, 'utf8'));
  if (!isDescriptionMap(legacy)) throw new Error('Legacy description monolith is not a string map');
  const jobs: Job[] = JSON.parse(fs.readFileSync(JOBS_PATH, 'utf8'));
  const { descriptions, aliases } = migrateLegacyDescriptions(legacy, jobs);

  writeJobDescriptionStore({ descriptions, aliases }, ROOT);
  const written = readJobDescriptionStore(ROOT);
  if (!sameStringMap(descriptions, written.descriptions) || !sameStringMap(aliases, written.aliases)) {
    throw new Error('Shard validation did not reproduce the migrated description store');
  }

  fs.unlinkSync(MONOLITH_PATH);
  console.log(`Sharded ${Object.keys(descriptions).length} descriptions into 64 files.`);
}

export function migrateLegacyDescriptions(
  legacy: Record<string, string>,
  jobs: Job[],
): { descriptions: Record<string, string>; aliases: Record<string, string> } {
  const descriptions: Record<string, string> = {};
  const claimedLegacyKeys = new Set<string>();

  for (const [key, content] of Object.entries(legacy)) {
    if (/^job-[0-9a-z]+$/.test(key)) descriptions[key] = content;
  }

  for (const job of jobs) {
    const contentKey = getJobContentKey(job);
    const legacyKeys = [job.id, job.slug].filter((key): key is string => Boolean(key));
    const matchingKey = [contentKey, ...legacyKeys].find((key) => typeof legacy[key] === 'string');
    if (!matchingKey) continue;

    if (!descriptions[contentKey]) descriptions[contentKey] = legacy[matchingKey];
    for (const key of legacyKeys) {
      if (typeof legacy[key] === 'string' && legacy[key] === descriptions[contentKey]) {
        claimedLegacyKeys.add(key);
      }
    }
  }

  for (const [key, content] of Object.entries(legacy)) {
    if (/^job-[0-9a-z]+$/.test(key) || claimedLegacyKeys.has(key)) continue;
    const archivalKey = getJobContentKey({ id: `legacy:${key}`, title: '', company: '', link: '' });
    if (!descriptions[archivalKey]) descriptions[archivalKey] = content;
  }

  return { descriptions, aliases: buildJobDescriptionAliases(jobs, descriptions) };
}

function isDescriptionMap(value: unknown): value is Record<string, string> {
  return Boolean(value)
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.values(value).every((entry) => typeof entry === 'string');
}

function sameStringMap(left: Record<string, string>, right: Record<string, string>): boolean {
  const leftKeys = Object.keys(left);
  return leftKeys.length === Object.keys(right).length
    && leftKeys.every((key) => left[key] === right[key]);
}

if (require.main === module) main();
