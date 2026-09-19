import fs from 'node:fs';
import path from 'node:path';
import { fetchJobOriginalContent, getCachedRawContent, isGenericJobTemplateHtml } from '../src/lib/job-guides';
import { getJobs } from '../src/lib/jobs';
import { getJobSlug } from '../src/lib/job-slugs';
import {
  JOB_DESCRIPTION_SHARD_COUNT,
  getJobDescriptionShardFilename,
  isJobDescriptionShard,
} from '../src/lib/job-description-shards';
import { seedDescriptionShardCache } from '../src/lib/job-description-shard-loader';

function preloadShards() {
  const dir = path.join(process.cwd(), 'content/job-description-shards');
  for (let i = 0; i < JOB_DESCRIPTION_SHARD_COUNT; i++) {
    const fn = getJobDescriptionShardFilename(i);
    const fp = path.join(dir, fn);
    if (!fs.existsSync(fp)) continue;
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (isJobDescriptionShard(data)) seedDescriptionShardCache(fn, data);
  }
}
  const missing = jobs.filter((job) => {
    const raw = getCachedRawContent(job);
    const plain = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return plain.length < 100;
  });
  console.log('missing', missing.length);
  for (const job of missing.slice(0, 8)) {
    const html = await fetchJobOriginalContent(job);
    const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(getJobSlug(job), plain.length, isGenericJobTemplateHtml(html), job.link?.slice(0, 60));
  }
}

main().catch(console.error);
