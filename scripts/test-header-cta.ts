import assert from 'node:assert/strict';
import slugTypes from '../content/slug-types.json';
import jobs from '../content/jobs-runtime.json';
import events from '../content/events-runtime.json';
import { getHeaderCta } from '../src/lib/header-cta';
import { classifySlug } from '../src/lib/slug-classifier';
import { EMPLOYER_RESOURCES } from '../src/lib/nav-config';

const employerJobCtaPaths = new Set(EMPLOYER_RESOURCES.map((item) => item.href.replace(/\/+$/, '') || '/'));

assert.equal(getHeaderCta('/'), 'job');
assert.equal(getHeaderCta('/jobs'), 'job');
assert.equal(getHeaderCta('/jobs/'), 'job');
assert.equal(getHeaderCta('/events'), 'event');
assert.equal(getHeaderCta('/events/'), 'event');
assert.equal(getHeaderCta(null), null);
assert.equal(getHeaderCta('/%invalid'), null);
assert.equal(getHeaderCta('/this-route-does-not-exist'), null);
assert.equal(getHeaderCta('/learn/defi/lesson'), null);

assert.equal(getHeaderCta('/popups'), 'popup');
assert.equal(getHeaderCta('/popups/'), 'popup');
assert.equal(getHeaderCta('/community'), 'partner');
assert.equal(getHeaderCta('/community/'), 'partner');
for (const href of employerJobCtaPaths) {
  assert.equal(getHeaderCta(href), 'job', href);
  assert.equal(getHeaderCta(`${href}/`), 'job', `${href}/`);
}
for (const slug of slugTypes.staticPages) {
  if (slug === 'jobs' || slug === 'events' || slug === 'popups' || slug === 'community') continue;
  if (employerJobCtaPaths.has(`/${slug}`)) continue;
  assert.equal(getHeaderCta(`/${slug}`), null, slug);
}
for (const job of jobs) {
  if (!job.slug || classifySlug(job.slug) !== 'job' || slugTypes.staticPages.includes(job.slug)) continue;
  assert.equal(getHeaderCta(`/${job.slug}`), 'job', job.slug);
}
for (const event of events) {
  if (!event.slug || slugTypes.staticPages.includes(event.slug)) continue;
  assert.equal(getHeaderCta(`/${event.slug}`), 'event', event.slug);
}
for (const slug of slugTypes.popups) {
  if (['job', 'event'].includes(classifySlug(slug))) continue;
  assert.equal(getHeaderCta(`/${slug}`), 'popup', slug);
}
for (const slug of [...slugTypes.companies, ...slugTypes.articles, ...slugTypes.glossary, ...slugTypes.resources]) {
  if (['job', 'event', 'popup'].includes(classifySlug(slug))) continue;
  assert.equal(getHeaderCta(`/${slug}`), null, slug);
}
assert.ok(slugTypes.jobs.length >= jobs.length, 'the compact index includes current jobs and legacy links');
console.log(`Header CTA routing passed for ${jobs.length} jobs, ${events.length} events, and other page types.`);
