export const PERSONAL_LINKEDIN_PROFILE = 'https://www.linkedin.com/in/easton-augustine-7a45aa102/';
export const PERSONAL_LINKEDIN_NAME = 'Easton Augustine';

export function escapeLinkedInText(text: string): string {
  return text.replace(/[|{}@\[\]()<>#\\*_~]/g, '\\$&');
}

export interface PersonalLinkedInConfig {
  token: string;
  memberId: string;
  expiresAt: string;
  version: string;
}

export function personalLinkedInConfig(env = process.env): PersonalLinkedInConfig {
  return {
    token: env.LINKEDIN_PERSONAL_ACCESS_TOKEN || '',
    memberId: env.LINKEDIN_PERSONAL_MEMBER_ID || '',
    expiresAt: env.LINKEDIN_PERSONAL_TOKEN_EXPIRES_AT || '',
    version: env.LINKEDIN_API_VERSION || '202609',
  };
}

export async function getLinkedInMember(token: string, request: typeof fetch = fetch): Promise<{ sub: string; name: string }> {
  const response = await request('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`LinkedIn profile check failed: HTTP ${response.status}`);
  const member = await response.json() as { sub?: string; name?: string };
  if (!member.sub || !/^[\w-]+$/.test(member.sub) || !member.name) throw new Error('LinkedIn did not return a member ID and name');
  return { sub: member.sub, name: member.name };
}

export class PersonalLinkedInClient {
  constructor(private config: PersonalLinkedInConfig, private request: typeof fetch = fetch) {}

  async verifyIdentity(): Promise<string> {
    const { token, memberId, expiresAt, version } = this.config;
    if (!token || !memberId || !/^[\w-]+$/.test(memberId)) throw new Error('Personal LinkedIn authorization is not configured');
    if (!/^\d{6}$/.test(version)) throw new Error('Invalid LinkedIn API version');
    const expiry = Date.parse(expiresAt);
    if (!Number.isFinite(expiry) || expiry <= Date.now() + 60000) throw new Error('Personal LinkedIn token is expired or expiring; reauthorize Easton');
    const member = await getLinkedInMember(token, this.request);
    if (member.sub !== memberId) throw new Error('LinkedIn token belongs to a different member; refusing to post');
    return `urn:li:person:${memberId}`;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.token}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': this.config.version,
      'X-Restli-Protocol-Version': '2.0.0',
    };
  }

  async create(text: string, link: { url: string; title: string; description?: string; thumbnail?: string }): Promise<string> {
    const author = await this.verifyIdentity();
    const source = new URL(link.url);
    if (source.origin !== 'https://hashtagweb3.com') throw new Error('Personal LinkedIn job link must point to hashtagweb3.com');
    let thumbnail: string | undefined;
    if (link.thumbnail) {
      const imageUrl = new URL(link.thumbnail);
      if (imageUrl.origin !== source.origin || !/^\/og\/jobs\/[^/]+\.png$/.test(imageUrl.pathname)) throw new Error('Expected a Hashtag Web3 job OG thumbnail');
      const image = await this.request(imageUrl, { signal: AbortSignal.timeout(30000), redirect: 'error' });
      if (!image.ok || !image.headers.get('content-type')?.startsWith('image/png')) throw new Error('Job OG thumbnail is unavailable');
      const bytes = await image.arrayBuffer();
      if (bytes.byteLength < 1000 || bytes.byteLength > 10 * 1024 * 1024) throw new Error('Invalid job OG image size');
      const initialized = await this.request('https://api.linkedin.com/rest/images?action=initializeUpload', {
        method: 'POST', headers: this.headers(), body: JSON.stringify({ initializeUploadRequest: { owner: author } }), signal: AbortSignal.timeout(30000),
      });
      if (!initialized.ok) throw new Error(`LinkedIn image initialization failed: HTTP ${initialized.status}`);
      const upload = await initialized.json() as { value?: { uploadUrl: string; image: string } };
      if (!upload.value?.image?.startsWith('urn:li:image:')) throw new Error('LinkedIn did not return an image URN');
      const uploadUrl = new URL(upload.value.uploadUrl);
      if (uploadUrl.protocol !== 'https:' || !(uploadUrl.hostname === 'linkedin.com' || uploadUrl.hostname.endsWith('.linkedin.com'))) throw new Error('Unexpected LinkedIn upload host');
      const uploaded = await this.request(uploadUrl, {
        method: 'PUT', headers: { Authorization: `Bearer ${this.config.token}`, 'Content-Type': 'image/png' }, body: bytes,
        signal: AbortSignal.timeout(30000), redirect: 'error',
      });
      if (!uploaded.ok) throw new Error(`LinkedIn image upload failed: HTTP ${uploaded.status}`);
      thumbnail = upload.value.image;
    }
    const response = await this.request('https://api.linkedin.com/rest/posts', {
      method: 'POST', headers: this.headers(), signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        author, commentary: escapeLinkedInText(text), visibility: 'PUBLIC', lifecycleState: 'PUBLISHED',
        distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
        content: { article: { source: link.url, title: link.title, ...(link.description ? { description: link.description } : {}), ...(thumbnail ? { thumbnail } : {}) } },
        isReshareDisabledByAuthor: false,
      }),
    });
    if (response.status !== 201) throw new Error(`Personal LinkedIn post failed: HTTP ${response.status}`);
    const receipt = response.headers.get('x-restli-id');
    if (!receipt || !/^urn:li:(share|ugcPost):\d+$/.test(receipt)) throw new Error('LinkedIn accepted the request but returned no valid post receipt; inspect the profile before retrying');
    return receipt;
  }
}
