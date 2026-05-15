import fs from 'fs';
import * as cheerio from 'cheerio';

const JOBS_FILE = './content/jobs-cache.json';
const OUTPUT_FILE = './content/jobs-full-text.json';
const CONCURRENCY = 20;

async function fetchJob(job) {
  try {
    const res = await fetch(job.link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000 // 10s timeout
    });

    if (!res.ok) {
      return { ...job, fullText: null, error: `HTTP ${res.status}` };
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Remove scripts, styles, nav, footer
    $('script, style, nav, footer, header, noscript, svg, img').remove();
    
    // Try to find common job description containers first, otherwise take body
    let content = $('.posting-content, .job-description, .description, main, article, #content').text();
    if (!content || content.trim().length < 100) {
      content = $('body').text();
    }

    const cleanText = content.replace(/\s+/g, ' ').trim();
    
    return { ...job, fullText: cleanText };
  } catch (err) {
    return { ...job, fullText: null, error: err.message };
  }
}

async function main() {
  console.log('Loading jobs...');
  const jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8'));
  console.log(`Found ${jobs.length} jobs to process.`);

  const results = [];
  let completed = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const batch = jobs.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(job => fetchJob(job)));
    
    for (const res of batchResults) {
      results.push(res);
      if (res.error) failed++;
    }
    
    completed += batch.length;
    console.log(`Progress: ${completed}/${jobs.length} (${((completed/jobs.length)*100).toFixed(1)}%) | Failed: ${failed}`);
    
    // Save intermediate progress every 500 jobs
    if (completed % 500 === 0 || completed === jobs.length) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
      console.log(`Checkpoint saved to ${OUTPUT_FILE}`);
    }

    // Small delay to prevent IP bans
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\nFinished! Successfully fetched ${jobs.length - failed} jobs. Failed: ${failed}.`);
}

main().catch(console.error);
