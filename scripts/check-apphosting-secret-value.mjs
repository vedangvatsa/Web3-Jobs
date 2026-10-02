import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const run = promisify(execFile);

async function readAccessToken() {
  const { stdout } = await run('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8', timeout: 15_000, maxBuffer: 1024 * 1024 });
  return stdout.trim();
}

export async function isSecretValueUnchanged({ projectId, name, value }, { token = readAccessToken, request = fetch } = {}) {
  if (typeof projectId !== 'string' || typeof name !== 'string' || !/^[a-zA-Z0-9-]+$/.test(projectId) || !/^[a-zA-Z0-9_-]+$/.test(name) || !Buffer.isBuffer(value) || !value.length) return false;
  try {
    const accessToken = await token();
    if (!accessToken) return false;
    const response = await request(`https://secretmanager.googleapis.com/v1/projects/${projectId}/secrets/${name}/versions/latest:access`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return false;
    const result = await response.json();
    const encoded = result?.payload?.data;
    if (typeof encoded !== 'string') return false;
    const current = Buffer.from(encoded, 'base64');
    if (current.toString('base64') !== encoded) return false;
    return current.equals(value);
  } catch {
    return false;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  const [projectId, name] = process.argv.slice(2);
  try {
    const unchanged = await isSecretValueUnchanged({ projectId, name, value: fs.readFileSync(0) });
    process.exitCode = unchanged ? 0 : 1;
  } catch {
    process.exitCode = 1;
  }
}
