import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_SEPARATOR = '.';

function getSecret() {
  return process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || '';
}

export function createUnsubscribeUrl(email: string) {
  if (!getSecret()) throw new Error('UNSUBSCRIBE_SECRET or CRON_SECRET is required');
  const normalizedEmail = email.trim().toLowerCase();
  const signature = createHmac('sha256', getSecret()).update(normalizedEmail).digest('base64url');
  const token = `${Buffer.from(normalizedEmail).toString('base64url')}${TOKEN_SEPARATOR}${signature}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hashtagweb3.com';
  return `${siteUrl}/api/email/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function verifyUnsubscribeToken(token: string) {
  const [encodedEmail, signature] = token.split(TOKEN_SEPARATOR);
  if (!encodedEmail || !signature || !getSecret()) return null;

  try {
    const email = Buffer.from(encodedEmail, 'base64url').toString('utf8');
    const expected = createHmac('sha256', getSecret()).update(email).digest('base64url');
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
    return email;
  } catch {
    return null;
  }
}
