/**
 * Re-run slug assignment on content/jobs-cache.json (preserves slugs by posting identity).
 *
 * Usage: npx tsx scripts/rebake-job-slugs.ts
 */
import { execSync } from 'child_process';
import path from 'path';

execSync('npx tsx scripts/assign-job-slugs.ts', {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});
