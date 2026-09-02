# LinkedIn Integration Setup Guide

This guide walks through setting up automatic LinkedIn posting for Web3-Jobs.

## What's Configured

✅ **Auto-posting** - New jobs post to LinkedIn automatically
✅ **OAuth** - Secure LinkedIn authorization
✅ **Tracking** - Records which jobs posted and when
✅ **Error handling** - Gracefully handles posting failures

## Credentials Stored

Your LinkedIn credentials need to be in **Firebase Secret Manager**:

```bash
gcloud secrets create LINKEDIN_CLIENT_ID --data-file=-
gcloud secrets create LINKEDIN_CLIENT_SECRET --data-file=-
gcloud secrets create LINKEDIN_ORG_ID --data-file=-
gcloud secrets create LINKEDIN_ACCESS_TOKEN --data-file=-
gcloud secrets create LINKEDIN_REDIRECT_URI --data-file=-
```

Or manually add to `.env.local`:

```env
LINKEDIN_CLIENT_ID=86t2x4x9ieabr0
LINKEDIN_CLIENT_SECRET=WPL_AP1.yKGp8H9nbcpBfO1O.ypwx5w==
LINKEDIN_ORG_ID=89714573
LINKEDIN_ACCESS_TOKEN=<will_be_obtained_via_oauth>
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
```

## Step 1: Get Access Token

Run this to get the OAuth authorization URL:

```typescript
// In your app or console
import { getLinkedInAuthUrl } from '@/lib/linkedin';

const authUrl = getLinkedInAuthUrl('state_123');
console.log('Visit:', authUrl);
```

Or manually construct:
```
https://www.linkedin.com/oauth/v2/authorization?
  response_type=code&
  client_id=86t2x4x9ieabr0&
  redirect_uri=http://localhost:3000/api/auth/linkedin/callback&
  state=random_state&
  scope=w_member_social%20w_organization_social
```

1. Click the link
2. Log in with your LinkedIn account
3. Authorize the app
4. You'll be redirected to `http://localhost:3000/api/auth/linkedin/callback?code=...`
5. The system automatically stores the access token

## Step 2: Post Jobs Automatically

**Option A: Manual trigger**
```bash
pnpm linkedin:post-jobs
```

**Option B: Automatic on job creation**

Add to `src/app/api/jobs/route.ts`:
```typescript
import { autoPostJobs } from '@/scripts/linkedin-auto-post';

export async function POST(request: NextRequest) {
  // ... create job ...
  
  // Post to LinkedIn if enabled
  if (process.env.LINKEDIN_ACCESS_TOKEN) {
    await postToLinkedIn(formatJobForLinkedIn(newJob));
  }
}
```

**Option C: Scheduled Cloud Function**

```typescript
import { onSchedule } from 'firebase-functions/scheduler';
import { autoPostJobs } from './linkedin-auto-post';

export const postJobsToLinkedIn = onSchedule(
  'every day 09:00', // Post daily at 9 AM
  async (context) => {
    await autoPostJobs();
  }
);
```

## Step 3: Monitor Posted Jobs

Jobs will have these fields when posted:

```javascript
{
  title: "Senior Solidity Engineer",
  company: "Uniswap",
  postedToLinkedIn: true,
  linkedInPostId: "urn:li:share:7210000001234567890",
  linkedInPostUrl: "https://www.linkedin.com/feed/update/urn:li:share:...",
  postedToLinkedInAt: 2026-03-11T12:34:56.000Z
}
```

## Troubleshooting

**"LinkedIn access token not set"**
- Run OAuth flow first
- Check Firebase Secret Manager or `.env.local`

**"Failed to register image"**
- Job posts without company logo
- Check that image URL is publicly accessible

**"Too many requests"**
- LinkedIn rate limits to ~1 request/sec
- Script automatically waits 2 seconds between posts

**"LinkedIn API error: 401"**
- Access token expired
- Re-run OAuth flow to get new token

## API Reference

### postToLinkedIn(options)
Post content to LinkedIn company page.

```typescript
import { postToLinkedIn } from '@/lib/linkedin';

const result = await postToLinkedIn({
  content: '🚀 We are hiring!',
  imageUrl: 'https://example.com/image.jpg',
  linkUrl: 'https://hashtagweb3.com/jobs/123',
  linkTitle: 'Apply Now',
  linkDescription: 'Senior Engineer role in Web3'
});
// Returns: { postId, url, success }
```

### formatJobForLinkedIn(job)
Format a job object for LinkedIn posting.

```typescript
import { formatJobForLinkedIn } from '@/lib/linkedin';

const options = formatJobForLinkedIn({
  title: 'Solidity Engineer',
  company: 'Aave',
  salary: '$150k-200k',
  location: 'Remote',
  url: 'https://...',
  companyLogo: 'https://...'
});
```

### getLinkedInAuthUrl(state)
Generate OAuth authorization URL.

```typescript
import { getLinkedInAuthUrl } from '@/lib/linkedin';

const url = getLinkedInAuthUrl('random_state_123');
// User visits this URL to authorize
```

## Files Created

- `src/lib/linkedin.ts` - Core API integration
- `scripts/linkedin-auto-post.ts` - Auto-posting script
- `src/app/api/auth/linkedin/callback/route.ts` - OAuth callback handler
- `LINKEDIN_SETUP.md` - This file

## Next Steps

1. ✅ Store credentials in Firebase Secret Manager
2. ✅ Get OAuth access token via authorization URL
3. ✅ Test with `pnpm linkedin:post-jobs`
4. ✅ Enable automatic posting on job creation
5. ✅ Monitor posted jobs in Firestore

---

**Questions?** Check LinkedIn API docs: https://docs.microsoft.com/en-us/linkedin/marketing/
