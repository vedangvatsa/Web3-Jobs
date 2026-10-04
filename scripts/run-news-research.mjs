import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { currentRun, loadResearch, writeReport } from './news-research.mjs';
import { researchReport } from './lib/news-research.mjs';

export async function runResearchRounds({ remaining, reviewed = () => 0, write, log = console.log, idleLimit = 2 }) {
  let idle = 0;
  for (let round = 1; ; round++) {
    const before = remaining(), reviewedBefore = reviewed();
    if (before === 0) return;
    log(`Research round ${round}: ${before} candidates still need outcomes.`);
    try { await write(round); } catch { log('Writer stopped; checking its persisted research progress.'); }
    const after = remaining();
    if (after === 0) return;
    idle = after < before || reviewed() > reviewedBefore ? 0 : idle + 1;
    if (idle >= idleLimit) throw new Error(`${after} candidates remain unreviewed after ${idle} attempts without progress`);
  }
}

async function main() {
  const { day } = currentRun();
  const brief = fs.readFileSync('scripts/news-agent-brief.md', 'utf8').replaceAll('$TODAY', day).replaceAll('$DRY_RUN', process.env.NEWS_DRY_RUN || 'false');
  const binary = process.env.OPENCODE_BIN || path.join(os.homedir(), '.opencode/bin/opencode');
  await runResearchRounds({
    remaining: () => writeReport(loadResearch(), day).counts.unreviewed,
    reviewed: () => { const report = researchReport(loadResearch(), day); return report.candidates - report.counts.unreviewed; },
    write: round => {
      const prompt = `This is research round ${round} of the single daily batch. Read the current queue; earlier rounds may already have completed some candidates. Continue every remaining candidate. Apply the no-slop rules during writing. Do not ask interactive questions: record specific source blockers for retry. Do not launch the site, signal processes, edit existing articles, commit or push. CI owns publication.\n\n${brief}`;
      execFileSync(binary, ['run', '--model', process.env.NEWS_MODEL || 'opencode/muse-spark-1.3-contributor-free', prompt], { stdio: 'inherit' });
    },
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
