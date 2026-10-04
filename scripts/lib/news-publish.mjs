import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export function allowedNewsPath(file) {
  return file === 'content/news-research.json' || file === 'content/news-tips.md'
    || /^content\/articles\/[a-z0-9]+(?:-[a-z0-9]+)?\.md$/.test(file)
    || /^public\/images\/news\/[a-z0-9]+(?:-[a-z0-9]+)?\.(jpg|jpeg|png|webp)$/.test(file);
}

export function pushNewsFiles({ cwd = process.cwd(), baseSha, expectedBaseSha = baseSha, files, day, message = `news: publish reviewed daily batch for ${day}`, attempts = 4 }) {
  if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('Live news publishing requires GitHub Actions; use --dry-run locally');
  if (!/^[a-f0-9]{40}$/.test(baseSha) || !/^[a-f0-9]{40}$/.test(expectedBaseSha) || !files.length || files.some(file => !allowedNewsPath(file))) throw new Error('Invalid news publication paths or base revision');
  const git = (args, options = {}) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024, ...options }).trim();
  if (git(['rev-parse', 'HEAD']) !== baseSha) throw new Error('The drafter changed Git history; CI owns publication');
  const cache = path.join(cwd, '.cache'); fs.mkdirSync(cache, { recursive: true });
  const temporary = fs.mkdtempSync(path.join(cache, 'news-publish-'));
  const env = { ...process.env, GIT_INDEX_FILE: path.join(temporary, 'index'), GIT_AUTHOR_NAME: 'github-actions[bot]', GIT_AUTHOR_EMAIL: '41898282+github-actions[bot]@users.noreply.github.com', GIT_COMMITTER_NAME: 'github-actions[bot]', GIT_COMMITTER_EMAIL: '41898282+github-actions[bot]@users.noreply.github.com' };
  const blobAt = (ref, file) => { try { return git(['rev-parse', '--verify', `${ref}:${file}`]); } catch { return null; } };
  try {
    const blobs = files.map(file => {
      const absolute = path.join(cwd, file), base = blobAt(expectedBaseSha, file);
      if (fs.lstatSync(absolute).isSymbolicLink()) throw new Error(`Refusing a symlink in news output: ${file}`);
      if (base && (file.startsWith('content/articles/') || file.startsWith('public/images/news/'))) throw new Error(`New reporting cannot overwrite a published file: ${file}`);
      return { file, base, blob: git(['hash-object', '-w', '--stdin'], { input: fs.readFileSync(absolute) }) };
    });
    for (let attempt = 1; attempt <= attempts; attempt++) {
      git(['fetch', 'origin', 'main']);
      const remote = git(['rev-parse', 'FETCH_HEAD']);
      const reserved = new Set();
      for (const registry of ['content/slug-types.json', 'content/legacy-slugs-archive.json', 'content/event-slug-history.json']) {
        const data = JSON.parse(git(['show', `${remote}:${registry}`]));
        if (registry.includes('slug-types')) for (const values of Object.values(data)) if (Array.isArray(values)) for (const slug of values) reserved.add(slug);
        if (registry.includes('legacy-slugs')) for (const slug of Object.keys(data)) reserved.add(slug);
        if (registry.includes('event-slug-history')) for (const event of Object.values(data)) { if (event.slug) reserved.add(event.slug); for (const alias of event.aliases || []) reserved.add(alias); }
      }
      for (const entry of blobs.filter(entry => entry.file.startsWith('content/articles/'))) {
        const slug = path.basename(entry.file, '.md');
        const existingArticle = blobAt(remote, entry.file);
        if ((reserved.has(slug) || blobAt(remote, `public/preview/${slug}.html`)) && existingArticle !== entry.blob) throw new Error(`Published root URL /${slug} is already occupied`);
      }
      git(['read-tree', remote], { env });
      for (const entry of blobs) {
        const current = blobAt(remote, entry.file);
        if (current !== entry.base && current !== entry.blob) throw new Error(`Newer main changed ${entry.file}; drafts and review artifacts retained`);
        git(['update-index', '--add', '--cacheinfo', '100644', entry.blob, entry.file], { env });
      }
      const tree = git(['write-tree'], { env });
      if (tree === git(['rev-parse', `${remote}^{tree}`])) return remote;
      const commit = git(['commit-tree', tree, '-p', remote, '-m', message], { env });
      try { git(['push', 'origin', `${commit}:refs/heads/main`]); return commit; }
      catch { if (attempt === attempts) throw new Error('News push failed; drafts and review artifacts retained'); }
    }
    throw new Error('No news publication attempt was made');
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}
