import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { linkedInTargets } from './linkedin-targets';
import { inspectLinkedInBufferReceipt, readLinkedInBufferPost, redactLinkedInDiagnostic } from './job-linkedin-verification';

interface DiagnosticReceipt {
  slug: string;
  platform: string;
  provider?: string;
  account?: string;
  postId?: string;
  expectedText?: string;
}

export async function inspectJobLinkedInReceipts(
  state: { history: DiagnosticReceipt[] },
  postIds: string[],
  { env = process.env, request = fetch }: { env?: NodeJS.ProcessEnv; request?: typeof fetch } = {},
) {
  if (!Array.isArray(state?.history)) throw new Error('Receipt file must contain a history array');
  if (!postIds.length || postIds.length > 50 || new Set(postIds).size !== postIds.length) {
    throw new Error('Supply 1 to 50 distinct known Buffer post IDs');
  }
  const targets = linkedInTargets(env).filter(target => target.transport !== 'direct');
  // Validate the whole selection before making any provider requests.
  const selected = postIds.map(postId => {
    const entries = state.history.filter(entry => entry.postId === postId);
    const entry = entries[0];
    const target = targets.find(target => target.channelId === entry?.account);
    if (entries.length !== 1 || entry.platform !== 'linkedin' || entry.provider !== 'buffer' || !target || !entry.expectedText?.trim()) {
      throw new Error(`ID ${postId} needs one exact company LinkedIn Buffer receipt with its account and expected text`);
    }
    return { entry, target, postId, expectedText: entry.expectedText };
  });
  if (!env.BUFFER_ACCESS_TOKEN) throw new Error('BUFFER_ACCESS_TOKEN must be supplied by the runtime');
  const results = [];
  for (const { entry, target, postId, expectedText } of selected) {
    const identity = { slug: entry.slug, account: target.channelId, postId };
    try {
      const post = await readLinkedInBufferPost(postId, { token: env.BUFFER_ACCESS_TOKEN, request });
      results.push({
        ...identity,
        assessment: inspectLinkedInBufferReceipt(target, postId, expectedText, post),
        expectedText,
        readback: post && {
          id: post.id, channelId: post.channelId, channelService: post.channelService,
          status: post.status, externalLink: post.externalLink, text: post.text, error: post.error?.message,
        },
      });
    } catch (error) {
      results.push({ ...identity, error: (error as Error).message });
    }
  }
  return redactLinkedInDiagnostic(JSON.stringify({ mode: 'read-only', checkedAt: new Date().toISOString(), results }, null, 2), env.BUFFER_ACCESS_TOKEN);
}

async function main() {
  const { values } = parseArgs({ options: {
    state: { type: 'string', default: 'scripts/social/jobs-social-posted.json' },
    'post-id': { type: 'string', multiple: true },
    help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log('Usage: node --import tsx scripts/social/inspect-job-linkedin-receipts.ts --state <receipt-file> --post-id <known-ID> [--post-id <known-ID> ...]\nReads only the selected Buffer posts. Prints JSON; never writes receipts or loads local env files.');
    return;
  }
  if (!values['post-id']?.length) throw new Error('At least one --post-id is required');
  const state = JSON.parse(await readFile(resolve(values.state), 'utf8'));
  console.log(await inspectJobLinkedInReceipts(state, values['post-id']));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(redactLinkedInDiagnostic((error as Error).message)); process.exitCode = 1; });
}
