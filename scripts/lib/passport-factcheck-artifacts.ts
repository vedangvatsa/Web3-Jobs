import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { sha256 } from './passport-gap-patches';
import type { Withdrawal } from './passport-factchecks';

export type Artifact = { path: string; sha256: string };
export type PassManifest = { version: 1; baseline: Artifact; passes: {
  id: string; baselineSha256: string; assignments: Artifact;
  patches: (Artifact & { batch: string })[]; contradictions: Withdrawal[];
  qualifications?: Artifact;
  researchSha256?: string;
}[] };

const identifier = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validatePassManifest(manifest: PassManifest): void {
  const keys = (value: object, expected: string[]) => assert.deepEqual(Object.keys(value).sort(), [...expected].sort(), 'Data-only manifest has unexpected fields');
  const artifact = (value: Artifact, expectedPath?: string) => {
    assert.match(value.sha256, /^[a-f0-9]{64}$/);
    assert.ok(/^[a-z0-9/-]+\.json$/.test(value.path) && !path.isAbsolute(value.path) && !value.path.split('/').includes('..'), 'Invalid data artifact path');
    if (expectedPath) assert.equal(value.path, expectedPath, 'Only assigned data artifacts may be replayed');
  };
  keys(manifest, ['version', 'baseline', 'passes']);
  assert.equal(manifest.version, 1);
  keys(manifest.baseline, ['path', 'sha256']); artifact(manifest.baseline);
  assert.ok(manifest.passes.length && new Set(manifest.passes.map(pass => pass.id)).size === manifest.passes.length, 'Missing or duplicate passes');
  for (const pass of manifest.passes) {
    keys(pass, ['id', 'baselineSha256', 'assignments', 'patches', 'contradictions', ...(pass.qualifications ? ['qualifications'] : []), ...(pass.researchSha256 ? ['researchSha256'] : [])]);
    assert.match(pass.id, identifier); assert.match(pass.baselineSha256, /^[a-f0-9]{64}$/);
    if (pass.researchSha256) assert.match(pass.researchSha256, /^[a-f0-9]{64}$/);
    keys(pass.assignments, ['path', 'sha256']); artifact(pass.assignments, `${pass.id}/assignments.json`);
    if (pass.qualifications) {
      keys(pass.qualifications, ['path', 'sha256']); artifact(pass.qualifications, `${pass.id}/qualifications.json`);
    }
    for (const patch of pass.patches) {
      keys(patch, ['batch', 'path', 'sha256']); assert.match(patch.batch, identifier);
      artifact(patch, `${pass.id}/${patch.batch}.json`);
    }
  }
}

export function capturePassInputs(cache: string, root: string, passId: string, batches: string[], includeBaseline = true) {
  assert.match(passId, identifier);
  batches.forEach(batch => assert.match(batch, identifier));
  assert.equal(new Set(batches).size, batches.length, 'Duplicate capture batch');
  const files = [
    ...(includeBaseline ? [{ source: 'baseline.json', target: 'baseline-pass2.json' }] : []),
    { source: 'assignments.json', target: `${passId}/assignments.json` },
    ...batches.map(batch => ({ source: `${batch}.json`, target: `${passId}/${batch}.json` })),
  ].map(file => {
    assert.ok(!fs.existsSync(path.join(root, file.target)), `Capture target already exists: ${file.target}`);
    return { ...file, raw: fs.readFileSync(path.join(cache, file.source)) };
  });
  fs.mkdirSync(path.join(root, passId), { recursive: true });
  const artifacts = files.map(({ target, raw }) => {
    fs.writeFileSync(path.join(root, target), raw);
    return { path: target, sha256: sha256(raw) };
  });
  const offset = includeBaseline ? 1 : 0;
  return { baseline: includeBaseline ? artifacts[0] : undefined, assignments: artifacts[offset], patches: batches.map((batch, index) => ({ batch, ...artifacts[index + offset + 1] })) };
}
