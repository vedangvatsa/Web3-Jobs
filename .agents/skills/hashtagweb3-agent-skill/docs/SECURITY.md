# 🔒 Security Guidelines for Job Alert System

## ✅ API Key Protection - Already Secured

Your Resend API key is properly protected:

### 1. `.env.local` File Protection
- ✅ API key stored in `.env.local` (not committed to Git)
- ✅ `.env.local` is in `.gitignore`
- ✅ All `.env*` files are blocked from Git

### 2. Environment Variable Usage
- ✅ Code references `process.env.RESEND_API_KEY`
- ✅ No hardcoded API keys in source code
- ✅ API key only exists in local environment files

### 3. What's Protected
```
.env.local           ← Contains your API key (never committed)
.gitignore           ← Blocks all .env* files
src/lib/email.ts     ← Uses process.env.RESEND_API_KEY
```

## 🛡️ Additional Security Measures

### API Endpoint Protection
The `/api/send-job-alerts` endpoint is protected with:

```typescript
// Required authorization header
Authorization: Bearer YOUR_CRON_SECRET
```

This prevents unauthorized users from triggering mass emails.

### Rate Limiting
Built-in protections:
- 100ms delay between emails (batch processing)
- Resend free tier limits: 100 emails/day, 3,000/month
- Test mode restricts sending to verified email only

## 🔐 Production Checklist

### Before Going Live:

1. **Generate Strong CRON_SECRET**
   ```bash
   # Generate a random 32-character secret
   openssl rand -hex 32
   ```
   Update in `.env.local`:
   ```
   CRON_SECRET=<generated-secret>
   ```

2. **Verify Domain in Resend**
   - Go to https://resend.com/domains
   - Add `hashtagweb3.com`
   - Add DNS records (SPF, DKIM)
   - Update `EMAIL_FROM` to use verified domain:
     ```
     EMAIL_FROM="HashTag Web3 Jobs <jobs@hashtagweb3.com>"
     ```

3. **Deployment Secrets** (GitHub/Vercel)
   
   **GitHub Secrets** (for GitHub Actions):
   ```
   Settings → Secrets and Variables → Actions → New repository secret
   ```
   Add:
   - `RESEND_API_KEY`
   - `CRON_SECRET`
   - All Firebase config vars

   **Vercel Environment Variables**:
   ```
   Project Settings → Environment Variables
   ```
   Add same secrets as above.

4. **Firestore Security Rules**
   Ensure subscribers collection has proper read/write rules:
   ```javascript
   match /subscribers/{document} {
     // Allow creates from client
     allow create: if request.auth != null || true;
     // Only backend can read all subscribers
     allow read: if request.auth.token.admin == true;
   }
   ```

## 🚨 Security Don'ts

❌ **Never commit `.env.local`**
❌ **Never hardcode API keys**
❌ **Never expose CRON_SECRET publicly**
❌ **Never log full email addresses in public logs**
❌ **Never commit `subscribers.csv` export**

## ✅ Security Do's

✅ Use environment variables for all secrets
✅ Rotate API keys periodically
✅ Monitor Resend dashboard for unusual activity
✅ Use strong random tokens for CRON_SECRET
✅ Enable 2FA on Resend account
✅ Review email sending logs regularly

## 🔍 Verify Security Status

Run these checks:

```bash
# 1. Ensure .env files are ignored
git check-ignore .env.local
# Should output: .env.local

# 2. Check for accidentally committed secrets
git log --all --full-history -- .env.local
# Should be empty

# 3. Verify no hardcoded keys in code
grep -r "re_" src/ --exclude-dir=node_modules
# Should only show process.env references

# 4. Check .gitignore
cat .gitignore | grep "\.env"
# Should show .env* patterns
```

## 📊 Monitor API Usage

Track in Resend dashboard:
- Emails sent per day
- Failed sends
- Bounce rates
- API key usage

Set up alerts for:
- Unusual spike in email volume
- High failure rates
- API rate limit warnings

## 🔄 Key Rotation

Rotate API keys every 90 days:

1. Generate new key in Resend
2. Update `.env.local`
3. Update deployment secrets (GitHub/Vercel)
4. Test with dry-run
5. Delete old key from Resend

## 📝 Audit Log

Keep track of:
- When alerts are sent (check terminal output)
- Number of recipients
- Any failures or bounces
- API key rotation dates

---

**Current Security Status**: ✅ Secure
- API key protected in `.env.local`
- Gitignore configured correctly
- No secrets in source code
- CRON endpoint protected with bearer token
