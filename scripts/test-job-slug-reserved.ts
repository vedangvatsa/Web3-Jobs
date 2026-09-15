/**
 * Job slugs stay unique and unshadowed. Existing non-reserved URLs stay put;
 * reserved collisions and new postings mint short abbrevs (`cm`, `cm2`).
 */
import {
  abbrevFromJobTitle,
  assignJobSlugsInCache,
} from '../src/lib/job-slugs';
import type { Job } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ${message}`);
    process.exit(1);
  }
}

function job(partial: Partial<Job> & Pick<Job, 'id' | 'title' | 'company' | 'link'>): Job {
  return {
    date: '2026-01-01',
    source: 'test',
    ...partial,
  };
}

assert(abbrevFromJobTitle('Community Manager') === 'cm', 'Community Manager → cm');
assert(abbrevFromJobTitle('Senior Product Manager') === 'pm', 'seniority stripped → pm');

const reserved = new Set(['community', 'binance', 'defi']);

const shadowed = job({
  id: '1',
  title: 'Community Manager',
  company: 'Harmony',
  link: 'https://example.com/jobs/1',
  slug: 'community',
});
const stable = job({
  id: '2',
  title: 'Trader',
  company: 'Wintermute',
  link: 'https://example.com/jobs/2',
  slug: 'trader',
  date: '2026-02-01',
});
const fresh = job({
  id: '3',
  title: 'Community Manager',
  company: 'Other',
  link: 'https://example.com/jobs/3',
  date: '2026-09-01',
});
const binanceRole = job({
  id: '4',
  title: 'Binance Accelerator Programme - LLM Data Scientist',
  company: 'Binance',
  link: 'https://example.com/jobs/4',
  slug: 'binance',
  date: '2026-03-01',
});

const placeholder = job({
  id: '5',
  title: 'Community Manager',
  company: 'PlaceholderCo',
  link: 'https://example.com/jobs/5',
  slug: 'roleab12c',
  date: '2026-10-01',
});

const jobs: Job[] = [shadowed, stable, fresh, binanceRole, placeholder];
assignJobSlugsInCache(jobs, { reservedRootSlugs: reserved });

assert(jobs.length === 5, 'no jobs dropped from cache');
assert(jobs[0].slug !== 'community', `shadowed community job reminted, got ${jobs[0].slug}`);
assert(jobs[0].slug === 'cm', `Harmony CM becomes /cm, got ${jobs[0].slug}`);
assert(jobs[1].slug === 'trader', 'non-reserved existing slug stays trader');
assert(jobs[2].slug === 'cm2', `second CM becomes /cm2, got ${jobs[2].slug}`);
assert(jobs[3].slug !== 'binance', `company slug reminted, got ${jobs[3].slug}`);
assert(!reserved.has(jobs[3].slug!), 'reminted binance job is not a reserved root');
assert(jobs[4].slug === 'cm3', `ingest placeholder reminted to cm3, got ${jobs[4].slug}`);

const slugs = jobs.map((item) => item.slug);
assert(new Set(slugs).size === slugs.length, 'assigned slugs are unique');
for (const item of jobs) {
  assert(Boolean(item.slug), `${item.id} missing slug`);
  assert(!reserved.has(item.slug!), `job ${item.id} still on reserved /${item.slug}`);
}

const dupA = job({
  id: '6',
  title: 'Trader',
  company: 'Alpha',
  link: 'https://example.com/jobs/6',
  slug: 'trader',
  date: '2026-01-15',
});
const dupB = job({
  id: '7',
  title: 'Trader',
  company: 'Beta',
  link: 'https://example.com/jobs/7',
  slug: 'trader',
  date: '2026-01-16',
});
const dups: Job[] = [dupA, dupB];
assignJobSlugsInCache(dups, { reservedRootSlugs: reserved });
assert(dups.length === 2, 'duplicate-slug jobs are not dropped');
assert(dups[0].slug !== dups[1].slug, `duplicate trader reminted apart: ${dups[0].slug} vs ${dups[1].slug}`);
assert(!reserved.has(dups[0].slug!) && !reserved.has(dups[1].slug!), 'dup remints stay off reserved roots');

console.log('✅ Job slug reserved-root regression passed');
