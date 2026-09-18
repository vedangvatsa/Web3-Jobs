import { Resend } from 'resend';

export async function unsubscribeEmailInResend(email: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(apiKey);
  const normalized = email.trim().toLowerCase();

  const updated = await resend.contacts.update({
    email: normalized,
    unsubscribed: true,
  });

  if (updated.error) {
    console.error('[resend-unsubscribe]', updated.error);
    return false;
  }

  return true;
}
