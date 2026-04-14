#!/usr/bin/env node

/**
 * Send a promotional email blast to all subscribers.
 * Usage: npx tsx scripts/send-promo-email.ts [--dry-run]
 *
 * Requires same env vars as send-new-jobs.ts:
 *   FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_JSON
 *   AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY, AWS_SES_REGION
 */

import * as admin from 'firebase-admin';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const SUBJECT = 'Hashtag Web3 x Network School';

const UTM = {
  source: 'email',
  medium: 'newsletter',
  campaign: 'ns-promo-apr2026',
};

function utm(baseUrl: string, content: string): string {
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}utm_source=${UTM.source}&utm_medium=${UTM.medium}&utm_campaign=${UTM.campaign}&utm_content=${content}`;
}

const NS_APPLY_URL = utm('https://ns.com', 'ns-apply-cta');
const HW3_URL = utm('https://hashtagweb3.com', 'hw3-link');
const TELEGRAM_URL = utm('https://t.me/web3hiring', 'telegram-link');
const CVIN_URL = utm('https://cvin.bio', 'cvin-cta');

// ─── HTML TEMPLATE ───────────────────────────────────────────────────────────

function generatePromoHTML(): string {
  const unsubscribeUrl = process.env.EMAIL_UNSUBSCRIBE_URL || 'https://hashtagweb3.com/unsubscribe';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #f9fafb; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <div style="background: #ffffff; border-radius: 12px; padding: 36px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">

      <!-- Header -->
      <div style="font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #9ca3af; text-transform: uppercase; margin-bottom: 28px;">
        HASHTAG WEB3 X NETWORK SCHOOL
      </div>

      <!-- Main pitch -->
      <p style="font-size: 17px; color: #374151; margin: 0 0 16px 0;">
        Network School is a startup society on an island off the coast of Singapore — coworking, serviced rooms, healthy meals, gym, content studio, workshops, and more.
      </p>

      <p style="font-size: 17px; color: #374151; margin: 0 0 24px 0;">
        Selected applicants are eligible to receive a <strong>free 1-week stay</strong> when accepted into a month-long cohort.
      </p>

      <!-- Primary CTA -->
      <div style="margin-bottom: 32px;">
        <a href="${NS_APPLY_URL}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 100px; font-size: 16px; font-weight: 600;">
          Apply now →
        </a>
      </div>

      <!-- Divider -->
      <div style="border-top: 1px solid #e5e7eb; margin: 28px 0;"></div>

      <!-- HW3 plug -->
      <p style="font-size: 16px; color: #374151; margin: 0 0 12px 0;">
        We run <a href="${HW3_URL}" style="color: #111827; font-weight: 700; text-decoration: underline;">hashtagweb3.com</a> — a curated feed of web3 jobs from companies that are actually hiring. No ghost listings.
      </p>

      <p style="font-size: 16px; color: #374151; margin: 0 0 4px 0;">
        Join 60k+ subscribers getting daily web3 job drops on Telegram:
      </p>
      <p style="margin: 0 0 12px 0;">
        <a href="${TELEGRAM_URL}" style="color: #111827; font-weight: 700; text-decoration: underline;">t.me/web3hiring →</a>
      </p>

      <!-- Divider -->
      <div style="border-top: 1px solid #e5e7eb; margin: 28px 0;"></div>

      <!-- CVin.bio plug -->
      <p style="font-size: 16px; color: #374151; margin: 0 0 12px 0;">
        When you do apply — stop sending PDFs. A link gets opened. A PDF gets ignored.
      </p>
      <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0;">
        Turn your CV into a live link in 2 minutes. Free.
      </p>

      <div>
        <a href="${CVIN_URL}" style="display: inline-block; border: 2px solid #111827; color: #111827; text-decoration: none; padding: 12px 24px; border-radius: 100px; font-size: 15px; font-weight: 600;">
          cvin.bio →
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #9ca3af; line-height: 1.6;">
      <p style="margin: 4px 0;">Hashtag Web3 | Global Tech Recruitment</p>
      <p style="margin: 4px 0;">You're receiving this because you opted in to Hashtag Web3 job alerts.</p>
      <p style="margin: 8px 0;">
        <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function generatePromoText(): string {
  return `HASHTAG WEB3 X NETWORK SCHOOL

Network School is a startup society on an island off the coast of Singapore — coworking, serviced rooms, healthy meals, gym, content studio, workshops, and more.

