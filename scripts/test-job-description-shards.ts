#!/usr/bin/env tsx

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Job } from '../src/types';
import { getCachedRawContent } from '../src/lib/job-guides';
import {
  clearDescriptionShardCache,
  seedDescriptionShardCache,
} from '../src/lib/job-description-shard-loader';
import {
  getJobDescriptionShardFilename,
  getJobDescriptionShardIndex,
  getJobDescriptionShardIndexForContentKey,
  isJobDescriptionShard,
  type JobDescriptionShard,
} from '../src/lib/job-description-shards';
import { getJobContentKey } from '../src/lib/job-slugs';
import {
  getJobDescriptionShardsPath,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';
import { migrateLegacyDescriptions } from './shard-job-descriptions';

const job: Job = {
  id: 'legacy-id',
  title: 'Protocol Engineer',
  company: 'Example Labs',
  link: 'https://jobs.example.com/roles/protocol-engineer',
  date: '2026-09-13',
  source: 'test',
  slug: 'legacy-slug',
};

function main(): void {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'job-description-shards-'));

  try {
    const canonicalKey = getJobContentKey(job);
    const migration = migrateLegacyDescriptions({ [job.id]: '<p>legacy content</p>' }, [job]);
    assert.equal(migration.descriptions[canonicalKey], '<p>legacy content</p>');
    assert.equal(migration.aliases[job.id], canonicalKey);
    assert.equal(migration.aliases[job.slug!], canonicalKey);
    assert.equal(getJobDescriptionShardIndex(job), getJobDescriptionShardIndexForContentKey(canonicalKey));

    writeJobDescriptionStore(migration, root);
    const stored = readJobDescriptionStore(root);
    assert.deepEqual(stored, migration);

    // Runtime reads go through the seeded in-memory cache (shards are served
    // as static assets via fetchSiteAsset, never fs-read at runtime).
    clearDescriptionShardCache();
    const filename = getJobDescriptionShardFilename(getJobDescriptionShardIndex(job));
    const seeded = JSON.parse(
      fs.readFileSync(path.join(getJobDescriptionShardsPath(root), filename), 'utf8'),
    ) as unknown;
    assert.ok(isJobDescriptionShard(seeded));
    seedDescriptionShardCache(filename, seeded as JobDescriptionShard);
    assert.equal(getCachedRawContent(job), '<p>legacy content</p>');

    const legacyLookupJob = {
      ...job,
      id: 'legacy-alias-id',
      slug: 'legacy-alias-slug',
      link: 'https://jobs.example.com/roles/legacy-alias',
    };
    const legacyLookupShard = getJobDescriptionShardIndex(legacyLookupJob);
    let legacyTargetKey = '';
    for (let index = 0; index < 1000; index += 1) {
      const candidateKey = getJobContentKey({
        ...legacyLookupJob,
        id: `legacy-target-${index}`,
        link: `${legacyLookupJob.link}/${index}`,
      });
      if (candidateKey !== getJobContentKey(legacyLookupJob)
        && getJobDescriptionShardIndexForContentKey(candidateKey) === legacyLookupShard) {
        legacyTargetKey = candidateKey;
        break;
      }
    }
    assert.ok(legacyTargetKey, 'expected a canonical key in the legacy lookup shard');
    writeJobDescriptionStore({
      descriptions: { [legacyTargetKey]: '<p>legacy alias content</p>' },
      aliases: {
        [legacyLookupJob.id]: legacyTargetKey,
        [legacyLookupJob.slug!]: legacyTargetKey,
      },
    }, root);
    clearDescriptionShardCache();
    const legacyFilename = getJobDescriptionShardFilename(legacyLookupShard);
    const legacySeeded = JSON.parse(
      fs.readFileSync(path.join(getJobDescriptionShardsPath(root), legacyFilename), 'utf8'),
    ) as unknown;
    assert.ok(isJobDescriptionShard(legacySeeded));
    seedDescriptionShardCache(legacyFilename, legacySeeded as JobDescriptionShard);
    assert.equal(getCachedRawContent(legacyLookupJob), '<p>legacy alias content</p>');

    const fallbackJob = { ...job, id: 'missing-shard', description: '<p>fallback</p>' };
    clearDescriptionShardCache();
    assert.equal(getCachedRawContent(fallbackJob), '<p>fallback</p>');

    // Malformed shard payloads never reach the cache: the loader validates
    // with isJobDescriptionShard and leaves the isolate unpoisoned.
    assert.equal(isJobDescriptionShard({}), false);
    assert.equal(isJobDescriptionShard({ version: 1, descriptions: {}, aliases: {} }), true);
    const corruptJob = { ...job, id: 'corrupt-shard', link: 'https://jobs.example.com/corrupt', description: '<h2>safe</h2>' };
    clearDescriptionShardCache();
    const corruptResult = getCachedRawContent(corruptJob);
    assert.equal(corruptResult, '<h3>safe</h3>');

    const runtimeSource = fs.readFileSync(path.join(process.cwd(), 'src/lib/job-guides.ts'), 'utf8');
    assert.doesNotMatch(runtimeSource, /job-descriptions\.json/);
    console.log('Job description shard tests passed.');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main();
