export const BUFFER_X_CHANNEL_ID = '6ab62682ea19ca0bdee284bd';
export const BUFFER_X_ACCOUNT = 'hashtag_web3';

type BufferPost = {
  id: string;
  text: string;
  channelId: string;
  channelService: string;
  status: string;
  externalLink?: string | null;
  error?: { message: string } | null;
};

export class BufferXClient {
  constructor(
    private token: string,
    private channelId = BUFFER_X_CHANNEL_ID,
    private request: typeof fetch = fetch,
    private sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ) {
    if (!token) throw new Error('BUFFER_ACCESS_TOKEN is required for X posting');
  }

  private async query<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const response = await this.request('https://api.buffer.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Buffer X request failed: HTTP ${response.status}`);
    const result = await response.json() as { data?: T; errors?: { message: string }[] };
    if (result.errors?.length) throw new Error(`Buffer X: ${result.errors.map((error) => error.message).join('; ')}`);
    if (!result.data) throw new Error('Buffer X response missing data');
    return result.data;
  }

  async verifyChannel(): Promise<void> {
    const { channel } = await this.query<{ channel: { id: string; name: string; service: string } | null }>(
      'query XChannel($id: ChannelId!) { channel(input: {id: $id}) { id name service } }',
      { id: this.channelId },
    );
    if (channel?.id !== this.channelId || channel.service !== 'twitter' || channel.name.replace(/^@/, '').toLowerCase() !== BUFFER_X_ACCOUNT) {
      throw new Error('Buffer channel does not match X account @hashtag_web3');
    }
  }

  async create(text: string): Promise<string> {
    await this.verifyChannel();
    const { createPost } = await this.query<{ createPost: { post?: { id: string }; message?: string } }>(
      'mutation XPost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id } } ... on MutationError { message } } }',
      { input: { channelId: this.channelId, text, schedulingType: 'automatic', mode: 'shareNow' } },
    );
    if (!createPost.post?.id?.trim()) throw new Error(`Buffer X post creation failed: ${createPost.message || 'missing post ID'}`);
    return createPost.post.id;
  }

  async verify(postId: string, expectedText: string, attempts = 6): Promise<string> {
    for (let attempt = 0; attempt < attempts; attempt++) {
      const { post } = await this.query<{ post: BufferPost | null }>(
        'query XReceipt($id: PostId!) { post(input: {id: $id}) { id text channelId channelService status externalLink error { message } } }',
        { id: postId },
      );
      if (!post || post.id !== postId || post.channelId !== this.channelId || post.channelService !== 'twitter' || post.text !== expectedText) {
        throw new Error(`Buffer X receipt ${postId} does not match the requested post`);
      }
      if (post.status === 'error') throw new Error(`Buffer X publish failed for ${postId}: ${post.error?.message || 'unknown publishing error'}`);
      if (post.status === 'sent' && post.externalLink) {
        const url = new URL(post.externalLink);
        if (url.protocol !== 'https:' || !['x.com', 'twitter.com', 'www.twitter.com', 'www.x.com'].includes(url.hostname) || !/^\/hashtag_web3\/status\/\d+\/?$/i.test(url.pathname)) {
          throw new Error(`Buffer X returned an unexpected published URL for ${postId}`);
        }
        return post.externalLink;
      }
      if (attempt + 1 < attempts) await this.sleep(5000);
    }
    throw new Error(`Buffer X post ${postId} is not yet confirmed sent; keeping its receipt pending`);
  }
}
