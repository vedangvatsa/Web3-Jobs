import { Resend } from 'resend';

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface JobListing {
  title: string;
  company: string;
  location: string;
  salary?: string;
  url: string;
  tags: string[];
}

export async function sendJobAlertEmail(
  to: string,
  jobs: JobListing[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    const fromName = process.env.EMAIL_FROM_NAME;
    const replyTo = process.env.EMAIL_REPLY_TO;
    const unsubscribeUrl = process.env.EMAIL_UNSUBSCRIBE_URL;
    const listUnsubscribe = unsubscribeUrl ? `<${unsubscribeUrl}>` : undefined;

    const hasDisplayName = fromEmail.includes('<') && fromEmail.includes('>');
    const fromField = hasDisplayName
      ? fromEmail
      : (fromName ? `${fromName} <${fromEmail}>` : fromEmail);

    if (fromEmail === 'onboarding@resend.dev') {
      console.warn('EMAIL_FROM is using the default resend.dev sender; deliverability may be reduced.');
    }

    const client = getResendClient();
    const { data, error } = await client.emails.send({
      from: fromField,
      to,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: `New Web3 Jobs - ${jobs.length} New Positions Available`,
      html: generateJobAlertHTML(jobs),
      text: generateJobAlertText(jobs),
      ...(listUnsubscribe
        ? {
            headers: {
              'List-Unsubscribe': listUnsubscribe,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          }
        : {}),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendBatchJobAlerts(
  emails: string[],
  jobs: JobListing[]
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  // Send in batches to avoid rate limits
  for (const email of emails) {
    const result = await sendJobAlertEmail(email, jobs);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
    // Rate limit: wait 100ms between emails
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { sent, failed };
}

function generateJobAlertHTML(jobs: JobListing[]): string {
  const jobsHTML = jobs.map(job => `
    <div style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
      <a href="${job.url}" style="text-decoration: none; color: #111827; font-size: 16px; font-weight: 600;">
        ${job.title}
      </a>
      <div style="margin-top: 4px; font-size: 13px; color: #6b7280;">
        ${job.company}${job.salary ? ` • ${job.salary}` : ''}
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #111827; background-color: #ffffff; margin: 0; padding: 0;">
        <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
          Curated Web3 roles, handpicked for your next move.
        </div>
        <div style="max-width: 640px; margin: 0 auto; padding: 24px;">
          <!-- Header -->
          <div style="padding: 8px 0 18px 0; border-bottom: 2px solid #111827;">
            <div style="font-size: 18px; font-weight: 700; letter-spacing: 0.2px;">Hashtag Web3</div>
            <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Weekly Job Alerts</div>
          </div>

          <!-- Content -->
          <div style="padding: 18px 0;">
            <div style="font-size: 20px; font-weight: 700; margin-bottom: 6px;">${jobs.length} roles worth a look</div>
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 14px;">Handpicked from the latest listings on Hashtag Web3.</div>

            ${jobsHTML}

            <div style="margin-top: 18px;">
              <a href="https://hashtagweb3.com/jobs"
                 style="display: inline-block; color: #111827; text-decoration: underline; font-weight: 600;">
                Browse all jobs →
              </a>
            </div>

            <div style="margin-top: 18px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px;">
              <p style="margin: 6px 0;">You’re receiving this because you opted in to Hashtag Web3 job alerts.</p>
              <p style="margin: 6px 0; font-size: 11px;">Prefer fewer emails? Reply with your preference and we’ll adjust.</p>
              ${process.env.EMAIL_UNSUBSCRIBE_URL ? `
                <p style="margin: 8px 0; font-size: 11px;">
                  <a href="${process.env.EMAIL_UNSUBSCRIBE_URL}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
                </p>
              ` : ''}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateJobAlertText(jobs: JobListing[]): string {
  const jobsText = jobs.map(job => {
    const salary = job.salary ? ` | ${job.salary}` : '';
    return `${job.title} - ${job.company}${salary}`;
  }).join('\n');

  return `
HASHTAG WEB3 JOB ALERTS

Fresh Web3 opportunities

${jobs.length} new positions:

${jobsText}

---

View all jobs at: https://hashtagweb3.com/jobs

---
You’re receiving this because you opted in to Hashtag Web3 job alerts.
  `;
}
