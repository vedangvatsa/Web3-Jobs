import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import {
  applyTitleTemplate,
  isTitleLengthCompliant,
  seoSocialTitle,
  SEO_TITLE_MAX,
  seoTitleSegment,
} from '../src/lib/seo-title';
import { getFreshJobCountLabel } from '../src/lib/seo-freshness';
import grants from '../content/grants/grants.json';
import events from '../content/events-runtime.json';

const STATIC_SEGMENTS = [
  'Web3 Events Calendar 2026',
  'Top Web3 Companies Hiring',
  'Top 100 Web3 Employers',
  'Contact Us',
  'Developer Portal & API',
  'Grants & Credits 2026',
  `Remote Web3 Jobs (${getFreshJobCountLabel()})`,
  `Remote Web3 Jobs & Crypto Careers (${getFreshJobCountLabel()})`,
  'Citizenship by investment',
  'Visas for Digital Nomads',
  'Web3 Glossary',
  'Learn Web3',
  'Startup Societies',
  'Web3 Community',
  'Career Tools',
  'Privacy Policy',
  'About Us',
];

function assertCompliant(label: string, segment: string): void {
  const rendered = applyTitleTemplate(segment);
  assert.ok(
    isTitleLengthCompliant(rendered),
    `${label}: "${rendered}" is ${rendered.length} chars (max ${SEO_TITLE_MAX})`,
  );
  assert.ok(rendered.includes('Hashtag Web3'), `${label}: missing brand suffix`);
  assert.equal(rendered.split(' | Hashtag Web3').length - 1, 1, `${label}: duplicate brand suffix in "${rendered}"`);
}

for (const segment of STATIC_SEGMENTS) {
  assertCompliant(`static:${segment}`, segment);
}

let grantWorst = '';
let grantWorstLen = 0;
for (const grant of grants) {
  assertCompliant(`grant:${grant.id}`, grant.name);
  const len = applyTitleTemplate(grant.name).length;
  if (len > grantWorstLen) {
    grantWorstLen = len;
    grantWorst = grant.name;
  }
}

let eventWorst = '';
let eventWorstLen = 0;
for (const event of events) {
  const name = typeof event.name === 'string' ? event.name : '';
  if (!name) continue;
  assertCompliant(`event:${event.id}`, name);
  const len = applyTitleTemplate(name).length;
  if (len > eventWorstLen) {
    eventWorstLen = len;
    eventWorst = name;
  }
}

assert.ok(
  !fs.readFileSync('src/app/events/page.tsx', 'utf8').includes(
    'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
  ),
  'events listing page must not stack keywords before the layout brand suffix',
);

assert.equal(seoSocialTitle('Learn Web3'), applyTitleTemplate('Learn Web3'));
assert.ok(seoTitleSegment('Privacy Policy | Hashtag Web3') === 'Privacy Policy');

execSync('npx tsx scripts/audit-seo-titles.ts', { stdio: 'inherit', cwd: process.cwd() });

console.log(
  `SEO title checks passed: ${STATIC_SEGMENTS.length} static segments, ${grants.length} grants, ${events.length} events (longest grant "${grantWorst}" ${grantWorstLen}c, longest event "${eventWorst}" ${eventWorstLen}c).`,
);