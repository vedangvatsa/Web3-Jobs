import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { isDeepStrictEqual, parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import { canonicalNewsUrl } from './news-discover.mjs';
import { LEDGER_PATH, RESEARCH_DIR, researchReport, reviewCandidate, validateLedger } from './lib/news-research.mjs';
import { checkedRecoveryPath, checkedRecoveryRoot, reportReadyReview } from './restore-news-drafts.mjs';

const RECOVERY = `${RESEARCH_DIR}/recovery`;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const slug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)?$/.test(value) && value === value.trim();
const id = value => typeof value === 'string' && Number.isSafeInteger(Number(value)) && Number(value) > 0 && String(Number(value)) === value;

function timestamp(value) {
  if (typeof value !== 'string' || value !== value.trim() || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) return NaN;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 19) === value.slice(0, 19) ? time : NaN;
}

function snapshots() {
  const files = new Map();
  const read = (root, relative, optional = false) => {
    const file = checkedRecoveryPath(root, relative, { optional });
    const bytes = file ? fs.readFileSync(file) : undefined;
    const stat = file ? fs.statSync(file) : undefined;
    files.set(path.join(root, relative), { root, relative, bytes, stat });
    return bytes;
  };
  const json = (root, relative, optional = false) => {
    const bytes = read(root, relative, optional);
    return bytes === undefined ? undefined : JSON.parse(bytes);
  };
  const unchanged = () => {
    for (const { root, relative, bytes, stat } of files.values()) {
      const file = checkedRecoveryPath(root, relative, { optional: bytes === undefined });
      if (bytes === undefined && file === undefined) continue;
      const current = file && fs.statSync(file);
      if (!bytes || !current || current.ino !== stat.ino || current.dev !== stat.dev || current.mtimeMs !== stat.mtimeMs
        || !fs.readFileSync(file).equals(bytes)) throw new Error(`Recovery input changed during validation: ${relative}`);
    }
  };
  return { read, json, unchanged };
}

function trustedSelection(journal, day, now, env) {
  const selected = journal?.selection;
  if (journal?.version !== 1 || journal.status !== 'selected' || journal.day !== day
    || journal.workflow !== '.github/workflows/refresh-jobs-cache.yml' || journal.branch !== 'main'
    || typeof journal.repository !== 'string' || journal.repository !== journal.repository.trim() || !/^[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9_.-]*$/i.test(journal.repository)
    || !id(journal.currentRunId) || !object(selected) || !id(selected.runId) || !id(selected.artifactId)
    || !Number.isSafeInteger(selected.runAttempt) || selected.runAttempt < 1
    || selected.artifactName !== `news-research-${selected.runId}-${selected.runAttempt}`
    || Number(selected.runId) >= Number(journal.currentRunId)
    || !['automatic', 'explicit'].includes(journal.mode)
    || (journal.mode === 'explicit' ? journal.requestedRunId !== selected.runId : journal.requestedRunId !== null)
    || !Array.isArray(journal.candidates) || !journal.candidates.some(item => item.runId === selected.runId && item.decision === 'selected')) {
    throw new Error('Reuse requires trusted selected recovery metadata for this run and day');
  }
  const checked = timestamp(journal.checkedAt), created = timestamp(selected.createdAt);
  if (![checked, created].every(Number.isFinite) || journal.checkedAt.slice(0, 10) !== day || selected.createdAt.slice(0, 10) !== day
    || created > checked || checked > now) throw new Error('Recovery selection has a wrong-day or future timestamp');
  if ((env.GITHUB_REPOSITORY && env.GITHUB_REPOSITORY.toLowerCase() !== journal.repository.toLowerCase())
    || (env.GITHUB_RUN_ID && env.GITHUB_RUN_ID !== String(journal.currentRunId))
    || (env.NEWS_RECOVERY_RUN && env.NEWS_RECOVERY_RUN !== String(selected.runId))) throw new Error('Recovery selection does not match the current environment');
  const { runId, runAttempt, artifactId, artifactName, createdAt } = selected;
  return { repository: journal.repository, runId, runAttempt, artifactId, artifactName, createdAt };
}

