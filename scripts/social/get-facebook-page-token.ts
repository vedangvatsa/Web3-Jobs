#!/usr/bin/env npx tsx
/**
 * Facebook Page Token Generator & Saver for Hashtag Web3
 *
 * Exchanges a User Access Token for a NEVER-EXPIRING Page Access Token
 * and automatically saves META_PAGE_ID & META_PAGE_TOKEN to .env.local.
 *
 * Usage:
 *   1. Go to: https://developers.facebook.com/tools/explorer/
 *   2. Select App: "HashtagWeb3.com" (1504312414704579)
 *   3. Under User or Page, select "Get User Access Token"
 *   4. Check permissions:
 *        - pages_show_list
 *        - pages_read_engagement
 *        - pages_manage_posts
 *   5. Click "Generate Access Token" and copy it
 *   6. Run:
 *        npx tsx scripts/social/get-facebook-page-token.ts <USER_ACCESS_TOKEN>
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env.local') });

const APP_ID = process.env.THREADS_APP_ID || '1504312414704579';
const APP_SECRET = process.env.THREADS_APP_SECRET || '46acaf706daddf243d7d47fcdb0f97a4';
const userTokenInput = process.argv[2];

if (!userTokenInput) {
  console.log(`
========================================================================
 🔑 Facebook Page Token Helper for Hashtag Web3
========================================================================

How to get your User Access Token in 30 seconds:

1. Open Graph API Explorer:
   https://developers.facebook.com/tools/explorer/

2. In the "Meta App" dropdown:
   Select "HashtagWeb3.com" (1504312414704579)

3. Under "User or Page":
   Select "Get User Access Token"

4. Add these 3 permissions in the Permissions section:
   - pages_show_list
   - pages_read_engagement
   - pages_manage_posts

5. Click "Generate Access Token", authorize, and copy the token string.

6. Run this command:
   npx tsx scripts/social/get-facebook-page-token.ts <COPIED_TOKEN>
========================================================================
`);
  process.exit(0);
}

async function main() {
  console.log('\n1. Exchanging user token for 60-day long-lived user token...');
  const exchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${userTokenInput}`;

  const exRes = await fetch(exchangeUrl);
  const exData = (await exRes.json()) as any;

  if (exData.error) {
    console.error('❌ Token exchange failed:', exData.error.message);
    process.exit(1);
  }

  const longLivedUserToken = exData.access_token;
  console.log('✓ Long-lived user token obtained.');

  console.log('\n2. Fetching managed Facebook Pages...');
  const accountsUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,category,link,access_token&access_token=${longLivedUserToken}`;

  const accRes = await fetch(accountsUrl);
  const accData = (await accRes.json()) as any;

  if (accData.error) {
    console.error('❌ Failed to fetch accounts:', accData.error.message);
    process.exit(1);
  }

  const pages = accData.data || [];
  if (pages.length === 0) {
    console.warn('⚠️  No pages found with this user token. Make sure pages_show_list was granted.');
    process.exit(1);
  }

  console.log(`\nFound ${pages.length} managed page(s):`);
  pages.forEach((p: any) => {
    console.log(` - ${p.name} (ID: ${p.id}) [${p.link || 'no link'}]`);
  });

  const targetPage =
    pages.find(
      (p: any) =>
        p.name.toLowerCase().includes('hashtag') ||
        (p.link && p.link.toLowerCase().includes('hashtagweb3'))
    ) || pages[0];

  console.log(`\n✓ Selected Target Page: "${targetPage.name}" (ID: ${targetPage.id})`);
  const pageToken = targetPage.access_token;

  console.log('\n3. Verifying page token expiration status...');
  const debugUrl = `https://graph.facebook.com/debug_token?input_token=${pageToken}&access_token=${pageToken}`;
  const debugRes = await fetch(debugUrl);
  const debugData = (await debugRes.json()) as any;

  if (debugData.data?.expires_at === 0) {
    console.log('✨ Token status: NEVER-EXPIRING!');
  } else if (debugData.data?.expires_at) {
    const expDate = new Date(debugData.data.expires_at * 1000);
    console.log(`⚠️  Token expires on: ${expDate.toISOString()}`);
  }

  const envLocalPath = path.join(rootDir, '.env.local');
  let envContent = fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath, 'utf-8') : '';

  if (envContent.includes('META_PAGE_ID=')) {
    envContent = envContent.replace(/META_PAGE_ID=.*(\r?\n|$)/, `META_PAGE_ID=${targetPage.id}\n`);
  } else {
    envContent += `\nMETA_PAGE_ID=${targetPage.id}\n`;
  }

  if (envContent.includes('META_PAGE_TOKEN=')) {
    envContent = envContent.replace(/META_PAGE_TOKEN=.*(\r?\n|$)/, `META_PAGE_TOKEN=${pageToken}\n`);
  } else {
    envContent += `META_PAGE_TOKEN=${pageToken}\n`;
  }

  fs.writeFileSync(envLocalPath, envContent, 'utf-8');
  console.log(`\n✓ Successfully updated ${envLocalPath} with:`);
  console.log(`  META_PAGE_ID=${targetPage.id}`);
  console.log(`  META_PAGE_TOKEN=${pageToken.slice(0, 15)}... (saved)\n`);

  console.log('To set on GitHub Actions repository secrets for automated 3h posting:');
  console.log(`  gh secret set META_PAGE_ID --body "${targetPage.id}"`);
  console.log(`  gh secret set META_PAGE_TOKEN --body "${pageToken}"`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
