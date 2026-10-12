import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPublishableJob, assertPublishableJobs, loadPublishedJobs, verifyEmployerApplication } from './job-publish-guard.mjs';

const now = Date.now();
const day = 86400000;
const job = { id: 'e18deeab-40ef-4a00-b627-d20fae6cb410', slug: 'marketing4', company: 'Harmony', title: 'Marketing Lead',
  date: new Date(now - day).toISOString(), active: true, link: 'https://jobs.lever.co/harmony/e18deeab-40ef-4a00-b627-d20fae6cb410' };
const openHtml = value => `<!doctype html><html><head><title>${value.title} at ${value.company}</title>
<script type="application/ld+json">${JSON.stringify({ '@type': 'JobPosting', title: value.title, hiringOrganization: { name: value.company }, datePosted: value.date,
  description: 'Lead marketing strategy, communications and community programs. Work with engineering and product teams to plan launches.' })}</script></head>
<body><h1>${value.title}</h1><p>${value.company} is accepting applications for this position.</p><a href="${value.link}/apply">Apply for this job</a></body></html>`;
const htmlResponse = (html = openHtml(job), status = 200) => new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });

test('rejects old, unknown, invalid, future, inactive and unverified payloads before any request', async () => {
  const changes = [{ date: '2024-03-09T05:33:00.298Z' }, { date: undefined }, { date: '' }, { date: 'not-a-date' },
    { date: new Date(now + 1).toISOString() }, { active: false }, { dateVerified: false }, { date: new Date(now - 30 * day - 1).toISOString() }];
  for (const change of changes) {
    let requests = 0;
    await assert.rejects(assertPublishableJob({ ...job, ...change }, { now: () => now,
      loadJobs: async () => { requests++; return [job]; }, request: async () => { requests++; return htmlResponse(); } }), /publication blocked/);
    assert.equal(requests, 0);
  }
});

test('exactly 30 days is allowed, requires a fresh GET, and is checked again on every delivery', async () => {
  const boundary = { ...job, date: new Date(now - 30 * day).toISOString() };
  let gets = 0;
  const options = { now: () => now, loadJobs: async () => [boundary], request: async (url, init) => {
    gets++;
    assert.equal(url, boundary.link); assert.equal(init.method, 'GET'); assert.equal(init.cache, 'no-store');
    assert.equal(init.redirect, 'manual');
    return htmlResponse(openHtml(boundary));
  } };
  await assertPublishableJob(boundary, options);
  await assertPublishableJob(boundary, options);
  assert.equal(gets, 2);
});

test('catalog eligibility is independent of the active flag and never restores an old queued date', async () => {
  const stale = { ...job, date: '2024-03-09T05:33:00.298Z' };
  assert.deepEqual(await loadPublishedJobs(async () => Response.json([stale, { ...job, date: undefined }, job])), [job]);
  await assert.rejects(assertPublishableJob(job, { loadJobs: async () => [stale] }), /expired/);
  await assert.rejects(assertPublishableJob(job, { loadJobs: async () => [] }), /absent/);
  await assert.rejects(assertPublishableJob(job, { loadJobs: async () => [{ ...job, link: 'https://careers.example.com/replacement' }] }), /link changed/);
  await assert.rejects(assertPublishableJob(job, { loadJobs: async () => [{ ...job, date: new Date(now).toISOString() }] }), /date changed/);
  await assert.rejects(loadPublishedJobs(async () => Response.json([], { status: 503 })), /unverified.*503/);
  assert.deepEqual(await loadPublishedJobs(async () => Response.json([])), []);
});

test('definite missing applications are closed; blocked, timed out and unsupported responses stay unverified', async () => {
  for (const status of [404, 410, 403, 429, 500, 503]) {
    await assert.rejects(verifyEmployerApplication(job, { request: async () => htmlResponse('', status) }),
      new RegExp(`Employer application ${[404, 410].includes(status) ? 'closed' : 'unverified'}: HTTP ${status}`));
  }
  await assert.rejects(verifyEmployerApplication(job, { request: async () => { throw new Error('timeout'); } }), /unverified: timeout/);
  await assert.rejects(verifyEmployerApplication(job, { request: async () => Response.json({ open: true }) }), /unverified: unsupported/);
});

