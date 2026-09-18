/**
 * resend-daily.ts — shared daily job-alerts broadcast logic.
 *
 * Used by scripts/send-resend-broadcast.ts (GitHub Action:
 * .github/workflows/daily-job-alerts.yml). Callers are thin wrappers.
 *
 * Throws on failure (callers map to exit codes). Never exits.
 */

import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';
import { getJobs } from '@/lib/jobs';
import { getJobPublicUrl } from '@/lib/job-slugs';
import type { JobListing } from '@/lib/email';
import type { Job } from '@/types';
import {
  countSegmentContacts,
  findActiveJobAlertsBroadcasts,
  jobAlertsBroadcastName,
  loadLastBroadcastSend,
  minSegmentContactsThreshold,
  RESEND_GENERAL_SEGMENT_ID,
  saveLastBroadcastSend,
  utcDateKey,
} from '../../scripts/resend-broadcast-guards';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hashtagweb3.com';
const UTM = 'utm_source=newsletter&utm_medium=email&utm_campaign=daily-job-alerts';
// process.cwd() is the repo root both for tsx scripts and the App Hosting
// runtime. (On App Hosting the filesystem is ephemeral per instance: the
// sent-ids file is best-effort dedup there, while the per-day send lock
// additionally checks Resend server-side, so double-sends stay impossible.)
const STATE_FILE = path.join(process.cwd(), '.resend-broadcast-sent.json');

type BroadcastTarget = { segmentId: string; label: string };

async function resolveBroadcastTarget(resendKey: string): Promise<BroadcastTarget> {
  const envSegment = process.env.RESEND_SEGMENT_ID?.trim() || process.env.RESEND_AUDIENCE_ID?.trim();
  if (envSegment) {
    return { segmentId: envSegment, label: `segment ${envSegment}` };
  }

  try {
    const res = await fetch('https://api.resend.com/segments', {
      headers: { Authorization: `Bearer ${resendKey}` },
    });
    if (res.ok) {
      const json = (await res.json()) as { data?: Array<{ id: string; name: string }> };
      const general = json.data?.find((a) => a.name === 'General');
      if (general?.id) {
        return { segmentId: general.id, label: `segment General (${general.id})` };
      }
      const daily = json.data?.find((a) => a.name === 'Daily');
      if (daily?.id) {
        return { segmentId: daily.id, label: `segment Daily (${daily.id})` };
      }
      const first = json.data?.[0];
      if (first?.id) {
        return { segmentId: first.id, label: `segment ${first.name} (${first.id})` };
      }
    }
  } catch {
    /* use default */
  }

  return {
    segmentId: RESEND_GENERAL_SEGMENT_ID,
    label: `segment General (${RESEND_GENERAL_SEGMENT_ID})`,
  };
}

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

