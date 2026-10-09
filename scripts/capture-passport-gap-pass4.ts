import fs from 'node:fs';
import assert from 'node:assert/strict';
import countries from '../content/nomads/countries.json';
import { capturePassInputs, validatePassManifest, type PassManifest } from './lib/passport-factcheck-artifacts';
import { replayFactcheckPasses } from './lib/passport-factcheck-passes';
import { mergeGapPatches, policyRoutes, qualifyPolicies, serializeAudit, sha256, type GapAssignments, type GapPatch, type Replacement } from './lib/passport-gap-patches';

const cache = '.cache/nomads/gap-pass4', root = 'content/nomads/factcheck-passes';
const manifest = JSON.parse(fs.readFileSync(`${root}/manifest.json`, 'utf8')) as PassManifest;
validatePassManifest(manifest);
assert.ok(!manifest.passes.some(pass => pass.id === 'gap-pass4'), 'Pass four is already captured');
const baseline = fs.readFileSync(`${cache}/baseline.json`, 'utf8');
assert.equal(sha256(baseline), '4f998906b7a139661baf2a82d15de315463be057bd7eccf79c463f2448945055');
assert.equal(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8'), baseline, 'Canonical baseline changed');
assert.equal(serializeAudit(replayFactcheckPasses()), baseline, 'Prior manifest does not reproduce pass-four baseline');
const assignments = JSON.parse(fs.readFileSync(`${cache}/assignments.json`, 'utf8')) as GapAssignments;
const patches = assignments.batches.map(batch => JSON.parse(fs.readFileSync(`${cache}/${batch.id}.json`, 'utf8')) as GapPatch);
const codes = countries.map(country => country.iso!);
const merged = mergeGapPatches(baseline, assignments, patches, codes);
const routes = policyRoutes(merged.data.policies);
// Schedule 3 ordinary nationalities with baseline preapproval-only claims; IL is a patch addition, RU has a treaty waiver.
const origins = ['CN', 'FJ', 'FM', 'KI', 'MH', 'PG', 'PW', 'SB', 'TH', 'TO', 'TV', 'VU', 'WS'];
const reason = 'Integration review of Nauru: visa duty remains supported. Regulation 12(2)(a), read with 16(4) and Schedule 3, permits on-entry visitor-visa applications for these fee-exempt nationalities, while live Tourism guidance requires advance application and printed approval. Replace the categorical preapproval-only/no-VOA claim with explicit method uncertainty; neither practical walk-up issuance nor a visa waiver is established. Taiwan is excluded following SL 14/2024; the independently evidenced UAE and Russian waivers are retained.';
const qualifications: Replacement[] = origins.map(passport => {
  const previous = routes.get(`${passport}/NR`)!;
  assert.equal(previous.t, 'vr'); assert.equal(previous.d, 0);
  assert.match(previous.n!, /not (?:VOA|visa on arrival)/);
  return { batch: 'gap-pass4-integration', passport, destination: 'NR', reason, sources: ['gap4-07-nr-law', previous.s!], previous,
    replacement: { t: 'vr', d: 0, s: 'gap4-07-nr-law', evidence: [previous.s!],
      n: 'Visitor visa required; Schedule 3 exempts this nationality from the visitor-visa fee, not from the visa. Regulations 12(2)(a) and 16(4) permit an application on entry, but current Tourism instructions require an advance application and a printed approval letter. Practical arrival-versus-advance issuance remains unreconciled: confirm with Nauru Immigration before travel; no unconditional walk-up visa or electronic-visa availability is asserted. Tourism accepts emailed documents: passport, photograph, return itinerary, accommodation and employment/support evidence; carry the printed approval for that advance process. Confirm current passport/document validity requirements. Regulation 12 requires onward admission documents and means of support; the grant is single-entry, no more than three months, with its actual conditions controlling.',
      stay: 'As granted; single entry, no more than 3 months under Regulation 12(7)', label: 'Visitor visa required; fee exemption / channel conflict' } };
});
const qualified = qualifyPolicies(merged.data, qualifications, codes, 'gap-pass4');
const inputs = capturePassInputs(cache, root, 'gap-pass4', assignments.batches.map(batch => batch.id), false);
const qualificationRaw = serializeAudit(qualifications);
fs.writeFileSync(`${root}/gap-pass4/qualifications.json`, qualificationRaw);
manifest.passes.push({ id: 'gap-pass4', baselineSha256: assignments.baselineSha256, assignments: inputs.assignments, patches: inputs.patches, contradictions: [], qualifications: { path: 'gap-pass4/qualifications.json', sha256: sha256(qualificationRaw) } });
validatePassManifest(manifest);
fs.writeFileSync(`${root}/manifest.json`, serializeAudit(manifest));
console.log({ ...merged.report, integrationQualifications: qualifications.length, withdrawalsAfterQualifications: qualified.withdrawals.length });
