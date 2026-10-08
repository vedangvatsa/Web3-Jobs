import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import countries from '../content/nomads/countries.json';
import policies from '../content/nomads/entry-policies.json';
import { parsePassportIndexHtml, validatePassportIndexSnapshot, type PassportIndexSnapshot } from './lib/passport-index';
import { compilePassportRules } from './lib/passport-policies';
import { matchesEntryCategory, validPassportRules } from '../src/lib/nomads/entry-rules';
import type { Factchecks } from './lib/passport-factchecks';
const audit = JSON.parse(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8')) as Factchecks;

const codes = ['IN', 'MY', 'AM', 'KH', 'NP', 'AU'];
const row = (iso: string, label: string, days = '', group = 'vr') => `<tr class="show-tr ${group}"><td><span class="flag-icon flag-icon-${iso.toLowerCase()}"></span></td><td><span class="vrules">${label}</span>${days ? `<span class="vdays">${days}</span>` : ''}<a href="https://link.passportindex.org/">Apply now</a></td></tr>`;
const rows = [row('MY', 'Digital Arrival Card', '90', 'vf'), row('AM', 'eVisa', '120', 'voa'), row('KH', 'eVisa · visa on arrival', '30', 'voa'), row('NP', 'visa-free', '', 'vf'), row('AU', 'eVisa')];
const html = (values = rows) => `<html><head><link rel="canonical" href="https://www.passportindex.org/passport/india/"></head><body><div id="psprt-dashboard"><h1><span class="flag-icon flag-icon-in"></span>India</h1></div><table id="psprt-dashboard-table"><tbody>${values.join('')}</tbody></table></body></html>`;
const fetchedAt = '2026-10-07T17:04:12Z';

test('parse visible entry labels rather than mobility-score CSS classes, preserving absent durations', () => {
  const parsed = parsePassportIndexHtml(html(), codes, fetchedAt, 'IN');
  assert.equal(parsed.page.rules.AM.t, 'ev', 'Armenia eVisa must not become VOA because of source scoring classes');
  assert.equal(parsed.page.rules.AM.d, 120);
  assert.equal(parsed.page.rules.AU.d, 0); assert.equal(parsed.page.rules.NP.d, 0);
  assert.equal(parsed.page.rules.MY.label, 'Digital Arrival Card');
  assert.equal(parsed.page.rules.MY.d, 90, 'Preserve the source claim for audit; official correction is applied later');
  assert.match(parsed.page.rules.MY.n!, /not a visa/);
  assert.ok(matchesEntryCategory(parsed.page.rules.KH, 'ev'));
  assert.ok(matchesEntryCategory(parsed.page.rules.KH, 'voa'));
  assert.doesNotMatch(JSON.stringify(parsed.page), /link\.passportindex|Apply now/);
});

test('incomplete, duplicate, challenged, mismatched and unrecognised pages fail closed', () => {
  assert.throws(() => parsePassportIndexHtml('<title>Just a moment...</title>', codes, fetchedAt), /dashboard/);
  assert.throws(() => parsePassportIndexHtml(html(), codes, fetchedAt, 'US'), /mismatched/);
  assert.throws(() => parsePassportIndexHtml(html(rows.slice(1)), codes, fetchedAt), /Incomplete/);
  assert.throws(() => parsePassportIndexHtml(html([...rows, rows[0]]), codes, fetchedAt), /duplicate/);
  assert.throws(() => parsePassportIndexHtml(html([row('MY', 'Unclear status'), ...rows.slice(1)]), codes, fetchedAt), /Unrecognised/);
  assert.throws(() => parsePassportIndexHtml(html([row('MY', 'visa-free', '90 or 180'), ...rows.slice(1)]), codes, fetchedAt), /stay period/);
});

test('worldwide labels retain permits, registrations, fee-free visas and arrival processes', () => {
  for (const [label, category] of [
    ['visa-free (EASE)', 'vf'], ['visa on arrival (EASE)', 'voa'],
    ['eVisitors', 'ev'], ['eVisa (fast track)', 'ev'],
    ['tourist card', 'eta'], ['visa waiver registration', 'eta'],
    ['Exit-entry Permit', 'vr'], ['not admitted', 'na'], ['Trump ban', 'na'],
    ['eVisa on arrival', 'voa'], ['eVisa · free visa on arrival', 'voa'],
  ]) {
    const rule = parsePassportIndexHtml(html([row('MY', label), ...rows.slice(1)]), codes, fetchedAt, 'IN').page.rules.MY;
    assert.equal(rule.t, category, label); assert.equal(rule.label, label); assert.equal(rule.d, 0);
    if (label === 'eVisa · free visa on arrival') assert.deepEqual(rule.a, ['ev', 'voa']);
    if (label === 'eVisa on arrival') assert.equal(rule.a, undefined, 'One combined process is not two independent entry options');
  }
});

test('all 199 passports have 198 accounted destinations, with reviewed government precedence across the whole matrix', () => {
  const reference = JSON.parse(fs.readFileSync('content/nomads/passport-index.json', 'utf8')) as PassportIndexSnapshot;
  const allCodes = countries.map(country => country.iso!);
  validatePassportIndexSnapshot(reference, allCodes);
  assert.equal(Object.keys(reference.passports).length, 199);
  const asOf = '2026-10-08';
  let routes = 0, checked = 0, historical = 0, unresolved = 0;
  for (const passport of countries) {
    const result = compilePassportRules(passport, countries, policies, asOf, reference, audit);
    assert.ok(validPassportRules(result), passport.name);
    assert.equal(result.destinations.length, 198, passport.name);
    assert.equal(result.destinations.some(destination => destination.iso === passport.iso), false);
    for (const destination of result.destinations) {
      routes++;
      if (destination.review === 'checked') checked++; else if (destination.review === 'historical') historical++; else unresolved++;
      const source = result.sources[destination.rule.s!];
      assert.ok(source, `${passport.iso}/${destination.iso} provenance`);
      if (source.kind === 'reference') { assert.equal(destination.review, 'unresolved'); assert.deepEqual(destination.rule, { ...reference.passports[passport.iso!].rules[destination.iso!], s: 'passport-index' }); }
    }
  }
  assert.equal(routes, 39402); assert.equal(checked, 29761); assert.equal(historical, 346); assert.equal(unresolved, 9295);
  assert.equal(reference.passports.DE.rules.AU.t, 'ev', 'Australian eVisitor is not visa on arrival');
  assert.equal(reference.passports.US.rules.BR.t, 'ev');
  assert.equal(reference.passports.US.rules.BR.d, 0, 'No invented Brazilian eVisa stay');
  assert.deepEqual(reference.passports.CN.rules.KH.a, ['ev', 'voa']);
});

test('empty and partially populated world snapshots cannot replace the complete matrix', () => {
  const reference = JSON.parse(fs.readFileSync('content/nomads/passport-index.json', 'utf8')) as PassportIndexSnapshot;
  const allCodes = countries.map(country => country.iso!);
  assert.throws(() => validatePassportIndexSnapshot({ version: 1, passports: {} }, allCodes), /passport coverage/);
  const missingPassport = structuredClone(reference); delete missingPassport.passports.US;
  assert.throws(() => validatePassportIndexSnapshot(missingPassport, allCodes), /passport coverage/);
  const missingDestination = structuredClone(reference); delete missingDestination.passports.US.rules.CA;
  assert.throws(() => validatePassportIndexSnapshot(missingDestination, allCodes), /Incomplete.*US/);
});

test('legacy-only compilation retains the India snapshot and distinguishes reference from government evidence', () => {
  const reference = JSON.parse(fs.readFileSync('content/nomads/passport-index.json', 'utf8')) as PassportIndexSnapshot;
  const india = countries.find(country => country.iso === 'IN')!;
  assert.equal(Object.keys(reference.passports.IN.rules).length, 198);
  const result = compilePassportRules(india, countries, policies, '2026-10-07', reference);
  assert.ok(validPassportRules(result)); assert.equal(result.version, 4);
  assert.equal(result.destinations.length, 198);
  assert.equal(result.destinations.filter(item => item.rule.t === 'unknown').length, 0);
  const malaysia = result.destinations.find(item => item.iso === 'MY')!.rule;
  assert.equal(malaysia.d, 30); assert.equal(malaysia.t, 'vf');
  assert.equal(result.sources[malaysia.s!].kind, 'government');
  const australia = result.destinations.find(item => item.iso === 'AU')!.rule;
  assert.equal(australia.t, 'ev'); assert.equal(australia.d, 0);
  assert.equal(result.sources[australia.s!].kind, 'reference');
  assert.equal(result.sources[australia.s!].urls[0], 'https://www.passportindex.org/passport/india/');
  assert.equal(result.destinations.find(item => item.iso === 'NP')!.rule.d, 0);
  const expired = compilePassportRules(india, countries, policies, '2027-01-01', reference);
  assert.equal(expired.destinations.find(item => item.iso === 'MY')!.rule.t, 'unknown', 'An expired official waiver must not fall back to the conflicting 90-day reference');
  assert.equal(validPassportRules({ ...result, version: 3 }), false, 'Reject cached catalogs without route-level official review status');
  assert.equal(validPassportRules({ ...result, version: 2 }), false, 'Older clients must not mislabel reference evidence as official');
  assert.equal(validPassportRules({ ...result, sources: { ...result.sources, 'passport-index': { ...result.sources['passport-index'], kind: undefined } } }), false);
});
