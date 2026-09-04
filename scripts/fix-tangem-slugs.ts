import fs from 'fs';
import path from 'path';

function generateShortSlug(title: string, existingSlugs: Set<string>): string {
  // Extract key role words or abbreviations
  const lower = title.toLowerCase().trim();
  
  let base = '';
  if (lower.includes('business development') || lower.includes('bd ')) {
    base = 'bd';
  } else if (lower.includes('ux writer')) {
    base = 'ux-writer';
  } else if (lower.includes('attribution analyst')) {
    base = 'attribution-analyst';
  } else if (lower.includes('treasury')) {
    base = 'treasury';
  } else if (lower.includes('transport')) {
    base = 'transport';
  } else if (lower.includes('assistant')) {
    base = 'assistant';
  } else if (lower.includes('accountant')) {
    base = 'accountant';
  } else if (lower.includes('ai engineer')) {
    base = 'ai-engineer';
  } else if (lower.includes('ambassador')) {
    base = 'ambassador-lead';
  } else {
    // Fallback: clean words
    base = lower
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .slice(0, 2)
      .join('-');
  }

  if (!existingSlugs.has(base)) {
    existingSlugs.add(base);
    return base;
  }

  // Conflict handling: base1, base2, etc.
  let counter = 1;
  while (existingSlugs.has(`${base}${counter}`)) {
    counter++;
  }
  const slug = `${base}${counter}`;
  existingSlugs.add(slug);
  return slug;
}

function updateTangemSlugs() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const existingSlugs = new Set<string>();
  cacheData.forEach((j: any) => {
    if (j.company !== 'Tangem' && j.slug) {
      existingSlugs.add(j.slug);
    }
  });

  let updatedCount = 0;
  for (const job of cacheData) {
    if (job.company === 'Tangem') {
      const oldSlug = job.slug;
      job.slug = generateShortSlug(job.title, existingSlugs);
      console.log(`Tangem: "${job.title}" -> /${job.slug} (was /${oldSlug})`);
      updatedCount++;
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
  console.log(`Updated ${updatedCount} Tangem job slugs to clean short URLs.`);
}

updateTangemSlugs();
