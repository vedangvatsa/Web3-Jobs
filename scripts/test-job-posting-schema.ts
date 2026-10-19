import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import type { Job } from '../src/types';
import { JobDetailView } from '../src/components/job-detail-view';
import { buildJobPostingSchema } from '../src/lib/job-posting-schema';
import { getJobPostingLocation } from '../src/lib/job-posting-location';
import { buildJobContentFallbackHtml } from '../src/lib/job-guides';

// tsx uses the repository's preserved JSX setting outside Next's compiler.
Object.assign(globalThis, { React });

const now = Date.parse('2026-10-19T12:00:00Z');
const contentHtml = '<p>Maintain the payment API and review production changes.</p><ul><li>Experience with TypeScript and incident response is required.</li></ul>';
const job: Job = {
  id: 'schema-regression', slug: 'schema-regression', title: 'Software Engineer',
  company: 'Example', link: 'https://example.com/jobs/engineer', source: 'Employer',
  date: '2026-10-18T09:00:00Z', dateVerified: true, active: true,
  location: 'Remote (United States)', workplaceType: 'remote',
};
const build = (overrides: Partial<Job> = {}) => buildJobPostingSchema({ job: { ...job, ...overrides }, contentHtml, siteUrl: 'https://hashtagweb3.com', now });

test('fully remote country restrictions and multiple countries survive without invented offices', () => {
  const result = build({ location: 'Remote (United States / Canada)' });
  assert.deepEqual(result.reasons, []);
  assert.equal(result.schema?.jobLocationType, 'TELECOMMUTE');
  assert.deepEqual(result.schema?.applicantLocationRequirements, [
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'Canada' },
  ]);
  assert.equal(result.schema?.jobLocation, undefined);
  assert.equal(result.schema?.description, `<p>Location: Remote (United States / Canada)</p>${contentHtml}`);
  assert.equal(result.schema?.datePosted, job.date);
  assert.deepEqual(build({ location: 'Remote-US' }).schema?.applicantLocationRequirements, [{ '@type': 'Country', name: 'United States' }]);
  assert.ok(build({ location: 'United States', workplaceType: 'remote' }).schema?.description.startsWith('<p>Location: Remote (United States)</p>'));
});

test('missing and broad remote locations suppress markup without default countries', () => {
  for (const location of [undefined, '', 'Not specified', 'Remote', 'Worldwide', 'Remote (Worldwide)', 'Remote (North America)', 'EMEA - Remote', 'Remote (Europe)', 'Remote (APAC)']) {
    const result = build({ location });
    assert.equal(result.schema, null, String(location));
    assert.ok(result.reasons.length, String(location));
  }
});

test('regional restrictions are not widened to their parent countries', () => {
  for (const location of ['Remote (New York, NY)', 'Remote (Ontario, Canada)', 'Remote (US / Europe)', 'Remote (United States, Eastern time zone)', 'Remote (England)', 'Remote (CA)']) {
    assert.equal(build({ location }).schema, null, location);
  }
  assert.equal(build({ location: 'Remote (Ontario, Canada)' }).reasons[0], 'remote-area-unresolved');
});

test('hybrid and onsite evidence overrides ATS isRemote flags; ambiguous remote claims are withheld', () => {
  for (const workplaceType of ['Hybrid', 'OnSite']) {
    const result = build({ workplaceType, isRemote: true, location: 'London, United Kingdom' });
    assert.equal(result.schema?.jobLocationType, undefined);
    assert.equal(result.schema?.jobLocation?.[0]?.address.addressCountry, 'GB');
  }
  for (const location of ['San Francisco - remote first in US', 'Remote optional - United States', 'Not remote - United States', 'Occasional remote - United States', 'Worldwide']) {
    assert.equal(build({ location, workplaceType: undefined }).schema, null, location);
  }
  assert.equal(build({ location: 'Remote (United States)', workplaceType: 'OnSite' }).schema, null);
  assert.equal(build({ isRemote: false }).schema, null);
  assert.equal(build({ location: 'United States', workplaceType: undefined, isRemote: true }).schema, null);
  const sensing = build({ title: 'Remote Sensing Engineer', location: 'London, UK', workplaceType: undefined });
  assert.ok(sensing.schema);
  assert.equal(sensing.schema.jobLocationType, undefined);
});

test('physical offices stay separate and unresolved cities cannot borrow another office country', () => {
  const result = build({ location: 'Abu Dhabi, UAE; Kuala Lumpur, Malaysia', workplaceType: 'onsite' });
  assert.deepEqual(result.schema?.jobLocation?.map(place => place.address.addressCountry), ['AE', 'MY']);
  for (const location of ['Bangalore', 'London; Paris, France', 'Indianapolis', 'Toronto, CA', 'Berlin, DE']) {
    const invalid = build({ location, workplaceType: 'onsite' });
    assert.equal(invalid.schema, null, location);
    assert.ok(invalid.reasons.includes('physical-country-missing'), location);
  }
});