test('200 soft-404s, board redirects, bot challenges and generic pages cannot authorize delivery', async () => {
  for (const body of ['<h1>Job not found</h1>', '<h1>This position has been filled</h1>', '<p>No longer accepting applications</p>',
    '<h1>Verify you are human</h1>', '<h1>Harmony careers</h1><p>Browse open roles</p>', '<h1>Marketing Lead</h1><p>Archived article</p>']) {
    await assert.rejects(verifyEmployerApplication(job, { request: async () => htmlResponse(body) }), /Employer application (closed|unverified)/);
  }
  let calls = 0;
  await assert.rejects(verifyEmployerApplication(job, { request: async () => ++calls === 1
    ? new Response(null, { status: 302, headers: { location: 'https://jobs.lever.co/harmony' } }) : htmlResponse(openHtml(job)) }), /redirected away/);
  assert.equal(calls, 2);
  await assert.rejects(verifyEmployerApplication({ ...job, link: 'https://hashtagweb3.com/marketing4' }, { request: async () => assert.fail('Own page cannot prove application validity') }), /direct public employer/);
});

test('HTML without JSON-LD needs the matching title and an application action', async () => {
  await verifyEmployerApplication(job, { request: async () => htmlResponse('<html><head><title>Careers</title></head><body><h1>Marketing Lead</h1><p>Lead marketing programs at Harmony.</p><a href="/harmony/id/apply">Apply now</a></body></html>') });
});

test('a mixed batch and jobs that age out during employer GET cause zero send callbacks', async () => {
  let requests = 0;
  await assert.rejects(assertPublishableJobs([job, { ...job, date: '' }], { request: async () => { requests++; return htmlResponse(); } }), /missing-date/);
  assert.equal(requests, 0);
  const boundary = { ...job, date: new Date(now - 30 * day).toISOString() };
  let clock = now;
  await assert.rejects(assertPublishableJob(boundary, { now: () => clock, loadJobs: async () => [boundary],
    request: async () => { clock++; return htmlResponse(openHtml(boundary)); } }), /expired/);
});

// URL chains and role identities come from the October 12 audit's saved GETs.
const redirectFixtures = [
  { family: 'Greenhouse host migration', id: '8259652', slug: 'sec65', company: 'Robinhood', title: 'Senior Physical Security Operations Manager', structured: false, urls: [
    'https://boards.greenhouse.io/robinhood/jobs/8259652?t=gh_src=&gh_jid=8259652',
    'https://job-boards.greenhouse.io/robinhood/jobs/8259652?t=gh_src=&gh_jid=8259652',
  ] },
  { family: 'Stripe query-to-detail routing', id: '8265686', slug: 'mkt103', company: 'Stripe', title: 'Writer, Content Marketing', structured: true, urls: [
    'https://stripe.com/jobs/search?gh_jid=8265686',
    'https://stripe.com/careers/search/redirect?gh_jid=8265686',
    'https://stripe.com/careers/listing/writer-content-marketing/8265686?gh_jid=8265686',
  ] },
  { family: 'Coinbase locale routing', id: '8269081', slug: 'eng537', company: 'Coinbase', title: 'Senior Software Engineer, Certificate Management', structured: true, urls: [
    'https://www.coinbase.com/careers/positions/8269081?gh_jid=8269081',
    'https://www.coinbase.com/en-in/careers/positions/8269081?gh_jid=8269081',
  ] },
  { family: 'Block same-job HTTPS upgrade', id: '5445956008', slug: 'ss2', company: 'Block', title: 'Head of Social - Square', structured: false, urls: [
    'http://block.xyz/careers/jobs/5445956008?gh_jid=5445956008',
    'https://block.xyz/careers/jobs/5445956008?gh_jid=5445956008',
  ] },
  { family: 'Fireblocks query-to-path routing', id: '4715533006', slug: 'sls188', company: 'Fireblocks', title: 'Sales Director, Payments', structured: true, urls: [
    'https://www.fireblocks.com/careers/position?gh_jid=4715533006',
    'https://www.fireblocks.com/careers/positions/4715533006',
  ] },
];

