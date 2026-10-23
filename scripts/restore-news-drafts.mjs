import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual, parseArgs } from 'node:util';
import matter from 'gray-matter';

const RESEARCH = '.cache/news-research';
const safeSlug = slug => typeof slug === 'string' && slug === slug.trim() && /^[a-z0-9]+(?:-[a-z0-9]+)?$/.test(slug);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const validDay = day => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && Number.isFinite(Date.parse(`${day}T00:00:00Z`)) && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;

function checkedRoot(directory) {
  if (!fs.lstatSync(directory).isDirectory()) throw new Error('Recovery root must be a directory, not a symlink');
  return fs.realpathSync(directory);
}

function checkedPath(root, relative, { directory = false, optional = false } = {}) {
  const parts = relative.split('/');
  if (path.isAbsolute(relative) || /[\\\0\r\n]/.test(relative) || parts.some(part => !part || part === '.' || part === '..')) throw new Error(`Unsafe recovery path: ${relative}`);
  let file = root;
  for (const [index, part] of parts.entries()) {
    file = path.join(file, part);
    const stat = fs.lstatSync(file, { throwIfNoEntry: false });
    if (!stat) {
      if (optional) return undefined;
      throw new Error(`Missing recovery file: ${relative}`);
    }
    if (stat.isSymbolicLink() || !(index === parts.length - 1 && !directory ? stat.isFile() : stat.isDirectory())) throw new Error(`Unsafe recovery path: ${relative}`);
    if (stat.isFile() && stat.nlink !== 1) throw new Error(`Hard-linked recovery file: ${relative}`);
  }
  return file;
}

function readJson(root, relative, optional = false) {
  const file = checkedPath(root, relative, { optional });
  return file ? JSON.parse(fs.readFileSync(file, 'utf8')) : undefined;
}

function readLedger(root) {
  const ledger = readJson(root, 'content/news-research.json', true);
  if (ledger !== undefined && (!object(ledger) || !object(ledger.candidates) || !object(ledger.runs))) throw new Error('Invalid recovery research ledger');
  return ledger;
}

function hasSourceChecks(record) {
  return Array.isArray(record.sourceChecks) && record.sourceChecks.length > 0 && record.sourceChecks.every(check => {
    if (!object(check) || !['read', 'blocked', 'unavailable'].includes(check.outcome)) return false;
    try { return ['https:', 'http:'].includes(new URL(check.url).protocol); }
    catch { return false; }
  });
}

function reviewHistory(references) {
  const history = new Map();
  for (const { source, record } of references) {
    const { previousReviews = [], ...review } = record;
    if (!Array.isArray(previousReviews)) throw new Error('Invalid recovery review history');
    for (const entry of [...previousReviews, { source, review }]) history.set(JSON.stringify(entry), entry);
  }
  return [...history.values()];
}

export { checkedRoot as checkedRecoveryRoot, checkedPath as checkedRecoveryPath };

export function reportReadyReview(report, id, articleSlug) {
  const outcomes = report.outcomes.filter(item => item.id === id);
  if (!outcomes.length || outcomes.some(item => item.status !== 'ready' || item.articleSlug !== articleSlug)) return undefined;
  const fields = ['id', 'articleSlug', 'link', 'status', 'reason', 'note', 'reviewedAt', 'sourceChecks'];
  const evidence = item => Object.fromEntries(fields.filter(key => Object.hasOwn(item, key)).map(key => [key, structuredClone(item[key])]));
  const review = evidence(outcomes[0]);
  if (outcomes.some(item => !isDeepStrictEqual(evidence(item), review))) throw new Error(`Conflicting current report reviews: ${id}`);
  return review;
}

