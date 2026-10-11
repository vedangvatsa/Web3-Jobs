import fs from 'node:fs';
import path from 'node:path';
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

export function validateNewsDrafts({ context, ledger, cwd = process.cwd(), audit = auditDrafts }) {
  const { day, baseSha } = context;
  if (!/^[a-f0-9]{40}$/.test(baseSha || '')) throw new Error('Validation requires the original checkout revision');
  const before = researchReport(ledger, day);
  const ready = before.outcomes.filter(item => item.status === 'ready');
  const draftPaths = [], validationErrors = [], fatalErrors = [];
  const fatal = message => { validationErrors.push(message); fatalErrors.push(message); };
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  const gitPaths = args => git(args).split('\0').filter(Boolean);
  if (git(['rev-parse', 'HEAD']).trim() !== baseSha) fatal('The drafter changed Git history; CI owns publication');
  const existing = new Set(gitPaths(['ls-tree', '-r', '--name-only', '-z', baseSha, '--', 'content/articles', 'public/images/news']));
  for (const item of ready) {
    const file = `content/articles/${item.articleSlug}.md`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)?$/.test(item.articleSlug || '') || !fs.existsSync(path.join(cwd, file))) {
      validationErrors.push(`Missing draft for ${item.title}`); continue;
    }
    if (existing.has(file)) { fatal(`New reporting cannot overwrite a published file: ${file}`); continue; }
    if (fs.lstatSync(path.join(cwd, file)).isSymbolicLink()) { fatal(`Symlink in draft output: ${file}`); continue; }
    draftPaths.push(file);
    try {
      const { data } = matter(fs.readFileSync(path.join(cwd, file), 'utf8'));
      if (typeof data.image === 'string' && new RegExp(`^/images/news/${item.articleSlug}\\.(jpg|jpeg|png|webp)$`).test(data.image) && fs.existsSync(path.join(cwd, `public${data.image}`))) {
        const image = `public${data.image}`;
        if (existing.has(image)) fatal(`New reporting cannot overwrite a published file: ${image}`);
        else draftPaths.push(image);
      } else validationErrors.push(`Missing article-specific image: ${item.articleSlug}`);
    } catch (error) { validationErrors.push(`Invalid draft front matter: ${item.articleSlug}: ${error.message}`); }
  }
  const protectedChanges = gitPaths(['diff', '--name-only', '-z', baseSha]).filter(file => ![LEDGER_PATH, 'content/news-tips.md', ...draftPaths].includes(file));
  for (const file of protectedChanges) fatal(`Drafter changed a protected or generated file: ${file}`);
  const changed = [...new Set([
    ...gitPaths(['diff', '--name-only', '-z', baseSha, '--', 'content/articles', 'public/images/news']),
    ...gitPaths(['ls-files', '--others', '--exclude-standard', '-z', '--', 'content/articles', 'public/images/news']),
  ])];
  for (const file of [...new Set([...changed, ...draftPaths])]) {
    const source = path.join(cwd, file);
    if (!fs.existsSync(source)) { fatal(`Drafter deleted an existing file: ${file}`); continue; }
    if (fs.lstatSync(source).isSymbolicLink()) { fatal(`Symlink in draft output: ${file}`); continue; }
    const target = path.join(cwd, RESEARCH_DIR, 'recovery', file);
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(source, target);
    if (file.startsWith('content/articles/') && !draftPaths.includes(file)) validationErrors.push(`Draft has no ready review outcome: ${file}`);
  }
  if (before.discoveryHealthy && before.counts.unreviewed === 0 && ready.length && !validationErrors.length) {
    try {
      const errors = audit(ready.map(item => item.articleSlug), { cwd, day });
      if (!Array.isArray(errors) || errors.some(error => typeof error !== 'string')) throw new Error('Invalid article-validation response');
      validationErrors.push(...errors);
      fatalErrors.push(...errors.filter(error => error.startsWith('Typecheck failed;')));
    } catch (error) { fatal(`Article validation could not finish: ${error.message}`); }
  }
  if (process.env.NEWS_DATE && process.env.NEWS_DATE !== day) fatal('Research day changed during publication');
  return { before, ready, draftPaths: [...new Set(draftPaths)], validationErrors: [...new Set(validationErrors)], fatalErrors: [...new Set(fatalErrors)] };
}
