import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { readNewsArticles } from './news-discover.mjs';
import { currentRun, loadResearch, recordResearchBatch } from './news-research.mjs';
import { RESEARCH_DIR } from './lib/news-research.mjs';
import { checkNewsSourceReadiness } from './lib/news-source-readiness.mjs';

export const SOURCE_READINESS_FILES = {
  diagnostics: `${RESEARCH_DIR}/source-readiness.json`,
  reviews: `${RESEARCH_DIR}/source-readiness-reviews.json`,
};

function safeDirectory(cwd) {
  const root = fs.realpathSync(cwd);
  for (const relative of ['.cache', RESEARCH_DIR]) {
    const directory = path.join(root, relative);
    if (!fs.lstatSync(directory).isDirectory() || fs.realpathSync(directory) !== directory) throw new Error('Source readiness cache must be a real directory inside the repository');
  }
  return root;
}

function readOptional(cwd, relative) {
  try {
    const file = path.join(cwd, relative);
    if (!fs.lstatSync(file).isFile()) throw new Error(`Unsafe source readiness file: ${relative}`);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function writeJson(cwd, relative, value) {
  safeDirectory(cwd);
  const destination = path.join(cwd, relative), temporary = `${destination}.${randomUUID()}.tmp`;
  try {
    try { if (!fs.lstatSync(destination).isFile()) throw new Error(`Unsafe source readiness file: ${relative}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    fs.renameSync(temporary, destination);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

function snapshot(cwd) {
  return { current: currentRun(cwd), ledger: loadResearch(cwd),
    restored: readOptional(cwd, `${RESEARCH_DIR}/restored.json`), articles: readNewsArticles(cwd) };
}

export async function runNewsSourceReadiness({ cwd = process.cwd(), record = execFileSync, env = process.env, dryRun = false, ...options } = {}) {
  cwd = safeDirectory(cwd);
  const before = snapshot(cwd), { current, ledger, restored, articles } = before;
  const previous = readOptional(cwd, SOURCE_READINESS_FILES.diagnostics);
  const report = await checkNewsSourceReadiness({ ...options, ledger, day: current.day, articles, restored, previous });
  if (report.reviews.length) recordResearchBatch(ledger, current.day, report.reviews, articles);
  report.files = { ...SOURCE_READINESS_FILES };
  report.recording = dryRun ? 'dry-run' : report.reviews.length ? 'pending' : 'no-reviews';
  writeJson(cwd, SOURCE_READINESS_FILES.reviews, report.reviews);
  writeJson(cwd, SOURCE_READINESS_FILES.diagnostics, report);
  if (!dryRun && report.reviews.length) {
    if (JSON.stringify(snapshot(cwd)) !== JSON.stringify(before)) {
      report.recording = 'state-changed';
      writeJson(cwd, SOURCE_READINESS_FILES.diagnostics, report);
      throw new Error('Research context, ledger or drafts changed during source checks; no reviews were recorded. Rerun before starting a writer.');
    }
    try {
      await record(process.execPath, ['scripts/news-research.mjs', 'record-batch', `--reviews=${SOURCE_READINESS_FILES.reviews}`], {
        cwd, encoding: 'utf8', timeout: 120_000, maxBuffer: 2 * 1024 * 1024,
        env: { ...env, NEWS_DRY_RUN: 'true' },
      });
      report.recording = 'recorded';
    } catch (error) {
      report.recording = 'failed';
      writeJson(cwd, SOURCE_READINESS_FILES.diagnostics, report);
      throw new Error(`Source readiness record-batch failed; inspect ${SOURCE_READINESS_FILES.diagnostics}: ${error.message}`);
    }
    writeJson(cwd, SOURCE_READINESS_FILES.diagnostics, report);
  }
  return { day: report.day, counts: report.counts, recording: report.recording, files: report.files };
}

async function main() {
  const { values } = parseArgs({ options: {
    'dry-run': { type: 'boolean', default: false }, concurrency: { type: 'string' }, 'timeout-ms': { type: 'string' },
  } });
  console.log(JSON.stringify(await runNewsSourceReadiness({ dryRun: values['dry-run'],
    ...(values.concurrency !== undefined ? { concurrency: Number(values.concurrency) } : {}),
    ...(values['timeout-ms'] !== undefined ? { timeoutMs: Number(values['timeout-ms']) } : {}),
  }), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