export function restoreNewsDrafts({ artifact, cwd = process.cwd(), reportOnly = false, day, now = Date.now() }) {
  if (day !== undefined && !reportOnly) throw new Error('An explicit recovery date is only allowed in report-only mode');
  cwd = checkedRoot(cwd);
  const current = day === undefined ? readJson(cwd, `${RESEARCH}/current.json`) : { day };
  if (!validDay(current?.day) || (!reportOnly && current.day !== new Date(now).toISOString().slice(0, 10))) throw new Error('Recovery needs the actual current UTC news date');
  const root = checkedRoot(path.resolve(cwd, artifact));
  const reportBytes = fs.readFileSync(checkedPath(root, `${RESEARCH}/report.json`));
  const report = JSON.parse(reportBytes);
  const selection = checkedPath(cwd, `${RESEARCH}/recovery-selection.json`, { optional: true });
  const recoverySource = { artifact: root, reportSha256: createHash('sha256').update(reportBytes).digest('hex'),
    ...(selection ? { selectionSha256: createHash('sha256').update(fs.readFileSync(selection)).digest('hex') } : {}) };
  if (report.day !== current.day) throw new Error('Recovery belongs to a different news date; review it manually');
  if (!Array.isArray(report.outcomes) || report.outcomes.some(item => !object(item) || typeof item.id !== 'string')) throw new Error('Invalid recovery report outcomes');
  const ledger = readLedger(root), localLedger = readLedger(cwd);
  const previous = readJson(root, `${RESEARCH}/restored.json`, true);
  if (previous !== undefined && (!object(previous) || previous.day !== current.day || !Array.isArray(previous.drafts))) throw new Error('Invalid or different-day restored draft manifest');
  const run = ledger?.runs[current.day];
  if (run && (run.day !== current.day || !Array.isArray(run.candidateIds) || !object(run.outcomes))) throw new Error('Invalid recovery daily run');
  const dailyIds = new Set([...report.outcomes.map(item => item.id), ...(run?.candidateIds || [])]);
  const owners = new Map();
  const addOwner = (record, source) => {
    if (!object(record) || typeof record.id !== 'string' || !record.id || !safeSlug(record.articleSlug)) throw new Error('Unsafe recovery article slug or owner');
    const owner = owners.get(record.articleSlug) || { id: record.id, references: [] };
    if (owner.id !== record.id) throw new Error(`Conflicting recovery owners: ${record.articleSlug}`);
    owner.references.push({ source, record });
    owners.set(record.articleSlug, owner);
  };
  for (const item of report.outcomes) if (item.articleSlug !== undefined && !safeSlug(item.articleSlug)) throw new Error('Unsafe recovery article slug');
  for (const [id, item] of Object.entries(ledger?.candidates || {})) {
    if (!item.articleSlug || !dailyIds.has(id)) continue;
    if (item.draftProgress?.day === current.day) {
      const progress = item.draftProgress;
      if (progress.id !== id || progress.articleSlug !== item.articleSlug || progress.approved !== false || progress.mustReview !== true || !hasSourceChecks(progress)) throw new Error('Invalid unfinished draft checkpoint');
      addOwner(progress, 'draft-checkpoint');
    }
    const outcome = report.outcomes.find(entry => entry.id === id && entry.articleSlug === item.articleSlug) || run?.outcomes[id];
    if (item.lastReviewedDay === current.day || outcome?.articleSlug === item.articleSlug) {
      if (item.id !== id) throw new Error('Invalid recovery candidate owner');
      addOwner(item, 'ledger');
    }
  }
  for (const item of previous?.drafts || []) addOwner(item, 'restored');
  for (const [slug, owner] of owners) {
    const outcome = run?.outcomes[owner.id];
    if (outcome?.articleSlug === slug) {
      if (outcome.id !== undefined && outcome.id !== owner.id) throw new Error('Invalid recovery outcome owner');
      owner.references.unshift({ source: 'run', record: { ...outcome, id: owner.id } });
    }
    for (const item of report.outcomes.filter(item => item.id === owner.id && item.articleSlug === slug)) owner.references.unshift({ source: 'report', record: item });
  }
  const publishedSlugs = new Set(), publishedIds = new Set();
  for (const book of [ledger, localLedger]) {
    for (const slug of book?.runs[current.day]?.baselineSlugs || []) publishedSlugs.add(slug);
    for (const [id, item] of Object.entries(book?.candidates || {})) if (item.status === 'published' || item.publishedAt) {
      publishedIds.add(id);
      if (item.articleSlug) publishedSlugs.add(item.articleSlug);
    }
    for (const savedRun of Object.values(book?.runs || {})) for (const [id, item] of Object.entries(savedRun.outcomes || {})) if (item.status === 'published' || item.publishedAt) {
      publishedIds.add(id);
      if (item.articleSlug) publishedSlugs.add(item.articleSlug);
    }
  }
  for (const item of [...report.outcomes, ...(previous?.drafts || [])]) if (item.status === 'published' || item.publishedAt) {
    publishedIds.add(item.id);
    if (item.articleSlug) publishedSlugs.add(item.articleSlug);
  }
  let publishedFiles = new Set();
  if (current.baseSha !== undefined) {
    if (!/^[a-f0-9]{40}$/.test(current.baseSha)) throw new Error('Invalid recovery checkout revision');
    publishedFiles = new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', '-z', current.baseSha, '--', 'content/articles', 'public/images/news'], { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).split('\0').filter(Boolean));
  }
  const drafts = [], items = [], ignored = [], errors = [];
  const files = new Map();
  const recoveryDirectory = checkedPath(root, `${RESEARCH}/recovery/content/articles`, { directory: true, optional: true });
  for (const name of recoveryDirectory ? fs.readdirSync(recoveryDirectory).sort() : []) {
    if (name.endsWith('.md') && !owners.has(name.slice(0, -3))) ignored.push({ file: `content/articles/${name}`, reason: 'No current-day ledger or restored-manifest owner' });
  }
  for (const [articleSlug, owner] of owners) {
    const relative = `content/articles/${articleSlug}.md`;
    if (publishedSlugs.has(articleSlug) || publishedIds.has(owner.id) || publishedFiles.has(relative)) {
      ignored.push({ file: relative, reason: 'Already published or in the checkout baseline' });
      continue;
    }
    const ready = report.outcomes.some(item => item.id === owner.id && item.articleSlug === articleSlug && item.status === 'ready')
      || (run?.outcomes[owner.id]?.status === 'ready' && run.outcomes[owner.id].articleSlug === articleSlug);
    if (!ready && !checkedPath(root, `${RESEARCH}/recovery/${relative}`, { optional: true })) {
      ignored.push({ file: relative, reason: 'Owned draft is absent from this artifact and still needs research; no publication approval restored' });
      continue;
    }
    const entry = { id: owner.id, articleSlug, inherited: owner.references.some(ref => ref.source === 'restored'), status: 'unreviewed', mustReview: true, approved: false, files: [], errors: [] };
    items.push(entry);
    try {
      const reference = owner.references.find(ref => hasSourceChecks(ref.record));
      if (!reference) throw new Error('Owned draft has no recorded source checks');
      const draft = { ...reference.record, id: owner.id, articleSlug, status: 'unreviewed', previousStatus: reference.record.previousStatus || reference.record.status,
        mustReview: true, approved: false, inherited: entry.inherited, previousReviews: reviewHistory(owner.references) };
      delete draft.recoveryReview;
      const pending = new Map();
      const inspectFile = (relative, image = false) => {
        const source = checkedPath(root, `${RESEARCH}/recovery/${relative}`);
        const bytes = fs.readFileSync(source);
        const destination = checkedPath(cwd, relative, { optional: true });
        if (publishedFiles.has(relative)) throw new Error(`Recovery cannot reuse a published file: ${relative}`);
        if (destination && (!image || !fs.readFileSync(destination).equals(bytes))) throw new Error(`Recovery cannot overwrite ${relative}`);
        entry.files.push({ path: relative, sha256: createHash('sha256').update(bytes).digest('hex'), action: destination ? 'reuse-identical' : 'copy' });
        if (!destination) pending.set(relative, bytes);
        return bytes;
      };
      const bytes = inspectFile(relative);
      const text = bytes.toString('utf8');
      if (!/^\uFEFF?---(?:yaml)?[ \t]*\r?\n/.test(text)) throw new Error('Recovery draft needs YAML front matter');
      const { data } = matter(text);
      entry.publishedDate = data.publishedDate;
      entry.sourceChecks = draft.sourceChecks;
      draft.originalDate = entry.originalDate = data.publishedDate;
      draft.reviewReasons = entry.reviewReasons = [];
      if (data.category !== 'News') entry.errors.push('Recovery contains a non-news draft');
      if (!validDay(data.publishedDate) || data.publishedDate > current.day) entry.errors.push(`publishedDate must be a valid YYYY-MM-DD date on or before ${current.day}; recovery never redates drafts`);
      else if (data.publishedDate < current.day) draft.reviewReasons.push('publication-date-needs-review');
      if (typeof data.image !== 'string' || data.image !== data.image.trim() || !new RegExp(`^/images/news/${articleSlug}\\.(?:png|jpg|jpeg|webp)$`).test(data.image)) throw new Error('Recovery draft needs its matching article-specific local news image');
      inspectFile(`public${data.image}`, true);
      draft.sourceFiles = entry.sourceFiles = entry.files.map(({ path, sha256 }) => ({ path, sha256 }));
      const recoveryReview = reportReadyReview(report, owner.id, articleSlug);
      if (recoveryReview) draft.recoveryReview = entry.recoveryReview = recoveryReview;
      if (!entry.errors.length) {
        for (const [file, bytes] of pending) {
          if (files.has(file) && !files.get(file).equals(bytes)) throw new Error(`Conflicting recovery file: ${file}`);
          files.set(file, bytes);
        }
        drafts.push(draft);
      }
    } catch (error) { entry.errors.push(error.message); }
    entry.eligible = entry.errors.length === 0;
    errors.push(...entry.errors.map(message => ({ articleSlug, message })));
  }
  const manifest = `${RESEARCH}/restored.json`;
  try {
    if (checkedPath(cwd, manifest, { optional: true })) throw new Error(`Recovery cannot overwrite ${manifest}`);
  } catch (error) { errors.push({ message: error.message }); }
  if (reportOnly) return { day: current.day, reportOnly: true, recoverySource, ownedDrafts: items.length, drafts: drafts.length, files: files.size, items, ignored, errors };
  if (errors.length) throw new Error(`Recovery validation failed before copying: ${errors.map(error => `${error.articleSlug ? `${error.articleSlug}: ` : ''}${error.message}`).join('; ')}`);
  const writeExclusive = (relative, bytes) => {
    if (checkedPath(cwd, relative, { optional: true })) throw new Error(`Recovery cannot overwrite ${relative}`);
    fs.mkdirSync(path.join(cwd, path.dirname(relative)), { recursive: true });
    checkedPath(cwd, path.dirname(relative), { directory: true });
    fs.writeFileSync(path.join(cwd, relative), bytes, { flag: 'wx' });
  };
  for (const [relative, bytes] of files) writeExclusive(relative, bytes);
  writeExclusive(manifest, JSON.stringify({ day: current.day, mustReview: true, approved: false, recoverySource, drafts, ignored }, null, 2) + '\n');
  return { drafts: drafts.length, files: files.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { values } = parseArgs({ options: { artifact: { type: 'string', default: '.cache/news-research-restore' }, 'report-only': { type: 'boolean', default: false }, day: { type: 'string' } } });
    const result = restoreNewsDrafts({ artifact: values.artifact, reportOnly: values['report-only'], day: values.day });
    console.log(JSON.stringify(result, null, 2));
    if (result.errors?.length) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
