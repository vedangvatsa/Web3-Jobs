#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import {
  loadManifest,
  refreshAllHashes,
  saveManifest,
} from './lib/prebuild-manifest';

const manifest = loadManifest();
refreshAllHashes(manifest);
saveManifest(manifest);
console.log(`[update-prebuild-input-hashes] Wrote ${Object.keys(manifest.steps).length} step hashes → content/prebuild-input-hashes.json`);
