import fs from 'node:fs';
import { load } from 'cheerio';
import { getAuditPage } from './lib/ats-audit-http';
import { readJobDescriptionStore } from './lib/job-description-store';
import { getJobContentKey } from '../src/lib/job-slugs';
import { atsBoardKey, getJobAtsBoards } from '../src/lib/ats-board-identity';
import type { Job } from '../src/types';

async function main() {
  const urls = process.argv.slice(2).filter(arg => /^https?:/.test(arg));
  if (urls.length) {
    const file = '.cache/ats-website-evidence.json';
    const evidence = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    let cursor = 0;
    await Promise.all(Array.from({ length: 5 }, async () => {
      while (cursor < urls.length) {
        const url = urls[cursor++];
        try {
          const response = await getAuditPage(url);
          const $ = load(response.body);
          $('script,style,noscript,svg').remove();
          const links = [...new Set($('a[href],iframe[src]').map((_, el) => $(el).attr('href') || $(el).attr('src') || '').get().filter(href => /career|jobs|ashby|greenhouse|lever\.co|workable|bamboohr|twitter|linkedin|x\.com|favicon/i.test(href)).map(href => new URL(href, response.url).toString()))];
          evidence[url] = { checkedAt: new Date().toISOString(), status: response.status, finalUrl: response.url, title: $('title').text(), description: $('meta[name="description"]').attr('content'), excerpt: ($('main').text() || $('body').text()).replace(/\s+/g, ' ').trim().slice(0, 900), links, icon: $('link[rel="icon"]').attr('href') };
        } catch (error) { evidence[url] = { error: (error as Error).message }; }
        console.log(JSON.stringify({ url, ...evidence[url] }));
      }
    }));
    fs.writeFileSync(file, JSON.stringify(evidence, null, 2));
    return;
  }
  const { results } = JSON.parse(fs.readFileSync('.cache/ats-employer-audit.json', 'utf8'));
  const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7).split(',');
  const cached = process.argv.includes('--cached-descriptions');
  const store = cached ? readJobDescriptionStore() : undefined;
  const jobs = cached ? JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Job[] : [];
  const limit = Number(process.argv.find(arg => arg.startsWith('--excerpt='))?.slice(10) || 1000);
  for (const entry of results) {
    if (only && !only.includes(entry.board.toLowerCase()) && !only.includes(entry.provider)) continue;
    const job = jobs.find(job => getJobAtsBoards(job).some(board => atsBoardKey(board.provider, board.board) === atsBoardKey(entry.provider, entry.board)));
    const description = job && store ? store.descriptions[getJobContentKey(job)] || store.descriptions[store.aliases[job.id]] : undefined;
    const excerpt = description ? load(description).text().replace(/\s+/g, ' ').trim().slice(0, limit) : entry.excerpt?.slice(0, limit);
    console.log(JSON.stringify({ board: `${entry.provider}:${entry.board}`, companies: entry.companies, jobs: entry.jobs, owner: entry.owner, website: entry.website, expected: entry.expectedWebsites, excerpt, externalLinks: entry.externalLinks, error: entry.error }));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
