import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { safeExternalUrl, type EntryRule } from '../../src/lib/nomads/types';
import { factcheckCounts, publicUrls, validateFactchecks, type Factchecks, type ReviewedPolicy, type Withdrawal } from './passport-factchecks';

export type GapAssignments = { baselineSha256: string; scope?: 'targeted'; batches: { id: string; routes: number; destinations: { iso: string; origins: string[] }[] }[] };
export type GapPatch = {
  version: 1; batch: string; baselineSha256: string; sources: Factchecks['sources']; policies: ReviewedPolicy[];
  reviews: { destination: string; resolvedOrigins: string[]; remainingOrigins: string[]; findings: string[]; attemptedUrls: string[] }[];
  corrections: Withdrawal[];
};
export type Replacement = Withdrawal & { batch: string; previous: EntryRule; replacement: EntryRule | null };
export const sha256 = (raw: string | Buffer) => createHash('sha256').update(raw).digest('hex');
export const serializeAudit = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
export function policyRoutes(policies: ReviewedPolicy[]) {
  return new Map(policies.flatMap(({ passports, destinations, ...rule }) => passports.flatMap(from => destinations.map(to => [`${from}/${to}`, rule] as const))));
}
const sameSet = (actual: string[], expected: string[], message: string) => {
  assert.equal(new Set(actual).size, actual.length, `${message}: duplicates`);
  assert.deepEqual([...actual].sort(), [...expected].sort(), message);
};
const unique = <T>(values: T[]) => [...new Set(values)];
const status = (remaining: number, codes: string[]) => remaining === 0 ? 'complete' as const : remaining === codes.length - 1 ? 'blocked' as const : 'partial' as const;

