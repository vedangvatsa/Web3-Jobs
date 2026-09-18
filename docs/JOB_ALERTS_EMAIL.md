# Job Alert Email System Setup

## Overview
Daily job alerts go out as a **Resend broadcast** to a segment (not per-subscriber Firestore sends).

**Production path:** `.github/workflows/daily-job-alerts.yml` → `npx tsx scripts/send-resend-broadcast.ts`  
**Local / manual:** `npm run send-alerts` (same script)  
**Unsubscribe:** `/api/email/unsubscribe?token=...` (links in the email)

## Quick Start

### 1. Get Resend API Key
1. Sign up at https://resend.com
2. Create an API key and a segment for subscribers
3. Verify your sending domain

### 2. Add Environment Variables
Add to your `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_SEGMENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
EMAIL_FROM="Alex <alex@hi.hashtagweb3.com>"
NEXT_PUBLIC_SITE_URL=https://hashtagweb3.com
UNSUBSCRIBE_SECRET=your-random-secret
```

### 3. Test the System

```bash
npm run send-alerts -- --dry-run
npm run send-alerts -- --limit 5
npm run send-alerts
```

## How It Works

1. **Subscribers** live in Resend (segment / audience)
2. **Broadcast script** picks recent jobs and sends one broadcast
3. **Resend** excludes unsubscribed contacts automatically
4. **Unsubscribe links** hit `/api/email/unsubscribe`

## Automation

Use [`.github/workflows/daily-job-alerts.yml`](../.github/workflows/daily-job-alerts.yml) (scheduled twice daily UTC as primary + backup). Manual runs: Actions → Daily Job Alerts → workflow_dispatch.

Legacy `POST /api/send-job-alerts` and `GET /api/cron/daily-alerts` were removed — do not point external cron at those URLs.
