import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { assertDailyContent, createDeployStateStore, dailyDeploymentDue, runDailyDeployment } from './lib/daily-deploy.mjs';

export function loadDailyContent(cwd = process.cwd()) {
  const json = file => JSON.parse(fs.readFileSync(path.join(cwd, file), 'utf8'));
  return {
    catalogs: json('content/catalog-refresh-state.json'), research: json('content/news-research.json'), jobs: json('content/jobs-runtime.json'),
    hasArticle: slug => { try { return fs.lstatSync(path.join(cwd, 'content/articles', `${slug}.md`)).isFile(); } catch { return false; } },
  };
}

async function main() {
  if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('Deployment CLI requires GitHub Actions');
  const [action] = process.argv.slice(2), date = process.env.DAILY_DEPLOY_DATE;
  const output = (key, value) => { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`); };
  if (action === 'plan' && !date && process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' && process.env.GITHUB_WORKFLOW === 'FAH fix secrets and deploy') {
    output('run', true); output('mode', 'manual'); return;
  }
  if (!date) throw new Error('Automatic deployment requires an explicit date');
  const store = createDeployStateStore({ token: process.env.GITHUB_TOKEN, repository: process.env.GITHUB_REPOSITORY });
  const { state } = await store.read();
  if (!dailyDeploymentDue(state, date)) { output('run', false); output('deployed', false); console.log(`The daily rollout for ${date} already succeeded.`); return; }
  const content = loadDailyContent();
  assertDailyContent({ date, ...content });
  if (action === 'plan') { output('run', true); output('mode', 'daily'); return; }
  if (action !== 'deploy') throw new Error('Unknown deployment command');
  const directory = '.cache/daily-deploy';
  fs.mkdirSync(directory, { recursive: true });
  const result = await runDailyDeployment({
    store, date, id: `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`,
    sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), content,
    token: process.env.FIREBASE_ACCESS_TOKEN,
    evidence: async (name, value) => { fs.writeFileSync(path.join(directory, `${name}.json`), JSON.stringify(value, null, 2) + '\n'); },
  });
  output('deployed', result.deployed);
  if (result.deployed && process.env.GITHUB_ENV) fs.appendFileSync(process.env.GITHUB_ENV, `DEPLOY_STARTED_AT=${result.startedAt}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
