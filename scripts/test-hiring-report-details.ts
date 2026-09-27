import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { experienceRequirements, remoteArrangement } from './lib/hiring-report-details';
import { loadHiringReportInput } from './lib/hiring-report-input';
import { keywordRules, percentage } from './lib/hiring-report-analysis';
import stats from '../content/hiring-report-stats.json';

type AuditRecord = {
  company: string; url: string; function: string; keywords: string[];
  experience: ReturnType<typeof experienceRequirements>;
  arrangement: ReturnType<typeof remoteArrangement>;
};

test('extracts role experience ranges separately from years using a specific tool', () => {
  const result = experienceRequirements('Requirements\n5+ years of software engineering experience, including React and TypeScript.\n2+ years of Python experience.');
  assert.equal(result.label, '3–5 years');
  assert.equal(result.lowerYears, 5);
  assert.equal(result.evidence[1].scope, 'specific skill');
  assert.equal(experienceRequirements('3 to 5 years of experience as a graphic or brand designer').lowerYears, 3);
  assert.equal(experienceRequirements('Three years of professional experience.').lowerYears, 3);
  assert.equal(experienceRequirements('5 - 10 years of hands-on experience securing AWS and cloud-native infrastructure.').lowerYears, null);
  assert.equal(experienceRequirements('3+ years of hands-on experience architecting CI/CD pipelines using GitHub Actions.').evidence[0].scope, 'specific skill');
});

test('preferred, missing and company-history experience do not become required years', () => {
  for (const text of [
    'We have 10 years of experience in software development.',
    'You will use Python and SQL.',
    'Preferred qualifications\n5 years of software engineering experience.',
    '5 years of software development experience is preferred.',
    '5 years of Python experience.',
  ]) assert.equal(experienceRequirements(text).lowerYears, null, text);
});

test('multiple and degree-dependent experience requirements stay ambiguous', () => {
  for (const text of [
    'Requirements\n5 years of professional experience.\n3 years of management experience.',
    "Requirements\nBachelor's degree and 5 years of professional experience or a master's degree and 3 years of professional experience.",
    'Requirements\nUp to 5 years of professional experience.',
  ]) assert.equal(experienceRequirements(text).label, 'Multiple or conditional requirements', text);
});

test('worldwide remote wording excludes temporary benefits and company descriptions', () => {
  assert.equal(remoteArrangement('Remote work from anywhere in the world.').label, 'Worldwide remote wording');
  for (const text of [
    'Work from Anywhere Policy: work remotely from anywhere in the world for up to 20 days per year.',
    'We are a fully remote team with members worldwide.',
    'Generous work from anywhere benefits.',
    "This isn't a work-from-anywhere-on-Earth kind of remote.",
    'Our team is fully remote and async-first.',
  ]) assert.equal(remoteArrangement(text).label, 'No clear arrangement matched', text);
});

test('remote geography and time-zone wording remains restricted', () => {
  for (const text of [
    'Location: Remote (US-based, PST preferred)',
    'Position is 100% remote; must reside in U.S.; reports to HQ in New York.',
    'This role is fully remote and open to candidates based in the US, UK and Canada.',
    'Work from anywhere in Canada, with optional offices in Montreal and Toronto.',
    'Remote work from anywhere in the world, with a schedule aligned with GMT+3.',
    'Remote work from anywhere in the world, schedule based on GMT+3',
  ]) assert.equal(remoteArrangement(text).label, 'Remote with location / time-zone conditions', text);
  assert.equal(remoteArrangement('Remote, work with us to build something.').label, 'No clear arrangement matched');
  assert.equal(remoteArrangement('Location: Remote (EU-based preferred)').label, 'No clear arrangement matched');
  assert.equal(remoteArrangement('For employees hired to work remotely from New York, we disclose a salary range of $100k-$150k.').label, 'No clear arrangement matched');
  assert.equal(remoteArrangement('Our workforce is fully remote, and your personal working hours can be based on your own timezone. All team-wide meetings are scheduled to be inclusive of all North American time zones.').label, 'No clear arrangement matched');
});

