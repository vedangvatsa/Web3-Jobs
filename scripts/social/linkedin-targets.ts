export const WEB3_LINKEDIN_CHANNEL_ID = '69c5b139af47dacb695b5feb';
export const CVINBIO_LINKEDIN_CHANNEL_ID = '6a134180c687a22dd420e089';

export interface LinkedInTarget {
  channelId: string;
  name: string;
  label: string;
}

export interface LinkedInReceipt {
  slug: string;
  platform: string;
  account?: string;
  postId?: string;
  verification?: 'pending' | 'verified';
}

export function linkedInTargets(env = process.env): LinkedInTarget[] {
  const targets = [
    { channelId: env.BUFFER_LINKEDIN_CHANNEL_ID || WEB3_LINKEDIN_CHANNEL_ID, name: 'hashtagweb3', label: '#Web3' },
    { channelId: env.BUFFER_CVINBIO_CHANNEL_ID || CVINBIO_LINKEDIN_CHANNEL_ID, name: 'cvinbio', label: 'CVin.Bio' },
  ];
  if (targets[0].channelId === targets[1].channelId) throw new Error('LinkedIn destinations must be different Buffer channels');
  return targets;
}

export function hasLinkedInReceipt(history: LinkedInReceipt[], slug: string, target: LinkedInTarget): boolean {
  return history.some((entry) =>
    entry.slug === slug && entry.platform === 'linkedin' && entry.verification !== 'pending' &&
    Boolean(entry.postId?.trim()) && !['unknown', 'published'].includes(entry.postId!) &&
    // Account-less receipts were produced by the original #Web3-only publisher.
    (entry.account || WEB3_LINKEDIN_CHANNEL_ID) === target.channelId,
  );
}

export async function publishLinkedInTargets(
  history: LinkedInReceipt[],
  slug: string,
  targets: LinkedInTarget[],
  publish: (target: LinkedInTarget) => Promise<string>,
  saveReceipt: (target: LinkedInTarget, postId: string) => void,
  force = false,
): Promise<Array<{ target: LinkedInTarget; status: 'submitted' | 'skipped' | 'failed'; error?: string }>> {
  const results: Array<{ target: LinkedInTarget; status: 'submitted' | 'skipped' | 'failed'; error?: string }> = [];
  for (const target of targets) {
    if (!force && hasLinkedInReceipt(history, slug, target)) {
      results.push({ target, status: 'skipped' });
      continue;
    }
    try {
      const postId = await publish(target);
      if (!postId?.trim() || ['unknown', 'published'].includes(postId)) throw new Error('Buffer did not return a valid LinkedIn receipt');
      saveReceipt(target, postId);
      results.push({ target, status: 'submitted' });
    } catch (error) {
      results.push({ target, status: 'failed', error: (error as Error).message });
    }
  }
  return results;
}
