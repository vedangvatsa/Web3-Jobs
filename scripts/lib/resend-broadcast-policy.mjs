import fs from 'node:fs';

const policyFile = new URL('./resend-broadcast-policy.json', import.meta.url);

export function getResendBroadcastPause(env = process.env) {
  if (String(env.RESEND_BROADCASTS_PAUSED || '').trim().toLowerCase() === 'true') {
    return { paused: true, reason: 'RESEND_BROADCASTS_PAUSED=true.' };
  }

  // Read each time: a cached JSON import could retain an earlier unpaused policy.
  let policy;
  try {
    policy = JSON.parse(fs.readFileSync(policyFile, 'utf8'));
  } catch {
    return { paused: true, reason: 'Broadcast policy is missing or unreadable; refusing to send.' };
  }
  if (typeof policy?.paused !== 'boolean') {
    return { paused: true, reason: 'Broadcast policy has no boolean paused setting; refusing to send.' };
  }
  return policy.paused
    ? { paused: true, reason: 'The tracked broadcast policy records an indefinite user pause.' }
    : { paused: false, reason: '' };
}
