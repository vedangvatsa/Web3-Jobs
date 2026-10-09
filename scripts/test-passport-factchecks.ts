import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createHash } from 'node:crypto';
import countries from '../content/nomads/countries.json';
import legacy from '../content/nomads/entry-policies.json';
import { compilePassportRules } from './lib/passport-policies';
import { factcheckCounts, mergeCandidates, publicUrls, validateFactchecks, type Candidate, type Factchecks } from './lib/passport-factchecks';
import type { PassportIndexSnapshot } from './lib/passport-index';
import { effectiveEntryRule, validPassportRules } from '../src/lib/nomads/entry-rules';

const audit = JSON.parse(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8')) as Factchecks;
const reference = JSON.parse(fs.readFileSync('content/nomads/passport-index.json', 'utf8')) as PassportIndexSnapshot;
const compile = (from: string, date = '2026-10-08', file = audit) => compilePassportRules(countries.find(country => country.iso === from)!, countries, legacy, date, reference, file);
const route = (from: string, to: string, date?: string) => compile(from, date).destinations.find(item => item.iso === to)!;

test('complete official audit partitions all 39,402 routes and preserves the original 199 snapshots', () => {
  validateFactchecks(audit, countries.map(country => country.iso!));
  assert.deepEqual(factcheckCounts(audit), { destinations: 199, routes: 39402, checked: 33620, historical: 983, unresolved: 4799, withdrawals: 188 });
  assert.equal(createHash('sha256').update(fs.readFileSync('content/nomads/passport-index.json')).digest('hex'), 'cfbba9ffc469e7f80b9140aa36a1371aabdb2260499b3108771c4684afbb3f6e');
  assert.equal(reference.version, 1);
  let retainedLegacy = 0, retainedReference = 0;
  const reviewed = new Map(audit.policies.flatMap(({ passports, destinations, ...rule }) => passports.flatMap(from => destinations.map(to => [`${from}/${to}`, rule] as const))));
  for (const passport of countries) {
    const data = compile(passport.iso!);
    assert.ok(validPassportRules(data));
    assert.deepEqual(JSON.parse(fs.readFileSync(`public/data/nomads/passports/${passport.id}.json`, 'utf8')), compile(passport.iso!, new Date().toISOString().slice(0, 10)));
    for (const item of data.destinations) {
      const rule = reviewed.get(`${passport.iso}/${item.iso}`);
      if (rule) assert.deepEqual(item.rule, rule, `Lossless policy expansion ${passport.iso}/${item.iso}`);
      else {
        assert.equal(item.review, 'unresolved');
         const withdrawal = audit.withdrawals.find(record => record.passport === passport.iso && record.destination === item.iso);
         if (withdrawal) {
           assert.equal(item.rule.t, 'unknown'); assert.deepEqual(item.rule.evidence, withdrawal.sources); assert.equal(item.rule.n, withdrawal.reason);
           continue;
         }
         const old = legacy.policies.find(policy => policy.passports.includes(passport.iso!) && policy.destinations.includes(item.iso!));
        if (old) { const { passports, destinations, ...expected } = old; assert.deepEqual(item.rule, expected); retainedLegacy++; }
        else { assert.deepEqual(item.rule, { ...reference.passports[passport.iso!].rules[item.iso!], s: 'passport-index' }); retainedReference++; }
      }
    }
  }
  assert.equal(retainedLegacy, 3); assert.equal(retainedReference, 4791);
});

test('explicit withdrawals without replacements block both old government rules and references, retaining all evidence', () => {
  const withdrawal = audit.withdrawals[0];
  const withoutReplacement = { ...audit, policies: audit.policies.map(policy => policy.destinations.includes(withdrawal.destination) ? { ...policy, passports: policy.passports.filter(from => from !== withdrawal.passport) } : policy) };
  const data = compile(withdrawal.passport, undefined, withoutReplacement);
  const item = data.destinations.find(item => item.iso === withdrawal.destination)!;
  assert.equal(item.review, 'unresolved'); assert.equal(item.rule.t, 'unknown'); assert.equal(item.rule.d, 0);
  assert.equal(item.rule.n, withdrawal.reason); assert.deepEqual(item.rule.evidence, withdrawal.sources);
  for (const source of withdrawal.sources) assert.ok(data.sources[source]);
  assert.deepEqual(effectiveEntryRule(item.rule, data.sources), item.rule);
  assert.notEqual(route(withdrawal.passport, withdrawal.destination).rule.t, 'unknown', 'A reviewed replacement takes precedence over withdrawal');
});

test('dated archives retain exact source dates, titles and capture URLs instead of claiming current checks', () => {
  const data = compile('FR'), item = data.destinations.find(item => item.iso === 'IN')!;
  assert.equal(item.review, 'historical');
  const source = data.sources[item.rule.s!];
  assert.equal(source.checkedAt, '2026-09-10'); assert.equal(source.historical, true);
  assert.match(source.title, /2026-09-10/);
  assert.ok(source.urls.includes('https://web.archive.org/web/20260910181755/https://indianvisaonline.gov.in/evisa/tvoa.html'));
  assert.equal(route('US', 'PK').review, 'historical');
  assert.equal(compile('US').sources[route('US', 'PK').rule.s!].checkedAt, '2026-08-06');
  assert.ok(Object.values(audit.sources).filter(source => source.urls.some(url => url.includes('web.archive.org/web/'))).every(source => source.historical));
  assert.equal(route('CF', 'CG').review, 'historical', 'Historical signed document reproductions need not be hosted on Wayback');
  assert.equal(route('TW', 'SY').review, 'historical', 'A live page can explicitly describe historical-only evidence');
  const mislabelledArchive = structuredClone(data);
  mislabelledArchive.destinations.find(destination => destination.iso === 'IN')!.review = 'checked';
  assert.equal(validPassportRules(mislabelledArchive), false, 'Historical evidence cannot be labelled a current check');
  const mislabelledReference = compile('IN');
  mislabelledReference.destinations.find(destination => mislabelledReference.sources[destination.rule.s!]?.kind === 'reference')!.review = 'checked';
  assert.equal(validPassportRules(mislabelledReference), false, 'A secondary reference cannot be labelled a government check');
  assert.doesNotMatch(JSON.stringify(audit), /ninja_table_public_nonce|[?&](?:token|nonce)=/i);
});

test('reviewed worldwide corrections retain precise periods, methods, conditions and temporary expiry', () => {
  const georgia = route('US', 'GE').rule;
  assert.equal(georgia.t, 'vf'); assert.equal(georgia.d, 0); assert.equal(georgia.stay, '1 year');
  assert.equal(route('US', 'TH').rule.d, 30); assert.equal(route('RU', 'TH').rule.d, 30);
  const cambodia = route('CN', 'KH').rule;
  assert.equal(cambodia.t, 'vf'); assert.equal(cambodia.d, 14); assert.equal(cambodia.until, '2026-10-15');
  assert.equal(route('CN', 'KH', '2026-10-16').rule.t, 'unknown');
  const malaysia = route('IN', 'MY').rule;
  assert.equal(malaysia.d, 30); assert.equal(malaysia.until, '2026-12-31'); assert.match(malaysia.n!, /MDAC/);
  const expired = route('IN', 'MY', '2027-01-01');
  assert.equal(expired.rule.t, 'unknown'); assert.equal(expired.review, 'unresolved'); assert.ok(expired.rule.s); assert.match(expired.rule.n!, /ended 2026-12-31/);
  const palau = route('NG', 'PW').rule;
  assert.equal(palau.t, 'vr'); assert.equal(palau.d, 0); assert.match(palau.n!, /pre-clearance/); assert.match(palau.stay!, /maximum 30 days/);
  for (const from of ['US', 'FM', 'MH']) assert.equal(route(from, 'PW').rule.t, 'vf', 'Visitor exemption is not free movement');
  assert.equal(route('HK', 'LK').rule.t, 'eta'); assert.equal(route('HK', 'LK').rule.d, 30); assert.equal(route('HK', 'LK').rule.a, undefined, 'Prior ETA and arrival stamp are sequential');
  const generic = route('AF', 'FR').rule;
  assert.equal(generic.t, 'vr'); assert.equal(generic.d, 0); assert.match(generic.n!, /does not by itself establish an eVisa/);
  const variable = route('FR', 'IN').rule;
  assert.equal(variable.d, 0); assert.ok(variable.stay); assert.deepEqual(variable.a, ['ev', 'vr']);
  assert.equal(validPassportRules({ ...compile('US'), version: 3 }), false);
});

const fixture = (): Candidate => ({ version: 1, group: 'example', sources: { official: { title: 'Official table', checkedAt: '2026-10-07', urls: ['https://example.gov/visas'] } }, policies: [{ passports: ['US'], destinations: ['MY'], t: 'vf', d: 30, s: 'official' }], reviews: [{ destination: 'MY', status: 'partial', unresolvedPassports: ['IN'], findings: ['IN could not be established.'], attemptedUrls: ['https://example.gov/visas'] }], withdrawals: [] });
test('import validation rejects gaps, overlaps, invalid sources, dates, stays and unsupported withdrawals', () => {
  const codes = ['US', 'IN', 'MY'];
  validateFactchecks(fixture(), codes, ['MY']);
  const mutations: Array<(file: Candidate) => void> = [
    file => { file.reviews = []; },
    file => { file.reviews.push(file.reviews[0]); },
    file => { file.reviews[0].unresolvedPassports = []; },
    file => { file.reviews[0].unresolvedPassports.push('US'); },
    file => { file.policies.push(file.policies[0]); },
    file => { file.policies[0].passports = ['MY']; },
    file => { file.policies[0].passports = ['XX']; },
    file => { file.policies[0].s = 'missing'; },
    file => { file.policies[0].d = -1; },
    file => { file.policies[0].stay = '1 month'; },
    file => { file.policies[0].until = '2026-02-30'; },
    file => { file.sources.official.checkedAt = '2026-02-30'; },
    file => { file.sources.official.urls = ['https://user:secret@example.gov/']; },
    file => { file.sources.unused = { ...file.sources.official, historical: 'yes' as unknown as boolean }; },
    file => { file.policies[0].evidence = ['missing-evidence']; },
    file => { file.policies[0].a = ['ev']; },
    file => { file.withdrawals = [{ passport: 'IN', destination: 'MY', reason: 'Contradicted claim', sources: [] }]; },
  ];
  for (const mutate of mutations) { const data = fixture(); mutate(data); assert.throws(() => validateFactchecks(data, codes, ['MY'])); }
  assert.throws(() => mergeCandidates([fixture(), fixture()], { example: 'MY' }, codes));
  assert.deepEqual(publicUrls(['https://example.gov/visas', 'https://example.gov/api?public_nonce=123']), ['https://example.gov/visas']);
  assert.throws(() => publicUrls(['https://example.gov/api?token=123']));
});
