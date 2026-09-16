/**
 * send-resend-broadcast.ts — daily job alerts via Resend Broadcasts.
 *
 * Builds the new-jobs email from recent listings and sends it as a
 * Resend broadcast to your full audience (preferred) or a segment. Unsubscribed
 * contacts are excluded by Resend automatically.
 *
 * Usage: npx tsx scripts/send-resend-broadcast.ts [--limit 10] [--dry-run] [--preview]
 * Env: RESEND_API_KEY (required), RESEND_AUDIENCE_ID (preferred — all contacts),
 *      RESEND_SEGMENT_ID (optional subset), EMAIL_FROM
 *
 * Exits nonzero on ANY failure (no silent green runs).
 */

import fs from 'fs';
import { Resend } from 'resend';
import { getJobs } from '@/lib/jobs';
import { getJobPublicUrl } from '@/lib/job-slugs';
import type { JobListing } from '@/lib/email';
import type { Job } from '@/types';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const jobLimit = limitIdx > -1 ? Math.max(1, Number(args[limitIdx + 1]) || 10) : 10;

/** Hashtag Web3 "General" audience — all newsletter subscribers in Resend. */
export const RESEND_GENERAL_AUDIENCE_ID = '2db4b31c-7b5b-46b9-b2b1-98ae142d289b';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || 'Alex <alex@hi.hashtagweb3.com>';

type BroadcastTarget =
  | { kind: 'audience'; audienceId: string; label: string }
  | { kind: 'segment'; segmentId: string; label: string };

function broadcastCreatePayload(target: BroadcastTarget) {
  return target.kind === 'audience' ? { audienceId: target.audienceId } : { segmentId: target.segmentId };
}

/** Daily job alerts go to the full subscribed audience (not an empty segment). */
async function resolveBroadcastTarget(resendKey: string): Promise<BroadcastTarget> {
  const envAudience = process.env.RESEND_AUDIENCE_ID?.trim();
  if (envAudience) {
    return { kind: 'audience', audienceId: envAudience, label: `audience ${envAudience}` };
  }

  const envSegment = process.env.RESEND_SEGMENT_ID?.trim();
  if (envSegment) {
    return { kind: 'segment', segmentId: envSegment, label: `segment ${envSegment}` };
  }

  try {
    const res = await fetch('https://api.resend.com/audiences', {
      headers: { Authorization: `Bearer ${resendKey}` },
    });
    if (res.ok) {
      const json = (await res.json()) as { data?: Array<{ id: string; name: string }> };
      const general = json.data?.find((a) => a.name === 'General');
      if (general?.id) {
        return { kind: 'audience', audienceId: general.id, label: `audience General (${general.id})` };
      }
      const first = json.data?.[0];
      if (first?.id) {
        return { kind: 'audience', audienceId: first.id, label: `audience ${first.name} (${first.id})` };
      }
    }
  } catch {
    /* use default */
  }

  return {
    kind: 'audience',
    audienceId: RESEND_GENERAL_AUDIENCE_ID,
    label: `audience General (${RESEND_GENERAL_AUDIENCE_ID})`,
  };
}

