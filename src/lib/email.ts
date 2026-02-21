import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Web3 Jobs <jobs@web3jobs.so>',
      to,
      subject: `🚀 ${jobs.length} New Web3 Jobs Available`,
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
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: white;">
      <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 18px;">
        <a href="${job.url}" style="color: #2563eb; text-decoration: none;">${job.title}</a>
      </h3>
      <div style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">
        <strong>${job.company}</strong> • ${job.location}
        ${job.salary ? ` • ${job.salary}` : ''}
      </div>
      ${job.tags.length > 0 ? `
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${job.tags.map(tag => `
            <span style="background: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
              ${tag}
            </span>
          `).join('')}
        </div>
      ` : ''}
      <div style="margin-top: 12px;">
        <a href="${job.url}" style="color: #2563eb; text-decoration: none; font-size: 14px;">
          View Job →
        </a>
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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #374151; background-color: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <h1 style="margin: 0 0 8px 0; font-size: 24px; color: #111827;">
              🚀 New Web3 Jobs for You
            </h1>
            <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
              We found ${jobs.length} new jobs that match your interests
            </p>
            
            ${jobsHTML}
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://web3jobs.so'}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
                Browse All Jobs
              </a>
            </div>
            
            <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #9ca3af;">
              <p style="margin: 8px 0;">
                You're receiving this because you subscribed to Web3 Jobs alerts.
              </p>
              <p style="margin: 8px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://web3jobs.so'}/unsubscribe?email={{email}}" 
                   style="color: #6b7280; text-decoration: underline;">
                  Unsubscribe
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateJobAlertText(jobs: JobListing[]): string {
  const jobsText = jobs.map(job => `
${job.title}
${job.company} • ${job.location}${job.salary ? ` • ${job.salary}` : ''}
Tags: ${job.tags.join(', ')}
View: ${job.url}
  `).join('\n---\n');

  return `
🚀 New Web3 Jobs for You

We found ${jobs.length} new jobs that match your interests:

${jobsText}

Browse all jobs: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://web3jobs.so'}

---
You're receiving this because you subscribed to Web3 Jobs alerts.
Unsubscribe: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://web3jobs.so'}/unsubscribe
  `.trim();
}
