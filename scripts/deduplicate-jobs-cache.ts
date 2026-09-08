import fs from "fs";
import path from "path";

interface Job {
  id: string;
  title: string;
  company: string;
  link: string;
  slug: string;
  source: string;
  date?: string;
  location?: string;
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function cleanUrl(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "source"].forEach(p => u.searchParams.delete(p));
    return u.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return url.split("?")[0].replace(/\/$/, "").toLowerCase();
  }
}

function deduplicate() {
  const filePath = path.join(process.cwd(), "content/jobs-cache.json");
  const rawJobs: Job[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Starting deduplication on ${rawJobs.length} jobs...`);

  const seenIds = new Set<string>();
  const seenLinks = new Set<string>();
  const seenCompanyTitleCombos = new Set<string>();

  const deduplicated: Job[] = [];
  let dupesRemoved = 0;

  for (const job of rawJobs) {
    const cleanLink = cleanUrl(job.link);
    const comboKey = `${normalize(job.company)}::${normalize(job.title)}`;

    // Prefer direct ATS links (Ashby, Greenhouse, Lever, Workday) over wrapper links like jobs.solana.com/companies/...
    const isWrapperLink = job.link.includes("jobs.solana.com/companies/");
    
    if (seenIds.has(job.id)) {
      dupesRemoved++;
      continue;
    }

    if (cleanLink && seenLinks.has(cleanLink)) {
      dupesRemoved++;
      continue;
    }

    if (seenCompanyTitleCombos.has(comboKey)) {
      // Check if existing item in deduplicated is a wrapper link and this one is a direct ATS link, swap it
      const existingIdx = deduplicated.findIndex(j => `${normalize(j.company)}::${normalize(j.title)}` === comboKey);
      if (existingIdx !== -1) {
        const existingJob = deduplicated[existingIdx];
        const existingIsWrapper = existingJob.link.includes("jobs.solana.com/companies/");
        if (existingIsWrapper && !isWrapperLink) {
          // Replace wrapper job with direct ATS job
          deduplicated[existingIdx] = job;
          if (cleanLink) seenLinks.add(cleanLink);
          seenIds.add(job.id);
        }
      }
      dupesRemoved++;
      continue;
    }

    seenIds.add(job.id);
    if (cleanLink) seenLinks.add(cleanLink);
    seenCompanyTitleCombos.add(comboKey);
    deduplicated.push(job);
  }

  console.log(`Deduplication complete:`);
  console.log(`  - Initial Jobs: ${rawJobs.length}`);
  console.log(`  - Duplicates Removed: ${dupesRemoved}`);
  console.log(`  - Clean Unique Jobs Remaining: ${deduplicated.length}`);

  fs.writeFileSync(filePath, JSON.stringify(deduplicated, null, 2));
}

deduplicate();
