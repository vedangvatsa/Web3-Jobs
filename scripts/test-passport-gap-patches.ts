import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import countries from '../content/nomads/countries.json';
import legacy from '../content/nomads/entry-policies.json';
import { replayFactcheckPasses } from './lib/passport-factcheck-passes';
import { capturePassInputs, validatePassManifest, type PassManifest } from './lib/passport-factcheck-artifacts';
import { mergeGapPatches, policyRoutes, qualifyPolicies, serializeAudit, sha256, withdrawContradictions, type GapAssignments, type GapPatch, type Replacement } from './lib/passport-gap-patches';
import { factcheckCounts, validateFactchecks, type Factchecks } from './lib/passport-factchecks';
import { compilePassportRules } from './lib/passport-policies';
import type { PassportIndexSnapshot } from './lib/passport-index';

test('pass manifests and exported inputs contain only replay data', () => {
  const root = 'content/nomads/factcheck-passes';
  const manifest = JSON.parse(fs.readFileSync(`${root}/manifest.json`, 'utf8')) as PassManifest;
  validatePassManifest(manifest);
  const artifacts = [manifest.baseline, ...manifest.passes.flatMap(pass => [pass.assignments, ...pass.patches, ...(pass.qualifications ? [pass.qualifications] : [])])];
  const files = (directory: string): string[] => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.relative(root, path.join(directory, entry.name))]);
  assert.deepEqual(files(root).sort(), ['manifest.json', ...artifacts.map(artifact => artifact.path)].sort());
  for (const artifact of artifacts) {
    const raw = fs.readFileSync(path.join(root, artifact.path), 'utf8');
    assert.equal(sha256(raw), artifact.sha256);
    assert.doesNotMatch(raw, /\/var\/folders\/|\/Users\/|"(?:cachePath|localPath|retrievals|excerpts)"\s*:/);
  }
  const withNotes = structuredClone(manifest);
  Object.assign(withNotes.passes[0].patches[0], { notes: { path: 'gap-pass3/gap-01.md', sha256: '0'.repeat(64) } });
  assert.throws(() => validatePassManifest(withNotes), /unexpected fields/);
  const withLedger = structuredClone(manifest);
  withLedger.passes[0].patches[0].path = 'gap-pass3/gap-01-source-provenance.json';
  assert.throws(() => validatePassManifest(withLedger), /Only assigned data/);
  const escaping = structuredClone(manifest);
  escaping.baseline.path = '../baseline.json';
  assert.throws(() => validatePassManifest(escaping), /Invalid data artifact path/);
  const researchPath = structuredClone(manifest);
  Object.assign(researchPath.passes.at(-1)!, { researchFile: '../report.md' });
  assert.throws(() => validatePassManifest(researchPath));
});

