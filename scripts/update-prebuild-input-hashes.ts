#!/usr/bin/env tsx
import { parseArgs } from 'node:util';
import {
  loadManifest,
  recordCompletedSteps,
  saveManifest,
} from './lib/prebuild-manifest';

const { values } = parseArgs({ options: { step: { type: 'string', multiple: true } } });
const manifest = loadManifest();
recordCompletedSteps(manifest, values.step || []);
saveManifest(manifest);
console.log(`[update-prebuild-input-hashes] Recorded completed generators: ${values.step!.join(', ')}`);