export function mergeGapPatches(baselineRaw: string, assignments: GapAssignments, patches: GapPatch[], codes: string[]) {
  assert.equal(sha256(baselineRaw), assignments.baselineSha256, 'Baseline SHA-256 mismatch');
  const baseline = JSON.parse(baselineRaw) as Factchecks;
  validateFactchecks(baseline, codes);
  const before = policyRoutes(baseline.policies);
  const reviews = new Map(baseline.reviews.map(review => [review.destination, review]));
  sameSet(assignments.batches.map(batch => batch.id), patches.map(patch => patch.batch), 'Batch assignment');
  const assignedDestinations = assignments.batches.flatMap(batch => batch.destinations.map(destination => destination.iso));
  assert.ok(assignments.scope === undefined || assignments.scope === 'targeted', 'Unknown assignment scope');
  if (assignments.scope === 'targeted') {
    assert.ok(assignedDestinations.length && assignedDestinations.every(destination => codes.includes(destination)), 'Invalid targeted destinations');
    sameSet(assignedDestinations, [...new Set(assignedDestinations)], 'Duplicate targeted destination');
  } else sameSet(assignedDestinations, baseline.reviews.filter(review => review.unresolvedPassports.length).map(review => review.destination), 'Assigned destinations must cover baseline gaps');
  const sources = structuredClone(baseline.sources);
  const changes = new Map<string, EntryRule>();
  const replacements: Replacement[] = [];
  const updatedReviews = new Map<string, Factchecks['reviews'][number]>();
  const batches = [];
  for (const assignment of assignments.batches) {
    const patch = patches.find(file => file.batch === assignment.id)!;
    assert.equal(patch.version, 1);
    assert.equal(patch.baselineSha256, assignments.baselineSha256, `${patch.batch}: baseline mismatch`);
    const destinations = assignment.destinations.map(item => item.iso);
    sameSet(patch.reviews.map(review => review.destination), destinations, `${patch.batch}: review destinations`);
    assert.equal(assignment.routes, assignment.destinations.reduce((sum, destination) => sum + destination.origins.length, 0));
    for (const destination of assignment.destinations) sameSet(destination.origins, reviews.get(destination.iso)!.unresolvedPassports, `${patch.batch}/${destination.iso}: assigned origins`);
    for (const [id, source] of Object.entries(patch.sources)) {
      assert.ok(id.startsWith(`${patch.batch}-`), `${patch.batch}: source must use batch prefix: ${id}`);
      assert.ok(!Object.hasOwn(sources, id), `Source overwrite ${id}`);
      assert.deepEqual(publicUrls(source.urls), source.urls, `Unstable source URLs ${id}`);
      assert.ok(!source.urls.some(url => url.startsWith('https://web.archive.org/web/')) || source.historical === true, `Archive must be historical: ${id}`);
      sources[id] = structuredClone(source);
    }
    const availableSources = { ...baseline.sources, ...patch.sources };
    const additions = new Set<string>();
    const corrections = new Map<string, Withdrawal>();
    for (const correction of patch.corrections) {
      const key = `${correction.passport}/${correction.destination}`;
      assert.ok(before.has(key) && destinations.includes(correction.destination), `Correction needs previously supported assigned route: ${key}`);
      assert.ok(!corrections.has(key), `Duplicate correction ${key}`);
      assert.ok(correction.reason?.trim() && correction.sources.length && new Set(correction.sources).size === correction.sources.length && correction.sources.every(id => Object.hasOwn(availableSources, id)), `Correction needs evidence ${key}`);
      corrections.set(key, correction);
    }
    for (const policy of patch.policies) {
      assert.ok(Object.hasOwn(availableSources, policy.s!), `Unknown or cross-batch source ${policy.s}`);
      assert.ok((policy.evidence || []).every(id => Object.hasOwn(availableSources, id)), 'Unknown supplemental evidence');
      if (policy.a) assert.equal(new Set(policy.a).size, policy.a.length, 'Duplicate alternative methods');
      for (const from of policy.passports) for (const to of policy.destinations) {
        const key = `${from}/${to}`;
        assert.ok(destinations.includes(to) && codes.includes(from) && from !== to, `Invalid patch route ${key}`);
        assert.ok(!changes.has(key), `Duplicate patch route ${key}`);
        const { passports, destinations: targets, ...rule } = policy;
        changes.set(key, structuredClone(rule));
        if (before.has(key)) {
          const correction = corrections.get(key);
          assert.ok(correction, `Unrecorded replacement ${key}`);
          assert.ok(correction.sources.includes(rule.s!) || (rule.evidence || []).some(id => correction.sources.includes(id)), `Replacement and correction evidence differ ${key}`);
          replacements.push({ ...structuredClone(correction), batch: patch.batch, previous: structuredClone(before.get(key)!), replacement: structuredClone(rule) });
        } else {
          assert.ok(reviews.get(to)!.unresolvedPassports.includes(from), `Addition outside baseline gaps ${key}`);
          additions.add(key);
        }
      }
    }
    for (const key of corrections.keys()) assert.ok(changes.has(key), `Correction without explicit replacement ${key}`);
    let current = 0, historical = 0, remaining = 0;
    for (const review of patch.reviews) {
      const previous = reviews.get(review.destination)!;
      sameSet([...review.resolvedOrigins, ...review.remainingOrigins], previous.unresolvedPassports, `${patch.batch}/${review.destination}: exact gap partition`);
      sameSet(review.resolvedOrigins, [...additions].filter(key => key.endsWith(`/${review.destination}`)).map(key => key.split('/')[0]), `${patch.batch}/${review.destination}: policies must equal resolved origins`);
      assert.ok(review.findings.length && review.findings.every(finding => typeof finding === 'string' && finding.trim()), 'Missing findings');
      assert.ok(review.attemptedUrls.every(url => safeExternalUrl(url)), 'Invalid attempted URL');
      const unresolvedPassports = previous.unresolvedPassports.filter(from => !review.resolvedOrigins.includes(from));
      updatedReviews.set(review.destination, { ...previous, status: status(unresolvedPassports.length, codes), unresolvedPassports,
        findings: unique([...previous.findings, ...review.findings]), attemptedUrls: unique([...previous.attemptedUrls, ...publicUrls(review.attemptedUrls)]) });
      remaining += unresolvedPassports.length;
      for (const from of review.resolvedOrigins) {
        if (sources[changes.get(`${from}/${review.destination}`)!.s!].historical) historical++; else current++;
      }
    }
    // Validate the candidate rules with a complete local partition, without modifying any baseline rule.
    validateFactchecks({ version: 1, sources: availableSources, policies: patch.policies, withdrawals: patch.corrections,
      reviews: destinations.map(destination => {
        const unresolvedPassports = codes.filter(from => from !== destination && !patch.policies.some(policy => policy.destinations.includes(destination) && policy.passports.includes(from)));
        return { destination, unresolvedPassports, status: status(unresolvedPassports.length, codes), findings: ['Patch validation'], attemptedUrls: [] };
      }) }, codes, destinations);
    batches.push({ batch: patch.batch, gaps: assignment.routes, currentAdditions: current, historicalAdditions: historical, corrections: corrections.size, remaining });
  }
  const merged: Factchecks = {
    version: 1, sources,
    policies: subtractRoutes(baseline.policies, new Set(changes.keys())).concat(patches.flatMap(patch => structuredClone(patch.policies))),
    reviews: baseline.reviews.map(review => updatedReviews.get(review.destination) || structuredClone(review)),
    withdrawals: structuredClone(baseline.withdrawals),
    replacements: [...structuredClone(baseline.replacements || []), ...replacements],
  };
  for (const replacement of replacements) mergeWithdrawal(merged, replacement);
  validateFactchecks(merged, codes);
  const after = policyRoutes(merged.policies);
  for (const [key, rule] of before) assert.deepEqual(after.get(key), changes.get(key) || rule, `Baseline policy lost or changed ${key}`);
  for (const [key, rule] of changes) assert.deepEqual(after.get(key), rule, `Patch rule lost ${key}`);
  const downgradedToHistorical = replacements.filter(item => !sources[item.previous.s!].historical && sources[item.replacement!.s!].historical).length;
  const upgradedFromHistorical = replacements.filter(item => sources[item.previous.s!].historical && !sources[item.replacement!.s!].historical).length;
  return { data: merged, report: { baselineSha256: assignments.baselineSha256, ...(assignments.scope ? { scope: assignments.scope } : {}), baseline: factcheckCounts(baseline), batches,
    currentAdditions: batches.reduce((sum, batch) => sum + batch.currentAdditions, 0), historicalAdditions: batches.reduce((sum, batch) => sum + batch.historicalAdditions, 0),
    corrections: replacements.length, downgradedToHistorical, upgradedFromHistorical, patchCoverage: factcheckCounts(merged) } };
}

