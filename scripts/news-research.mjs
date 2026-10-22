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
  fs.writeFileSync(path.join(directory, 'queue.json'), JSON.stringify({ day, remaining: queue.length, publicationComplete: report.publicationComplete, candidates: queue }, null, 2) + '\n');
  return report;
}
export function currentRun(cwd = process.cwd()) {
  return JSON.parse(fs.readFileSync(path.join(cwd, RESEARCH_DIR, 'current.json'), 'utf8'));
}

export function assignedResearchQueue(ledger, day, assignment) {
  if (assignment?.day !== day || !Array.isArray(assignment.candidates)) throw new Error('Research assignment does not match the current day');
  const run = ledger.runs[day], ids = assignment.candidates.map(candidate => candidate.id);
  if (new Set(ids).size !== ids.length || ids.some(id => !run?.candidateIds.includes(id))) throw new Error('Invalid assigned research candidates');
  const candidates = ids.filter(id => !run.outcomes[id]).map(id => ledger.candidates[id]);
  return { day, remaining: candidates.length, candidates };
}

export function recordResearchBatch(ledger, day, reviews, articles) {
  if (!Array.isArray(reviews) || !reviews.length) throw new Error('Provide a non-empty JSON array of review outcomes');
  const next = structuredClone(ledger);
  for (const review of reviews) {
    try { reviewCandidate(next, day, review, { articles }); }
    catch (error) { throw new Error(`Review ${review?.id || '(missing id)'}: ${error.message}`); }
  }
  return next;
}

export async function prepareDailyResearch({ ledger, day, articles, tips = [], discover = () => discoverNews({ hours: 24, articles }), now = Date.now() }) {
  if (ledger.runs[day]?.status === 'completed' || ledger.runs[day]?.publication) return researchReport(ledger, day);
  const resume = ledger.runs[day]?.discovery?.feeds?.some(feed => feed.ok) === true;
  retryUnpublishedDrafts(ledger, day);
  const discovery = resume ? { ...ledger.runs[day].discovery, candidates: [] } : await discover();
  return prepareResearch({ ledger, discovery, articles, tips, day, now, preserveDiscovery: resume });
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
    reviews: { type: 'string' }, assigned: { type: 'boolean', default: false },
  } });
  const action = positionals[0], ledger = loadResearch();
  if (action === 'prepare') {
    const day = values.date || process.env.NEWS_DATE || new Date().toISOString().slice(0, 10);
    const baseSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const alreadyPublished = ledger.runs[day] && researchReport(ledger, day).publicationComplete;
    if (!alreadyPublished) {
      const articles = readNewsArticles();
      await prepareDailyResearch({ ledger, articles, tips: readTips(fs.readFileSync('content/news-tips.md', 'utf8')), day });
      writeResearch(ledger);
    }
    fs.mkdirSync(RESEARCH_DIR, { recursive: true });
    const previous = alreadyPublished && fs.existsSync(path.join(RESEARCH_DIR, 'current.json')) ? currentRun() : undefined;
    const current = { day, baseSha, checkpointSha: baseSha, persist: process.env.GITHUB_ACTIONS === 'true' && process.env.NEWS_DRY_RUN !== 'true',
      ...(previous?.day === day && previous.baseSha === baseSha && previous.publishedSha ? { checkpointSha: previous.publishedSha, publishedSha: previous.publishedSha } : {}) };
    fs.writeFileSync(path.join(RESEARCH_DIR, 'current.json'), JSON.stringify(current, null, 2) + '\n');
    const report = writeReport(ledger, day);
    if (!report.publicationComplete) checkpoint(current);
    output('day', day); output('needs_writer', !report.publicationComplete && report.counts.unreviewed > 0);
    console.log(JSON.stringify({ day, candidates: report.candidates, remaining: report.counts.unreviewed, publicationComplete: report.publicationComplete, coverageComplete: report.complete,
      workingFeeds: report.feeds.filter(feed => feed.ok).length, totalFeeds: report.feeds.length, queue: `${RESEARCH_DIR}/queue.json` }, null, 2));
  } else if (action === 'add') {
    const current = currentRun();
    const id = addResearchCandidate(ledger, current.day, values);
    writeResearch(ledger); writeReport(ledger, current.day); checkpoint(current);
    console.log(JSON.stringify({ id }));
  } else if (action === 'record-batch') {
    if (!values.reviews) throw new Error('Use record-batch --reviews=.cache/news-research/reviews.json');
    const current = currentRun();
    const next = recordResearchBatch(ledger, current.day, JSON.parse(fs.readFileSync(values.reviews, 'utf8')), readNewsArticles());
    writeResearch(next);
    console.log(JSON.stringify(writeReport(next, current.day).counts));
    checkpoint(current);
  } else if (action === 'record') {
    const current = currentRun(), { day } = current;
    const sourceChecks = ['read', 'blocked', 'unavailable'].flatMap(outcome => (values[outcome] || []).map(url => ({ url, outcome })));
    reviewCandidate(ledger, day, { id: values.id, status: values.status, reason: values.reason, note: values.note, articleSlug: values.article, duplicateOf: values.duplicate, sourceChecks, retrySearches: values.search }, { articles: readNewsArticles() });
    writeResearch(ledger);
    console.log(JSON.stringify(writeReport(ledger, day).counts));
    checkpoint(current);
  } else if (action === 'queue') {
    const { day } = currentRun(); writeReport(ledger, day);
    console.log(values.assigned
      ? JSON.stringify(assignedResearchQueue(ledger, day, JSON.parse(fs.readFileSync(path.join(RESEARCH_DIR, 'assignment.json'), 'utf8'))), null, 2)
      : fs.readFileSync(path.join(RESEARCH_DIR, 'queue.json'), 'utf8'));
  } else if (action === 'report') {
    const { day } = currentRun(); console.log(reportMarkdown(writeReport(ledger, day)));
  } else throw new Error('Use prepare, add, queue, record, record-batch or report');
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