function redirectedJob(fixture) {
  return { id: fixture.id, slug: fixture.slug, company: fixture.company, title: fixture.title, date: new Date(now - day).toISOString(), link: fixture.urls[0] };
}

function redirectBody(fixture, postingChanges = {}, extra = '') {
  const value = redirectedJob(fixture);
  const posting = { '@type': 'JobPosting', title: value.title, hiringOrganization: { name: value.company }, datePosted: value.date,
    identifier: { '@type': 'PropertyValue', value: value.id }, description: `Join ${value.company} as ${value.title}. Work with the team to deliver projects and support customers.`, ...postingChanges };
  return `<!doctype html><html><head><title>Job Application for ${value.title} at ${value.company}</title>
    ${fixture.structured ? `<script type="application/ld+json">${JSON.stringify(posting)}</script>` : ''}</head>
    <body><h1>${value.title}</h1><p>Work at ${value.company}.</p>${extra}<form action="${fixture.urls.at(-1)}"><input name="resume" type="file"><button>Apply for this job</button></form></body></html>`;
}

function recordedRedirects(urls, html, status = 200) {
  const calls = [];
  return { calls, request: async (url, init) => {
    const i = calls.length;
    assert.equal(url, urls[i]); assert.equal(init.method, 'GET'); assert.equal(init.redirect, 'manual'); assert.equal(init.cache, 'no-store');
    calls.push(url);
    const response = i + 1 < urls.length ? new Response(null, { status: 301, headers: { location: urls[i + 1] } }) : htmlResponse(html, status);
    Object.defineProperty(response, 'url', { value: url });
    return response;
  } };
}

for (const fixture of redirectFixtures) test(`accepts the audit's ${fixture.family} only with fresh matching job evidence`, async () => {
  const record = redirectedJob(fixture);
  const before = structuredClone(record);
  const network = recordedRedirects(fixture.urls, redirectBody(fixture));
  await verifyEmployerApplication(record, { request: network.request, now: () => now });
  assert.deepEqual(network.calls, fixture.urls);
  assert.deepEqual(record, before, 'Redirect resolution must not overwrite the original source date or URL');
});

test('stable ATS identity never admits another job, tenant, arbitrary gh_jid host or a generic board', async () => {
  const fixture = redirectFixtures[0];
  const invalid = [
    'https://job-boards.greenhouse.io/robinhood',
    'https://job-boards.greenhouse.io/robinhood?gh_jid=8259652',
    'https://job-boards.greenhouse.io/other-company/jobs/8259652',
    'https://job-boards.greenhouse.io/robinhood/jobs/8259653',
    'https://job-boards.greenhouse.io/robinhood/jobs/8259653?gh_jid=8259652',
    'https://job-boards.greenhouse.io/robinhood/jobs/8259652?gh_jid=8259652&gh_jid=8259653',
    'https://job-boards.greenhouse.io.attacker.example.net/robinhood/jobs/8259652?gh_jid=8259652',
    'https://attacker.example.net/positions/8259652?gh_jid=8259652',
  ];
  for (const final of invalid) {
    const network = recordedRedirects([fixture.urls[0], final], redirectBody(fixture));
    await assert.rejects(verifyEmployerApplication(redirectedJob(fixture), { request: network.request, now: () => now }), /unverified/);
  }
  for (const first of ['https://attacker.example.net/jobs?gh_jid=8259652', 'https://stripe.com/unrelated?gh_jid=8259652']) {
    const network = recordedRedirects([first, fixture.urls[1]], redirectBody(fixture));
    await assert.rejects(verifyEmployerApplication({ ...redirectedJob(fixture), link: first }, { request: network.request, now: () => now }), /redirected away/);
    assert.equal(network.calls.length, 1);
  }
});