Selected applicants are eligible to receive a free 1-week stay when accepted into a month-long cohort.

Apply now: ${NS_APPLY_URL}

---

We run hashtagweb3.com — a curated feed of web3 jobs from companies that are actually hiring. No ghost listings.

Join 60k+ subscribers on Telegram: ${TELEGRAM_URL}

---

When you do apply — stop sending PDFs. A link gets opened. A PDF gets ignored.
Turn your CV into a live link in 2 minutes. Free.

cvin.bio: ${CVIN_URL}

---
Hashtag Web3 | Global Tech Recruitment
You're receiving this because you opted in to Hashtag Web3 job alerts.
`;
}

// ─── INFRA ───────────────────────────────────────────────────────────────────

function initAdminFirestore(): admin.firestore.Firestore {
  if (admin.apps.length) return admin.firestore();

  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!base64Key && !rawJson) {
    throw new Error('No Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_JSON.');
  }

  const sa = JSON.parse(base64Key ? Buffer.from(base64Key, 'base64').toString('utf8') : rawJson!);
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  return admin.firestore();
}

async function fetchAllSubscribers(db: admin.firestore.Firestore): Promise<string[]> {
  const [subSnap, manualSnap] = await Promise.all([
    db.collection('subscribers').get(),
    db.collection('manual_additions').get(),
  ]);

  const all = [
    ...subSnap.docs.map(d => (d.data().email as string)?.toLowerCase().trim()),
    ...manualSnap.docs.map(d => (d.data().email as string)?.toLowerCase().trim()),
  ].filter(Boolean);

  const unique = [...new Set(all)];
  console.log(`✅ ${unique.length} unique subscribers (subscribers: ${subSnap.size}, manual: ${manualSnap.size})`);
  return unique;
}

async function sendOneEmail(client: SESv2Client, to: string): Promise<{ success: boolean; error?: string }> {
  try {
    const fromField = `${process.env.EMAIL_FROM_NAME || 'Hashtag Web3'} <${process.env.EMAIL_FROM || 'hi@hashtagweb3.com'}>`;
    await client.send(new SendEmailCommand({
      FromEmailAddress: fromField,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: SUBJECT, Charset: 'UTF-8' },
          Body: {
            Html: { Data: generatePromoHTML(), Charset: 'UTF-8' },
            Text: { Data: generatePromoText(), Charset: 'UTF-8' },
          },
        },
      },
    }));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`\n📣 PROMO EMAIL: "${SUBJECT}"`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`UTM: ${JSON.stringify(UTM)}\n`);

  if (!process.env.AWS_SES_ACCESS_KEY_ID || !process.env.AWS_SES_SECRET_ACCESS_KEY) {
    console.error('❌ AWS SES credentials missing');
    process.exit(1);
  }

  const db = initAdminFirestore();
  const emails = await fetchAllSubscribers(db);

  if (isDryRun) {
    console.log(`\n📋 DRY RUN — would send to ${emails.length} subscribers`);
    console.log(`Sample: ${emails.slice(0, 5).join(', ')}`);
    console.log(`\nSubject: ${SUBJECT}`);
    console.log(`NS CTA: ${NS_APPLY_URL}`);
    console.log(`HW3: ${HW3_URL}`);
    console.log(`Telegram: ${TELEGRAM_URL}`);
    console.log(`CVin: ${CVIN_URL}`);
    console.log('\n✅ Dry run complete. Remove --dry-run to send.');
    process.exit(0);
  }

  // Live send
  const client = new SESv2Client({
    region: process.env.AWS_SES_REGION || 'us-west-1',
    credentials: {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
    },
  });

  let sent = 0, failed = 0;
  const CONCURRENCY = 10;

  for (let i = 0; i < emails.length; i += CONCURRENCY) {
    const batch = emails.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(e => sendOneEmail(client, e)));

    for (const r of results) {
      if (r.success) sent++; else { failed++; console.error(`  ❌ ${r.error}`); }
    }

    if ((i + CONCURRENCY) % 100 === 0 || i + CONCURRENCY >= emails.length) {
      console.log(`  Progress: ${Math.min(i + CONCURRENCY, emails.length)}/${emails.length} (sent: ${sent}, failed: ${failed})`);
    }
  }

  console.log(`\n✅ Done! Sent: ${sent}, Failed: ${failed}`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