test('hybrid role combinations and technical systems are not hybrid work arrangements', () => {
  assert.equal(remoteArrangement('Hybrid working model: 3 days in-office, 2 days WFH.').label, 'Hybrid / scheduled office attendance');
  assert.equal(remoteArrangement('This is a hybrid trading and engineering role.').label, 'No clear arrangement matched');
  assert.equal(remoteArrangement('A hybrid role combining pre-sales with customer success.').label, 'No clear arrangement matched');
  assert.equal(remoteArrangement('Build hybrid networking infrastructure.').label, 'No clear arrangement matched');
});

test('conflicting or location-dependent arrangements remain conditional', () => {
  for (const text of [
    'Remote work from anywhere in the world.\nCandidates must reside in the United States.',
    'Hybrid working model in New York.\nIn Singapore, employees are expected to work on-site five days per week.',
    'Hybrid working schedule: work fully remotely or from your nearest office.',
    'We offer a hybrid work approach. Expectations may vary by location and role.',
    'Sydney-based employees enjoy hybrid 3 days a week in our head office, while remote team members can work from home.',
    'Remote work from anywhere in the world.\nCandidates must reside in the US, with a schedule aligned with GMT+3.',
  ]) assert.equal(remoteArrangement(text).label, 'Conditional or conflicting arrangements', text);
});

test('new report tables reconcile to per-listing evidence and their stated denominators', () => {
  const audit = JSON.parse(readFileSync('content/hiring-report-analysis-evidence.json', 'utf8')) as { generatedAt: string; records: AuditRecord[] };
  assert.deepEqual(audit, JSON.parse(readFileSync('public/data/hiring-report-analysis-evidence.json', 'utf8')));
  assert.equal(audit.generatedAt, stats.generatedAt);
  assert.equal(audit.records.length, stats.listings);
  const { records, inputSha256 } = loadHiringReportInput();
  assert.deepEqual(stats.inputSha256, inputSha256);
  const inputByUrl = new Map(records.map(({ job, text }) => [`https://hashtagweb3.com/${job.slug}`, text]));
  for (const row of audit.records) {
    const source = inputByUrl.get(row.url);
    assert.ok(source, row.url);
    for (const item of [...row.experience.evidence, ...row.arrangement.evidence]) assert.ok(source.includes(item.excerpt), row.url);
    assert.deepEqual(row.keywords, keywordRules.filter(([, pattern]) => pattern.test(source)).map(([label]) => label));
  }
  for (const group of stats.skillsByFunction) {
    const cohort = audit.records.filter(row => row.function === group.label);
    assert.equal(group.n, cohort.length);
    for (const skill of group.skills) {
      assert.equal(skill.count, cohort.filter(row => row.keywords.includes(skill.label)).length);
      assert.equal(skill.pct, percentage(skill.count, group.n));
    }
  }
  for (const [field, rows] of [['experience', stats.experience.rows], ['arrangement', stats.workArrangements]] as const) {
    assert.equal(rows.reduce((sum: number, row: { count: number }) => sum + row.count, 0), stats.listings);
    for (const row of rows) {
      assert.equal(row.count, audit.records.filter(record => record[field].label === row.label).length);
      assert.equal(row.pct, percentage(row.count, stats.listings));
    }
  }
  assert.equal(stats.experience.matched.count, audit.records.filter(row => row.experience.lowerYears !== null).length);
  assert.equal(stats.experience.specificSkillYears.count, audit.records.filter(row => row.experience.evidence.some(item => item.request === 'required' && item.scope === 'specific skill')).length);
  const topNames = new Set(stats.topCompanies.map(row => row.label));
  const topCount = audit.records.filter(row => topNames.has(row.company)).length;
  assert.equal(stats.employerComparison.top.n, topCount);
  assert.equal(stats.employerComparison.other.n, stats.listings - topCount);
  for (const row of stats.employerComparison.rows) {
    assert.equal(row.top.pct, percentage(row.top.count, topCount));
    assert.equal(row.other.pct, percentage(row.other.count, stats.listings - topCount));
    assert.equal(row.differencePp, Math.round((row.top.pct - row.other.pct) * 10) / 10);
  }
});