test('optional employment, direct-apply, deadline and salary claims require evidence absent from this catalog', () => {
  for (const title of ['VP, International Communications', 'Internal Audit Senior Manager', 'Smart Contract Engineer', 'Software Engineer']) {
    const result = build({ title, salary: '$100k - $150k', department: 'International Operations' });
    assert.ok(result.schema);
    for (const property of ['employmentType', 'directApply', 'validThrough', 'baseSalary']) {
      assert.equal(Object.hasOwn(result.schema, property), false, `${title}: ${property}`);
    }
  }
});

test('the original-date age policy remains inclusive at 30 days and rejects every invalid provenance state', () => {
  const boundaryDate = new Date(now - 30 * 86_400_000).toISOString();
  assert.ok(build({ date: boundaryDate }).schema);
  const cases: [Partial<Job>, string][] = [
    [{ date: new Date(Date.parse(boundaryDate) - 1).toISOString() }, 'expired'],
    [{ dateVerified: false }, 'unverified-date'],
    [{ date: '' }, 'missing-date'],
    [{ date: '2026-02-30' }, 'invalid-date'],
    [{ date: '2026-10-20T00:00:00Z' }, 'future-date'],
    [{ active: false }, 'inactive'],
  ];
  for (const [overrides, reason] of cases) {
    const result = build(overrides);
    assert.equal(result.schema, null);
    assert.ok(result.reasons.includes(reason));
  }
});

test('missing required content produces actionable omission reasons', () => {
  assert.deepEqual(build({ title: '', company: '', link: 'javascript:void(0)' }).reasons, ['missing-title', 'missing-hiring-organization', 'missing-application-url']);
  for (const description of ['', '<p>&nbsp;</p>', `<p>${job.title}</p>`]) {
    const result = buildJobPostingSchema({ job, contentHtml: description, siteUrl: 'https://hashtagweb3.com', now });
    assert.equal(result.schema, null);
    assert.ok(result.reasons.includes('incomplete-description'));
  }
});

function render(overrides: Partial<Job>, html = contentHtml) {
  return load(renderToStaticMarkup(React.createElement(JobDetailView, {
    job: { ...job, date: new Date().toISOString(), ...overrides }, contentHtml: html,
    company: null, siteUrl: 'https://hashtagweb3.com',
  })));
}

test('suppression preserves the actual job page, application link, description, and breadcrumbs', () => {
  const $ = render({ location: 'Remote' });
  assert.equal($('[data-job-posting-schema]').attr('data-job-posting-schema'), 'suppressed');
  assert.equal($('[data-job-posting-schema-reasons]').attr('data-job-posting-schema-reasons'), 'remote-country-missing');
  const schemas = $('script[type="application/ld+json"]').toArray().map(element => JSON.parse($(element).text()));
  assert.deepEqual(schemas.map(schema => schema['@type']), ['BreadcrumbList']);
  assert.equal($('h1').text(), job.title);
  assert.ok($(`a[href="${job.link}"]`).length);
  assert.ok($('section').text().includes('Maintain the payment API'));
});

test('rendered eligible markup matches the page and escapes script delimiters', () => {
  const title = 'Engineer </script><script>invalid()</script>';
  const $ = render({ title });
  assert.equal($('[data-job-posting-schema]').attr('data-job-posting-schema'), 'eligible');
  assert.equal($('script').length, 2);
  const schema = JSON.parse($('script').first().text());
  assert.equal(schema.title, title);
  assert.equal(schema.description, `<p>Location: ${job.location}</p>${contentHtml}`);
  assert.equal($('h1').text(), title);
});

test('synthesized fallback descriptions remain visible but are not advertised as complete jobs', () => {
  const $ = render({}, buildJobContentFallbackHtml(job));
  assert.equal($('[data-job-posting-schema]').attr('data-job-posting-schema'), 'suppressed');
  assert.equal($('[data-job-posting-schema-reasons]').attr('data-job-posting-schema-reasons'), 'incomplete-description');
  assert.ok($('section').text().includes('Position Overview'));
});

test('expired detail components still refuse to render', () => {
  assert.throws(() => render({ date: '2020-01-01' }), /NEXT_HTTP_ERROR_FALLBACK;404/);
  assert.equal(getJobPostingLocation({ ...job, location: undefined }).reason, 'missing-location');
});
