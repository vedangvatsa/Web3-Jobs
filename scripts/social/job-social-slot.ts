import { assertPostingWindow, postingSlot } from './posting-slot.mjs';

export function createJobSocialSlotGuard({ env = process.env, now = Date.now }: {
  env?: Record<string, string | undefined>;
  now?: () => number;
} = {}) {
  const name = env.SOCIAL_PUBLISH_SLOT;
  const date = env.SOCIAL_PUBLISH_DATE;
  const manual = [name, date].every(value => value === undefined || value === '');
  const slot = manual ? null : postingSlot(name, date);
  const assertOpen = () => assertPostingWindow(slot, now());
  const beforeSend = (preflight: () => Promise<void>) => async () => {
    assertOpen();
    await preflight();
    assertOpen();
  };
  const guardRestMutations = (request: typeof fetch): typeof fetch => (input, init) => {
    const method = init?.method || (input instanceof Request ? input.method : 'GET');
    if (!['GET', 'HEAD'].includes(method.toUpperCase())) assertOpen();
    return request(input, init);
  };
  return { assertOpen, beforeSend, guardRestMutations };
}
