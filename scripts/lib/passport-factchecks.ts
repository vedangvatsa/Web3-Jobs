import assert from 'node:assert/strict';
import { validDate, validPassportRules } from '../../src/lib/nomads/entry-rules';
import { safeExternalUrl, type EntryRule, type EntrySource } from '../../src/lib/nomads/types';

export type ReviewedPolicy = EntryRule & { passports: string[]; destinations: string[] };
export type DestinationReview = { destination: string; status: 'complete' | 'partial' | 'blocked'; unresolvedPassports: string[]; findings: string[]; attemptedUrls: string[] };
export type Withdrawal = { passport: string; destination: string; reason: string; sources: string[] };
export type Factchecks = { version: 1; sources: Record<string, Omit<EntrySource, 'kind'>>; policies: ReviewedPolicy[]; reviews: DestinationReview[]; withdrawals: Withdrawal[] };
export type Candidate = Factchecks & { group: string };

const ephemeral = (url: string) => /[?&][^=]*(?:nonce|token|signature|session)[^=]*=/i.test(url);
export function publicUrls(urls: string[]): string[] {
  const stable = urls.filter(url => !ephemeral(url));
  assert.ok(stable.length || !urls.length, 'Ephemeral citations need a stable official landing URL');
  return stable;
}

export function validateFactchecks(file: Factchecks, codes: string[], destinations = codes): void {
  assert.equal(file.version, 1);
  const uniqueCodes = (values: string[], allowed: string[]) => Array.isArray(values) && new Set(values).size === values.length && values.every(code => allowed.includes(code));
  assert.ok(uniqueCodes(destinations, codes));
  for (const [id, source] of Object.entries(file.sources)) {
    assert.match(id, /^[a-z0-9][a-z0-9-]*$/i);
    assert.ok(source.title?.trim() && validDate(source.checkedAt), `Invalid source ${id}`);
    assert.ok(source.checkedAt <= new Date().toISOString().slice(0, 10), `Future source ${id}`);
    assert.ok(source.urls.length && source.urls.every(url => safeExternalUrl(url)), `Invalid URLs ${id}`);
    assert.ok(!source.sha256 || /^[a-f0-9]{64}$/.test(source.sha256), `Invalid hash ${id}`);
  }
  const routes = new Set<string>();
  const sources = Object.fromEntries(Object.entries(file.sources).map(([id, source]) => [id, { ...source, kind: 'government' }]));
  for (const { passports, destinations: targets, ...rule } of file.policies) {
    assert.ok(passports.length && targets.length && uniqueCodes(passports, codes) && uniqueCodes(targets, destinations), 'Invalid policy codes');
    assert.ok(rule.t !== 'unknown', 'A policy needs a supported rule');
    assert.ok(validPassportRules({ version: 4, passport: 'validation', scope: '', sources, destinations: [{ name: 'validation', iso: targets[0], review: file.sources[rule.s!]?.historical ? 'historical' : 'checked', rule }] }), `Invalid policy ${rule.s}`);
    for (const from of passports) for (const to of targets) {
      const key = `${from}/${to}`;
      assert.notEqual(from, to, `Self route ${key}`);
      assert.ok(!routes.has(key), `Conflicting policy ${key}`); routes.add(key);
    }
  }
  assert.equal(file.reviews.length, destinations.length, 'Missing destination reviews');
  assert.ok(uniqueCodes(file.reviews.map(review => review.destination), destinations), 'Duplicate destination review');
  for (const review of file.reviews) {
    assert.ok(uniqueCodes(review.unresolvedPassports, codes.filter(code => code !== review.destination)), 'Invalid unresolved passports');
    assert.ok(review.findings.length && review.findings.every(text => typeof text === 'string' && text.trim()));
    assert.ok(review.attemptedUrls.every(url => safeExternalUrl(url)), 'Invalid attempted URL');
    for (const from of codes.filter(code => code !== review.destination)) assert.notEqual(routes.has(`${from}/${review.destination}`), review.unresolvedPassports.includes(from), `Partition error ${from}/${review.destination}`);
    assert.equal(review.status, review.unresolvedPassports.length === 0 ? 'complete' : review.unresolvedPassports.length === codes.length - 1 ? 'blocked' : 'partial');
  }
  const withdrawn = new Set<string>();
  for (const withdrawal of file.withdrawals) {
    const key = `${withdrawal.passport}/${withdrawal.destination}`;
    assert.ok(codes.includes(withdrawal.passport) && destinations.includes(withdrawal.destination) && withdrawal.passport !== withdrawal.destination && !withdrawn.has(key), `Invalid withdrawal ${key}`);
    assert.ok(withdrawal.reason?.trim() && withdrawal.sources.length && withdrawal.sources.every(id => Object.hasOwn(file.sources, id)), `Withdrawal without evidence ${key}`);
    withdrawn.add(key);
  }
}

export function mergeCandidates(candidates: Candidate[], groups: Record<string, string>, codes: string[]): Factchecks {
  assert.equal(candidates.length, Object.keys(groups).length);
  assert.equal(new Set(candidates.map(file => file.group)).size, candidates.length);
  const merged: Factchecks = { version: 1, sources: {}, policies: [], reviews: [], withdrawals: [] };
  for (const file of candidates) {
    assert.ok(Object.hasOwn(groups, file.group), `Unknown group ${file.group}`);
    validateFactchecks(file, codes, groups[file.group].split(' '));
    for (const [id, source] of Object.entries(file.sources)) {
      assert.ok(!Object.hasOwn(merged.sources, id), `Duplicate source ${id}`);
      merged.sources[id] = { ...source, urls: publicUrls(source.urls), ...(source.urls.some(url => url.startsWith('https://web.archive.org/web/')) ? { historical: true } : {}) };
    }
    merged.policies.push(...file.policies);
    merged.reviews.push(...file.reviews.map(review => ({ ...review, attemptedUrls: publicUrls(review.attemptedUrls) })));
    merged.withdrawals.push(...file.withdrawals);
  }
  validateFactchecks(merged, codes);
  // Only identical rules and destination sets coalesce; nationality-specific conditions stay distinct.
  const compact = new Map<string, ReviewedPolicy>();
  for (const { passports, ...policy } of merged.policies) {
    const key = JSON.stringify(Object.fromEntries(Object.entries(policy).sort(([a], [b]) => a.localeCompare(b))));
    const existing = compact.get(key);
    if (existing) existing.passports.push(...passports);
    else compact.set(key, { passports: [...passports], ...policy });
  }
  merged.policies = [...compact.values()].map(policy => ({ ...policy, passports: policy.passports.sort() }));
  validateFactchecks(merged, codes);
  return merged;
}

export function factcheckCounts(file: Factchecks) {
  let checked = 0, historical = 0;
  for (const policy of file.policies) {
    const count = policy.passports.length * policy.destinations.length;
    if (file.sources[policy.s!].historical) historical += count; else checked += count;
  }
  return { destinations: file.reviews.length, routes: checked + historical + file.reviews.reduce((sum, review) => sum + review.unresolvedPassports.length, 0), checked, historical, unresolved: file.reviews.reduce((sum, review) => sum + review.unresolvedPassports.length, 0), withdrawals: file.withdrawals.length };
}
