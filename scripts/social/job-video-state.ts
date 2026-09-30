import fs from 'node:fs/promises';
import type {Ledger} from './job-video-core.ts';
const file = 'scripts/social/job-video-state.json';
const repository = 'vedangvatsa/Web3-Jobs';
let sha: string | undefined;
async function github(method: string, body?: unknown) {
  const response = await fetch(`https://api.github.com/repos/${repository}/contents/${file}`, {method, headers: {Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json'}, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`Video ledger ${method} failed — HTTP ${response.status}`);
  return await response.json() as unknown;
}
export async function loadState(remote: boolean): Promise<Ledger> {
  if (remote) {
    const response = await github('GET') as unknown as {sha: string; content: string};
    sha = response.sha;
    const state = JSON.parse(Buffer.from(response.content, 'base64').toString()) as Ledger;
    await fs.writeFile(file, JSON.stringify(state, null, 2) + '\n');
    return state;
  }
  return JSON.parse(await fs.readFile(file, 'utf8')) as Ledger;
}
export async function saveState(state: Ledger, remote: boolean): Promise<void> {
  const content = JSON.stringify(state, null, 2) + '\n';
  await fs.writeFile(file, content);
  if (!remote) return;
  const response = await github('PUT', {message: 'chore(social): persist job video receipts [skip ci]', branch: 'main', sha, content: Buffer.from(content).toString('base64')}) as unknown as {content: {sha: string}};
  sha = response.content.sha;
}
