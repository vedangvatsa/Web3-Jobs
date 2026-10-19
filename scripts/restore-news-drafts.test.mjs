import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { restoreNewsDrafts } from './restore-news-drafts.mjs';

function fixture(t, day = '2026-10-19') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'news-recovery-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cwd = path.join(root, 'checkout'), artifact = path.join(root, 'artifact');
  const write = (base, relative, text) => { const file = path.join(base, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
  write(cwd, '.cache/news-research/current.json', JSON.stringify({ day: '2026-10-19' }));
  write(artifact, '.cache/news-research/report.json', JSON.stringify({ day, outcomes: [{ id: 'candidate', status: 'ready', articleSlug: 'story' }] }));
  write(artifact, '.cache/news-research/recovery/content/articles/story.md', '---\ncategory: News\nimage: /images/news/story.jpg\n---\nUnpublished draft.');
  write(artifact, '.cache/news-research/recovery/public/images/news/story.jpg', 'test image bytes');
  return { cwd, artifact, write };
}

test('restores saved drafts and their images for re-review without changing the research ledger', t => {
  const f = fixture(t);
  f.write(f.cwd, 'content/news-research.json', 'current ledger');
  assert.deepEqual(restoreNewsDrafts(f), { drafts: 1, files: 2 });
  assert.equal(fs.readFileSync(path.join(f.cwd, 'content/news-research.json'), 'utf8'), 'current ledger');
  assert.match(fs.readFileSync(path.join(f.cwd, 'content/articles/story.md'), 'utf8'), /Unpublished draft/);
  assert.ok(fs.existsSync(path.join(f.cwd, '.cache/news-research/restored.json')));
});

test('different-day, missing-image and overwrite conflicts fail before copying any drafts', t => {
  for (const issue of ['date', 'image', 'overwrite']) {
    const f = fixture(t, issue === 'date' ? '2026-10-18' : '2026-10-19');
    if (issue === 'image') fs.unlinkSync(path.join(f.artifact, '.cache/news-research/recovery/public/images/news/story.jpg'));
    if (issue === 'overwrite') f.write(f.cwd, 'public/images/news/story.jpg', 'published image');
    assert.throws(() => restoreNewsDrafts(f));
    assert.equal(fs.existsSync(path.join(f.cwd, 'content/articles/story.md')), false);
    if (issue === 'overwrite') assert.equal(fs.readFileSync(path.join(f.cwd, 'public/images/news/story.jpg'), 'utf8'), 'published image');
  }
});

test('recovery rejects traversal and symlink files', t => {
  for (const issue of ['traversal', 'symlink']) {
    const f = fixture(t);
    if (issue === 'traversal') f.write(f.artifact, '.cache/news-research/report.json', JSON.stringify({ day: '2026-10-19', outcomes: [{ status: 'ready', articleSlug: '../../unrelated' }] }));
    else {
      const image = path.join(f.artifact, '.cache/news-research/recovery/public/images/news/story.jpg');
      fs.unlinkSync(image);
      fs.symlinkSync(path.join(f.cwd, '.cache/news-research/current.json'), image);
    }
    assert.throws(() => restoreNewsDrafts(f));
    assert.equal(fs.existsSync(path.join(f.cwd, 'content/articles/story.md')), false);
  }
});
