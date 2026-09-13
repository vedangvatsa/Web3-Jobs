import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'ingest-workday-coindesk.ts');
const result = spawnSync('npx', ['tsx', scriptPath], { stdio: 'inherit' });

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
