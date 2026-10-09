import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { sha256, type GapPatch } from './lib/passport-gap-patches';
import { validatePassManifest, type PassManifest } from './lib/passport-factcheck-artifacts';

// Optional research-cache integrity check; offline imports and builds use versioned pass artifacts.
const root = 'content/nomads/factcheck-passes';
const manifest = JSON.parse(fs.readFileSync(`${root}/manifest.json`, 'utf8')) as PassManifest;
validatePassManifest(manifest);
const results = [];
const captureHashes = (directory: string): Set<string> => {
  const hashes = new Set<string>();
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) for (const hash of captureHashes(target)) hashes.add(hash);
    else if (entry.isFile()) hashes.add(sha256(fs.readFileSync(target)));
  }
  return hashes;
};
const retainedHashes = captureHashes('.cache/nomads/factcheck');
for (const pass of manifest.passes) for (const artifact of pass.patches) {
  const raw = fs.readFileSync(path.join(root, artifact.path), 'utf8');
  assert.equal(sha256(raw), artifact.sha256);
  const patch = JSON.parse(raw) as GapPatch;
  const passCache = `.cache/nomads/${pass.id}`;
  const nestedCache = `${passCache}/${artifact.batch}`;
  const cache = fs.existsSync(nestedCache) ? nestedCache : passCache;
  if (pass.researchSha256) assert.equal(sha256(fs.readFileSync(`${passCache}/final-candidate.json`)), pass.researchSha256, 'Reviewed research input hash mismatch');
  const hashes = captureHashes(cache);
  const hashed = Object.entries(patch.sources).filter(([, source]) => source.sha256);
  const missing = hashed.filter(([, source]) => !hashes.has(source.sha256!) && !retainedHashes.has(source.sha256!)).map(([id]) => id);
  assert.deepEqual(missing, [], `${artifact.batch}: source digest has no preserved capture`);
  results.push({ pass: pass.id, batch: artifact.batch, hashedSources: hashed.length, retainedCaptureHashes: hashed.filter(([, source]) => !hashes.has(source.sha256!)).length, unhashedCompositeOrExcerptSources: Object.keys(patch.sources).length - hashed.length, distinctCachedContents: hashes.size });
  for (const hash of hashes) retainedHashes.add(hash);
}
const totals = (rows: typeof results) => ({ matchedSourceHashes: rows.reduce((sum, row) => sum + row.hashedSources, 0), retainedCaptureHashes: rows.reduce((sum, row) => sum + row.retainedCaptureHashes, 0), unhashedCompositeOrExcerptSources: rows.reduce((sum, row) => sum + row.unhashedCompositeOrExcerptSources, 0) });
console.log(JSON.stringify({ batches: results, passes: manifest.passes.map(pass => ({ id: pass.id, ...totals(results.filter(row => row.pass === pass.id)) })), ...totals(results) }, null, 2));
