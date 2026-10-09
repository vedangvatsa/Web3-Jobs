import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import countries from '../content/nomads/countries.json';
import { mergeGapPatches, serializeAudit, sha256, withdrawContradictions, type GapAssignments, type GapPatch } from './lib/passport-gap-patches';
import { capturePassInputs, validatePassManifest, type PassManifest } from './lib/passport-factcheck-artifacts';

const cache = '.cache/nomads/gap-pass3';
const root = 'content/nomads/factcheck-passes';
assert.ok(!fs.existsSync(`${root}/manifest.json`), 'Capture is one-time; review new passes through a new manifest entry');
const baseline = fs.readFileSync(`${cache}/baseline.json`, 'utf8');
assert.equal(sha256(baseline), '628d74004a53c4e3e18467e95a6051e23182bdffd858efc24cdde02b1268d31c');
assert.equal(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8'), baseline, 'Canonical baseline changed');
const assignments = JSON.parse(fs.readFileSync(`${cache}/assignments.json`, 'utf8')) as GapAssignments;
const patches = assignments.batches.map(batch => JSON.parse(fs.readFileSync(`${cache}/${batch.id}.json`, 'utf8')) as GapPatch);
const codes = countries.map(country => country.iso!);
const merged = mergeGapPatches(baseline, assignments, patches, codes);
const contradictions = [{ passport: 'IS', destination: 'SZ',
  reason: 'Integration review: Iceland ordinary-passport exemption in the prior Brussels source conflicts with the explicitly visa-required Iceland row in the newly inspected Ministry of Home Affairs 2025-labelled schedule. Neither a controlling replacement nor supersession is established. Withdraw the supported exemption pending reconciliation; do not fall back to the legacy or Passport Index answer.',
  sources: ['gap-12-sz-schedules', merged.data.policies.find(policy => policy.passports.includes('IS') && policy.destinations.includes('SZ'))!.s!],
}];
withdrawContradictions(merged.data, contradictions, codes, 'gap-pass3-integration');
const inputs = capturePassInputs(cache, root, 'gap-pass3', assignments.batches.map(batch => batch.id));
const manifest: PassManifest = { version: 1, baseline: inputs.baseline!, passes: [{ id: 'gap-pass3', baselineSha256: assignments.baselineSha256, assignments: inputs.assignments, patches: inputs.patches, contradictions }] };
validatePassManifest(manifest);
fs.writeFileSync(path.join(root, 'manifest.json'), serializeAudit(manifest));
console.log(merged.report);
