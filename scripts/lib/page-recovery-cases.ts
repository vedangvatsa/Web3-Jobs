import removedJobs from '../../content/removed-job-paths.json';
import tombstones from '../../content/event-tombstones.json';

const removedJob = removedJobs[0];
const removedEvent = Object.values(tombstones).find(entry => Date.parse(entry.until) > Date.now())?.slugs[0];
if (!removedJob || !removedEvent) throw new Error('Recovery checks require a removed job and an active event tombstone');
const encoded = (slug: string) => `%${slug.charCodeAt(0).toString(16)}${slug.slice(1)}`;

export const recoveryPaths = [
  '/missing-recovery-test?token=private-example#private-fragment',
  '/missing-recovery-test/tg?utm_campaign=saved',
  '/%6dissing-recovery-test',
  '/evnets', '/constructor', '/__proto__', `/${'x'.repeat(500)}`,
  '/jobs/missing-recovery-test', '/events/missing-recovery-test',
  '/company/missing-recovery-test', '/companies/missing-recovery-test',
  '/articles/missing-recovery-test', '/blog/missing-recovery-test', '/news/missing-recovery-test',
  '/glossary/defi/missing-recovery-test', '/glossary/missing-recovery-test',
  '/nomads/missing-recovery-test', '/nomads/cities/missing-recovery-test',
  '/visas/missing-recovery-test', '/citizenship/missing-recovery-test', '/popups/missing-recovery-test',
  '/learn/missing-recovery-test', '/learn/fundamentals/missing-recovery-test', '/learn/missing-recovery-test/lesson',
  '/not/a/route', '/developers/missing-recovery-test', '/resources/missing-recovery-test',
  '/jobs/missing-recovery-test/tg', '/events/missing-recovery-test/li',
  '/missing-recovery-test/?ordinary=1', '/learn/missing-recovery-test/tg', '/company/missing-recovery-test/deeper',
  `/${removedJob}`, `/jobs/${removedJob}`, `/${removedJob}/tg`, `/${removedJob}/li`,
  `/${encoded(removedJob)}`, `/jobs/${encoded(removedJob)}`,
  '/marketing4', '/jobs/marketing4', '/marketing4/li',
  `/${removedEvent}`, `/${removedEvent}/li`, `/${encoded(removedEvent)}`,
  '/job-listing-cache', '/job-listing-cache/999999999999999', '/job-listing-cache/999999999999999/jobs',
];

export const retiredResourcePaths = [
  `/preview/${removedJob}.html`, `/preview/jobs/${removedJob}.html`, `/og/jobs/${removedJob}.png`,
  `/preview/${encoded(removedJob)}.html`, `/og/jobs/${encoded(removedJob)}.png`,
  `/%70review/${removedJob}.html`, `/%6fg/jobs/${removedJob}.png`,
  `/preview/${removedEvent}.html`, `/preview/${encoded(removedEvent)}.html`,
];

export const missingMachinePaths = [
  '/missing-recovery-test', '/missing-recovery-test?mode=agent', '/missing-recovery-test.json',
  '/api/jobs/wrong-id', '/api/events/wrong-id', '/api/does-not-exist',
  '/api/does-not-exist?mode=agent',
  '/unmatched/nested?mode=agent',
];
