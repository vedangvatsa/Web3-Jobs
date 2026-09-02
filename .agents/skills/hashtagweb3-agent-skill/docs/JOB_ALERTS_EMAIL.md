# Job Alert Email System Setup

## Overview
Automated email system that sends job alerts to subscribers stored in Firebase.

## Quick Start

### 1. Get Resend API Key
1. Sign up at https://resend.com (free tier: 100 emails/day, 3,000/month)
2. Create an API key
3. Verify your domain (or use resend's test domain for development)

### 2. Add Environment Variables
Add to your `.env.local`:

```bash
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email From Address (must be verified domain)
EMAIL_FROM="Web3 Jobs <jobs@hashtagweb3.com>"

# API Security
CRON_SECRET=your-random-secret-token-here

# Site URL
NEXT_PUBLIC_SITE_URL=https://hashtagweb3.com
```

### 3. Test the System

**Dry run** (preview without sending):
```bash
npm run send-alerts -- --dry-run
```

**Send to all subscribers**:
```bash
npm run send-alerts
```

**Send only 5 latest jobs**:
```bash
npm run send-alerts -- --limit 5
```

## How It Works

1. **Subscriber Collection**: Emails stored in Firestore `subscribers` collection
2. **Job Alerts Script**: Fetches latest jobs from `jobs-cache.json`
3. **Email Service**: Sends beautiful HTML emails via Resend
4. **Batch Processing**: Rate-limited sending to avoid spam filters

## Email Features

✅ Beautiful HTML email template  
✅ Job cards with company, location, salary  
✅ Tags/skills for each job  
✅ Direct links to job pages  
✅ Unsubscribe link  
✅ Plain text fallback  
✅ Mobile responsive  

## Automation Options

### Option 1: GitHub Actions (Recommended)
Create `.github/workflows/send-job-alerts.yml`:

```yaml
name: Send Job Alerts

on:
  schedule:
    # Run every Monday at 9 AM UTC
    - cron: '0 9 * * 1'
  workflow_dispatch: # Manual trigger

jobs:
  send-alerts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run send-alerts
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          CRON_SECRET: ${{ secrets.CRON_SECRET }}
          NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
          # Add Firebase config secrets
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
```

### Option 2: Vercel Cron
Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/send-job-alerts",
    "schedule": "0 9 * * 1"
  }]
}
```

### Option 3: Manual Trigger
Run locally or via cron job:
```bash
0 9 * * 1 cd /path/to/project && npm run send-alerts
```

## API Endpoint

**POST** `/api/send-job-alerts`

Headers:
```
Authorization: Bearer YOUR_CRON_SECRET
Content-Type: application/json
```

Body:
```json
{
  "jobs": [
    {
      "title": "Senior Solidity Developer",
      "company": "Uniswap Labs",
      "location": "Remote",
      "salary": "$150k - $250k",
      "url": "https://hashtagweb3.com/jobs/123",
      "tags": ["Solidity", "DeFi", "Smart Contracts"]
    }
  ],
  "dryRun": false
}
```

## Monitoring

Check script output for:
- Number of subscribers
- Emails sent successfully
- Failed sends
- Rate limiting status

## Troubleshooting

**No emails sending**:
- Check RESEND_API_KEY is set
- Verify domain in Resend dashboard
- Check rate limits (100/day on free tier)

**Permission denied**:
- Verify Firestore rules allow reading subscribers collection
- Check Firebase credentials are correct

**Emails going to spam**:
- Verify your domain in Resend
- Add SPF/DKIM records
- Don't send too frequently

## Best Practices

1. **Frequency**: Weekly (Monday mornings) or bi-weekly
2. **Job Count**: 5-10 jobs per email (not overwhelming)
3. **Segmentation**: Consider filtering by skills/preferences (future enhancement)
4. **Testing**: Always dry-run before sending to all subscribers
5. **Monitoring**: Track open rates in Resend dashboard

## Future Enhancements

- [ ] User preferences (job categories, skills)
- [ ] Unsubscribe page
- [ ] Email open/click tracking
- [ ] A/B testing email templates
- [ ] Personalized job recommendations
- [ ] Digest frequency selection (daily/weekly/monthly)
