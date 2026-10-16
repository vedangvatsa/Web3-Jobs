import * as fs from 'fs';
import * as path from 'path';
import { hashPaths, outputsReady } from './hash-files';
import { PREBUILD_DATA_STEPS, SITEMAP_STEP, type PrebuildStep } from './prebuild-steps';
import { publicRootFiles } from './public-page-files';
import { hasExpiredPassportArtifacts } from './passport-artifact-expiry';

const ROOT = process.cwd();
export const MANIFEST_PATH = path.join(ROOT, 'content', 'prebuild-input-hashes.json');

export type HashManifest = {
  version: 1;
  steps: Record<string, { inputHash: string }>;
};

export function loadManifest(): HashManifest {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as HashManifest;
  } catch {
    return { version: 1, steps: {} };
  }
}

export function saveManifest(manifest: HashManifest): void {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

export function stepInputHash(step: PrebuildStep, root = ROOT): string {
  return hashPaths(root, [...step.inputs, ...(step.id === 'slug-types' ? publicRootFiles(root) : [])]);
}

export function shouldRunStep(
  step: PrebuildStep,
  manifest: HashManifest,
  fast: boolean,
  dirtyOutputs?: Set<string>,
  root = ROOT,
  today = new Date().toISOString().slice(0, 10),
): boolean {
  const current = stepInputHash(step, root);
  const stored = manifest.steps[step.id]?.inputHash;
  const ready = outputsReady(root, step.outputs);
  const upstreamChanged = dirtyOutputs
    ? step.inputs.some((input) => dirtyOutputs.has(input))
    : false;

  if (step.id === 'nomad-catalogs' && ready && hasExpiredPassportArtifacts(step.outputs, root, today)) {
    console.log('[prebuild-data] nomad-catalogs: passport exemption expired → run');
    return true;
  }

  if (fast) {
    if (ready && !upstreamChanged && stored === current) {
      console.log(`[prebuild-data] ${step.id}: outputs present → skip (FAH_FAST)`);
      return false;
    }
    const reason = upstreamChanged ? 'upstream outputs changed' : !ready ? 'missing outputs' : 'input hash changed';
    console.log(`[prebuild-data] ${step.id}: ${reason} → run (FAH_FAST)`);
    return true;
  }

  if (!ready) {
    console.log(`[prebuild-data] ${step.id}: missing outputs → run`);
    return true;
  }
  if (stored !== current) {
    console.log(`[prebuild-data] ${step.id}: input hash changed → run`);
    return true;
  }
  console.log(`[prebuild-data] ${step.id}: up to date → skip`);
  return false;
}

export function recordStep(manifest: HashManifest, step: PrebuildStep, root = ROOT): void {
  if (!outputsReady(root, step.outputs)) throw new Error(`Cannot record ${step.id}: generated outputs are missing`);
  manifest.steps[step.id] = { inputHash: stepInputHash(step, root) };
}

/** An ingestion job can acknowledge only the generators it actually ran. */
export function recordCompletedSteps(manifest: HashManifest, ids: string[], root = ROOT): void {
  if (!ids.length || new Set(ids).size !== ids.length) throw new Error('Pass each completed generator once with --step=<id>');
  const steps = ids.map(id => {
    const step = [...PREBUILD_DATA_STEPS, SITEMAP_STEP].find(item => item.id === id);
    if (!step) throw new Error(`Unknown prebuild step: ${id}`);
    if (!outputsReady(root, step.outputs)) throw new Error(`Cannot record ${id}: generated outputs are missing`);
    return step;
  });
  for (const step of steps) recordStep(manifest, step, root);
}
