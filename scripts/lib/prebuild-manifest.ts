import * as fs from 'fs';
import * as path from 'path';
import { hashPaths, outputsReady } from './hash-files';
import { PREBUILD_DATA_STEPS, SITEMAP_STEP, type PrebuildStep } from './prebuild-steps';

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

export function stepInputHash(step: PrebuildStep): string {
  return hashPaths(ROOT, step.inputs);
}

export function shouldRunStep(step: PrebuildStep, manifest: HashManifest, fast: boolean): boolean {
  const current = stepInputHash(step);
  const stored = manifest.steps[step.id]?.inputHash;
  const ready = outputsReady(ROOT, step.outputs);

  if (fast) {
    if (ready) {
      console.log(`[prebuild-data] ${step.id}: outputs present → skip (FAH_FAST)`);
      return false;
    }
    console.log(`[prebuild-data] ${step.id}: missing outputs → run (FAH_FAST)`);
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

export function recordStep(manifest: HashManifest, step: PrebuildStep): void {
  manifest.steps[step.id] = { inputHash: stepInputHash(step) };
}

/** Refresh stored input hashes for all steps (after ingest). Does not run generators. */
export function refreshAllHashes(manifest: HashManifest): void {
  for (const step of [...PREBUILD_DATA_STEPS, SITEMAP_STEP]) {
    if (outputsReady(ROOT, step.outputs)) {
      recordStep(manifest, step);
    }
  }
}
