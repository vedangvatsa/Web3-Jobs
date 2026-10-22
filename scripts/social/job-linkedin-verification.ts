import type { LinkedInTarget } from './linkedin-targets';

export interface LinkedInBufferPost {
  id: string;
  text: string;
  channelId: string;
  channelService: string;
  status: string;
  externalLink?: string | null;
  error?: { message?: string } | null;
}

interface ReadOptions {
  token?: string;
  request?: typeof fetch;
}

interface VerifyOptions extends ReadOptions {
  attempts?: number;
  sleep?: (ms: number) => Promise<void>;
}

export function redactLinkedInDiagnostic(message: string, token = process.env.BUFFER_ACCESS_TOKEN || ''): string {
  return (token ? message.replaceAll(token, '[redacted]') : message)
    .replace(/Bearer\s+[^\s"'<>]+/gi, 'Bearer [redacted]');
}

export async function readLinkedInBufferPost(postId: string, { token = process.env.BUFFER_ACCESS_TOKEN || '', request = fetch }: ReadOptions = {}): Promise<LinkedInBufferPost | null> {
  if (!token) throw new Error('BUFFER_ACCESS_TOKEN is required for LinkedIn readback');
  if (!postId?.trim()) throw new Error('A known Buffer post ID is required for LinkedIn readback');
  let response: Response;
  try {
    response = await request('https://api.buffer.com/graphql', {
      method: 'POST', redirect: 'error',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query: 'query LinkedInReceipt($id: PostId!) { post(input: {id: $id}) { id text channelId channelService status externalLink error { message } } }',
        variables: { id: postId },
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new Error('Buffer LinkedIn readback unavailable (network, redirect or timeout)');
  }
  if (!response.ok) throw new Error(`Buffer LinkedIn readback failed: HTTP ${response.status}`);
  const data = await response.json().catch(() => { throw new Error('Buffer LinkedIn readback returned invalid JSON'); }) as {
    data?: { post?: LinkedInBufferPost | null };
    errors?: { message?: string; extensions?: { code?: string } }[];
  } | null;
  if (data?.errors?.length) {
    const detail = data.errors.map(error => `${error.extensions?.code || 'UNKNOWN'}: ${error.message || 'No message'}`).join('; ');
    throw new Error(`Buffer LinkedIn GraphQL: ${redactLinkedInDiagnostic(detail, token).replace(/[\r\n]+/g, ' ').slice(0, 1000)}`);
  }
  if (!data?.data || !('post' in data.data)) throw new Error('Buffer LinkedIn readback missing post data');
  return data.data.post ?? null;
}

export function inspectLinkedInBufferReceipt(target: LinkedInTarget, postId: string, expectedText: string, post: LinkedInBufferPost | null):
  { verified: true; permalink: string } | { verified: false; reason: string; retryable: boolean } {
  const pending = (reason: string, retryable = false) => ({ verified: false as const, reason, retryable });
  if (!post) return pending('post not found');
  if (post.id !== postId) return pending('post ID mismatch');
  if (post.channelId !== target.channelId) return pending('channel ID mismatch');
  if (post.channelService !== 'linkedin') return pending('channel service mismatch');
  if (post.text !== expectedText) return pending('text mismatch');
  if (post.status === 'error') return pending(`provider status=error: ${post.error?.message || 'No publishing error message'}`);
  if (post.status !== 'sent') return pending(`provider status=${post.status}`, ['scheduled', 'sending'].includes(post.status));
  if (!post.externalLink) return pending('sent without a permalink', true);
  try {
    const url = new URL(post.externalLink);
    const feedPost = /^\/feed\/update\/urn:li:(?:activity|share|ugcPost):\d+\/?$/.test(url.pathname);
    const namedPost = /^\/posts\/[\w-]+\/?$/.test(url.pathname) && url.pathname.startsWith(`/posts/${target.name}_`);
    if (url.protocol === 'https:' && ['linkedin.com', 'www.linkedin.com'].includes(url.hostname)
      && !url.username && !url.password && !url.port && (feedPost || namedPost)) {
      return { verified: true, permalink: post.externalLink };
    }
  } catch { /* A malformed URL cannot prove delivery. */ }
  return pending('invalid LinkedIn post permalink');
}

export async function verifyLinkedInBuffer(target: LinkedInTarget, postId: string, expectedText: string, options: VerifyOptions = {}): Promise<{ permalink: string }> {
  const { attempts = 6, sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)) } = options;
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 6) throw new Error('LinkedIn readback attempts must be between 1 and 6');
  const pending = (reason: string) => new Error(`LinkedIn ${target.label} receipt ${postId} remains pending: ${redactLinkedInDiagnostic(reason, options.token).replace(/[\r\n]+/g, ' ').slice(0, 1000)}; read-only reconciliation required`);
  if (!expectedText?.trim()) throw pending('missing expected text');
  for (let attempt = 0; attempt < attempts; attempt++) {
    let post: LinkedInBufferPost | null;
    try {
      post = await readLinkedInBufferPost(postId, options);
    } catch (error) {
      throw pending((error as Error).message);
    }
    const result = inspectLinkedInBufferReceipt(target, postId, expectedText, post);
    if (result.verified) return { permalink: result.permalink };
    if (!result.retryable || attempt + 1 === attempts) throw pending(result.reason);
    // The caller checkpoints the accepted ID before these read-only polls.
    await sleep(5000);
  }
  throw pending('readback exhausted');
}