test('each redirect hop must preserve identity; returning from a different job does not repair the chain', async () => {
  const fixture = redirectFixtures[2];
  const network = recordedRedirects([fixture.urls[0], fixture.urls[0].replaceAll('8269081', '8269082'), fixture.urls[1]], redirectBody(fixture));
  await assert.rejects(verifyEmployerApplication(redirectedJob(fixture), { request: network.request, now: () => now }), /redirected away/);
});

test('redirected pages require matching employer and title even if the stable URL and application button look correct', async () => {
  const fixture = redirectFixtures[1];
  for (const changes of [{ hiringOrganization: { name: 'Another employer' } }, { title: 'Another role' }, { identifier: { value: '8265687' } }]) {
    const network = recordedRedirects(fixture.urls, redirectBody(fixture, changes));
    await assert.rejects(verifyEmployerApplication(redirectedJob(fixture), { request: network.request, now: () => now }), /unverified.*(?:match|identifier)/);
  }
  const greenhouse = redirectFixtures[0];
  for (const html of [redirectBody(greenhouse).replaceAll('Robinhood', 'Another employer'), redirectBody(greenhouse).replaceAll(greenhouse.title, 'Another role')]) {
    const network = recordedRedirects(greenhouse.urls, html);
    await assert.rejects(verifyEmployerApplication(redirectedJob(greenhouse), { request: network.request, now: () => now }), /title or company does not match/);
  }
  const privy = { ...fixture, id: '8246785', title: 'Social & Content Marketing, Stripe Crypto', urls: [
    'https://stripe.com/jobs/search?gh_jid=8246785', 'https://stripe.com/careers/search/redirect?gh_jid=8246785',
    'https://stripe.com/careers/listing/social-content-marketing-stripe-crypto/8246785?gh_jid=8246785',
  ] };
  const network = recordedRedirects(privy.urls, redirectBody(privy, { hiringOrganization: { name: 'Privy' } }));
  await assert.rejects(verifyEmployerApplication(redirectedJob(privy), { request: network.request, now: () => now }), /title or company does not match/);
  const canonical = recordedRedirects([privy.urls.at(-1)], redirectBody(privy, { hiringOrganization: { name: 'Privy' } }));
  await assert.rejects(verifyEmployerApplication({ ...redirectedJob(privy), link: privy.urls.at(-1) }, { request: canonical.request, now: () => now }), /title or company does not match/);
});

test('fresh catalog dates cannot wash old, future or invalid employer dates on a canonical redirect', async () => {
  const fixture = redirectFixtures[1];
  for (const datePosted of [new Date(now - 30 * day - 1).toISOString(), new Date(now + 1).toISOString(), 'not-a-date', '']) {
    const network = recordedRedirects(fixture.urls, redirectBody(fixture, { datePosted }));
    await assert.rejects(verifyEmployerApplication(redirectedJob(fixture), { request: network.request, now: () => now }), /Job publication blocked/);
  }
  const expired = { ...redirectedJob(fixture), date: '2024-03-09T05:33:00.298Z' };
  await assert.rejects(verifyEmployerApplication(expired, { request: async () => assert.fail('Cannot reset the original date from a redirected page'), now: () => now }), /expired/);
  const oldBreezy = { id: '99ff2f649be201', slug: 'pm84', title: 'Product Partnerships Manager', company: 'Transak', date: new Date(now - day).toISOString(), link: 'https://transak-inc.breezy.hr/p/99ff2f649be201-product-partnerships-manager' };
  await assert.rejects(verifyEmployerApplication(oldBreezy, { request: async () => htmlResponse(openHtml({ ...oldBreezy, date: '2020-09-03' })), now: () => now }), /expired/);
});