export function buildHtml(jobs: JobListing[]): string {
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
       <div style="font-size: 20px; font-weight: 700; margin-bottom: 14px;">${jobs.length} new roles today</div>
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

export function buildText(jobs: JobListing[]): string {
  const lines = jobs.map((job) => {
    const salary = job.salary ? ` | ${job.salary}` : '';
    return `${job.title} - ${job.company}${salary}\n${job.url}`;
  }).join('\n\n');
  return `HASHTAG WEB3 DAILY JOB ALERTS\n\n${jobs.length} new roles today:\n\n${lines}\n\n---\n60,000+ get instant job alerts: https://t.me/web3hiring\nView all jobs at: ${siteUrl}?${UTM}&utm_content=browse-all\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`;
}

export interface DailyBroadcastOptions {
  jobLimit?: number;
  dryRun?: boolean;
  forceSend?: boolean;
  preview?: boolean;
  from?: string;
}

export interface DailyBroadcastResult {
  status: 'sent' | 'dry-run' | 'preview' | 'skipped' | 'empty';
  broadcastId?: string;
  jobs?: number;
  subject?: string;
  message?: string;
}

async function assertSafeToSendLive(resendKey: string, forceSend: boolean): Promise<void> {
  const today = utcDateKey();
  const prior = loadLastBroadcastSend();
  if (!forceSend && prior?.dateUtc === today) {
    throw new Error(
      `SKIP: daily broadcast already recorded for ${today}` +
        (prior.broadcastId ? ` (${prior.broadcastId})` : ''),
    );
  }

  const active = await findActiveJobAlertsBroadcasts(resendKey, today);
  if (!active.length) return;

  if (forceSend) {
    console.warn(`Warning: ${active.length} active job-alerts broadcast(s) for ${today} already exist in Resend.`);
    return;
  }

  const canonical = prior?.broadcastId;
  const primary = active.find((r) => r.id === canonical) ?? active[0];
  if (primary?.id && primary.id !== canonical) {
    saveLastBroadcastSend(primary.id);
  }
  throw new Error(
    `SKIP: Resend already has an active broadcast for ${today}: ${primary.id} (${primary.status}).`,
  );
}

export async function runDailyBroadcast(opts: DailyBroadcastOptions = {}): Promise<DailyBroadcastResult> {
  const { jobLimit = 10, dryRun = false, forceSend = false, preview = false } = opts;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  const from = opts.from || process.env.EMAIL_FROM || 'Alex <alex@hi.hashtagweb3.com>';

  console.log(`Job broadcast (Resend) — ${dryRun ? 'DRY RUN' : 'LIVE'}, 7-day pool, limit ${jobLimit}`);

  if (!dryRun && !preview) {
    try {
      await assertSafeToSendLive(apiKey, forceSend);
    } catch (e: any) {
      if (String(e?.message || '').startsWith('SKIP:')) {
        console.log(String(e.message).slice(5).trim() || 'Skipped.');
        return { status: 'skipped', message: String(e.message) };
      }
      throw e;
    }
  }

  const allJobs = await getJobs();
  const now = new Date();
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
    return { status: 'empty' };
  }
  console.log(`Selected ${jobs.length} jobs (newest unsent from 7-day pool, 0 repeats).`);

  const resend = new Resend(apiKey);
  const target = await resolveBroadcastTarget(apiKey);
  console.log(`Broadcast target: ${target.label}`);

  const minContacts = minSegmentContactsThreshold();
  let segmentCount: number;
  try {
    segmentCount = await countSegmentContacts(apiKey, target.segmentId, 3000, minContacts);
  } catch (err) {
    throw new Error(`Could not verify Resend contacts: ${err}`);
  }
  console.log(`Segment subscribers (subscribed): ${segmentCount.toLocaleString()} (min ${minContacts.toLocaleString()})`);
  if (segmentCount === 0) {
    throw new Error(`Resend ${target.label} has no segment members. Run sync-resend-broadcast-segment.ts.`);
  }
  if (segmentCount < minContacts) {
    throw new Error(
      `Segment ${target.segmentId} has only ${segmentCount} subscribed contacts (expected at least ${minContacts}).`,
    );
  }

  const subject = `${jobs.length} new Web3 roles today`;
  const html = buildHtml(jobs);
  const text = buildText(jobs);

  if (preview) {
    console.log('--- SUBJECT ---\n' + subject + '\n--- TEXT BODY ---\n' + text);
    return { status: 'preview', jobs: jobs.length, subject };
  }

  if (dryRun) {
    const created = await resend.broadcasts.create({
      segmentId: target.segmentId,
      from,
      subject: `[DRY-RUN] ${subject}`,
      html,
      text,
      name: `dry-run ${new Date().toISOString()}`,
    });
    if (created.error) throw new Error(`Dry-run draft failed: ${JSON.stringify(created.error)}`);
    const id = (created.data as any)?.id;
    console.log(`Dry-run draft created: ${id}. Deleting.`);
    if (id) await resend.broadcasts.remove(id);
    console.log(`Dry run OK: ${jobs.length} jobs, subject ready, ${target.label} reachable.`);
    return { status: 'dry-run', jobs: jobs.length, subject };
  }

  const sent = await resend.broadcasts.create({
    segmentId: target.segmentId,
    from,
    subject,
    html,
    text,
    name: jobAlertsBroadcastName(),
    send: true,
  });
  if (sent.error) throw new Error(`Broadcast failed: ${JSON.stringify(sent.error)}`);
  const broadcastId = (sent.data as { id?: string })?.id;
  console.log(`Broadcast sent: ${broadcastId} (${jobs.length} jobs).`);
  if (broadcastId) saveLastBroadcastSend(broadcastId);
  for (const id of jobIds) sentIds.add(id);
  saveSentIds(sentIds);
  return { status: 'sent', broadcastId, jobs: jobs.length, subject };
}

export { FONT_STACK };
