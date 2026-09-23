/**
 * ONE-OFF: create a Resend broadcast DRAFT (never sends) for the
 * Web3 job-resources message to the General segment.
 * Usage (CI only, needs full-access RESEND_API_KEY):
 *   npx tsx scripts/create-resources-broadcast-draft.ts
 * Delete this file after the draft is verified.
 */
import { Resend } from 'resend';
import { RESEND_GENERAL_SEGMENT_ID } from './resend-broadcast-guards';

const UTM = 'utm_source=newsletter&utm_medium=email&utm_campaign=web3-job-resources';
const link = (path: string) => `https://hashtagweb3.com${path}?${UTM}`;

const SUBJECT = 'Job hunting in Web3 is tough! Here are 10 free resources';

const ITEMS: Array<[string, string]> = [
  ['Interview Question Bank', link('/interview-questions')],
  ['Find Your Web3 Personality Type + Roles That Match', link('/web3-career-quiz')],
  ['Estimate Your Salary', link('/salary-calculator')],
  ['Resume Builder', link('/resume-builder')],
  ['Invoice Generator for Contractors', link('/invoice-generator')],
  ['Visas for Digital Nomads', link('/digital-nomad-visas')],
  ['Remote Work Checklist', link('/remote-work-checklist')],
  ['Web3 Jobs', link('/')],
];

const TEXT = [
  'Job hunting in Web3 is tough!',
  '',
  'We have some resources to make your job search easier:',
  '',
  ...ITEMS.map(([label, url]) => `• ${label}: ${url}`),
  '• Web3 News Feed: https://t.me/web3newsfeed',
  '• Web3 Networking Group: https://t.me/hashtagweb3',
].join('\n');

const HTML = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #f9fafb; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <div style="background: #ffffff; border-radius: 12px; padding: 36px 32px;">
      <p style="font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">Job hunting in Web3 is tough!</p>
      <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">We have some resources to make your job search easier:</p>
      <ul style="font-size: 16px; color: #374151; padding-left: 20px; margin: 0 0 8px 0;">
${ITEMS.map(([label, url]) => `        <li style="margin-bottom: 10px;"><a href="${url}" style="color: #111827; font-weight: 600;">${label}</a></li>`).join('\n')}
        <li style="margin-bottom: 10px;"><a href="https://t.me/web3newsfeed" style="color: #111827; font-weight: 600;">Web3 News Feed</a></li>
        <li style="margin-bottom: 10px;"><a href="https://t.me/hashtagweb3" style="color: #111827; font-weight: 600;">Web3 Networking Group</a></li>
      </ul>
    </div>
    <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #9ca3af;">
      <p>Hashtag Web3 | Global Tech Recruitment</p>
      <p><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #9ca3af;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is required');
  const resend = new Resend(apiKey);
  console.log('--- TEXT PREVIEW ---');
  console.log(TEXT);
  console.log('--- END PREVIEW ---');
  const { data, error } = await resend.broadcasts.create({
    audienceId: RESEND_GENERAL_SEGMENT_ID,
    from: 'Alex <alex@hashtagweb3.com>',
    subject: SUBJECT,
    html: HTML,
    text: TEXT,
  } as never);
  if (error) throw new Error(`broadcast create failed: ${JSON.stringify(error)}`);
  console.log(`DRAFT_CREATED broadcastId=${(data as { id?: string })?.id} (draft only — nothing sent)`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
