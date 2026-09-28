import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { trimPostedLog } from '../news-story-dedup.mjs';

const statePattern = /^\.telegram-(?:news-(?:posted|last|deliveries)-[a-zA-Z0-9]+|ai-news-(?:posted|last|deliveries))\.json$/;

export function mergeNewsState(name, local, remote) {
  if (name.includes('-deliveries')) {
    for (const value of [local, remote]) {
      if (value !== undefined && (!value || Array.isArray(value) || typeof value !== 'object'
        || Object.values(value).some(receipt => !receipt || !['reserved', 'sent'].includes(receipt.status)))) {
        throw new Error(`Invalid delivery ledger: ${name}`);
      }
    }
    const merged = { ...remote, ...local };
    for (const [id, receipt] of Object.entries(remote || {})) {
      if (receipt.status === 'sent') merged[id] = receipt;
    }
    return merged;
  }
  if (name.includes('-posted')) {
    for (const value of [local, remote]) {
      if (value !== undefined && (!Array.isArray(value) || value.some(item => typeof item !== 'string'))) {
        throw new Error(`Invalid posted history: ${name}`);
      }
    }
    return trimPostedLog(new Set([...(remote || []), ...(local || [])]));
  }
  for (const value of [local, remote]) {
    if (value !== undefined && !Number.isFinite(Date.parse(value?.postedAt))) {
      throw new Error(`Invalid cooldown: ${name}`);
    }
  }
  if (!local) return remote;
  if (!remote) return local;
  return Date.parse(local.postedAt) > Date.parse(remote.postedAt) ? local : remote;
}

export function persistTelegramState({ cwd = process.cwd(), syncOnly = false, attempts = 3, validateRemote = (_remote) => {}, pattern = statePattern, mergeState = mergeNewsState, kind = 'news' } = {}) {
  const git = (args, options = {}) => execFileSync('git', args, {
    cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...options,
  }).trim();
  const local = new Map(fs.readdirSync(cwd).filter(name => pattern.test(name))
    .map(name => [name, JSON.parse(fs.readFileSync(path.join(cwd, name), 'utf8'))]));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'telegram-state-'));
  const env = {
    ...process.env,
    GIT_INDEX_FILE: path.join(temp, 'index'),
    GIT_AUTHOR_NAME: 'github-actions[bot]',
    GIT_AUTHOR_EMAIL: '41898282+github-actions[bot]@users.noreply.github.com',
    GIT_COMMITTER_NAME: 'github-actions[bot]',
    GIT_COMMITTER_EMAIL: '41898282+github-actions[bot]@users.noreply.github.com',
  };
  try {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      git(['fetch', 'origin', 'main']);
      const base = git(['rev-parse', 'FETCH_HEAD']);
      const remoteNames = new Set(git(['ls-tree', '--name-only', base]).split('\n').filter(name => pattern.test(name)));
      const remoteState = new Map([...remoteNames].map(name => [name, JSON.parse(git(['show', `${base}:${name}`]))]));
      validateRemote(remoteState);
      const names = new Set([...local.keys(), ...remoteNames]);
      if (!syncOnly) git(['read-tree', base], { env });
      for (const name of names) {
        const remote = remoteState.get(name);
        const merged = mergeState(name, local.get(name), remote);
        const text = JSON.stringify(merged, null, 2) + '\n';
        fs.writeFileSync(path.join(cwd, name), text);
        if (!syncOnly) {
          const blob = git(['hash-object', '-w', '--stdin'], { input: text });
          git(['update-index', '--add', '--cacheinfo', '100644', blob, name], { env });
        }
      }
      if (syncOnly) return;
      const tree = git(['write-tree'], { env });
      if (tree === git(['rev-parse', `${base}^{tree}`])) return;
      const commit = git(['commit-tree', tree, '-p', base, '-m', `chore: persist Telegram ${kind} delivery history`], { env });
      try {
        git(['push', 'origin', `${commit}:refs/heads/main`]);
        return;
      } catch {
        if (attempt === attempts) throw new Error(`Telegram ${kind} history push failed; local receipts retained for recovery`);
      }
    }
    throw new Error(`Telegram ${kind} history requires at least one persistence attempt`);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

export function persistNewsState(options = {}) {
  return persistTelegramState(options);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  persistNewsState({ syncOnly: process.argv.includes('--sync') });
}
