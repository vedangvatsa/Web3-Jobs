import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';

export function restoreNewsDrafts({ artifact, cwd = process.cwd() }) {
  const current = JSON.parse(fs.readFileSync(path.join(cwd, '.cache/news-research/current.json'), 'utf8'));
  const root = fs.realpathSync(artifact);
  const report = JSON.parse(fs.readFileSync(path.join(root, '.cache/news-research/report.json'), 'utf8'));
  if (report.day !== current.day) throw new Error('Recovery belongs to a different news date; review it manually');
  const drafts = report.outcomes.filter(item => item.status === 'ready');
  const files = new Map();
  function add(relative) {
    const source = path.join(root, '.cache/news-research/recovery', relative);
    const destination = path.join(cwd, relative);
    if (fs.existsSync(destination)) throw new Error(`Recovery cannot overwrite ${relative}`);
    if (!fs.lstatSync(source).isFile() || !fs.realpathSync(source).startsWith(`${root}${path.sep}`)) throw new Error(`Unsafe recovery file: ${relative}`);
    files.set(relative, { source, destination });
    return source;
  }
  for (const item of drafts) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)?$/.test(item.articleSlug || '')) throw new Error('Unsafe recovery article slug');
    const source = add(`content/articles/${item.articleSlug}.md`);
    const { data } = matter(fs.readFileSync(source, 'utf8'));
    if (data.category !== 'News') throw new Error('Recovery contains a non-news draft');
    if (typeof data.image !== 'string' || !/^\/images\/news\/[a-z0-9-]+\.(?:png|jpg|jpeg|webp)$/.test(data.image)) throw new Error('Recovery draft needs its local news image');
    add(`public${data.image}`);
  }
  for (const { source, destination } of files.values()) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
  }
  fs.writeFileSync(path.join(cwd, '.cache/news-research/restored.json'), JSON.stringify({ day: current.day, drafts }, null, 2) + '\n');
  return { drafts: drafts.length, files: files.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(restoreNewsDrafts({ artifact: '.cache/news-research-restore' }))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
