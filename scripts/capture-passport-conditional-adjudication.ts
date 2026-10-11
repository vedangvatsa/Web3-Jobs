import fs from 'node:fs';
import assert from 'node:assert/strict';
import countries from '../content/nomads/countries.json';
import { publicUrls, type Factchecks, type ReviewedPolicy } from './lib/passport-factchecks';
import { validatePassManifest, type PassManifest } from './lib/passport-factcheck-artifacts';
import { replayFactcheckPasses } from './lib/passport-factcheck-passes';
import { mergeGapPatches, policyRoutes, serializeAudit, sha256, type GapAssignments, type GapPatch } from './lib/passport-gap-patches';

type Adjudication = {
  version: 1; artifactType: string; batch: string; baselineSha256: string;
  sources: Factchecks['sources']; policies: ReviewedPolicy[]; corrections: unknown[];
  fullyResolvedTravelPaths: unknown[];
};
const root = 'content/nomads/factcheck-passes', id = 'conditional-adjudication';
const manifest = JSON.parse(fs.readFileSync(`${root}/manifest.json`, 'utf8')) as PassManifest;
validatePassManifest(manifest);
assert.ok(!manifest.passes.some(pass => pass.id === id) && !fs.existsSync(`${root}/${id}`), 'Adjudication already captured');
const baselineRaw = fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8');
assert.equal(sha256(baselineRaw), '15dba6e71d3bcec062fb72345d0bc84909b9b4e85a1583c15c6cd2d0ae73c3df');
assert.equal(serializeAudit(replayFactcheckPasses()), baselineRaw, 'Prior passes do not reproduce current pass-five canonical data');
const baseline = JSON.parse(baselineRaw) as Factchecks;
const researchRaw = fs.readFileSync(`.cache/nomads/${id}/candidate.json`, 'utf8');
assert.equal(sha256(researchRaw), 'bbff3212eaaa83b55f91a0e27c6db1289e0479e16beddfa946770d88c00bff9c');
const candidate = JSON.parse(researchRaw) as Adjudication;
assert.equal(candidate.version, 1); assert.equal(candidate.batch, id);
assert.equal(candidate.artifactType, 'research-adjudication-not-applied');
assert.deepEqual(candidate.corrections, []); assert.deepEqual(candidate.fullyResolvedTravelPaths, []);
const pass5 = manifest.passes.find(pass => pass.id === 'gap-pass5')!;
assert.equal(candidate.baselineSha256, pass5.baselineSha256, 'Research must trace to the pre-pass-five baseline');
const independent = new Set<string>();
for (const artifact of pass5.patches) {
  const raw = fs.readFileSync(`${root}/${artifact.path}`, 'utf8');
  assert.equal(sha256(raw), artifact.sha256);
  const patch = JSON.parse(raw) as GapPatch;
  for (const key of policyRoutes(patch.policies).keys()) { assert.ok(!independent.has(key)); independent.add(key); }
}
assert.equal(independent.size, 199, 'Independent pass-five additions');
const expected = ['HK/LR', 'MO/LR', 'PS/LR', 'XK/LR', 'XK/BH', 'XK/TG', 'XK/IN', 'XK/CN', 'PS/BA', 'PS/AR', 'XK/AR', 'PS/AO', 'XK/AO', 'PS/BJ', 'XK/BJ'].sort();
const additions = policyRoutes(candidate.policies);
assert.deepEqual([...additions.keys()].sort(), expected, 'Only the 15 reviewed duty records may be imported');
const selectedSources = new Set<string>();
const policies = candidate.policies.map(policy => {
  assert.equal(policy.t, 'vr'); assert.equal(policy.d, 0); assert.ok(policy.label?.trim() && policy.n?.trim());
  assert.equal(policy.a, undefined); assert.equal(policy.stay, undefined); assert.equal(policy.until, undefined);
  assert.equal(policy.evidence, undefined);
  assert.ok(policy.s && Object.hasOwn(candidate.sources, policy.s)); selectedSources.add(policy.s!);
  const { passports, destinations, t, d, s, label, n } = policy;
  return { passports: [...passports], destinations: [...destinations], t, d, s, label, n };
});
const before = policyRoutes(baseline.policies);
for (const key of additions.keys()) {
  const [from, to] = key.split('/');
  assert.ok(!independent.has(key), `Overlap with pass-five additions ${key}`);
  assert.ok(!before.has(key) && baseline.reviews.find(review => review.destination === to)!.unresolvedPassports.includes(from), `Not a current unresolved route ${key}`);
}
const sources: Factchecks['sources'] = {};
for (const key of selectedSources) {
  const source = candidate.sources[key]; assert.ok(!source.historical, 'Requirement adjudication cannot promote historical evidence');
  assert.deepEqual(publicUrls(source.urls), source.urls, 'Unstable research citation');
  sources[key] = { title: source.title, urls: [...source.urls], checkedAt: source.checkedAt, ...(source.sha256 ? { sha256: source.sha256 } : {}) };
}
assert.equal(Object.keys(sources).length, 9);
const destinations = [...new Set(policies.flatMap(policy => policy.destinations))];
assert.ok(!destinations.includes('OM') && !destinations.includes('PS'));
const assigned = destinations.map(iso => ({ iso, origins: [...baseline.reviews.find(review => review.destination === iso)!.unresolvedPassports] }));
const assignments: GapAssignments = { baselineSha256: sha256(baselineRaw), scope: 'targeted', batches: [{ id, routes: assigned.reduce((sum, destination) => sum + destination.origins.length, 0), destinations: assigned }] };
const meaning = 'Saved public-source adjudication resolves only the stated requirement, not passport recognition, an accepted substitute document, routine tourist issuance, granted stay or admission. No full conditional decision tree is established and no traveller status is assumed.';
const patch: GapPatch = { version: 1, batch: id, baselineSha256: sha256(baselineRaw), sources, policies, corrections: [], reviews: assigned.map(destination => {
  const resolvedOrigins = destination.origins.filter(from => additions.has(`${from}/${destination.iso}`));
  const relevant = policies.filter(policy => policy.destinations.includes(destination.iso));
  return { destination: destination.iso, resolvedOrigins, remainingOrigins: destination.origins.filter(from => !resolvedOrigins.includes(from)),
    findings: [meaning, `${resolvedOrigins.length} requirement-only additions, independently checked against the post-pass-five baseline and disjoint from its 199 additions. Original source dates are retained; this is evidence re-adjudication, not new retrieval or enactment.`,
      ...(destination.iso === 'AR' ? ['The obligation is visa or AVE, with neither issuance channel established. The custom label and note must remain visible; no alternative-method array advertises AVE eligibility.'] : []),
      ...(destination.iso === 'AO' ? ['The established duty concerns overnight ordinary tourism; qualifying cruise/day visitors and other legal exceptions remain separate and are not presumed.'] : []),
      ...(destination.iso === 'BJ' ? ['Haiti and Romania exception/commencement questions remain unresolved; the two document-sensitive duty records do not settle them.'] : []),
    ], attemptedUrls: [...new Set(relevant.flatMap(policy => sources[policy.s!].urls))] };
}) };
const merged = mergeGapPatches(baselineRaw, assignments, [patch], countries.map(country => country.iso!));
for (const destination of ['OM', 'PS']) assert.deepEqual(merged.data.reviews.find(review => review.destination === destination), baseline.reviews.find(review => review.destination === destination), 'Modelling proposals must receive zero route credit');
assert.equal(merged.report.currentAdditions, expected.length);
fs.mkdirSync(`${root}/${id}`);
const write = (name: string, value: unknown) => {
  const raw = serializeAudit(value), path = `${id}/${name}.json`;
  fs.writeFileSync(`${root}/${path}`, raw); return { path, sha256: sha256(raw) };
};
manifest.passes.push({ id, baselineSha256: sha256(baselineRaw), assignments: write('assignments', assignments), patches: [{ batch: id, ...write(id, patch) }], contradictions: [],
  researchSha256: sha256(researchRaw), researchFile: 'candidate.json', researchBaselineSha256: candidate.baselineSha256 });
validatePassManifest(manifest);
fs.writeFileSync(`${root}/manifest.json`, serializeAudit(manifest));
console.log({ ...merged.report, visaDuties: [...additions.keys()].filter(key => !key.endsWith('/AR')).length, visaOrAveDuties: [...additions.keys()].filter(key => key.endsWith('/AR')).length,
  independentPass5Additions: independent.size, sources: selectedSources.size, completeConditionalTrees: 0, establishedRoutineAdmissionPaths: 0 });
