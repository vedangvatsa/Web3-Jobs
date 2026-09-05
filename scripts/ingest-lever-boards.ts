import fs from 'fs';
import path from 'path';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { getJobContentKey } from '../src/lib/job-slugs';

interface LeverJob {
  id: string;
  text: string;
  createdAt: number;
  hostedUrl?: string;
  applyUrl?: string;
  categories?: {
    location?: string;
    department?: string;
    team?: string;
    allLocations?: string[];
  };
  description?: string;
  descriptionBody?: string;
  lists?: Array<{ text?: string; content?: string }>;
  additional?: string;
}

function buildLeverDescription(j: LeverJob): string {
  const parts: string[] = [];
  if (j.description) parts.push(j.description);
  if (j.descriptionBody) parts.push(j.descriptionBody);
  for (const list of j.lists || []) {
    if (list.text) parts.push(`<h3>${list.text}</h3>`);
    if (list.content) parts.push(`<ul>${list.content}</ul>`);
  }
  if (j.additional) parts.push(`<p>${j.additional}</p>`);
  return parts.filter(Boolean).join('\n');
}

async function ingestLeverCompany(
  companyName: string,
  leverSlug: string,
  cacheData: any[],
  descData: Record<string, string>
) {
  console.log(`Fetching Lever jobs for ${companyName} (${leverSlug})...`);
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${leverSlug}?mode=json`);
    if (!res.ok) throw new Error(`Lever HTTP ${res.status}`);
    const jobs = (await res.json()) as LeverJob[];
    console.log(`Fetched ${jobs.length} active jobs for ${companyName}.`);

    let added = 0;
    let updated = 0;

    for (const j of jobs) {
      const title = j.text?.trim();
      const link = j.hostedUrl || j.applyUrl;
      if (!title || !link || !isConcreteJobOpening(title, link)) continue;

      const pubDate = j.createdAt ? new Date(j.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
      const loc = j.categories?.location || j.categories?.allLocations?.join(', ') || 'Remote / Hybrid';
      const dept = j.categories?.department || j.categories?.team || 'Engineering';

      const job = {
        id: j.id,
        title,
        company: companyName,
        link,
        date: pubDate,
        source: `Lever: ${companyName} [${leverSlug}]`,
        location: loc,
        department: dept,
        active: true,
        slug: `role${j.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
      };

      const existingIdx = cacheData.findIndex((existing: any) => existing.id === job.id || existing.link === job.link);
      if (existingIdx === -1) {
        cacheData.unshift(job);
        added++;
      } else {
        cacheData[existingIdx] = { ...cacheData[existingIdx], ...job, slug: cacheData[existingIdx].slug || job.slug };
        updated++;
      }

      const descHtml = buildLeverDescription(j);
      if (descHtml) {
        descData[getJobContentKey(job)] = descHtml;
      }
    }

    console.log(`${companyName}: ${added} added, ${updated} updated.`);
  } catch (err: any) {
    console.warn(`⚠️ Lever fetch warning for ${companyName}: ${err.message}`);
  }
}

async function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const descPath = path.join(process.cwd(), 'content/job-descriptions.json');
  const descData = fs.existsSync(descPath) ? JSON.parse(fs.readFileSync(descPath, 'utf8')) : {};

  await ingestLeverCompany('CertiK', 'certik', cacheData, descData);
  await ingestLeverCompany('Wintermute', 'wintermute-trading', cacheData, descData);

  console.log(`Total jobs in cache: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
  fs.writeFileSync(descPath, JSON.stringify(descData, null, 2));
}

main();
