import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

async function fetchGreenhouseHtml(ghJid: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.greenhouse.io/v1/boards/coinbase/jobs/${ghJid}?content=true`);
    if (!res.ok) return null;
    const data: any = await res.json();
    const rawHtml = data.content || '';
    if (!rawHtml) return null;
    return rawHtml
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  } catch (err) {
    return null;
  }
}

async function fixAllCoinbaseDescriptions() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const jobs = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let updated = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    if (job.company === 'Coinbase' && job.source && job.source.includes('Greenhouse')) {
      const ghIdMatch = job.link.match(/gh_jid=(\d+)/) || job.id.match(/^(\d+)$/);
      if (ghIdMatch) {
        const ghJid = ghIdMatch[1];
        const html = await fetchGreenhouseHtml(ghJid);
        if (html && html.length > 200) {
          jobs[i].description = html;
          updated++;
          console.log(`[${updated}] Updated Coinbase (${ghJid}): ${job.title} (${html.length} chars)`);
        }
      }
    }
  }

  fs.writeFileSync(cachePath, JSON.stringify(jobs, null, 2), 'utf8');
  console.log(`Successfully updated ${updated} Coinbase job descriptions.`);
}

fixAllCoinbaseDescriptions().catch(console.error);
