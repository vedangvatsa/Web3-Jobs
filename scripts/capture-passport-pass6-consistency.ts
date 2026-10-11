import fs from 'node:fs';
import assert from 'node:assert/strict';
import countries from '../content/nomads/countries.json';
import legacy from '../content/nomads/entry-policies.json';
import { publicUrls, factcheckCounts, type Factchecks } from './lib/passport-factchecks';
import { validatePassManifest, type PassManifest } from './lib/passport-factcheck-artifacts';
import { replayFactcheckPasses } from './lib/passport-factcheck-passes';
import { compilePassportRules } from './lib/passport-policies';
import { mergeGapPatches, policyRoutes, serializeAudit, sha256, type GapAssignments, type GapPatch } from './lib/passport-gap-patches';

type Component = { url: string; captureDate: string; rawBody: string | null; rawSha256: string | null; originalReceipt: string | null; receiptSha256: string | null; textFile: string | null; textSha256: string | null };
type Evidence = { groups: { id: string; policy: GapPatch['policies'][number]; source: Factchecks['sources'][string]; components: Component[] }[] };
const root = 'content/nomads/factcheck-passes', id = 'pass6-consistency', cache = `.cache/nomads/${id}`;
const manifest = JSON.parse(fs.readFileSync(`${root}/manifest.json`, 'utf8')) as PassManifest;
validatePassManifest(manifest);
assert.ok(!manifest.passes.some(pass => pass.id === id) && !fs.existsSync(`${root}/${id}`), 'Consistency pass already captured');
const baselineRaw = fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8');
assert.equal(sha256(baselineRaw), '13a3f7f2f5ee25a1eac2a6f1113c9789f1f4197ed5a5ad0746ec2c4e83d20bf3');
assert.equal(serializeAudit(replayFactcheckPasses()), baselineRaw);
const baseline = JSON.parse(baselineRaw) as Factchecks;
const pinned = (name: string, hash: string) => {
  const raw = fs.readFileSync(`${cache}/${name}`, 'utf8');
  assert.equal(sha256(raw), hash, `Research input changed: ${name}`);
  return raw;
};
const researchRaw = pinned('candidate.json', '9bc0b0845f2d62bcd117a35d1e5e8765676fa03d7b31845995c2531ba8d60ae8');
const candidate = JSON.parse(researchRaw) as GapPatch;
const evidence = JSON.parse(pinned('evidence.json', '3c27686c3ba52fe16035cbb8822cfada9451aaf0de0c032d07643fceedc8e1f1')) as Evidence;
const accounting = JSON.parse(pinned('accounting.json', 'd123a4521420abe2dbf88d8032ca47d061f2109fb1b0215a20bed24c0fb55137')) as { routes: { route: string; currentCredit: number; historicalCredit: number }[] };
assert.equal(candidate.version, 1); assert.equal(candidate.batch, id); assert.equal(candidate.baselineSha256, sha256(baselineRaw));
assert.deepEqual(candidate.corrections || [], []);
const expectedByDestination: Record<string, string[]> = {
  BF: ['PS', 'TW', 'US', 'XK'], BI: ['PS', 'XK'], CY: ['SO'], ER: ['ET', 'SD', 'HK', 'MO', 'PS', 'TW', 'XK'],
  ET: ['PS', 'XK'], IQ: ['BD', 'HK', 'IL', 'PS', 'XK'], KE: ['PS', 'XK'], KW: ['MO', 'PS', 'XK'], LK: ['PS'],
  MM: ['PS', 'XK'], NE: ['IL', 'MO', 'PS', 'XK'], NP: ['XK'], SY: ['CZ', 'PT'], UG: ['PS', 'XK'], VE: ['IL', 'MO', 'XK'], ZA: ['PS', 'XK'],
};
const expected = Object.entries(expectedByDestination).flatMap(([to, origins]) => origins.map(from => `${from}/${to}`)).sort();
const additions = policyRoutes(candidate.policies);
assert.equal(expected.length, 43); assert.deepEqual([...additions.keys()].sort(), expected);
assert.equal(accounting.routes.length, 4585);
assert.deepEqual(accounting.routes.map(row => row.route).sort(), baseline.reviews.flatMap(review => review.unresolvedPassports.map(from => `${from}/${review.destination}`)).sort());
assert.deepEqual(accounting.routes.filter(row => row.currentCredit).map(row => row.route).sort(), expected);
assert.ok(accounting.routes.every(row => row.historicalCredit === 0));
assert.equal(candidate.policies.length, 17); assert.equal(evidence.groups.length, 17);
const sources: Factchecks['sources'] = {};
let verifiedBodies = 0;
const policies = candidate.policies.map(policy => {
  assert.equal(policy.destinations.length, 1);
  const to = policy.destinations[0];
  assert.equal(policy.t, to === 'KE' ? 'eta' : 'vr'); assert.equal(policy.d, 0);
  for (const key of ['a', 'stay', 'until', 'evidence'] as const) assert.equal(policy[key], undefined);
  assert.ok(policy.label?.trim() && policy.n?.trim());
  const source = candidate.sources[policy.s!], group = evidence.groups.find(item => item.id === policy.s)!;
  assert.deepEqual(group.policy, policy); assert.deepEqual(group.source, source);
  assert.ok(!source.historical); assert.deepEqual(publicUrls(source.urls), source.urls);
  sources[policy.s!] = { title: source.title, urls: [...source.urls], checkedAt: source.checkedAt };
  const evidenceIds: string[] = [];
  group.components.forEach((component, index) => {
    assert.ok(source.urls.includes(component.url)); assert.ok(component.captureDate <= source.checkedAt);
    for (const [file, hash] of [[component.rawBody, component.rawSha256], [component.originalReceipt, component.receiptSha256], [component.textFile, component.textSha256]]) {
      if (file) { assert.ok(file.startsWith('.cache/nomads/') && !file.split('/').includes('..')); assert.equal(sha256(fs.readFileSync(file)), hash, `Capture changed: ${file}`); }
    }
    if (component.rawBody) verifiedBodies++;
    const key = `${policy.s}-capture-${index + 1}`;
    sources[key] = { title: `${source.title}: source ${index + 1}${!component.rawBody ? ' (saved text only; raw response unavailable)' : !component.originalReceipt ? ' (saved body; no separate HTTP receipt)' : ''}`,
      urls: [component.url], checkedAt: component.captureDate, ...(component.rawSha256 ? { sha256: component.rawSha256 } : {}) };
    evidenceIds.push(key);
  });
  const prefix = ['BF', 'NE', 'VE'].includes(to) ? 'Air entry only: ' : to === 'BI' ? 'Airport entry only: ' : to === 'IQ' ? 'Federal Iraq only: ' : '';
  const { passports, destinations, t, d, s, label, n } = policy;
  return { passports: [...passports], destinations: [...destinations], t, d, s, label: `${prefix}${label}`, n, evidence: evidenceIds };
});
assert.equal(verifiedBodies, 38);
const assigned = Object.keys(expectedByDestination).map(iso => ({ iso, origins: [...baseline.reviews.find(review => review.destination === iso)!.unresolvedPassports] }));
const assignments: GapAssignments = { baselineSha256: sha256(baselineRaw), scope: 'targeted', batches: [{ id, routes: assigned.reduce((sum, destination) => sum + destination.origins.length, 0), destinations: assigned }] };
const dateNotes: Record<string, string> = {
  BF: 'Air-entry pages dated 2 October 2025 remain in the register effective 1 October 2026; neither date proves present tourist issuance.',
  NE: 'Air-entry pages dated 11 June 2026 remain in the register effective 1 October 2026. SE, MR, MU and RW remain unresolved official conflicts.',
  BI: 'The ordinary-passport schedule was published 27 September 2024; fee-free categories and airport preapproval remain distinct.',
  ER: 'The source displays an update of 19 April 2025; the original Eritrean-ID exception is retained and KE/UG waiver leads remain unresolved.',
  MM: 'The bilateral passport-class schedule is as of 8 July 2026. Its two images and the default were captured 11 October 2026.',
  ZA: 'The saved DHA exemption schedule was issued 9 December 2025 and checked 7 October 2026; the visitor-duty page was captured 11 October 2026.',
};
const patch: GapPatch = { version: 1, batch: id, baselineSha256: sha256(baselineRaw), sources, policies, corrections: [], reviews: assigned.map(destination => {
  const original = candidate.reviews.find(review => review.destination === destination.iso)!;
  assert.deepEqual([...original.resolvedOrigins].sort(), [...expectedByDestination[destination.iso]].sort());
  return { destination: destination.iso, resolvedOrigins: [...original.resolvedOrigins], remainingOrigins: [...original.remainingOrigins],
    findings: [...original.findings, 'Requirement-only evidence: document acceptance, routine tourist issuance, stay and admission remain unconfirmed. No complete conditional decision tree is established.', ...(dateNotes[destination.iso] ? [dateNotes[destination.iso]] : [])],
    attemptedUrls: [...new Set(policies.filter(policy => policy.destinations.includes(destination.iso)).flatMap(policy => sources[policy.s!].urls))] };
}) };
const merged = mergeGapPatches(baselineRaw, assignments, [patch], countries.map(country => country.iso!));
assert.deepEqual(factcheckCounts(merged.data), { destinations: 199, routes: 39402, checked: 33877, historical: 983, unresolved: 4542, withdrawals: 188 });
assert.equal(merged.report.currentAdditions, 43); assert.equal(merged.report.historicalAdditions, 0); assert.equal(merged.report.corrections, 0);
assert.deepEqual(merged.data.withdrawals, baseline.withdrawals); assert.deepEqual(merged.data.replacements, baseline.replacements);
for (const review of baseline.reviews) if (!Object.hasOwn(expectedByDestination, review.destination)) assert.deepEqual(merged.data.reviews.find(item => item.destination === review.destination), review);
let unchanged = 0;
for (const country of countries) {
  const before = compilePassportRules(country, countries, legacy, '2026-10-11', undefined, baseline);
  const after = compilePassportRules(country, countries, legacy, '2026-10-11', undefined, merged.data);
  for (const route of before.destinations) if (!additions.has(`${country.iso}/${route.iso}`)) {
    assert.deepEqual(after.destinations.find(item => item.iso === route.iso), route); unchanged++;
  }
}
assert.equal(unchanged, 39359);
assert.doesNotMatch(serializeAudit(patch), /\.cache\/|\/Users\/|\/var\/folders\/|"(?:rawBody|originalReceipt|excerpt|textFile)"\s*:/);
fs.mkdirSync(`${root}/${id}`);
const write = (name: string, value: unknown) => {
  const raw = serializeAudit(value), path = `${id}/${name}.json`;
  fs.writeFileSync(`${root}/${path}`, raw); return { path, sha256: sha256(raw) };
};
manifest.passes.push({ id, baselineSha256: sha256(baselineRaw), assignments: write('assignments', assignments), patches: [{ batch: id, ...write(id, patch) }], contradictions: [],
  researchSha256: sha256(researchRaw), researchFile: 'candidate.json', researchBaselineSha256: candidate.baselineSha256 });
validatePassManifest(manifest);
fs.writeFileSync(`${root}/manifest.json`, serializeAudit(manifest));
console.log({ ...merged.report, verifiedBodies, unchangedCompiledRoutes: unchanged, sources: Object.keys(sources).length, visaDuties: 41, etaDuties: 2, completeConditionalTrees: 0, establishedRoutineAdmissionPaths: 0 });