function assertUnpublishedOwner(book, review) {
  if (!book) return;
  const inspect = (candidateId, item) => {
    if ((candidateId === review.id || item.articleSlug === review.articleSlug) && (item.status === 'published' || item.publishedAt)) {
      throw new Error(`Already published: ${review.articleSlug}`);
    }
    if (candidateId !== review.id && item.articleSlug === review.articleSlug) throw new Error(`Another candidate owns this draft: ${review.articleSlug}`);
  };
  for (const [candidateId, item] of Object.entries(book.candidates)) inspect(candidateId, item);
  for (const run of Object.values(book.runs)) {
    if (run.baselineSlugs.includes(review.articleSlug) || run.publication?.articleSlugs?.includes(review.articleSlug)
      || run.publication?.publishedIds?.includes(review.id)) throw new Error(`Published or baseline draft: ${review.articleSlug}`);
    for (const [candidateId, outcome] of Object.entries(run.outcomes)) inspect(candidateId, outcome);
  }
}

export function reuseNewsReviews({ cwd = process.cwd(), artifact = '.cache/news-research-restore', reportOnly = false, now = Date.now(), env = process.env } = {}) {
  cwd = checkedRecoveryRoot(cwd);
  const artifactPath = path.resolve(cwd, artifact), relativeArtifact = path.relative(cwd, artifactPath);
  if (relativeArtifact && !relativeArtifact.startsWith(`..${path.sep}`) && relativeArtifact !== '..') checkedRecoveryPath(cwd, relativeArtifact, { directory: true });
  const root = checkedRecoveryRoot(artifactPath), inputs = snapshots();
  const context = inputs.json(cwd, `${RESEARCH_DIR}/current.json`);
  const day = context?.day;
  if (!Number.isFinite(now) || typeof day !== 'string' || day !== new Date(now).toISOString().slice(0, 10)
    || (env.NEWS_DATE && env.NEWS_DATE !== day)) throw new Error('Reuse needs the actual current prepared UTC news day');
  if (!/^[a-f0-9]{40}$/.test(context.baseSha || '')) throw new Error('Reuse requires the original checkout baseline revision');
  const ledger = validateLedger(inputs.json(cwd, LEDGER_PATH)), run = ledger.runs[day];
  if (!run || !['prepared', 'incomplete'].includes(run.status) || run.publication || run.completedAt || context.publishedSha) throw new Error('Reuse needs an open, unpublished daily research run');
  const selectionBytes = inputs.read(cwd, `${RESEARCH_DIR}/recovery-selection.json`);
  const selected = trustedSelection(JSON.parse(selectionBytes), day, now, env);
  const manifest = inputs.json(cwd, `${RESEARCH_DIR}/restored.json`);
  const reportBytes = inputs.read(root, `${RESEARCH_DIR}/report.json`), report = JSON.parse(reportBytes);
  if (manifest?.day !== day || manifest.approved !== false || manifest.mustReview !== true || !Array.isArray(manifest.drafts)
    || manifest.recoverySource?.artifact !== root || manifest.recoverySource.reportSha256 !== digest(reportBytes)
    || manifest.recoverySource.selectionSha256 !== digest(selectionBytes)) throw new Error('Restored evidence does not match the selected artifact, report and selection hashes');
  if (report?.day !== day || !Array.isArray(report.outcomes) || report.outcomes.some(item => !object(item) || !/^[a-f0-9]{20}$/.test(item.id || ''))
    || new Set(report.outcomes.map(item => item.id)).size !== report.outcomes.length) throw new Error('Invalid or wrong-day current artifact report');
  if (report.status === 'completed' || report.publicationComplete || report.publication || report.outcomes.some(item => item.status === 'published' || item.publishedAt)) {
    throw new Error('The source artifact already records a daily publication');
  }
  const sourceLedger = inputs.json(root, LEDGER_PATH, true);
  if (sourceLedger) {
    validateLedger(sourceLedger);
    if (sourceLedger.runs[day]?.status === 'completed' || sourceLedger.runs[day]?.publication) throw new Error('The source artifact daily run is closed');
  }
  const gitFiles = args => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).split('\0').filter(Boolean);
  const baseline = new Set(gitFiles(['ls-tree', '-r', '--name-only', '-z', context.baseSha, '--', 'content/articles', 'public/images/news']));
  const tracked = new Set(gitFiles(['ls-files', '-z', '--', 'content/articles', 'public/images/news']));
  const ids = new Set(), slugs = new Set(), skipped = [], reviews = [], articles = [];
  for (const draft of manifest.drafts) {
    if (!object(draft) || !/^[a-f0-9]{20}$/.test(draft.id || '') || !slug(draft.articleSlug) || ids.has(draft.id) || slugs.has(draft.articleSlug)) throw new Error('Invalid or conflicting restored draft owners');
    ids.add(draft.id); slugs.add(draft.articleSlug);
    if (draft.approved !== false || draft.mustReview !== true || draft.status !== 'unreviewed' || !Array.isArray(draft.reviewReasons)) throw new Error('Invalid unapproved restored draft flags');
    const review = reportReadyReview(report, draft.id, draft.articleSlug);
    if (!review) {
      skipped.push({ id: draft.id, articleSlug: draft.articleSlug, reason: 'No direct ready review in the current artifact report; inherited history is not eligible' });
      continue;
    }
    if (draft.originalDate !== day || draft.reviewReasons.length) {
      skipped.push({ id: draft.id, articleSlug: draft.articleSlug, reason: 'Publication date or review flags still need fresh review' });
      continue;
    }
    try {
      if (!isDeepStrictEqual(draft.recoveryReview, review)) throw new Error('Missing or changed direct current-report recoveryReview');
      const reviewed = timestamp(review.reviewedAt);
      if (!Number.isFinite(reviewed) || review.reviewedAt.slice(0, 10) !== day || reviewed > now || reviewed > timestamp(selected.createdAt)) throw new Error('Original reviewedAt must be actual same-day, non-future evidence recorded before artifact upload');
      const candidate = ledger.candidates[review.id], source = sourceLedger?.candidates[review.id];
      const canonicalURL = canonicalNewsUrl(review.link);
      if (!candidate || candidate.id !== review.id || !run.candidateIds.includes(review.id) || !canonicalURL || canonicalNewsUrl(candidate.link) !== canonicalURL
        || (sourceLedger && (!source || source.id !== review.id || canonicalNewsUrl(source.link) !== canonicalURL))) throw new Error('Candidate identity does not match the source id and canonical URL');
      assertUnpublishedOwner(ledger, review); assertUnpublishedOwner(sourceLedger, review);
      if (run.outcomes[review.id] || ['published', 'rejected'].includes(candidate.status) || candidate.mergedInto
        || (candidate.articleSlug && candidate.articleSlug !== review.articleSlug)) throw new Error('Candidate already has a current review or conflicting draft ownership');
      if (report.outcomes.some(item => item.id !== review.id && item.articleSlug === review.articleSlug)) throw new Error('Another current-report candidate owns this draft');
      if (!Array.isArray(draft.sourceFiles) || draft.sourceFiles.length !== 2 || new Set(draft.sourceFiles.map(file => file?.path)).size !== 2) throw new Error('Recovery needs exactly the immutable article and image hashes');
      const files = new Map();
      for (const file of draft.sourceFiles) {
        if (!object(file) || typeof file.path !== 'string' || (file.path !== `content/articles/${review.articleSlug}.md`
          && !new RegExp(`^public/images/news/${review.articleSlug}\\.(?:jpg|jpeg|png|webp)$`).test(file.path))
          || !/^[a-f0-9]{64}$/.test(file.sha256 || '')) throw new Error('Unsafe restored source file or hash');
        if (baseline.has(file.path) || tracked.has(file.path)) throw new Error(`Recovery file is tracked or in the checkout baseline: ${file.path}`);
        const bytes = inputs.read(cwd, file.path), original = inputs.read(root, `${RECOVERY}/${file.path}`);
        if (digest(bytes) !== file.sha256 || digest(original) !== file.sha256 || !bytes.equals(original)) throw new Error(`Restored file hash changed: ${file.path}`);
        files.set(file.path, bytes);
      }
      const text = files.get(`content/articles/${review.articleSlug}.md`)?.toString('utf8');
      if (!text || !/^\uFEFF?---(?:yaml)?[ \t]*\r?\n/.test(text)) throw new Error('Recovery draft needs YAML front matter');
      const { data } = matter(text);
      if (data.category !== 'News' || data.publishedDate !== day || typeof data.title !== 'string' || !data.title.trim()) throw new Error('Recovery needs a current-day News article with a title');
      if (typeof data.image !== 'string' || !new RegExp(`^/images/news/${review.articleSlug}\\.(?:jpg|jpeg|png|webp)$`).test(data.image)
        || !files.has(`public${data.image}`)) throw new Error('Recovery image does not match the article and immutable source files');
      articles.push({ slug: review.articleSlug, title: data.title });
      reviews.push({ ...review, reusedFrom: { ...selected, reportSha256: digest(reportBytes), selectionSha256: digest(selectionBytes),
        sourceFiles: structuredClone(draft.sourceFiles) } });
    } catch (error) { throw new Error(`Review ${draft.id} (${draft.articleSlug}): ${error.message}`); }
  }
  for (const item of report.outcomes) if (item.status === 'ready' && !manifest.drafts.some(draft => draft.id === item.id && draft.articleSlug === item.articleSlug)) {
    throw new Error(`Current ready review has no matching restored draft: ${item.id}`);
  }
  if (!reviews.length) throw new Error(`No eligible current-artifact same-day ready reviews to reuse; skipped ${skipped.length}: ${skipped.map(item => `${item.articleSlug}: ${item.reason}`).join('; ')}`);
  const next = structuredClone(ledger);
  for (const review of reviews) {
    try {
      const outcome = reviewCandidate(next, day, review, { articles, now: timestamp(review.reviewedAt) });
      outcome.reviewedAt = review.reviewedAt;
      outcome.reusedFrom = structuredClone(review.reusedFrom);
      Object.assign(next.candidates[review.id], { reviewedAt: outcome.reviewedAt, reusedFrom: structuredClone(outcome.reusedFrom) });
    } catch (error) { throw new Error(`Review ${review.id}: ${error.message}`); }
  }
  validateLedger(next);
  const result = researchReport(next, day);
  if (result.publicationComplete) throw new Error('Review reuse must not complete publication');
  inputs.unchanged();
  if (!reportOnly) {
    const temporary = `${LEDGER_PATH}.reuse-${randomUUID()}.tmp`;
    checkedRecoveryPath(cwd, 'content', { directory: true });
    fs.writeFileSync(path.join(cwd, temporary), JSON.stringify(next, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    try {
      inputs.unchanged();
      fs.renameSync(path.join(cwd, temporary), checkedRecoveryPath(cwd, LEDGER_PATH));
    } finally { fs.rmSync(path.join(cwd, temporary), { force: true }); }
  }
  return { day, reportOnly, eligible: reviews.length, reused: reportOnly ? 0 : reviews.length,
    candidateIds: reviews.map(review => review.id), articleSlugs: reviews.map(review => review.articleSlug), skipped,
    counts: (reportOnly ? researchReport(ledger, day) : result).counts, approved: false, publicationComplete: false,
    requiresValidation: true, requiredAudits: ['quality', 'source', 'image', 'date', 'duplicate', 'typecheck'], reusedFrom: selected };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { values } = parseArgs({ options: { artifact: { type: 'string', default: '.cache/news-research-restore' }, apply: { type: 'boolean', default: false } } });
    console.log(JSON.stringify(reuseNewsReviews({ artifact: values.artifact, reportOnly: !values.apply }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
