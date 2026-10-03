import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

test('job image publisher rejects Instagram before selection, writes or requests, even when forced', () => {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/social/post-job-openings.ts', '--platform', 'instagram', '--dry-run', '--force'], {encoding: 'utf8'});
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Instagram is video-only/);
  assert.doesNotMatch(result.stdout, /Selected Job|State saved/);
});
