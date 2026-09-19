import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { getJobContentKey } from '../src/lib/job-slugs';
import {
  readJobDescriptionStore,
  writeJobDescriptionStore,
  buildJobDescriptionAliases,
} from './lib/job-description-store';

function formatDescription(rawText: string): string {
  const unescaped = rawText
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[\u2010\u2011\u2012]/g, '-');

  const lines = unescaped.split('\n').map((l) => l.trim());
  const htmlParts: string[] = [];
  let inList = false;

  for (const line of lines) {
    if (!line) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      continue;
    }
    if (/^#{2,4}\s+/.test(line)) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      const hText = line.replace(/^#{2,4}\s+/, '').trim();
      htmlParts.push(`<h3>${hText}</h3>`);
    } else if (/^[-*•·▪–—\u2010-\u2015]\s+/.test(line)) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${line.replace(/^[-*•·▪–—\u2010-\u2015]\s+/, '').trim()}</li>`);
    } else if (line.endsWith(':') && line.length < 80) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<h3>${line}</h3>`);
    } else {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<p>${line}</p>`);
    }
  }
  if (inList) htmlParts.push('</ul>');
  return htmlParts.join('\n');
}

async function fetchWithRetry(url: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) return await res.text();
      if (res.status === 404) return '';
    } catch (e: any) {
      if (attempt === retries) throw e;
    }
    await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  return '';
}

async function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const allJobs: Job[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const yziJobs = allJobs.filter((j) => j.id && j.id.startsWith('yzilabs-'));

  console.log(`Found ${yziJobs.length} YZi Labs jobs to refresh.`);

  const store = readJobDescriptionStore();
  let updatedCount = 0;
  let skippedCount = 0;

  const concurrency = 6;
  for (let i = 0; i < yziJobs.length; i += concurrency) {
    const chunk = yziJobs.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (job) => {
        const rawId = job.id.replace('yzilabs-', '');
        const jobUrl = `https://talent.yzilabs.com/jobs/${rawId}`;
        const html = await fetchWithRetry(jobUrl);

        if (!html) {
          console.warn(`[warn] Could not fetch ${job.slug} (${jobUrl})`);
          skippedCount++;
          return;
        }

        const pMatches = [...html.matchAll(/<p class="whitespace-pre-wrap[^"]*">([\s\S]*?)<\/p>/gi)];
        if (pMatches.length === 0) {
          console.warn(`[warn] No whitespace-pre-wrap p found for ${job.slug}`);
          skippedCount++;
          return;
        }

        const combinedText = pMatches.map((m) => m[1]).join('\n\n');
        const formattedHtml = formatDescription(combinedText);

        const contentKey = getJobContentKey(job);
        store.descriptions[contentKey] = formattedHtml;
        updatedCount++;
        console.log(`[updated] ${job.slug} (${job.company} - ${job.title}) -> ${pMatches.length} sections, ${formattedHtml.length} chars`);
      })
    );
  }

  console.log(`\nRebuilding aliases...`);
  store.aliases = buildJobDescriptionAliases(allJobs, store.descriptions);

  console.log(`Writing shards...`);
  writeJobDescriptionStore(store);

  // Mirror to public directory
  const contentDir = path.join(process.cwd(), 'content/job-description-shards');
  const publicDir = path.join(process.cwd(), 'public/job-description-shards');
  fs.mkdirSync(publicDir, { recursive: true });
  for (const file of fs.readdirSync(contentDir)) {
    if (file.endsWith('.json')) {
      fs.copyFileSync(path.join(contentDir, file), path.join(publicDir, file));
    }
  }

  console.log(`\nDone! Successfully updated ${updatedCount} YZi Labs job descriptions (${skippedCount} skipped).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