export function subtractRoutes(policies: ReviewedPolicy[], removed: Set<string>): ReviewedPolicy[] {
  return policies.flatMap(policy => {
    if (!policy.passports.some(from => policy.destinations.some(to => removed.has(`${from}/${to}`)))) return [structuredClone(policy)];
    return policy.destinations.flatMap(destination => {
      const passports = policy.passports.filter(from => !removed.has(`${from}/${destination}`));
      return passports.length ? [{ ...structuredClone(policy), passports, destinations: [destination] }] : [];
    });
  });
}

function mergeWithdrawal(data: Factchecks, item: Withdrawal) {
  const previous = data.withdrawals.find(old => old.passport === item.passport && old.destination === item.destination);
  if (previous) {
    previous.reason = unique([previous.reason, item.reason]).join('\n');
    previous.sources = unique([...previous.sources, ...item.sources]);
  } else data.withdrawals.push({ passport: item.passport, destination: item.destination, reason: item.reason, sources: [...item.sources] });
}

export function qualifyPolicies(data: Factchecks, records: Replacement[], codes: string[], pass: string) {
  const result = structuredClone(data), routes = policyRoutes(data.policies), changed = new Set<string>();
  const policies: ReviewedPolicy[] = [];
  for (const record of records) {
    const key = `${record.passport}/${record.destination}`;
    assert.equal(record.batch, `${pass}-integration`);
    assert.ok(routes.has(key) && !changed.has(key), `Qualification needs unique supported route ${key}`);
    assert.deepEqual(record.previous, routes.get(key), `Qualification previous rule mismatch ${key}`);
    assert.ok(record.replacement && record.replacement.t === record.previous.t && record.replacement.d === record.previous.d, `Qualification cannot change requirement category or numeric stay ${key}`);
    assert.ok(record.reason.trim() && record.sources.length && record.sources.includes(record.replacement.s!) && record.sources.every(id => Object.hasOwn(data.sources, id)), `Qualification needs corresponding evidence ${key}`);
    assert.equal(Boolean(data.sources[record.replacement.s!].historical), Boolean(data.sources[record.previous.s!].historical), `Qualification cannot change historical status ${key}`);
    changed.add(key);
    policies.push({ passports: [record.passport], destinations: [record.destination], ...structuredClone(record.replacement) });
    mergeWithdrawal(result, record);
    (result.replacements ||= []).push(structuredClone(record));
    const review = result.reviews.find(item => item.destination === record.destination)!;
    review.findings = unique([...review.findings, record.reason]);
    review.attemptedUrls = unique([...review.attemptedUrls, ...publicUrls(record.sources.flatMap(id => result.sources[id].urls))]);
  }
  result.policies = subtractRoutes(data.policies, changed).concat(policies);
  validateFactchecks(result, codes);
  const before = factcheckCounts(data), after = factcheckCounts(result);
  for (const key of ['checked', 'historical', 'unresolved', 'routes'] as const) assert.equal(after[key], before[key], `Qualification changed ${key} coverage`);
  return result;
}

export function withdrawContradictions(data: Factchecks, withdrawals: Withdrawal[], codes: string[], pass: string) {
  const result = structuredClone(data);
  const routes = policyRoutes(result.policies), removed = new Set<string>();
  for (const withdrawal of withdrawals) {
    const key = `${withdrawal.passport}/${withdrawal.destination}`;
    assert.ok(routes.has(key) && !removed.has(key), `Contradiction must withdraw a supported route exactly once: ${key}`);
    assert.ok(withdrawal.reason.trim() && withdrawal.sources.length && withdrawal.sources.every(id => Object.hasOwn(result.sources, id)), `Contradiction needs evidence ${key}`);
    removed.add(key);
    mergeWithdrawal(result, withdrawal);
    (result.replacements ||= []).push({ ...structuredClone(withdrawal), batch: pass, previous: routes.get(key)!, replacement: null });
    const review = result.reviews.find(item => item.destination === withdrawal.destination)!;
    assert.ok(!review.unresolvedPassports.includes(withdrawal.passport));
    review.unresolvedPassports.push(withdrawal.passport);
    review.status = status(review.unresolvedPassports.length, codes);
    review.findings = unique([...review.findings, withdrawal.reason]);
    review.attemptedUrls = unique([...review.attemptedUrls, ...withdrawal.sources.flatMap(id => result.sources[id].urls)]);
  }
  result.policies = subtractRoutes(result.policies, removed);
  validateFactchecks(result, codes);
  return result;
}
