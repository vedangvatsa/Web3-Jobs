import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { readLocalJsonFile } from '../src/lib/catalog-fs';

test('a newly generated source catalog wins over an older standalone build', () => {
  const original = process.cwd();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-order-'));
  try {
    fs.mkdirSync(path.join(root, 'content'), { recursive: true });
    fs.mkdirSync(path.join(root, '.next/standalone/content'), { recursive: true });
    for (const dir of ['content', '.next/standalone/content']) fs.writeFileSync(path.join(root, dir, 'jobs-runtime.json'), '[]');
    fs.writeFileSync(path.join(root, 'content/events-runtime.json'), '["new-event"]');
    fs.writeFileSync(path.join(root, '.next/standalone/content/events-runtime.json'), '["old-event"]');
    process.chdir(root);
    assert.deepEqual(readLocalJsonFile('content', 'events-runtime.json'), ['new-event']);
    process.chdir(path.join(root, '.next/standalone'));
    assert.deepEqual(readLocalJsonFile('content', 'events-runtime.json'), ['old-event']);
  } finally {
    process.chdir(original);
    fs.rmSync(root, { recursive: true, force: true });
  }
});
