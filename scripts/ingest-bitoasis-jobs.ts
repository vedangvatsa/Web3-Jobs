#!/usr/bin/env tsx
/**
 * BitOasis job ingestion.
 * Standardized to delegate to generic Keka ATS board ingestion.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const kekaScript = path.join(__dirname, 'ingest-keka-board.ts');
execFileSync('npx', ['tsx', kekaScript, 'dcx', 'BitOasis'], {
  stdio: 'inherit',
  cwd: process.cwd(),
});
