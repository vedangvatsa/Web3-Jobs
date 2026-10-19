import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkNewsWriter, checkWriterResponse, requireFreeNewsModel, NEWS_FREE_MODELS } from './check-news-writer.mjs';

const ready = { status: 0, stdout: JSON.stringify({ type: 'text', part: { text: 'NEWS_WRITER_READY' } }) };
test('provider errors cannot pass readiness even when OpenCode exits zero', () => {
  assert.throws(() => checkWriterResponse({ status: 0, stdout: JSON.stringify({ type: 'error', error: { data: { message: 'Model has been deprecated' } } }) }), /deprecated/);
  assert.throws(() => checkWriterResponse({ status: 0, stdout: '' }), /readiness response/);
  assert.throws(() => checkWriterResponse({ ...ready, status: 1, stderr: 'connection refused' }), /connection refused/);
  assert.throws(() => checkWriterResponse({ error: new Error('timed out') }), /timed out/);
  assert.throws(() => checkWriterResponse({ ...ready, stdout: `${ready.stdout}\n${JSON.stringify({ type: 'tool_use' })}` }), /attempted a tool call/);
  assert.doesNotThrow(() => checkWriterResponse(ready));
});

test('an unavailable model stops before inference instead of entering research retries', () => {
  let calls = 0;
  assert.throws(() => checkNewsWriter({ binary: 'opencode', model: 'opencode/deepseek-v4.1-flash-free', run: () => { calls++; return { status: 0, stdout: 'opencode/mimo-v2.6-flash-free\n' }; } }), /deepseek-v4.1-flash-free is unavailable/);
  assert.equal(calls, 1);
});

test('refresh and readiness use the selected model without approving tools in the probe', () => {
  const env = { NEWS_MODEL: 'opencode/deepseek-v4.1-flash-free', OPENCODE_API_KEY: 'test-key' };
  const calls = [];
  const result = checkNewsWriter({ binary: '/bin/opencode', model: env.NEWS_MODEL, env, run: (binary, args, options) => {
    calls.push({ binary, args, options });
    return calls.length === 1 ? { status: 0, stdout: `${env.NEWS_MODEL}\n` } : ready;
  } });
  assert.equal(result, env.NEWS_MODEL);
  assert.deepEqual(calls[0].args, ['models', 'opencode', '--refresh']);
  assert.equal(calls[1].args[calls[1].args.indexOf('--model') + 1], env.NEWS_MODEL);
  assert.equal(JSON.parse(calls[1].options.env.OPENCODE_CONFIG_CONTENT).permission, 'ask');
  assert.equal(JSON.parse(calls[1].options.env.OPENCODE_CONFIG_CONTENT).small_model, env.NEWS_MODEL);
  assert.equal(calls[1].options.env.OPENCODE_API_KEY, 'test-key');
  assert.equal(env.OPENCODE_CONFIG_CONTENT, undefined);
});

test('a paid model or retired free model cannot silently replace the approved free writer', () => {
  for (const model of NEWS_FREE_MODELS) assert.equal(requireFreeNewsModel(model), model);
  for (const model of ['opencode/deepseek-v4.1-flash', 'opencode/muse-spark-1.3-contributor-free', undefined]) {
    assert.throws(() => checkNewsWriter({ binary: 'opencode', model, run: () => assert.fail('must not invoke a paid or unapproved model') }), /approved free model/);
  }
});
