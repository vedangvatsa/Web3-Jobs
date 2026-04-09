import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

let sesClient: SESv2Client | null = null;

function getSESClient(): SESv2Client {
  if (!sesClient) {
    sesClient = new SESv2Client({
      region: process.env.AWS_SES_REGION || 'us-west-1',
      credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
      },
    });
  }
  return sesClient;
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
): Promise<{ success: boolean; messageId?: string; error?: string; timestamp?: string }> {
  try {
    if (!process.env.AWS_SES_ACCESS_KEY_ID || !process.env.AWS_SES_SECRET_ACCESS_KEY) {
      console.error('AWS SES credentials are not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = process.env.EMAIL_FROM || 'hi@hashtagweb3.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Hashtag Web3';
    const replyTo = process.env.EMAIL_REPLY_TO;
    const unsubscribeUrl = process.env.EMAIL_UNSUBSCRIBE_URL;

    const fromField = `${fromName} <${fromEmail}>`;

    const client = getSESClient();
    const command = new SendEmailCommand({
      FromEmailAddress: fromField,
      Destination: {
        ToAddresses: [to],
      },
      ReplyToAddresses: replyTo ? [replyTo] : undefined,
      Content: {
        Simple: {
          Subject: {
            Data: `New Web3 Jobs - ${jobs.length} New Positions Available`,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: generateJobAlertHTML(jobs),
              Charset: 'UTF-8',
            },
            Text: {
              Data: generateJobAlertText(jobs),
              Charset: 'UTF-8',
            },
          },
        },
      },
      ...(unsubscribeUrl
        ? {
            ListManagementOptions: undefined,
          }
        : {}),
    });

    const response = await client.send(command);

    return {
      success: true,
      messageId: response.MessageId,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Failed to send email:', error.message);
    return { success: false, error: error.message, timestamp: new Date().toISOString() };
  }
}

export async function sendBatchJobAlerts(
  emails: string[],
  jobs: JobListing[]
): Promise<{ 
  sent: number; 
  failed: number;
  details: Array<{
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
    timestamp: string;
  }>;
}> {
  let sent = 0;
  let failed = 0;
  const details: Array<{
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
    timestamp: string;
  }> = [];

  // SES allows 14/sec — send with concurrency of 10 to be safe
  const CONCURRENCY = 10;

  for (let i = 0; i < emails.length; i += CONCURRENCY) {
    const batch = emails.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (email) => {
        const result = await sendJobAlertEmail(email, jobs);
        return { email, ...result };
      })
    );

    for (const result of results) {
      details.push({
        email: result.email,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        timestamp: result.timestamp || new Date().toISOString(),
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    // Log progress every batch
    if ((i + CONCURRENCY) % 100 === 0 || i + CONCURRENCY >= emails.length) {
      console.log(`  Progress: ${Math.min(i + CONCURRENCY, emails.length)}/${emails.length} (sent: ${sent}, failed: ${failed})`);
    }
  }

  return { sent, failed, details };
}

function generateJobAlertHTML(jobs: JobListing[]): string {
  const unsubscribeUrl = process.env.EMAIL_UNSUBSCRIBE_URL || 'https://hashtagweb3.com/unsubscribe';
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
              <p style="margin: 6px 0;">Hashtag Web3 | Global Tech Recruitment</p>
              <p style="margin: 6px 0;">You're receiving this because you opted in to Hashtag Web3 job alerts.</p>
              <p style="margin: 6px 0; font-size: 11px;">Prefer fewer emails? Reply with your preference and we'll adjust.</p>
              ${unsubscribeUrl ? `
                <p style="margin: 8px 0; font-size: 11px;">
                  <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
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
You're receiving this because you opted in to Hashtag Web3 job alerts.
  `;
}
