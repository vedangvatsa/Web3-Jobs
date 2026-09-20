import fs from 'node:fs';
import * as cheerio from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventGuideContent } from '../src/components/event-guide-content';
import { descriptionFormattingIssues } from './lib/description-format-checks';
import { buildJobsListing } from '../src/lib/jobs-listing-build';
import { buildSynthesizedJobContent } from '../src/lib/job-guides';
import { getJobContentKey } from '../src/lib/job-slugs';
import { readJobDescriptionStore } from './lib/job-description-store';
import { resolveEventGuide } from '../src/lib/event-guide-store';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { splitEventDescriptionBlocks } from '../src/lib/event-description-blocks';
import type { Web3Event } from '../src/lib/events';
import type { Job } from '../src/types';

type Finding = { kind: string; slug: string; sample: string };
const findings: Finding[] = [];
const add = (kind: string, slug: string, sample: string) => findings.push({ kind, slug, sample: sample.slice(0, 2000) });
async function main() {
  const jobs = buildJobsListing(JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Job[]);
  const store = readJobDescriptionStore();
  let scanned = 0;
  for (const job of jobs) {
    if (process.argv.includes('--events')) continue;
    const raw = store.descriptions[getJobContentKey(job)] || job.description || '';
    const html = buildSynthesizedJobContent(job, raw);
    const $ = cheerio.load(html);
    const slug = job.slug || job.id;
    for (const issue of descriptionFormattingIssues(html)) add(`job-${issue.kind}`, slug, issue.sample);
    const source = cheerio.load(raw);
    for (const tag of ['table', 'ol', 'pre']) {
      const meaningful = source(tag).filter((_, el) => tag === 'ol' ? source(el).find('li').length > 0 : !!source(el).text().trim());
      if (meaningful.length && !$(tag).length) add('job-lost-structure', slug, tag);
    }
    if (++scanned % 1000 === 0) console.error(`[formatting] Checked ${scanned}/${jobs.length} jobs`);
  }
  const events: Web3Event[] = await buildEventsListing();
  for (const event of events) {
    if (process.argv.includes('--jobs')) continue;
    const guide = await resolveEventGuide(event);
    const slug = event.slug || event.id;
    const html = renderToStaticMarkup(createElement(EventGuideContent, { editorial: guide }));
    for (const issue of descriptionFormattingIssues(html)) add(`event-${issue.kind}`, slug, issue.sample);
    for (const section of guide.sections) {
      if (!section.heading.trim() || section.heading.length > 180) add('event-heading', slug, section.heading);
      for (const paragraph of section.content) {
        for (const block of splitEventDescriptionBlocks(paragraph)) {
          if (block.type !== 'p') continue;
          if (/^\s*(?:#{1,6}\s+|[-*•▪]\s+|\d+[.)]\s+[A-Z])/.test(block.text)) add('event-unformatted-block', slug, block.text);
          if (/<\/?(?:p|div|strong|span)(?:\s|>)/.test(block.text)) add('event-markup-leak', slug, block.text);
          if (/\b(?:agenda|schedule|day \d|time:|what to expect|the evening)\b|→/i.test(block.text) && (block.text.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM)?/gi) || []).length >= 4 && !block.text.includes('\n')) add('event-agenda-run', slug, block.text);
        }
      }
    }
  }
  const counts: Record<string, number> = {};
  for (const item of findings) counts[item.kind] = (counts[item.kind] || 0) + 1;
  console.log(JSON.stringify({ jobs: jobs.length, events: events.length, counts }, null, 2));
  for (const kind of Object.keys(counts)) console.log(kind, findings.filter(f => f.kind === kind).slice(0, 10));
  if (!process.argv.includes('--report-only') && findings.length) process.exitCode = 1;
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