test('canonical destinations still reject closed pages, old validThrough, HTML challenges and API-only availability', async () => {
  const fixture = redirectFixtures[4];
  for (const extra of ['<h1>Position Closed</h1>', '<p>Sorry, this position is no longer accepting candidates.</p>', '<p>Sorry, this position is no&nbsp;longer accepting candidates.</p>']) {
    const network = recordedRedirects(fixture.urls, redirectBody(fixture, {}, extra));
    await assert.rejects(verifyEmployerApplication(redirectedJob(fixture), { request: network.request, now: () => now }), /closed: employer page/);
  }
  const expired = recordedRedirects(fixture.urls, redirectBody(fixture, { validThrough: new Date(now - 1).toISOString() }));
  await assert.rejects(verifyEmployerApplication(redirectedJob(fixture), { request: expired.request, now: () => now }), /expired JobPosting/);
  for (const status of [403, 404, 410, 429, 503]) {
    const network = recordedRedirects(fixture.urls, redirectBody(fixture), status);
    await assert.rejects(verifyEmployerApplication({ ...redirectedJob(fixture), atsEvidence: { verified: true } }, { request: network.request, now: () => now }),
      new RegExp(`application ${[404, 410].includes(status) ? 'closed' : 'unverified'}: HTTP ${status}`));
  }
  for (const html of ['<h1>Security checkpoint</h1>', '<div id="app"></div><script>window.job={isListed:true}</script>']) {
    const network = recordedRedirects(fixture.urls, html);
    await assert.rejects(verifyEmployerApplication({ ...redirectedJob(fixture), atsEvidence: { verified: true } }, { request: network.request, now: () => now }), /unverified/);
  }
});

test('HTTP is allowed only for a known original job upgraded to HTTPS on the same host', async () => {
  const fixture = redirectFixtures[3];
  const httpOnly = recordedRedirects([fixture.urls[0]], redirectBody(fixture));
  await assert.rejects(verifyEmployerApplication(redirectedJob(fixture), { request: httpOnly.request, now: () => now }), /HTTPS URL/);
  for (const link of ['http://careers.example.com/roles/123', 'http://block.xyz/careers?gh_jid=5445956008']) {
    await assert.rejects(verifyEmployerApplication({ ...redirectedJob(fixture), link }, { request: async () => assert.fail('Unknown HTTP source'), now: () => now }), /HTTPS URL/);
  }
  const anotherHost = 'https://job-boards.greenhouse.io/block/jobs/5445956008';
  const migrated = recordedRedirects([fixture.urls[0], anotherHost], redirectBody(fixture));
  await assert.rejects(verifyEmployerApplication(redirectedJob(fixture), { request: migrated.request, now: () => now }), /unverified/);
  assert.equal(migrated.calls.length, 1);
  const jane = 'https://www.janestreet.com/join-jane-street/apply/8877535002?gh_jid=8877535002';
  const downgrade = recordedRedirects([jane, 'http://www.janestreet.com/join-jane-street/apply/8877535002/?gh_jid=8877535002'], redirectBody(fixture));
  await assert.rejects(verifyEmployerApplication({ ...redirectedJob(fixture), link: jane }, { request: downgrade.request, now: () => now }), /HTTPS URL/);
  assert.equal(downgrade.calls.length, 1);
});

test('unsafe redirect destinations are rejected before requesting internal addresses', async () => {
  const fixture = redirectFixtures[0];
  const targets = ['https://127.1/job', 'https://2130706433/job', 'https://0x7f000001/job', 'https://[::1]/job', 'https://[::ffff:127.0.0.1]/job',
    'https://[fe80::1]/job', 'https://169.254.169.254/job', 'https://192.168.1.1/job', 'https://metadata.google.internal/job', 'https://service.local/job',
    'https://127.0.0.1.nip.io/job', 'https://job-boards.greenhouse.io:8443/robinhood/jobs/8259652', 'https://user:password@job-boards.greenhouse.io/robinhood/jobs/8259652'];
  for (const destination of targets) {
    const network = recordedRedirects([fixture.urls[0], destination], redirectBody(fixture));
    await assert.rejects(verifyEmployerApplication(redirectedJob(fixture), { request: network.request, now: () => now }), /unverified/);
    assert.equal(network.calls.length, 1, destination);
  }
});
