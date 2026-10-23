import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { LEDGER_PATH, RESEARCH_DIR, researchReport } from './news-research.mjs';

function auditDrafts(slugs, { cwd, day }) {
  const raw = execFileSync(process.execPath, ['--import', 'tsx', 'scripts/validate-news-drafts.ts', ...slugs], {
    cwd, encoding: 'utf8', env: { ...process.env, NEWS_DATE: day }, maxBuffer: 16 * 1024 * 1024,
  });
  const result = JSON.parse(raw);
  if (!Array.isArray(result.errors) || result.errors.some(error => typeof error !== 'string')) throw new Error('Invalid article-validation response');
  return result.errors;
}

const RECOVERY = `${RESEARCH_DIR}/recovery`;
const STAGING_MANIFEST = `${RECOVERY}/staging.json`;
const articlePath = /^content\/articles\/([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;
const imagePath = /^public\/images\/news\/([a-z0-9]+(?:-[a-z0-9]+)*)\.(jpg|jpeg|png|webp)$/;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

function checkedPath(cwd, relative, { directory = false } = {}) {
  const parts = relative.split('/');
  if (path.isAbsolute(relative) || /[\\\0\r\n]/.test(relative) || parts.some(part => !part || part === '.' || part === '..')) throw new Error(`Unsafe draft output path: ${relative}`);
  let absolute = cwd;
  for (const [index, part] of parts.entries()) {
    absolute = path.join(absolute, part);
    const stat = fs.lstatSync(absolute, { throwIfNoEntry: false });
    if (!stat) return undefined;
    if (stat.isSymbolicLink()) throw new Error(`Symlink in draft output: ${relative}`);
    if (!(index === parts.length - 1 && !directory ? stat.isFile() : stat.isDirectory())) throw new Error(`Non-regular draft output path: ${relative}`);
    if (stat.isFile() && stat.nlink !== 1) throw new Error(`Hard-linked draft output: ${relative}`);
  }
  return absolute;
}

function retainDrafts({ cwd, context, snapshots, pending, tracked, baseline, publishReadyBatch }) {
  const writes = new Map();
  const writable = relative => {
    if (tracked.has(relative) || baseline.has(relative)) throw new Error(`Recovery cannot overwrite a tracked file: ${relative}`);
    return checkedPath(cwd, relative);
  };
  const plan = (relative, bytes, immutable = false) => {
    const destination = writable(relative);
    if (destination) {
      const existing = fs.readFileSync(destination);
      if (existing.equals(bytes)) return;
      if (immutable) throw new Error(`Recovery archive differs from retained bytes: ${relative}`);
    }
    writes.set(relative, bytes);
  };
  let manifest;
  if (publishReadyBatch) {
    const file = writable(STAGING_MANIFEST);
    if (file) {
      manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (manifest.version !== 1 || manifest.day !== context.day || manifest.baseSha !== context.baseSha || !Array.isArray(manifest.files)) throw new Error('Invalid pending draft staging manifest');
      for (const entry of manifest.files) {
        if ((!articlePath.test(entry.path) && !imagePath.test(entry.path)) || !/^[a-f0-9]{64}$/.test(entry.sha256 || '')
          || entry.recoveryPath !== `${RECOVERY}/unapproved/${entry.sha256}/${entry.path}` || entry.status !== 'pending' || entry.approved !== false || entry.mustReview !== true) throw new Error('Invalid pending draft staging entry');
        const archive = checkedPath(cwd, entry.recoveryPath);
        if (!archive || digest(fs.readFileSync(archive)) !== entry.sha256) throw new Error(`Pending draft archive is missing or changed: ${entry.path}`);
      }
    }
  }
  for (const [file, bytes] of snapshots) plan(`${RECOVERY}/${file}`, bytes);
  if (pending.size) {
    manifest ||= { version: 1, day: context.day, baseSha: context.baseSha, files: [] };
    for (const [file, owner] of pending) {
      const bytes = snapshots.get(file), sha256 = digest(bytes);
      const recoveryPath = `${RECOVERY}/unapproved/${sha256}/${file}`;
      plan(recoveryPath, bytes, true);
      if (!manifest.files.some(entry => entry.path === file && entry.sha256 === sha256)) manifest.files.push({
        path: file, recoveryPath, sha256, bytes: bytes.length, articleSlug: owner.articleSlug, candidateId: owner.candidateId,
        status: 'pending', approved: false, mustReview: true, ownerRequired: !owner.candidateId,
        ...(owner.orphanImage ? { orphanImage: true } : {}),
      });
    }
    plan(STAGING_MANIFEST, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
  }
  const unchangedSources = () => {
    for (const [file, bytes] of snapshots) {
      const source = checkedPath(cwd, file);
      if (!source || !fs.readFileSync(source).equals(bytes)) throw new Error(`Draft changed during validation: ${file}`);
    }
  };
  unchangedSources();
  for (const [relative, bytes] of writes) {
    writable(relative);
    fs.mkdirSync(path.join(cwd, path.dirname(relative)), { recursive: true });
    checkedPath(cwd, path.dirname(relative), { directory: true });
    fs.writeFileSync(path.join(cwd, relative), bytes);
  }
  unchangedSources();
  for (const file of pending.keys()) fs.unlinkSync(path.join(cwd, file));
  return { quarantinedPaths: [...pending.keys()], stagingManifest: manifest ? STAGING_MANIFEST : null };
}

export function preserveUnpublishedNewsOutputs({ context, ledger, cwd = process.cwd() }) {
  if (!/^[a-f0-9]{40}$/.test(context.baseSha || '') || !fs.lstatSync(cwd).isDirectory()) throw new Error('Invalid news recovery checkout');
  cwd = fs.realpathSync(cwd);
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).split('\0').filter(Boolean);
  if (git(['rev-parse', 'HEAD'])[0].trim() !== context.baseSha) throw new Error('Cannot preserve after writer changed Git history');
  const marker = checkedPath(cwd, `${RESEARCH_DIR}/writer-state.json`);
  if (marker) {
    const state = JSON.parse(fs.readFileSync(marker, 'utf8'));
    if (state.day !== context.day || state.state !== 'stopped') throw new Error('Cannot preserve outputs while writer shutdown is unconfirmed');
  }
  const baseline = new Set(git(['ls-tree', '-r', '--name-only', '-z', context.baseSha]));
  const tracked = new Set(git(['ls-files', '-z']));
  const published = new Set(ledger.runs[context.day].baselineSlugs);
  for (const item of [...Object.values(ledger.candidates), ...Object.values(ledger.runs).flatMap(run => Object.values(run.outcomes))]) {
    if ((item.status === 'published' || item.publishedAt) && item.articleSlug) published.add(item.articleSlug);
  }
  const snapshots = new Map();
  for (const file of git(['ls-files', '--others', '--exclude-standard', '-z', '--', 'content/articles', 'public/images/news'])) {
    const match = file.match(articlePath) || file.match(imagePath);
    if (!match || baseline.has(file) || published.has(match[1])) continue;
    const source = checkedPath(cwd, file);
    if (source) snapshots.set(file, fs.readFileSync(source));
  }
  retainDrafts({ cwd, context, snapshots, pending: new Map(), tracked, baseline, publishReadyBatch: false });
  return { preservedPaths: [...snapshots.keys()], approved: false };
}

export function validateNewsDrafts({ context, ledger, cwd = process.cwd(), audit = auditDrafts, publishReadyBatch = false }) {
  const { day, baseSha } = context;
  if (!/^[a-f0-9]{40}$/.test(baseSha || '')) throw new Error('Validation requires the original checkout revision');
  if (!fs.lstatSync(cwd).isDirectory()) throw new Error('Validation requires a checkout directory, not a symlink');
  cwd = fs.realpathSync(cwd);
  const before = researchReport(ledger, day);
  const ready = before.outcomes.filter(item => item.status === 'ready');
  const readyOutputSlugs = new Set(ready.map(item => item.articleSlug));
  const draftPaths = [], validationErrors = [], fatalErrors = [];
  let audited = false, safeToPersist = false, quarantinedPaths = [], stagingManifest = null;
  const fatal = message => { validationErrors.push(message); fatalErrors.push(message); };
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  const gitPaths = args => git(args).split('\0').filter(Boolean);
  if (git(['rev-parse', 'HEAD']).trim() !== baseSha) fatal('The drafter changed Git history; CI owns publication');
  if (process.env.NEWS_DATE && process.env.NEWS_DATE !== day) fatal('Research day changed during publication');
  const baseline = new Set(gitPaths(['ls-tree', '-r', '--name-only', '-z', baseSha]));
  const tracked = new Set(gitPaths(['ls-files', '-z']));
  const publishedSlugs = new Set(ledger.runs[day].baselineSlugs);
  for (const item of [...Object.values(ledger.candidates), ...Object.values(ledger.runs).flatMap(run => Object.values(run.outcomes))]) {
    if ((item.status === 'published' || item.publishedAt) && item.articleSlug) publishedSlugs.add(item.articleSlug);
  }
  const published = file => baseline.has(file) || publishedSlugs.has((file.match(articlePath) || file.match(imagePath))?.[1]);
  const inspect = file => { try { return checkedPath(cwd, file); } catch (error) { fatal(error.message); } };
  const writerState = inspect(`${RESEARCH_DIR}/writer-state.json`);
  if (writerState) {
    try {
      const writer = JSON.parse(fs.readFileSync(writerState, 'utf8'));
      if (writer.version !== 1 || writer.day !== day || writer.state !== 'stopped'
        || !Number.isFinite(Date.parse(writer.startedAt)) || !Number.isFinite(Date.parse(writer.stoppedAt))
        || Date.parse(writer.stoppedAt) < Date.parse(writer.startedAt)) throw new Error('Writer shutdown is not confirmed');
    } catch { fatal('News writer shutdown is unconfirmed; publication is disabled until its tools have stopped'); }
  }
  for (const directory of ['content/articles', 'public/images/news', RECOVERY]) {
    try { checkedPath(cwd, directory, { directory: true }); } catch (error) { fatal(error.message); }
  }
  for (const item of ready) {
    const file = `content/articles/${item.articleSlug}.md`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)?$/.test(item.articleSlug || '')) {
      validationErrors.push(`Missing draft for ${item.title}`); continue;
    }
    if (published(file)) { fatal(`New reporting cannot overwrite a published file: ${file}`); continue; }
    const source = inspect(file);
    if (!source) { validationErrors.push(`Missing draft for ${item.title}`); continue; }
    draftPaths.push(file);
    try {
      const { data } = matter(fs.readFileSync(source, 'utf8'));
      const referencedImage = typeof data.image === 'string' && `public${data.image}`.match(imagePath);
      if (referencedImage) readyOutputSlugs.add(referencedImage[1]);
      if (typeof data.image === 'string' && new RegExp(`^/images/news/${item.articleSlug}\\.(jpg|jpeg|png|webp)$`).test(data.image) && inspect(`public${data.image}`)) {
        const image = `public${data.image}`;
        if (published(image)) fatal(`New reporting cannot overwrite a published file: ${image}`);
        else draftPaths.push(image);
      } else validationErrors.push(`Missing article-specific image: ${item.articleSlug}`);
    } catch (error) { validationErrors.push(`Invalid draft front matter: ${item.articleSlug}: ${error.message}`); }
  }
  const protectedChanges = gitPaths(['diff', '--no-renames', '--name-only', '-z', baseSha]).filter(file => ![LEDGER_PATH, 'content/news-tips.md', ...draftPaths].includes(file));
  for (const file of protectedChanges) fatal(`Drafter changed a protected or generated file: ${file}`);
  for (const file of [LEDGER_PATH, `${LEDGER_PATH}.${process.pid}.tmp`, 'content/news-tips.md',
    ...['current.json', 'validation.json', 'report.json', 'report.md', 'queue.json'].map(name => `${RESEARCH_DIR}/${name}`)]) inspect(file);
  const untracked = new Set(gitPaths(['ls-files', '--others', '--exclude-standard', '-z', '--', 'content/articles', 'public/images/news']));
  const changed = [...new Set([
    ...gitPaths(['diff', '--no-renames', '--name-only', '-z', baseSha, '--', 'content/articles', 'public/images/news']),
    ...(publishReadyBatch ? gitPaths(['ls-files', '--others', '-z', '--', 'content/articles', 'public/images/news']) : untracked),
  ])];
  const snapshots = new Map(), pending = new Map(), pendingSlugs = new Map();
  for (const file of [...new Set([...changed, ...draftPaths])]) {
    const source = inspect(file);
    if (!source) { fatal(`Drafter deleted an existing file: ${file}`); continue; }
    if (published(file)) { fatal(`New reporting cannot overwrite a published file: ${file}`); continue; }
    const bytes = fs.readFileSync(source);
    snapshots.set(file, bytes);
    if (draftPaths.includes(file)) continue;
    if (!publishReadyBatch) {
      if (file.startsWith('content/articles/')) validationErrors.push(`Draft has no ready review outcome: ${file}`);
      continue;
    }
    if (tracked.has(file) || !untracked.has(file)) { fatal(`Only untracked news outputs may be quarantined: ${file}`); continue; }
    const article = file.match(articlePath), image = file.match(imagePath);
    if (readyOutputSlugs.has((article || image)?.[1])) {
      validationErrors.push(`Unclaimed output for a ready article: ${file}`); continue;
    }
    if (article) {
      try {
        if (matter(bytes.toString('utf8')).data.category !== 'News') throw new Error('category must be News');
        const owners = ledger.runs[day].candidateIds.filter(id => ledger.candidates[id].articleSlug === article[1]);
        const owner = { articleSlug: article[1], candidateId: owners.length === 1 ? owners[0] : null };
        pending.set(file, owner); pendingSlugs.set(article[1], owner);
      } catch (error) { fatal(`Cannot quarantine an unapproved News draft: ${file}: ${error.message}`); }
    } else if (!image) fatal(`Unrelated file in news output: ${file}`);
  }
  if (publishReadyBatch) for (const file of changed) {
    if (draftPaths.includes(file)) continue;
    const image = file.match(imagePath);
    if (!image || readyOutputSlugs.has(image[1])) continue;
    if (untracked.has(file) && !tracked.has(file) && !published(file) && snapshots.has(file)) {
      const owners = ledger.runs[day].candidateIds.filter(id => ledger.candidates[id].articleSlug === image[1]);
      pending.set(file, pendingSlugs.get(image[1]) || {
        articleSlug: image[1], candidateId: owners.length === 1 ? owners[0] : null, orphanImage: true,
      });
    } else fatal(`Image is not a safe unpublished output: ${file}`);
  }
  if (!fatalErrors.length) {
    try {
      ({ quarantinedPaths, stagingManifest } = retainDrafts({ cwd, context, snapshots, pending, tracked, baseline, publishReadyBatch }));
      safeToPersist = true;
    }
    catch (error) { fatal(`Draft recovery could not finish: ${error.message}`); }
  }
  if (before.discoveryHealthy && (publishReadyBatch || before.counts.unreviewed === 0) && ready.length && !validationErrors.length) {
    try {
      const errors = audit(ready.map(item => item.articleSlug), { cwd, day });
      if (!Array.isArray(errors) || errors.some(error => typeof error !== 'string')) throw new Error('Invalid article-validation response');
      audited = true;
      validationErrors.push(...errors);
      fatalErrors.push(...errors.filter(error => error.startsWith('Typecheck failed;')));
    } catch (error) { fatal(`Article validation could not finish: ${error.message}`); }
  }
  const draftsValid = audited && ready.length > 0 && !validationErrors.length;
  return { before, ready, draftPaths: [...new Set(draftPaths)], validationErrors: [...new Set(validationErrors)], fatalErrors: [...new Set(fatalErrors)],
    audited, draftsValid, safeToPersist, publishReadyBatch, partialPublicationEligible: publishReadyBatch && draftsValid && before.counts.unreviewed > 0,
    quarantinedPaths, stagingManifest };
}
