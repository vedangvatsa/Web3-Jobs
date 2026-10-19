import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkNewsWriter, checkWriterResponse } from './check-news-writer.mjs';

const ready = { status: 0, stdout: JSON.stringify({ type: 'text', part: { text: 'NEWS_WRITER_READY' } }) };
test('provider errors cannot pass readiness even when OpenCode exits zero', () => {
  assert.throws(() => checkWriterResponse({ status: 0, stdout: JSON.stringify({ type: 'error', error: { data: { message: 'Model has been deprecated' } } }) }), /deprecated/);
  assert.throws(() => checkWriterResponse({ status: 0, stdout: '' }), /readiness response/);
  assert.throws(() => checkWriterResponse({ ...ready, status: 1, stderr: 'connection refused' }), /connection refused/);
  assert.throws(() => checkWriterResponse({ error: new Error('timed out') }), /timed out/);
  assert.doesNotThrow(() => checkWriterResponse(ready));
});

test('an unavailable model stops before inference instead of entering research retries', () => {
  let calls = 0;
  assert.throws(() => checkNewsWriter({ binary: 'opencode', model: 'opencode/retired-free', run: () => { calls++; return { status: 0, stdout: 'opencode/available-free\n' }; } }), /retired-free is unavailable/);
  assert.equal(calls, 1);
});

test('refresh and readiness use the selected model with tools denied only for the probe', () => {
  const env = { NEWS_MODEL: 'opencode/available-free', OPENCODE_API_KEY: 'test-key' };
  const calls = [];
  const result = checkNewsWriter({ binary: '/bin/opencode', model: env.NEWS_MODEL, env, run: (binary, args, options) => {
    calls.push({ binary, args, options });
    return calls.length === 1 ? { status: 0, stdout: `${env.NEWS_MODEL}\n` } : ready;
  } });
  assert.equal(result, env.NEWS_MODEL);
  assert.deepEqual(calls[0].args, ['models', 'opencode', '--refresh']);
  assert.equal(calls[1].args[calls[1].args.indexOf('--model') + 1], env.NEWS_MODEL);
  assert.equal(JSON.parse(calls[1].options.env.OPENCODE_CONFIG_CONTENT).permission, 'deny');
  assert.equal(JSON.parse(calls[1].options.env.OPENCODE_CONFIG_CONTENT).small_model, env.NEWS_MODEL);
  assert.equal(calls[1].options.env.OPENCODE_API_KEY, 'test-key');
  assert.equal(env.OPENCODE_CONFIG_CONTENT, undefined);
});
