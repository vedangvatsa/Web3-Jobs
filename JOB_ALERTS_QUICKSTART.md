# 📧 Job Alert Email System - Quick Reference

## ✅ What's Installed
- **Resend** email service (7 packages added)
- Email templates with beautiful HTML design
- API endpoint for sending alerts
- CLI script for manual/automated sending

## 🚀 Next Steps

### 1. Get Resend API Key (2 minutes)
```bash
# Visit https://resend.com
# Sign up (free: 100 emails/day, 3,000/month)
# Go to API Keys → Create API Key
# Copy the key starting with "re_"
```

### 2. Add to .env.local
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM="Web3 Jobs <jobs@yourdomain.com>"
CRON_SECRET=any-random-secret-string-here
NEXT_PUBLIC_SITE_URL=https://web3jobs.so
```

### 3. Test It!
```bash
# Preview without sending (recommended first)
npm run send-alerts -- --dry-run

# Send 3 latest jobs to all subscribers
npm run send-alerts -- --limit 3

# Send 10 latest jobs (default)
npm run send-alerts
```

## 📊 What Happens

```
npm run send-alerts
  ↓
1. Fetches all emails from Firebase 'subscribers' collection
2. Gets latest jobs from jobs-cache.json
3. Creates beautiful HTML email with job cards
4. Sends to each subscriber (rate-limited)
5. Reports: sent/failed/total
```

## 📧 Email Preview

Each email includes:
- 📌 Job title + company name (clickable)
- 📍 Location + salary
- 🏷️ Tags/skills
- 🔗 "View Job" button
- 🔗 "Browse All Jobs" CTA
- 👋 Unsubscribe link

## ⚙️ Automate It

### GitHub Actions (Weekly)
Add `.github/workflows/send-job-alerts.yml` - see docs/JOB_ALERTS_EMAIL.md

### Vercel Cron
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/send-job-alerts",
    "schedule": "0 9 * * 1"
  }]
}
```

### Local Cron (macOS/Linux)
```bash
# Edit crontab
crontab -e

# Add this line (runs every Monday 9am)
0 9 * * 1 cd /path/to/project && npm run send-alerts
```

## 🐛 Troubleshooting

**"RESEND_API_KEY is missing"**
→ Add to .env.local and restart

**"No subscribers found"**
→ Check Firebase 'subscribers' collection has data

**Emails go to spam**
→ Verify domain in Resend dashboard + add DNS records

**Rate limit hit**
→ Free tier: 100/day. Upgrade or reduce frequency

## 📈 Monitor Results

Check in Resend dashboard:
- Emails sent/failed
- Open rates
- Click rates
- Bounce rates

## 🎯 Best Practices

✅ **Frequency**: Weekly (Mondays 9am)  
✅ **Job Count**: 5-10 jobs per email  
✅ **Always dry-run** before first real send  
✅ **Track metrics** in Resend dashboard  
✅ **Test with your own email** first  

## 📁 Files Created

```
src/
  lib/
    email.ts                    # Email sending logic + templates
  app/
    api/
      send-job-alerts/
        route.ts               # API endpoint
scripts/
  send-job-alerts.ts           # CLI script
docs/
  JOB_ALERTS_EMAIL.md          # Full documentation
```

## 💡 Future Ideas

- [ ] Unsubscribe page
- [ ] User preferences (skills, location)
- [ ] Personalized recommendations
- [ ] A/B test email templates
- [ ] Weekly digest with stats

---

**Ready to send your first alert?**
```bash
npm run send-alerts -- --dry-run
```

See full docs: `docs/JOB_ALERTS_EMAIL.md`
