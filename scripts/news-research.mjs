import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { discoverNews, readNewsArticles } from './news-discover.mjs';
import { LEDGER_PATH, RESEARCH_DIR, addResearchCandidate, prepareResearch, readTips, researchReport, reportMarkdown, reviewCandidate, retryUnpublishedDrafts, validateLedger } from './lib/news-research.mjs';
import { pushNewsFiles } from './lib/news-publish.mjs';

export function loadResearch(cwd = process.cwd()) {
  return validateLedger(JSON.parse(fs.readFileSync(path.join(cwd, LEDGER_PATH), 'utf8')));
}
export function writeResearch(ledger, cwd = process.cwd()) {
  const file = path.join(cwd, LEDGER_PATH), temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(ledger, null, 2) + '\n');
  fs.renameSync(temporary, file);
}
export function writeReport(ledger, day, cwd = process.cwd()) {
  const report = researchReport(ledger, day), directory = path.join(cwd, RESEARCH_DIR);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(directory, 'report.md'), reportMarkdown(report));
  const queue = ledger.runs[day].candidateIds.filter(id => !ledger.runs[day].outcomes[id]).map(id => ledger.candidates[id]);
  fs.writeFileSync(path.join(directory, 'queue.json'), JSON.stringify({ day, remaining: queue.length, candidates: queue }, null, 2) + '\n');
  return report;
}
export function currentRun(cwd = process.cwd()) {
  return JSON.parse(fs.readFileSync(path.join(cwd, RESEARCH_DIR, 'current.json'), 'utf8'));
}
function checkpoint(current) {
  if (!current.persist || process.env.GITHUB_ACTIONS !== 'true' || process.env.NEWS_DRY_RUN === 'true') return;
  current.checkpointSha = pushNewsFiles({ baseSha: current.baseSha, expectedBaseSha: current.checkpointSha, files: [LEDGER_PATH], day: current.day, message: `news: checkpoint daily research for ${current.day} [skip ci]` });
  fs.writeFileSync(path.join(RESEARCH_DIR, 'current.json'), JSON.stringify(current, null, 2) + '\n');
}
function output(name, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    date: { type: 'string' }, id: { type: 'string' }, status: { type: 'string' }, reason: { type: 'string' }, note: { type: 'string' }, article: { type: 'string' }, duplicate: { type: 'string' },
    title: { type: 'string' }, link: { type: 'string' }, published: { type: 'string' }, source: { type: 'string' },
    read: { type: 'string', multiple: true }, blocked: { type: 'string', multiple: true }, unavailable: { type: 'string', multiple: true }, search: { type: 'string', multiple: true },
  } });
  const action = positionals[0], ledger = loadResearch();
  if (action === 'prepare') {
    const day = values.date || process.env.NEWS_DATE || new Date().toISOString().slice(0, 10);
    const baseSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    if (ledger.runs[day]?.status !== 'completed') {
      retryUnpublishedDrafts(ledger, day);
      const articles = readNewsArticles();
      const discovery = await discoverNews({ hours: 24, articles });
      prepareResearch({ ledger, discovery, articles, tips: readTips(fs.readFileSync('content/news-tips.md', 'utf8')), day });
      writeResearch(ledger);
    }
    fs.mkdirSync(RESEARCH_DIR, { recursive: true });
    const current = { day, baseSha, checkpointSha: baseSha, persist: process.env.GITHUB_ACTIONS === 'true' && process.env.NEWS_DRY_RUN !== 'true' };
    fs.writeFileSync(path.join(RESEARCH_DIR, 'current.json'), JSON.stringify(current, null, 2) + '\n');
    const report = writeReport(ledger, day);
    checkpoint(current);
    output('day', day); output('needs_writer', report.counts.unreviewed > 0);
    console.log(JSON.stringify({ day, candidates: report.candidates, remaining: report.counts.unreviewed, workingFeeds: report.feeds.filter(feed => feed.ok).length, totalFeeds: report.feeds.length, queue: `${RESEARCH_DIR}/queue.json` }, null, 2));
  } else if (action === 'add') {
    const current = currentRun();
    const id = addResearchCandidate(ledger, current.day, values);
    writeResearch(ledger); writeReport(ledger, current.day); checkpoint(current);
    console.log(JSON.stringify({ id }));
  } else if (action === 'record') {
    const current = currentRun(), { day } = current;
    const sourceChecks = ['read', 'blocked', 'unavailable'].flatMap(outcome => (values[outcome] || []).map(url => ({ url, outcome })));
    reviewCandidate(ledger, day, { id: values.id, status: values.status, reason: values.reason, note: values.note, articleSlug: values.article, duplicateOf: values.duplicate, sourceChecks, retrySearches: values.search }, { articles: readNewsArticles() });
    writeResearch(ledger);
    console.log(JSON.stringify(writeReport(ledger, day).counts));
    checkpoint(current);
  } else if (action === 'queue') {
    const { day } = currentRun(); writeReport(ledger, day);
    console.log(fs.readFileSync(path.join(RESEARCH_DIR, 'queue.json'), 'utf8'));
  } else if (action === 'report') {
    const { day } = currentRun(); console.log(reportMarkdown(writeReport(ledger, day)));
  } else throw new Error('Use prepare, add, queue, record or report');
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
