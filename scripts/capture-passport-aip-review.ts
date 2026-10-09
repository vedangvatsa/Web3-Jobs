import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import countries from '../content/nomads/countries.json';
import { validDate } from '../src/lib/nomads/entry-rules';
import { factcheckCounts } from './lib/passport-factchecks';
import { curateAipReview, type AipResearch } from './lib/passport-aip-review';
import { validatePassManifest, type PassManifest } from './lib/passport-factcheck-artifacts';
import { replayFactcheckPasses } from './lib/passport-factcheck-passes';
import { mergeGapPatches, serializeAudit, sha256, withdrawContradictions } from './lib/passport-gap-patches';

const cache = '.cache/nomads/aip-research', root = 'content/nomads/factcheck-passes', id = 'aip-research';
const manifest = JSON.parse(fs.readFileSync(`${root}/manifest.json`, 'utf8')) as PassManifest;
validatePassManifest(manifest);
assert.ok(!manifest.passes.some(pass => pass.id === id) && !fs.existsSync(`${root}/${id}`), 'AIP review already captured');
const baselineRaw = fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8');
assert.equal(sha256(baselineRaw), 'fb7593d6d43a6794e69b98750cf7222936cc03fe16c8a9a041616ab239f49da4');
assert.equal(serializeAudit(replayFactcheckPasses()), baselineRaw, 'Prior passes do not reproduce the canonical baseline');
const researchRaw = fs.readFileSync(`${cache}/final-candidate.json`, 'utf8');
assert.equal(sha256(researchRaw), '14f734144ac48ca6dee8eca8db88ede562bcf446bd1d2e371dc458426ca32abf');
const research = JSON.parse(researchRaw) as AipResearch;
const componentHashes = new Set<string>();
for (const source of Object.values(research.sources)) {
  for (const evidence of source.evidence) {
    assert.equal(path.basename(evidence.body), evidence.body, 'Capture body must be within the research directory');
    assert.equal(sha256(fs.readFileSync(path.join(cache, evidence.body))), evidence.sha256, `Evidence capture mismatch ${evidence.body}`);
    assert.ok(evidence.retrievedAt || evidence.observedDate, 'Missing actual retrieval date');
    const observed = (evidence.retrievedAt || evidence.observedDate)!.slice(0, 10);
    assert.ok(validDate(observed) && source.checkedAt >= observed && source.checkedAt <= new Date().toISOString().slice(0, 10));
    if (evidence.actualPageOrPublicationDate) assert.ok(validDate(evidence.actualPageOrPublicationDate) && evidence.actualPageOrPublicationDate <= source.checkedAt);
    componentHashes.add(evidence.sha256);
  }
}
const { assignments, patch, withdrawals, counts } = curateAipReview(research, baselineRaw);
const codes = countries.map(country => country.iso!);
const merged = mergeGapPatches(baselineRaw, assignments, [patch], codes);
const data = withdrawContradictions(merged.data, withdrawals, codes, `${id}-integration`);
fs.mkdirSync(`${root}/${id}`);
const write = (name: string, value: unknown) => {
  const raw = serializeAudit(value), relative = `${id}/${name}.json`;
  fs.writeFileSync(path.join(root, relative), raw);
  return { path: relative, sha256: sha256(raw) };
};
manifest.passes.push({ id, baselineSha256: sha256(baselineRaw), assignments: write('assignments', assignments),
  patches: [{ batch: patch.batch, ...write(patch.batch, patch) }], contradictions: withdrawals, researchSha256: sha256(researchRaw) });
validatePassManifest(manifest);
fs.writeFileSync(`${root}/manifest.json`, serializeAudit(manifest));
console.log({ counts, currentAdditions: merged.report.currentAdditions, historicalAdditions: merged.report.historicalAdditions,
  withdrawals: withdrawals.length, sources: Object.keys(patch.sources).length, distinctVerifiedComponentHashes: componentHashes.size, coverage: factcheckCounts(data) });
