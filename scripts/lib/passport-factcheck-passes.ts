import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import countries from '../../content/nomads/countries.json';
import { factcheckCounts, type Factchecks } from './passport-factchecks';
import { mergeGapPatches, qualifyPolicies, serializeAudit, sha256, withdrawContradictions, type GapAssignments, type GapPatch, type Replacement } from './passport-gap-patches';
import { validatePassManifest, type Artifact, type PassManifest } from './passport-factcheck-artifacts';

export function replayFactcheckPasses(legacyRaw?: string) {
  const root = 'content/nomads/factcheck-passes';
  const manifestRaw = fs.readFileSync(`${root}/manifest.json`, 'utf8');
  const manifest = JSON.parse(manifestRaw) as PassManifest;
  validatePassManifest(manifest);
  const read = (artifact: Artifact) => {
    assert.ok(!path.isAbsolute(artifact.path) && !artifact.path.split('/').includes('..'), 'Invalid artifact path');
    const raw = fs.readFileSync(path.join(root, artifact.path), 'utf8');
    assert.equal(sha256(raw), artifact.sha256, `Artifact hash mismatch ${artifact.path}`);
    return raw;
  };
  let raw = read(manifest.baseline);
  if (legacyRaw !== undefined) assert.equal(legacyRaw, raw, 'Legacy candidates no longer reproduce the pinned baseline');
  const baseline = JSON.parse(raw) as Factchecks & { inputs: { group: string; sha256: string }[] };
  let data: Factchecks = baseline;
  const passes = [];
  for (const pass of manifest.passes) {
    assert.equal(sha256(raw), pass.baselineSha256, `${pass.id}: incorrect pass order/baseline`);
    const assignments = JSON.parse(read(pass.assignments)) as GapAssignments;
    assert.equal(assignments.baselineSha256, pass.baselineSha256);
    const patches = pass.patches.map(artifact => {
      const patch = JSON.parse(read(artifact)) as GapPatch;
      assert.equal(patch.batch, artifact.batch);
      return patch;
    });
    const merged = mergeGapPatches(raw, assignments, patches, countries.map(country => country.iso!));
    for (const withdrawal of pass.contradictions) assert.ok(assignments.batches.some(batch => batch.destinations.some(destination => destination.iso === withdrawal.destination)), 'Withdrawal outside assigned destinations');
    data = withdrawContradictions(merged.data, pass.contradictions, countries.map(country => country.iso!), `${pass.id}-integration`);
    const qualifications = pass.qualifications ? JSON.parse(read(pass.qualifications)) as Replacement[] : [];
    if (pass.qualifications) data = qualifyPolicies(data, qualifications, countries.map(country => country.iso!), pass.id);
    passes.push({ id: pass.id, ...merged.report, integrationWithdrawals: pass.contradictions.length, ...(pass.qualifications ? { integrationQualifications: qualifications.length } : {}), coverage: factcheckCounts(data), inputs: pass.patches.map(({ batch, sha256 }) => ({ batch, sha256 })) });
    raw = serializeAudit({ ...data, coverage: factcheckCounts(data), inputs: baseline.inputs,
      manifestSha256: sha256(serializeAudit({ ...manifest, passes: manifest.passes.slice(0, passes.length) })), passes });
  }
  return { ...data, coverage: factcheckCounts(data), inputs: baseline.inputs, manifestSha256: sha256(serializeAudit(manifest)), passes };
}