test('capture ignores raw research files and preserves input bytes and cache originals', () => {
  const directory = fs.mkdtempSync('.cache/nomads/pass-input-test-');
  try {
    const cache = path.join(directory, 'research'), root = path.join(directory, 'export');
    fs.mkdirSync(path.join(cache, 'gap-01'), { recursive: true });
    const inputs = { 'baseline.json': '{ "version": 1 }\n', 'assignments.json': '{ "batches": [] }\n', 'gap-01.json': '{ "batch": "gap-01" }\n' };
    const research = { 'gap-01.md': 'Unpublished research notes and quotations', 'gap-01/source-provenance.json': '{"excerpts":["Unpublished verbatim evidence"]}', 'gap-01-evidence-ledger.json': '{"retrievals":[]}' };
    for (const [name, raw] of Object.entries({ ...inputs, ...research })) fs.writeFileSync(path.join(cache, name), raw);
    const captured = capturePassInputs(cache, root, 'gap-pass3', ['gap-01']);
    assert.deepEqual(fs.readdirSync(root).sort(), ['baseline-pass2.json', 'gap-pass3']);
    assert.deepEqual(fs.readdirSync(path.join(root, 'gap-pass3')).sort(), ['assignments.json', 'gap-01.json']);
    for (const [source, artifact] of Object.entries({ 'baseline.json': captured.baseline!, 'assignments.json': captured.assignments, 'gap-01.json': captured.patches[0] })) {
      const original = fs.readFileSync(path.join(cache, source));
      assert.deepEqual(fs.readFileSync(path.join(root, artifact.path)), original);
      assert.equal(artifact.sha256, sha256(original));
    }
    for (const [name, raw] of Object.entries({ ...inputs, ...research })) assert.equal(fs.readFileSync(path.join(cache, name), 'utf8'), raw);
    assert.throws(() => capturePassInputs(cache, root, 'gap-pass3', ['gap-01']), /already exists/);
    assert.throws(() => capturePassInputs(cache, root, '../research', ['gap-01']));
    const appended = capturePassInputs(cache, root, 'gap-pass4', ['gap-01'], false);
    assert.equal(appended.baseline, undefined);
    assert.equal(fs.readFileSync(path.join(root, 'baseline-pass2.json'), 'utf8'), inputs['baseline.json']);
    assert.deepEqual(fs.readdirSync(path.join(root, 'gap-pass4')).sort(), ['assignments.json', 'gap-01.json']);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test('offline manifest replay is exact, lossless and separately accounts for historical downgrades', () => {
  const output = replayFactcheckPasses();
  assert.equal(serializeAudit(output), fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8'));
  const pass = output.passes[0];
  assert.equal(pass.currentAdditions, 2470); assert.equal(pass.historicalAdditions, 631); assert.equal(pass.corrections, 55);
  assert.equal(pass.downgradedToHistorical, 6); assert.equal(pass.upgradedFromHistorical, 0);
  assert.equal(pass.patchCoverage.unresolved, 6194); assert.equal(pass.integrationWithdrawals, 1);
  assert.equal(pass.coverage.checked, pass.baseline.checked + pass.currentAdditions - pass.downgradedToHistorical - pass.integrationWithdrawals);
  assert.equal(output.coverage.historical, pass.baseline.historical + pass.historicalAdditions + pass.downgradedToHistorical);
  const fourth = output.passes[1];
  assert.equal(fourth.baselineSha256, '4f998906b7a139661baf2a82d15de315463be057bd7eccf79c463f2448945055');
  assert.deepEqual(fourth.baseline, pass.coverage);
  assert.equal(fourth.currentAdditions, 1228); assert.equal(fourth.historicalAdditions, 0); assert.equal(fourth.corrections, 2);
  assert.equal(fourth.integrationWithdrawals, 0); assert.equal(fourth.integrationQualifications, 13);
  assert.equal(fourth.coverage.checked, fourth.baseline.checked + fourth.currentAdditions);
  assert.equal(fourth.coverage.unresolved, fourth.baseline.unresolved - fourth.currentAdditions);
  const aip = output.passes[2];
  assert.equal(aip.baselineSha256, 'fb7593d6d43a6794e69b98750cf7222936cc03fe16c8a9a041616ab239f49da4');
  assert.deepEqual(aip.baseline, fourth.coverage); assert.equal(aip.scope, 'targeted');
  assert.equal(aip.currentAdditions, 172); assert.equal(aip.historicalAdditions, 0); assert.equal(aip.integrationWithdrawals, 4);
  assert.equal(aip.coverage.checked, aip.baseline.checked + aip.currentAdditions - aip.integrationWithdrawals);
  assert.equal(aip.coverage.unresolved, aip.baseline.unresolved - aip.currentAdditions + aip.integrationWithdrawals);
  const fifth = output.passes[3];
  assert.equal(fifth.baselineSha256, '3d6a5b7e4780bad19ef72a7e1524d5d546471540b5faa8da65ead82db5937b6b');
  assert.deepEqual(fifth.baseline, aip.coverage);
  assert.equal(fifth.batches.length, 12); assert.equal(fifth.currentAdditions, 199);
  assert.equal(fifth.historicalAdditions, 0); assert.equal(fifth.corrections, 0); assert.equal(fifth.integrationWithdrawals, 0);
  assert.equal(fifth.coverage.checked, fifth.baseline.checked + fifth.currentAdditions);
  assert.equal(fifth.coverage.unresolved, fifth.baseline.unresolved - fifth.currentAdditions);
  const adjudication = output.passes[4];
  assert.equal(adjudication.baselineSha256, '15dba6e71d3bcec062fb72345d0bc84909b9b4e85a1583c15c6cd2d0ae73c3df');
  assert.deepEqual(adjudication.baseline, fifth.coverage); assert.equal(adjudication.scope, 'targeted');
  assert.equal(adjudication.currentAdditions, 15); assert.equal(adjudication.historicalAdditions, 0);
  assert.equal(adjudication.corrections, 0); assert.equal(adjudication.integrationWithdrawals, 0);
  assert.equal(adjudication.batches[0].gaps, 17); assert.equal(adjudication.batches[0].remaining, 2);
  assert.equal(adjudication.coverage.checked, adjudication.baseline.checked + 15);
  assert.equal(adjudication.coverage.unresolved, adjudication.baseline.unresolved - 15);
  const consistency = output.passes[5];
  assert.equal(consistency.baselineSha256, '13a3f7f2f5ee25a1eac2a6f1113c9789f1f4197ed5a5ad0746ec2c4e83d20bf3');
  assert.deepEqual(consistency.baseline, adjudication.coverage); assert.equal(consistency.scope, 'targeted');
  assert.equal(consistency.currentAdditions, 43); assert.equal(consistency.historicalAdditions, 0);
  assert.equal(consistency.corrections, 0); assert.equal(consistency.integrationWithdrawals, 0);
  assert.equal(consistency.batches[0].gaps, 252); assert.equal(consistency.batches[0].remaining, 209);
  assert.equal(output.coverage.checked, 33877); assert.equal(output.coverage.unresolved, 4542);
  const previous = JSON.parse(fs.readFileSync('content/nomads/factcheck-passes/baseline-pass2.json', 'utf8')) as Factchecks;
  const before = policyRoutes(previous.policies), after = policyRoutes(output.policies);
  const replacements = new Map(output.replacements!.map(record => [`${record.passport}/${record.destination}`, record]));
  for (const [key, rule] of before) {
    const record = replacements.get(key);
    assert.deepEqual(after.get(key), record ? record.replacement || undefined : rule, key);
    if (record) assert.deepEqual(record.previous, rule);
  }
  for (const [id, source] of Object.entries(previous.sources)) assert.deepEqual(output.sources[id], source, `Original source ${id}`);
  for (const review of previous.reviews) {
    const next = output.reviews.find(item => item.destination === review.destination)!;
    for (const finding of review.findings) assert.ok(next.findings.includes(finding));
    for (const url of review.attemptedUrls) assert.ok(next.attemptedUrls.includes(url));
  }
  for (const from of ['BH', 'KW', 'OM', 'SA', 'JP', 'KR']) {
    const data = compilePassportRules(countries.find(country => country.iso === from)!, countries, legacy, '2026-10-08', undefined, output);
    const az = data.destinations.find(item => item.iso === 'AZ')!;
    assert.equal(az.review, 'historical'); assert.equal(data.sources[az.rule.s!].checkedAt, '2026-07-23');
    assert.match(az.rule.n!, /three|3/i);
  }
  const iceland = compilePassportRules(countries.find(country => country.iso === 'IS')!, countries, legacy, '2026-10-08', undefined, output);
  const sz = iceland.destinations.find(item => item.iso === 'SZ')!;
  assert.equal(sz.rule.t, 'unknown'); assert.equal(sz.review, 'unresolved'); assert.equal(sz.rule.evidence!.length, 2);
});

test('fourth-pass corrections preserve visa duty and distinguish method conflict from exemption', () => {
  const audit = JSON.parse(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8')) as Factchecks;
  const routes = policyRoutes(audit.policies);
  assert.equal(routes.get('CZ/ST')!.t, 'vf'); assert.equal(routes.get('CZ/ST')!.d, 15);
  const taiwan = routes.get('TW/NR')!;
  assert.equal(taiwan.t, 'vr'); assert.equal(taiwan.d, 0);
  assert.match(taiwan.n!, /2024|Taiwan/); assert.match(taiwan.label || '', /no Taiwan Schedule 3 fee exemption/);
  const corrections = audit.replacements!.filter(record => /^gap4-/.test(record.batch));
  assert.deepEqual(corrections.map(record => `${record.passport}/${record.destination}`).sort(), ['CZ/ST', 'TW/NR']);
  const qualifications = audit.replacements!.filter(record => record.batch === 'gap-pass4-integration');
  assert.equal(qualifications.length, 13);
  for (const record of qualifications) {
    const rule = routes.get(`${record.passport}/NR`)!;
    assert.equal(rule.t, 'vr'); assert.equal(rule.d, 0); assert.equal(rule.a, undefined);
    assert.match(rule.n!, /on entry/); assert.match(rule.n!, /advance application/); assert.match(rule.n!, /unreconciled/);
    assert.match(rule.n!, /passport.*photograph.*return itinerary.*accommodation.*employment\/support/);
    assert.ok(rule.evidence!.includes(record.previous.s!));
  }
  for (const from of ['AE', 'RU']) assert.equal(routes.get(`${from}/NR`)!.t, 'vf');
  assert.match(routes.get('SO/ES')!.n!, /not recogni[sz]ed|non.recognition/i);
  assert.match(routes.get('RU/NO')!.n!, /external/);
  assert.match(routes.get('CN/BJ')!.n!, /90/); assert.equal(routes.get('CN/BJ')!.d, 30);
});

const codes = ['US', 'IN', 'MY', 'CA'];
function fixture() {
  const baseline: Factchecks = { version: 1, sources: { official: { title: 'Government table', urls: ['https://example.gov/visas'], checkedAt: '2026-10-07' } },
    policies: [{ passports: ['US'], destinations: ['MY', 'CA'], t: 'vf', d: 30, s: 'official', n: 'Keep the original condition.' }],
    reviews: codes.map(destination => {
      const unresolvedPassports = codes.filter(from => from !== destination && !(from === 'US' && ['MY', 'CA'].includes(destination)));
      return { destination, status: unresolvedPassports.length === 3 ? 'blocked' : 'partial', unresolvedPassports, findings: ['Earlier finding'], attemptedUrls: ['https://example.gov/old'] };
    }), withdrawals: [{ passport: 'US', destination: 'MY', reason: 'Earlier withdrawal', sources: ['official'] }] };
  const raw = serializeAudit(baseline);
  const assignments: GapAssignments = { baselineSha256: sha256(raw), batches: [{ id: 'gap-test', routes: 10, destinations: baseline.reviews.map(review => ({ iso: review.destination, origins: review.unresolvedPassports })) }] };
  const patch: GapPatch = { version: 1, batch: 'gap-test', baselineSha256: sha256(raw), sources: { 'gap-test-source': { title: 'New rule', urls: ['https://example.gov/new'], checkedAt: '2026-10-08' } },
    policies: [{ passports: ['IN'], destinations: ['MY'], t: 'ev', d: 0, s: 'gap-test-source', evidence: ['official'], n: 'Method-specific stay unspecified.' }, { passports: ['US'], destinations: ['MY'], t: 'vr', d: 0, s: 'gap-test-source' }],
    reviews: baseline.reviews.map(review => ({ destination: review.destination, resolvedOrigins: review.destination === 'MY' ? ['IN'] : [], remainingOrigins: review.unresolvedPassports.filter(from => !(review.destination === 'MY' && from === 'IN')), findings: ['New finding'], attemptedUrls: ['https://example.gov/new'] })),
    corrections: [{ passport: 'US', destination: 'MY', reason: 'Replacement evidence', sources: ['gap-test-source'] }] };
  return { raw, assignments, patch };
}

test('exact pair subtraction, correction deduplication and evidence survive multi-destination baseline policies', () => {
  const { raw, assignments, patch } = fixture();
  const result = mergeGapPatches(raw, assignments, [patch], codes).data;
  assert.equal(policyRoutes(result.policies).get('US/CA')!.n, 'Keep the original condition.');
  assert.equal(policyRoutes(result.policies).get('US/MY')!.t, 'vr');
  assert.equal(result.withdrawals.length, 1);
  assert.deepEqual(result.withdrawals[0].sources, ['official', 'gap-test-source']);
  assert.match(result.withdrawals[0].reason, /Earlier withdrawal\nReplacement evidence/);
  const without = withdrawContradictions(result, [{ passport: 'US', destination: 'MY', reason: 'Unreconciled conflict', sources: ['official'] }], codes, 'review');
  assert.equal(without.withdrawals.length, 1); assert.equal(factcheckCounts(without).unresolved, 10);
  assert.equal(without.replacements!.at(-1)!.replacement, null);
  const tampered = structuredClone(result);
  tampered.replacements![0].replacement!.d = 99;
  assert.throws(() => validateFactchecks(tampered, codes), /Replacement differs/);
  const expanded = compilePassportRules(countries.find(country => country.iso === 'IN')!, countries, legacy, '2026-10-08', undefined, result);
  assert.ok(expanded.sources.official, 'Supplemental policy evidence must be registered in the selected shard');
});

test('integration qualifications require exact previous rules and cannot change route coverage', () => {
  const { raw, assignments, patch } = fixture();
  const data = mergeGapPatches(raw, assignments, [patch], codes).data;
  const previous = policyRoutes(data.policies).get('US/MY')!;
  const record: Replacement = { batch: 'test-integration', passport: 'US', destination: 'MY', previous, replacement: { ...previous, n: 'Requirement established; practical issuance uncertain.' }, reason: 'Method conflict', sources: [previous.s!] };
  const qualified = qualifyPolicies(data, [record], codes, 'test');
  assert.deepEqual(factcheckCounts(qualified), factcheckCounts(data));
  assert.equal(qualified.withdrawals.length, data.withdrawals.length);
  for (const mutate of [
    (item: Replacement) => { item.previous = { ...item.previous, d: 30 }; },
    (item: Replacement) => { item.replacement = null; },
    (item: Replacement) => { item.replacement!.t = 'voa'; },
    (item: Replacement) => { item.replacement!.d = 90; },
    (item: Replacement) => { item.sources = []; },
    (item: Replacement) => { item.passport = 'CA'; },
  ]) {
    const invalid = structuredClone(record); mutate(invalid);
    assert.throws(() => qualifyPolicies(data, [invalid], codes, 'test'));
  }
  assert.throws(() => qualifyPolicies(data, [record, record], codes, 'test'));
});

test('gap contract rejects tampered baselines, assignments, partitions, sources, dates and unsupported corrections', () => {
  const mutations: Array<(input: ReturnType<typeof fixture>) => void> = [
    input => { input.raw += ' '; },
    input => { input.assignments.batches[0].destinations.pop(); },
    input => { input.assignments.batches[0].destinations[0].origins = []; },
    input => { input.patch.baselineSha256 = '0'.repeat(64); },
    input => { input.patch.reviews.pop(); },
    input => { input.patch.reviews.push(input.patch.reviews[0]); },
    input => { input.patch.reviews.find(review => review.destination === 'MY')!.resolvedOrigins = []; },
    input => { input.patch.reviews.find(review => review.destination === 'MY')!.remainingOrigins.push('IN'); },
    input => { input.patch.reviews.find(review => review.destination === 'MY')!.remainingOrigins = []; },
    input => { input.patch.corrections = []; },
    input => { input.patch.corrections[0].passport = 'IN'; },
    input => { input.patch.corrections[0].sources = []; },
    input => { input.patch.corrections.push(input.patch.corrections[0]); },
    input => { input.patch.policies.pop(); },
    input => { input.patch.policies.push(input.patch.policies[0]); },
    input => { input.patch.policies[0].passports = ['MY']; },
    input => { input.patch.policies[0].passports = ['XX']; },
    input => { input.patch.policies[0].destinations = ['XX']; },
    input => { input.patch.policies[0].s = 'gap-other-source'; },
    input => { input.patch.policies[0].evidence = ['missing']; },
    input => { input.patch.sources.official = input.patch.sources['gap-test-source']; },
    input => { input.patch.sources['gap-test-source'].checkedAt = '2026-02-30'; },
    input => { input.patch.sources['gap-test-source'].checkedAt = '2099-01-01'; },
    input => { input.patch.sources['gap-test-source'].urls = ['https://web.archive.org/web/20260101000000/https://example.gov']; },
    input => { input.patch.policies[0].d = 30; input.patch.policies[0].stay = 'One month'; },
    input => { input.patch.policies[0].a = ['vr']; },
    input => { input.patch.policies[0].a = ['ev', 'ev']; },
    input => { input.patch.policies[0].until = '2026-02-30'; },
  ];
  for (const mutate of mutations) {
    const input = fixture(); mutate(input);
    assert.throws(() => mergeGapPatches(input.raw, input.assignments, [input.patch], codes), mutate.toString());
  }
});

test('uncertain methods, age/residence and territory branches remain explicit in real pass policies', () => {
  const audit = JSON.parse(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8')) as Factchecks;
  const routes = policyRoutes(audit.policies);
  assert.match(routes.get('IN/MA')!.n!, /residen|age|minor/i);
  assert.match(routes.get('PA/TJ')!.n!, /55/);
  assert.match(routes.get('IN/OM')!.n!, /residen|GCC/);
  assert.match(routes.get('GB/PS')!.n!, /Gaza|West Bank/);
  assert.match(routes.get('IN/KR')!.n!, /Jeju/);
  assert.match(routes.get('CN/KW')!.n!, /uncertain|conflict|not establish/i);
  assert.equal(routes.get('CN/KW')!.d, 0); assert.equal(routes.get('CN/KW')!.t, 'vr');
  assert.equal(routes.get('VA/BD')!.d, 90); assert.equal(routes.get('VA/BD')!.t, 'vf');
  assert.equal(routes.get('IN/MY')!.d, 30); assert.equal(routes.get('IN/MY')!.until, '2026-12-31');
});

test('targeted passes partition their assigned gaps and preserve all unassigned reviews and rules', () => {
  const { raw, assignments, patch } = fixture();
  assignments.scope = 'targeted';
  assignments.batches[0].destinations = assignments.batches[0].destinations.filter(destination => destination.iso === 'MY');
  assignments.batches[0].routes = assignments.batches[0].destinations[0].origins.length;
  patch.reviews = patch.reviews.filter(review => review.destination === 'MY');
  const merged = mergeGapPatches(raw, assignments, [patch], codes);
  assert.equal(merged.report.scope, 'targeted');
  const before = JSON.parse(raw) as Factchecks;
  assert.deepEqual(merged.data.reviews.filter(review => review.destination !== 'MY'), before.reviews.filter(review => review.destination !== 'MY'));
  assert.deepEqual(policyRoutes(merged.data.policies).get('US/CA'), policyRoutes(before.policies).get('US/CA'));
  const incompleteGlobal = structuredClone(assignments); delete incompleteGlobal.scope;
  assert.throws(() => mergeGapPatches(raw, incompleteGlobal, [patch], codes), /Assigned destinations/);
  const duplicate = structuredClone(assignments); duplicate.batches[0].destinations.push(duplicate.batches[0].destinations[0]);
  assert.throws(() => mergeGapPatches(raw, duplicate, [patch], codes), /Duplicate targeted destination/);
  const incompletePartition = structuredClone(patch); incompletePartition.reviews[0].remainingOrigins = [];
  assert.throws(() => mergeGapPatches(raw, assignments, [incompletePartition], codes), /exact gap partition/);
});

test('AIP additions keep air-only scope, unknown stays and actual operative page dates', () => {
  const patch = JSON.parse(fs.readFileSync('content/nomads/factcheck-passes/aip-research/aip-reviewed.json', 'utf8')) as GapPatch;
  const counts: Record<string, number> = {};
  for (const policy of patch.policies) {
    for (const destination of policy.destinations) counts[destination] = (counts[destination] || 0) + policy.passports.length;
    assert.match(policy.label!, /^Air entry only:/);
    assert.match(policy.n!, /Land and sea entry are not established/);
    assert.match(policy.n!, /ordinary passports/); assert.equal(policy.d, 0);
    assert.ok(!patch.sources[policy.s!].historical);
  }
  assert.deepEqual(counts, { BF: 161, NE: 2, CF: 9 });
  const rules = policyRoutes(patch.policies);
  assert.equal(rules.get('ML/NE')!.stay, 'Up to 3 months (air entry only)');
  assert.equal(rules.get('BF/NE')!.stay, undefined);
  assert.match(rules.get('BF/NE')!.n!, /three months.*60 days/);
  assert.equal(rules.has('RW/BF'), false); assert.equal(rules.has('US/CF'), false);
  assert.match(rules.get('CM/CF')!.n!, /25 March 2022.*PERM/);
  assert.match(rules.get('AU/BF')!.n!, /2 October 2025.*1 October 2026/);
  assert.equal(patch.sources['aip-reviewed-aip-register'].sha256, 'f3510118b4974b32fb83a8bd42948d5ffede0735404a4a2e78e0694f7c4978f6');
  assert.equal(patch.sources['aip-reviewed-review-ne-2024'].historical, true);
  assert.match(patch.sources['aip-reviewed-review-ne-2024'].title, /Historical comparison only.*8 August 2024/);
  assert.match(patch.sources['aip-reviewed-review-se-advice'].title, /receipt/);
});

test('all four Niger conflicts withdraw prior claims with both sources and no reference fallback', () => {
  const audit = JSON.parse(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8')) as Factchecks;
  const reference = JSON.parse(fs.readFileSync('content/nomads/passport-index.json', 'utf8')) as PassportIndexSnapshot;
  const records = audit.replacements!.filter(record => record.batch === 'aip-research-integration');
  assert.deepEqual(records.map(record => record.passport).sort(), ['MR', 'MU', 'RW', 'SE']);
  for (const record of records) {
    assert.equal(record.destination, 'NE'); assert.equal(record.previous.t, 'vr'); assert.equal(record.replacement, null);
    const data = compilePassportRules(countries.find(country => country.iso === record.passport)!, countries, legacy, '2026-10-08', reference, audit);
    const route = data.destinations.find(item => item.iso === 'NE')!;
    assert.equal(route.review, 'unresolved'); assert.equal(route.rule.t, 'unknown'); assert.equal(route.rule.d, 0); assert.equal(route.rule.stay, undefined);
    assert.match(route.rule.n!, /Air-entry evidence conflict/);
    assert.ok(route.rule.evidence!.includes(record.previous.s!));
    assert.ok(route.rule.evidence!.includes('aip-reviewed-aip-ne'));
    assert.ok(route.rule.evidence!.includes('aip-reviewed-review-ne-paris'));
    for (const id of route.rule.evidence!) assert.ok(data.sources[id]);
  }
});

test('AIP integration leaves other Niger durations, methods and fees intact', () => {
  const previous = JSON.parse(fs.readFileSync('content/nomads/factcheck-passes/gap-pass4/gap4-10.json', 'utf8')) as GapPatch;
  const audit = JSON.parse(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8')) as Factchecks;
  const routes = policyRoutes(audit.policies);
  for (const [key, rule] of policyRoutes(previous.policies)) if (key.endsWith('/NE') && !['SE/NE', 'MR/NE', 'MU/NE', 'RW/NE'].includes(key)) assert.deepEqual(routes.get(key), rule, key);
  assert.equal(audit.reviews.find(review => review.destination === 'BF')!.unresolvedPassports.includes('RW'), true);
  assert.equal(audit.reviews.find(review => review.destination === 'BF')!.unresolvedPassports.length, 4);
  assert.equal(audit.reviews.find(review => review.destination === 'NE')!.unresolvedPassports.length, 4);
  assert.equal(audit.reviews.find(review => review.destination === 'CF')!.unresolvedPassports.length, 175);
});

test('fifth-pass public-source additions retain requirements, passport conditions and distinct method stays', () => {
  const audit = JSON.parse(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8')) as Factchecks;
  const routes = policyRoutes(audit.policies);
  assert.equal(routes.get('BR/MY')!.d, 90); assert.match(routes.get('BR/MY')!.n!, /MDAC/);
  assert.equal(routes.get('SR/MY')!.d, 30);
  assert.equal(routes.get('AZ/MA')!.t, 'vf'); assert.equal(routes.get('AZ/MA')!.d, 90);
  assert.match(routes.get('AZ/MA')!.n!, /28 August 2024/);
  const laos = routes.get('AF/LA')!;
  assert.equal(laos.t, 'vr'); assert.equal(laos.d, 0); assert.equal(laos.a, undefined);
  assert.match(laos.n!, /arrival eligibility, electronic eligibility.*unconfirmed/);
  assert.equal(audit.reviews.find(review => review.destination === 'LA')!.unresolvedPassports.includes('BY'), true);
  const thai = routes.get('PS/TH')!;
  assert.equal(thai.t, 'vr'); assert.equal(thai.d, 0);
  assert.match(thai.n!, /Jordanian residence/); assert.match(thai.n!, /routine issuance is not assured/);
  for (const origin of ['PS', 'XK']) {
    const korea = routes.get(`${origin}/KR`)!;
    assert.equal(korea.t, 'vr'); assert.equal(korea.d, 0);
    assert.equal(korea.stay, 'C-3-9: up to 90 days for a single-entry visa; 30 days for a double-entry visa');
    assert.match(korea.n!, /excludes.*Jeju/); assert.match(korea.n!, /not an eVisa/);
  }
  const austria = routes.get('AT/NG')!;
  assert.equal(austria.t, 'ev'); assert.equal(austria.d, 0);
  assert.match(`${austria.n} ${austria.stay}`, /four weeks/i);
  assert.equal(routes.get('CZ/NG')!.d, 30);
  assert.equal(routes.get('TL/VN')!.t, 'ev'); assert.equal(routes.get('TL/VN')!.d, 0);
  assert.match(routes.get('TL/VN')!.n!, /Phu Quoc/);
  assert.equal(routes.get('IT/SY')!.t, 'voa'); assert.equal(routes.get('IT/SY')!.d, 0);
  for (const origin of ['DO', 'HN', 'SV', 'VC']) {
    assert.equal(routes.get(`${origin}/BO`)!.t, 'vf'); assert.equal(routes.get(`${origin}/BO`)!.d, 0);
  }
  const manifest = JSON.parse(fs.readFileSync('content/nomads/factcheck-passes/manifest.json', 'utf8')) as PassManifest;
  const additions = manifest.passes.find(pass => pass.id === 'gap-pass5')!.patches.flatMap(artifact => (JSON.parse(fs.readFileSync(`content/nomads/factcheck-passes/${artifact.path}`, 'utf8')) as GapPatch).policies);
  assert.equal(additions.reduce((sum, policy) => sum + policy.passports.length * policy.destinations.length, 0), 199);
  for (const policy of additions) assert.ok(!audit.sources[policy.s!].historical);
  assert.equal(audit.replacements!.some(record => record.batch.startsWith('gap5-')), false);
});

test('adjudication adds exactly 15 independent qualified duties, not document or admission clearance', () => {
  const root = 'content/nomads/factcheck-passes';
  const manifest = JSON.parse(fs.readFileSync(`${root}/manifest.json`, 'utf8')) as PassManifest;
  const pass = manifest.passes.find(item => item.id === 'conditional-adjudication')!;
  const patch = JSON.parse(fs.readFileSync(`${root}/${pass.patches[0].path}`, 'utf8')) as GapPatch;
  const audit = JSON.parse(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8')) as Factchecks;
  const current = policyRoutes(audit.policies), additions = policyRoutes(patch.policies);
  const pass5 = new Set(manifest.passes.find(item => item.id === 'gap-pass5')!.patches.flatMap(artifact => [...policyRoutes((JSON.parse(fs.readFileSync(`${root}/${artifact.path}`, 'utf8')) as GapPatch).policies).keys()]));
  assert.equal(pass5.size, 199);
  assert.deepEqual([...additions.keys()].sort(), ['HK/LR', 'MO/LR', 'PS/LR', 'XK/LR', 'XK/BH', 'XK/TG', 'XK/IN', 'XK/CN', 'PS/BA', 'PS/AR', 'XK/AR', 'PS/AO', 'XK/AO', 'PS/BJ', 'XK/BJ'].sort());
  for (const [key, rule] of additions) {
    assert.ok(!pass5.has(key)); assert.deepEqual(current.get(key), rule);
    assert.equal(rule.t, 'vr'); assert.equal(rule.d, 0);
    assert.equal(rule.stay, undefined); assert.equal(rule.a, undefined); assert.equal(rule.until, undefined);
    assert.match(rule.label!, /unconfirmed/);
    assert.match(rule.n!, /document/); assert.match(rule.n!, /stay/); assert.match(rule.n!, /issuance/);
    assert.ok(!patch.sources[rule.s!].historical);
  }
  for (const origin of ['PS', 'XK']) {
    const ar = additions.get(`${origin}/AR`)!;
    assert.match(ar.label!, /^Visa or AVE required/); assert.match(ar.n!, /without treating AVE as a visa or proving AVE eligibility/);
    const ao = additions.get(`${origin}/AO`)!;
    assert.match(ao.label!, /overnight tourism/); assert.match(ao.n!, /cruise passengers\/day visitors/);
  }
  assert.equal(Object.keys(patch.sources).length, 9);
  assert.equal(patch.sources['conditional-adjudication-cn-duty'].sha256, undefined);
  assert.equal(patch.sources['conditional-adjudication-cn-duty'].checkedAt, '2026-10-08');
  assert.equal(patch.sources['conditional-adjudication-lr-duty'].checkedAt, '2026-10-09');
  assert.equal(pass.researchBaselineSha256, manifest.passes.find(item => item.id === 'gap-pass5')!.baselineSha256);
  assert.equal(pass.researchSha256, 'bbff3212eaaa83b55f91a0e27c6db1289e0479e16beddfa946770d88c00bff9c');
  assert.equal(pass.researchFile, 'candidate.json');
  assert.ok(!patch.reviews.some(review => ['OM', 'PS'].includes(review.destination)));
  assert.ok(!Object.keys(patch.sources).some(id => /^conditional-adjudication-(om|ps)-/.test(id)));
  assert.equal(audit.reviews.find(review => review.destination === 'OM')!.unresolvedPassports.length, 88);
  assert.equal(audit.reviews.find(review => review.destination === 'PS')!.unresolvedPassports.length, 195);
  assert.deepEqual(audit.reviews.find(review => review.destination === 'BJ')!.unresolvedPassports.sort(), ['HT', 'RO']);
});

test('pass-six changes exactly 43 obligations and preserves every other compiled route and prior snapshot', () => {
  const root = 'content/nomads/factcheck-passes';
  const manifest = JSON.parse(fs.readFileSync(`${root}/manifest.json`, 'utf8')) as PassManifest;
  const output = replayFactcheckPasses(), codes = countries.map(country => country.iso!);
  const initial = JSON.parse(fs.readFileSync(`${root}/${manifest.baseline.path}`, 'utf8'));
  let raw = serializeAudit(initial);
  for (const [index, pass] of manifest.passes.slice(0, -1).entries()) {
    assert.equal(sha256(raw), pass.baselineSha256);
    const assignments = JSON.parse(fs.readFileSync(`${root}/${pass.assignments.path}`, 'utf8')) as GapAssignments;
    const patches = pass.patches.map(artifact => JSON.parse(fs.readFileSync(`${root}/${artifact.path}`, 'utf8')) as GapPatch);
    let data = withdrawContradictions(mergeGapPatches(raw, assignments, patches, codes).data, pass.contradictions, codes, `${pass.id}-integration`);
    if (pass.qualifications) data = qualifyPolicies(data, JSON.parse(fs.readFileSync(`${root}/${pass.qualifications.path}`, 'utf8')), codes, pass.id);
    raw = serializeAudit({ ...data, coverage: factcheckCounts(data), inputs: initial.inputs,
      manifestSha256: sha256(serializeAudit({ ...manifest, passes: manifest.passes.slice(0, index + 1) })), passes: output.passes.slice(0, index + 1) });
  }
  assert.equal(sha256(raw), '13a3f7f2f5ee25a1eac2a6f1113c9789f1f4197ed5a5ad0746ec2c4e83d20bf3');
  const before = JSON.parse(raw) as Factchecks;
  const pass = manifest.passes.at(-1)!;
  assert.equal(pass.id, 'pass6-consistency'); assert.equal(pass.researchFile, 'candidate.json');
  assert.equal(pass.researchSha256, '9bc0b0845f2d62bcd117a35d1e5e8765676fa03d7b31845995c2531ba8d60ae8');
  const patch = JSON.parse(fs.readFileSync(`${root}/${pass.patches[0].path}`, 'utf8')) as GapPatch;
  const expectedByDestination: Record<string, string[]> = {
    BF: ['PS', 'TW', 'US', 'XK'], BI: ['PS', 'XK'], CY: ['SO'], ER: ['ET', 'SD', 'HK', 'MO', 'PS', 'TW', 'XK'],
    ET: ['PS', 'XK'], IQ: ['BD', 'HK', 'IL', 'PS', 'XK'], KE: ['PS', 'XK'], KW: ['MO', 'PS', 'XK'], LK: ['PS'],
    MM: ['PS', 'XK'], NE: ['IL', 'MO', 'PS', 'XK'], NP: ['XK'], SY: ['CZ', 'PT'], UG: ['PS', 'XK'], VE: ['IL', 'MO', 'XK'], ZA: ['PS', 'XK'],
  };
  const additions = policyRoutes(patch.policies), previous = policyRoutes(before.policies), current = policyRoutes(output.policies);
  assert.deepEqual([...additions.keys()].sort(), Object.entries(expectedByDestination).flatMap(([to, origins]) => origins.map(from => `${from}/${to}`)).sort());
  assert.equal(additions.size, 43);
  for (const [key, rule] of previous) assert.deepEqual(current.get(key), rule, key);
  for (const [id, source] of Object.entries(before.sources)) assert.deepEqual(output.sources[id], source);
  assert.deepEqual(output.withdrawals, before.withdrawals); assert.deepEqual(output.replacements, before.replacements);
  for (const [key, rule] of additions) {
    const to = key.split('/')[1];
    assert.ok(!previous.has(key)); assert.deepEqual(current.get(key), rule);
    assert.equal(rule.t, to === 'KE' ? 'eta' : 'vr'); assert.equal(rule.d, 0);
    assert.equal(rule.stay, undefined); assert.equal(rule.a, undefined); assert.equal(rule.until, undefined);
    assert.match(rule.label!, /unconfirmed/); assert.match(rule.n!, /stay and admission remain unconfirmed/);
    assert.match(rule.n!, /not personal clearance/);
    if (['BF', 'NE', 'VE'].includes(to)) assert.match(rule.label!, /^Air entry only:/);
    if (to === 'BI') assert.match(rule.label!, /^Airport entry only:/);
    if (to === 'IQ') { assert.match(rule.label!, /^Federal Iraq only:/); assert.match(rule.n!, /Kurdistan-only permission does not authorise federal Iraq/); }
    assert.ok(rule.evidence!.length && rule.evidence!.every(id => patch.sources[id]));
  }
  assert.match(additions.get('PS/LK')!.label!, /^Prior entry permission required/);
  assert.match(additions.get('PS/KE')!.n!, /not acceptance of this passport or eligibility for successful electronic issuance/);
  assert.match(additions.get('MO/KW')!.n!, /without qualifying foreign status.*local sponsorship/);
  assert.match(additions.get('ET/ER')!.n!, /original Eritrean national-ID exception/);
  assert.match(additions.get('US/BF')!.n!, /does not assert tourism is available/);
  assert.match(additions.get('SO/CY')!.n!, /not a Schengen admission right/);
  assert.equal(Object.values(patch.sources).filter(source => source.sha256).length, 38);
  assert.equal(patch.sources['pass6-consistency-ug-duty-capture-2'].checkedAt, '2026-10-07');
  assert.equal(patch.sources['pass6-consistency-mm-duty-capture-1'].checkedAt, '2026-10-11');
  assert.equal(patch.sources['pass6-consistency-za-duty-capture-2'].sha256, undefined);
  const referenceRaw = fs.readFileSync('content/nomads/passport-index.json', 'utf8');
  assert.equal(sha256(referenceRaw), 'cfbba9ffc469e7f80b9140aa36a1371aabdb2260499b3108771c4684afbb3f6e');
  const reference = JSON.parse(referenceRaw) as PassportIndexSnapshot;
  let untouched = 0;
  for (const country of countries) {
    const prior = compilePassportRules(country, countries, legacy, '2026-10-11', reference, before);
    const next = compilePassportRules(country, countries, legacy, '2026-10-11', reference, output);
    for (const route of prior.destinations) {
      const updated = next.destinations.find(item => item.iso === route.iso)!;
      if (!additions.has(`${country.iso}/${route.iso}`)) { assert.deepEqual(updated, route); untouched++; }
      else { assert.equal(updated.review, 'checked'); assert.deepEqual(updated.rule, additions.get(`${country.iso}/${route.iso}`)); }
    }
  }
  assert.equal(untouched, 39359);
  for (const to of ['OM', 'PS', 'SZ', 'CU', 'BD', 'CO', 'TW', 'NA', 'RW']) assert.deepEqual(output.reviews.find(review => review.destination === to), before.reviews.find(review => review.destination === to));
  assert.deepEqual(output.reviews.find(review => review.destination === 'NE')!.unresolvedPassports.slice().sort(), ['MR', 'MU', 'RW', 'SE']);
  assert.equal(output.reviews.find(review => review.destination === 'OM')!.unresolvedPassports.length, 88);
  assert.equal(output.reviews.find(review => review.destination === 'PS')!.unresolvedPassports.length, 195);
});
