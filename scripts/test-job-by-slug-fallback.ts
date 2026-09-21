import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

async function main() {
  const cwd = process.cwd();
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'job-slug-catalog-only-'));
  fs.mkdirSync(path.join(temp, 'content'), { recursive: true });
  fs.writeFileSync(
    path.join(temp, 'content', 'jobs-runtime.json'),
    JSON.stringify([
      {
        id: '10479738',
        slug: 'arc6',
        title: 'Solutions Architect, Web3',
        company: 'Amazon',
        link: 'https://example.com/job',
        source: 'test',
        date: '2026-09-21',
        active: true,
      },
      {
        id: '8820662002',
        slug: 'pm87',
        title: 'Senior Product Marketing Manager',
        company: 'ComplyAdvantage',
        link: 'https://example.com/job2',
        source: 'test',
        date: '2026-09-21',
        active: true,
      },
    ]),
  );
  // No job-shards directory at all — production must still resolve.

  process.chdir(temp);
  try {
    const { fetchJobById, fetchJobBySlug } = await import('../src/lib/job-by-slug-record.ts');
    assert.equal((await fetchJobBySlug('arc6'))?.title, 'Solutions Architect, Web3');
    assert.equal((await fetchJobBySlug('pm87'))?.slug, 'pm87');
    assert.equal((await fetchJobById('10479738'))?.slug, 'arc6');
    assert.equal(await fetchJobBySlug('missing-slug-xyz'), null);
    console.log('[test-job-by-slug-fallback] OK — catalog-only resolution');
  } finally {
    process.chdir(cwd);
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
