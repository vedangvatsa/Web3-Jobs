import assert from 'node:assert/strict';
import test from 'node:test';
import countries from '../content/nomads/countries.json';
import policies from '../content/nomads/entry-policies.json';
import { compilePassportRules } from './lib/passport-policies';
import { effectiveEntryRule, validPassportRules } from '../src/lib/nomads/entry-rules';

const on = '2026-10-07';
// Exercise the retained legacy layer in isolation; the full reviewed corpus has its own precedence tests.
const passport = (iso: string, date = on) => compilePassportRules(countries.find(country => country.iso === iso)!, countries, policies, date);
const destination = (from: string, to: string, date = on) => passport(from, date).destinations.find(country => country.iso === to)!.rule;

test('Malaysia grants Indian tourists up to 30 days, with a dated exemption and source conditions', () => {
  const rule = destination('IN', 'MY');
  assert.equal(rule.t, 'vf'); assert.equal(rule.d, 30);
  assert.equal(rule.until, '2026-12-31'); assert.match(rule.n!, /MDAC/);
  assert.equal(destination('GB', 'MY').d, 90, 'Indian conditions must not overwrite the British rule');
  assert.equal(destination('IN', 'MY', '2026-12-31').t, 'vf');
  assert.equal(destination('IN', 'MY', '2027-01-01').t, 'unknown');
  assert.equal(effectiveEntryRule(rule, passport('IN').sources, '2027-01-01').t, 'unknown', 'Client must reject an expired waiver in a cached shard');
});

test('registration validity and visit duration are distinct; Singapore has no blanket 30-day stay', () => {
  const hongKong = destination('IN', 'HK');
  assert.equal(hongKong.t, 'eta'); assert.equal(hongKong.d, 14);
  assert.match(hongKong.n!, /six-month PAR validity is not the stay limit/);
  assert.equal(destination('IN', 'SG').t, 'vr'); assert.equal(destination('IN', 'SG').d, 0);
  assert.equal(destination('GB', 'SG').t, 'vf'); assert.equal(destination('GB', 'SG').d, 0);
});

test('shared Schengen limits preserve passport-specific conditions and distinguish free movement', () => {
  const american = destination('US', 'FR');
  assert.equal(american.d, 90); assert.match(american.n!, /rolling 180-day period/);
  assert.equal(destination('IN', 'FR').t, 'vr');
  assert.equal(destination('FR', 'DE').t, 'fm'); assert.equal(destination('FR', 'DE').d, 0);
  assert.match(destination('TW', 'DE').n!, /identity card number/);
  assert.match(destination('AL', 'FR').n!, /biometric/);
  assert.equal(destination('VU', 'DE').t, 'vr');
});

test('Japan registration and passport conditions do not become generic 30-day eVisas', () => {
  assert.equal(destination('IN', 'JP').t, 'vr'); assert.equal(destination('IN', 'JP').d, 0);
  assert.equal(destination('ID', 'JP').t, 'eta'); assert.equal(destination('ID', 'JP').d, 15);
  assert.equal(destination('QA', 'JP').d, 30);
  assert.equal(destination('GB', 'JP').d, 90); assert.match(destination('GB', 'JP').n!, /extension/);
  assert.match(destination('UY', 'JP').n!, /does not recognise/);
});

test('UK ETA travel validity is not a two-year stay, and current visa-list changes are retained', () => {
  const american = destination('US', 'GB');
  assert.equal(american.t, 'eta'); assert.equal(american.d, 0);
  assert.equal(american.stay, 'Up to 6 months per visit');
  assert.match(american.n!, /Two-year ETA validity is not permission/);
  assert.equal(destination('LC', 'GB').t, 'vr'); assert.equal(destination('NI', 'GB').t, 'vr');
  assert.equal(destination('IE', 'GB').t, 'fm'); assert.equal(destination('GB', 'IE').t, 'fm');
  assert.match(destination('TW', 'GB').n!, /identity card number/);
});

test('legacy Sri Lankan fee waivers do not remove the prior-ETA requirement or reset the stay on second entry', () => {
  assert.equal(destination('IN', 'LK').t, 'eta'); assert.equal(destination('IN', 'LK').d, 30);
  assert.equal(destination('SG', 'LK').t, 'eta');
  assert.equal(destination('MV', 'LK').d, 90);
  assert.match(destination('IN', 'LK').n!, /remaining balance/);
});

test('all 39,402 routes preserve coverage without manufacturing unverified eligibility or days', () => {
  let count = 0;
  for (const country of countries) {
    const data = passport(country.iso!);
    assert.ok(validPassportRules(data)); assert.equal(data.destinations.length, countries.length - 1);
    for (const { rule } of data.destinations) {
      count++;
      if (rule.t === 'unknown') assert.equal(rule.d, 0);
      else { assert.ok(rule.s && data.sources[rule.s]); assert.ok(rule.n); }
    }
  }
  assert.equal(count, 39402);
  const unreviewed = compilePassportRules(countries.find(country => country.iso === 'IN')!, countries, { ...policies, policies: [] }, on);
  assert.ok(unreviewed.destinations.every(destination => destination.rule.t === 'unknown' && destination.rule.d === 0), 'Never fall back to the imported generic eVisa/30-days claims when evidence is absent');
  assert.equal(validPassportRules({ passport: 'India', destinations: [{ name: 'Malaysia', iso: 'MY', rule: { t: 'vf', d: 90 } }] }), false, 'Reject old cached catalogs');
});

test('conflicting policies and invalid or missing evidence fail the data build', () => {
  const malaysia = policies.policies.find(policy => policy.s === 'india-malaysia')!;
  const india = countries.find(country => country.iso === 'IN')!;
  assert.throws(() => compilePassportRules(india, countries, { ...policies, policies: [...policies.policies, malaysia] }, on), /Conflicting/);
  assert.throws(() => compilePassportRules(india, countries, { ...policies, sources: {} }, on), /Invalid/);
  const data = passport('IN');
  const bad = { ...data, destinations: [{ name: 'Test', iso: 'MY', rule: { t: '__proto__', d: 0 } }] };
  assert.equal(validPassportRules(bad), false);
  data.destinations[0].rule.d = -1;
  assert.equal(validPassportRules(data), false);
});
