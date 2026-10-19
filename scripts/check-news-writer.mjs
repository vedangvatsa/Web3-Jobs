import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function checkWriterResponse(result) {
  const events = String(result.stdout || '').split('\n').flatMap(line => {
    try { return [JSON.parse(line)]; } catch { return []; }
  });
  const errors = events.filter(event => event.type === 'error').map(event => event.error?.data?.message || event.error?.name || 'Writer error');
  if (errors.length) throw new Error(errors.join('; '));
  if (result.error || result.status !== 0) throw new Error(result.error?.message || `Writer exited ${result.status}: ${String(result.stderr || '').slice(-4000)}`);
  const text = events.filter(event => event.type === 'text').map(event => event.part?.text || '').join('').trim();
  if (text !== 'NEWS_WRITER_READY') throw new Error(`Writer did not produce the readiness response: ${String(result.stderr || '').slice(-4000) || 'empty or unexpected output'}`);
}

export function checkNewsWriter({ binary, model, run = spawnSync, env = process.env }) {
  if (!model?.startsWith('opencode/')) throw new Error('NEWS_MODEL must select an OpenCode model');
  const options = { encoding: 'utf8', timeout: 120_000, maxBuffer: 2 * 1024 * 1024, env };
  const catalog = run(binary, ['models', 'opencode', '--refresh'], options);
  if (catalog.error || catalog.status !== 0) throw new Error('Could not refresh the news model catalog');
  const available = String(catalog.stdout).split(/\r?\n/).map(line => line.trim());
  if (!available.includes(model)) throw new Error(`News model ${model} is unavailable. Available free models: ${available.filter(name => name.startsWith('opencode/') && /free$|big-pickle$/.test(name)).join(', ')}`);
  const result = run(binary, ['--print-logs', '--log-level', 'WARN', 'run', '--format', 'json', '--model', model, 'Reply with NEWS_WRITER_READY only. Do not use any tools or read any files.'], {
    ...options,
    env: { ...env, OPENCODE_CONFIG_CONTENT: JSON.stringify({ permission: 'deny', share: 'disabled', autoupdate: false, small_model: model }) },
  });
  checkWriterResponse(result);
  return model;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const model = checkNewsWriter({ binary: process.env.OPENCODE_BIN || path.join(os.homedir(), '.opencode/bin/opencode'), model: process.env.NEWS_MODEL });
    console.log(`News writer ready: ${model}`);
  } catch (error) {
    const key = process.env.OPENCODE_API_KEY;
    console.error(key ? error.message.replaceAll(key, '[redacted]') : error.message);
    process.exitCode = 1;
  }
}
