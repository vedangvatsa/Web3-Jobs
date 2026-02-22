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

    const client = getResendClient();
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject: `New Web3 Jobs - ${jobs.length} New Positions Available`,
      html: generateJobAlertHTML(jobs),
      text: generateJobAlertText(jobs),
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
    <div style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 16px; color: #111827;">
        <strong>${job.title}</strong>
      </p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">
        ${job.company}
      </p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #374151; background-color: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header with Hashtag Web3 Branding -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); border-radius: 12px 12px 0 0; padding: 24px; text-align: center; color: white;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">Hashtag Web3</div>
            <div style="font-size: 14px; opacity: 0.9;">Job Alerts</div>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <h1 style="margin: 0 0 24px 0; font-size: 22px; color: #111827;">
              New Web3 Jobs Available
            </h1>
            
            ${jobsHTML}
            
            <div style="margin-top: 32px; text-align: center;">
              <a href="https://hashtagweb3.com" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
                View All Jobs on Hashtag Web3
              </a>
            </div>
            
            <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px;">
              <p style="margin: 8px 0;">
                Hashtag Web3 — Your source for Web3 jobs and education
              </p>
              <p style="margin: 8px 0; font-size: 11px;">
                You're receiving this because you subscribed to job alerts from Hashtag Web3.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateJobAlertText(jobs: JobListing[]): string {
  const jobsText = jobs.map(job => `${job.title} - ${job.company}`).join('\n');

  return `
HASHTAG WEB3 - Job Alerts

New Web3 Jobs Available

${jobs.length} new positions:

${jobsText}

---

View all jobs at: https://hashtagweb3.com

---
Hashtag Web3 — Your source for Web3 jobs and education

You're receiving this because you subscribed to job alerts from Hashtag Web3.
  `;
}