async function targetHasContacts(resendKey: string, target: BroadcastTarget): Promise<boolean> {
  const param =
    target.kind === 'audience'
      ? `audience_id=${encodeURIComponent(target.audienceId)}`
      : `segment_id=${encodeURIComponent(target.segmentId)}`;
  const res = await fetch(`https://api.resend.com/contacts?${param}&limit=1`, {
    headers: { Authorization: `Bearer ${resendKey}` },
  });
  if (!res.ok) {
    throw new Error(`contacts list failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: unknown[] };
  return Boolean(json.data?.length);
}
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hashtagweb3.com';
const UTM = 'utm_source=newsletter&utm_medium=email&utm_campaign=daily-job-alerts';
const STATE_FILE = new URL('../.resend-broadcast-sent.json', import.meta.url).pathname;

function jobUrl(job: Job): string {
  return `${getJobPublicUrl(job, siteUrl)}?${UTM}`;
}

function loadSentIds(): Set<string> {
  try {
    const arr = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveSentIds(set: Set<string>) {
  fs.writeFileSync(STATE_FILE, JSON.stringify([...set].slice(-3000)));
}

const FONT_STACK = "'Inter', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

function buildHtml(jobs: JobListing[]): string {
  const jobsHTML = jobs.map((job) => `
   <div style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
    <a href="${job.url}" style="text-decoration: none; color: #111827; font-size: 16px; font-weight: 600;">
     ${job.title}
    </a>
    <div style="margin-top: 4px; font-size: 13px; color: #6b7280;">
     ${job.company}${job.salary ? ` - ${job.salary}` : ''}
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
    <body style="font-family: 'Inter', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.5; color: #111827; background-color: #ffffff; margin: 0; padding: 0;">
     <div style="max-width: 640px; margin: 0 auto; padding: 24px;">
      <div style="padding: 8px 0 18px 0; border-bottom: 2px solid #111827;">
       <div style="font-size: 18px; font-weight: 700; letter-spacing: 0.2px;">Hashtag Web3</div>
       <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Daily Job Alerts</div>
      </div>
      <div style="padding: 18px 0;">
       <div style="font-size: 20px; font-weight: 700; margin-bottom: 6px;">${jobs.length} new roles today</div>
       <div style="font-size: 13px; color: #6b7280; margin-bottom: 14px;">Handpicked from the latest listings on Hashtag Web3.</div>
       ${jobsHTML}
       <div style="margin-top: 18px;">
        <a href="${siteUrl}?${UTM}&utm_content=browse-all"
          style="display: inline-block; color: #111827; text-decoration: underline; font-weight: 600;">
         View all jobs at hashtagweb3.com →
        </a>
       </div>
       <div style="margin-top: 22px; padding: 18px; background-color: #f8fafc; border-radius: 10px; text-align: center;">
        <div style="font-size: 15px; font-weight: 700; color: #111827;">60,000+ get instant job alerts</div>
        <div style="margin-top: 14px;">
         <a href="https://t.me/web3hiring"
           style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px;">
          Subscribe on Telegram
         </a>
        </div>
       </div>
       <div style="margin-top: 18px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px;">
        <p style="margin: 6px 0;">Hashtag Web3 | Global Tech Recruitment</p>
        <p style="margin: 8px 0; font-size: 11px;">
         <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
        </p>
       </div>
      </div>
     </div>
    </body>
   </html>
  `;
}

function buildText(jobs: JobListing[]): string {
  const lines = jobs.map((job) => {
    const salary = job.salary ? ` | ${job.salary}` : '';
    return `${job.title} - ${job.company}${salary}\n${job.url}`;
  }).join('\n\n');
  return `HASHTAG WEB3 DAILY JOB ALERTS\n\n${jobs.length} new roles today:\n\n${lines}\n\n---\n60,000+ get instant job alerts: https://t.me/web3hiring\nView all jobs at: ${siteUrl}?${UTM}&utm_content=browse-all\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`;
}

async function main() {
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY');
    process.exit(1);
  }
  console.log(`Job broadcast (Resend) — ${isDryRun ? 'DRY RUN' : 'LIVE'}, 7-day pool, limit ${jobLimit}`);

  const allJobs = await getJobs();
  const now = new Date();
  // Selection pool: last 7 days, newest first, skipping already-emailed IDs,
  // so thin days backfill from the week and nothing ever repeats.
  const poolStart = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const sentIds = loadSentIds();
  const companyCounts = new Map<string, number>();
  const jobs: JobListing[] = [];
  const jobIds: string[] = [];
  const MAX_PER_COMPANY = 2;

  const pool = (allJobs as any[])
    .filter((j) => new Date(j.date) >= poolStart && !sentIds.has(String(j.id)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const job of pool) {
    if (jobs.length >= jobLimit) break;
    const company = job.company?.name || job.company || 'Unknown Company';
    const key = company.toLowerCase();
    const count = companyCounts.get(key) || 0;
    if (count >= MAX_PER_COMPANY) continue;
    companyCounts.set(key, count + 1);
    jobs.push({
      title: job.title,
      company,
      location: job.location || 'Remote',
      salary: job.salary,
      url: jobUrl(job as Job),
      tags: job.tags?.slice(0, 5) || [],
    });
    jobIds.push(String(job.id));
  }

  if (!jobs.length) {
    console.log('No unsent jobs in pool — nothing to send.');
    return;
  }
  console.log(`Selected ${jobs.length} jobs (newest unsent from 7-day pool, 0 repeats).`);

  const resend = new Resend(apiKey);
  const target = await resolveBroadcastTarget(apiKey);
  console.log(`Broadcast target: ${target.label}`);

  try {
    if (!(await targetHasContacts(apiKey, target))) {
      console.error(`Resend ${target.label} has no contacts.`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Could not verify Resend contacts:', err);
    process.exit(1);
  }
  const subject = `${jobs.length} new Web3 roles today — ${jobs[0].title} @ ${jobs[0].company}`;
  const html = buildHtml(jobs);
  const text = buildText(jobs);

  if (args.includes('--preview')) {
    console.log('--- SUBJECT ---\n' + subject + '\n--- TEXT BODY ---\n' + text);
    return;
  }

  if (isDryRun) {
    // Validate end-to-end by creating a draft, then delete it. Never sends.
    const created = await resend.broadcasts.create({
      ...broadcastCreatePayload(target),
      from,
      subject: `[DRY-RUN] ${subject}`,
      html,
      text,
      name: `dry-run ${new Date().toISOString()}`,
    });
    if (created.error) {
      console.error('Dry-run draft failed:', created.error);
      process.exit(1);
    }
    const id = (created.data as any)?.id;
    console.log(`Dry-run draft created: ${id}. Deleting.`);
    if (id) await resend.broadcasts.remove(id);
    console.log(`Dry run OK: ${jobs.length} jobs, subject ready, ${target.label} reachable.`);
    return;
  }

  const sent = await resend.broadcasts.create({
    ...broadcastCreatePayload(target),
    from,
    subject,
    html,
    text,
    name: `job-alerts ${new Date().toISOString().slice(0, 10)}`,
    send: true,
  });
  if (sent.error) {
    console.error('Broadcast failed:', sent.error);
    process.exit(1);
  }
  console.log(`Broadcast sent: ${(sent.data as any)?.id} (${jobs.length} jobs).`);
  for (const id of jobIds) sentIds.add(id);
  saveSentIds(sentIds);
}

main().catch((e) => {
  console.error('Fatal:', e?.message || e);
  process.exit(1);
});
