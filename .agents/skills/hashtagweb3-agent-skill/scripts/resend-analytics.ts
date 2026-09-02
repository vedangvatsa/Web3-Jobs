#!/usr/bin/env node

/**
 * Resend Email Analytics
 * Fetches and analyzes email delivery metrics from Resend
 * 
 * Usage: npx tsx scripts/resend-analytics.ts [--days 7] [--limit 50]
 */

import { Resend } from 'resend';

async function getEmailAnalytics() {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const daysIndex = args.indexOf('--days');
  const daysBack = daysIndex >= 0 ? parseInt(args[daysIndex + 1]) : 7;
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex >= 0 ? parseInt(args[limitIndex + 1]) : 50;

  const client = new Resend(process.env.RESEND_API_KEY);

  try {
    console.log('📊 Fetching Resend Email Analytics');
    console.log(`Last ${daysBack} days | Limit: ${limit} emails\n`);

    // Fetch emails from Resend
    const response = await client.emails.list({ limit });

    if (!response.data || !response.data.data || response.data.data.length === 0) {
      console.log('ℹ️  No emails found in Resend account');
      process.exit(0);
    }

    // Filter by date
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const emails = response.data.data.filter((email: any) => {
      const createdAt = email.created_at ? new Date(email.created_at) : new Date();
      return createdAt >= thresholdDate;
    });

    console.log(`✅ Found ${emails.length} emails in the last ${daysBack} days\n`);

    // Calculate statistics
    const stats = {
      total: emails.length,
      delivered: 0,
      failed: 0,
      bounced: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
    };

    const recipients: { [key: string]: number } = {};

    emails.forEach((email: any) => {
      // Count by status
      if (email.status) {
        if (email.status === 'delivered') stats.delivered++;
        else if (email.status === 'failed') stats.failed++;
        else if (email.status === 'bounced') stats.bounced++;
      }

      // Count opens, clicks, unsubscribes
      if (email.last_event === 'opened') stats.opened++;
      if (email.last_event === 'clicked') stats.clicked++;
      if (email.last_event === 'complained') stats.unsubscribed++;

      // Track recipients
      if (email.to) {
        recipients[email.to] = (recipients[email.to] || 0) + 1;
      }
    });

    // Calculate rates
    const deliveryRate = ((stats.delivered / stats.total) * 100).toFixed(2);
    const failureRate = ((stats.failed / stats.total) * 100).toFixed(2);
    const openRate = ((stats.opened / stats.total) * 100).toFixed(2);
    const clickRate = ((stats.clicked / stats.total) * 100).toFixed(2);

    console.log('📈 SUMMARY STATISTICS');
    console.log('────────────────────────────────────');
    console.log(`Total emails sent:     ${stats.total}`);
    console.log(`Delivered:             ${stats.delivered} (${deliveryRate}%)`);
    console.log(`Failed:                ${stats.failed} (${failureRate}%)`);
    console.log(`Bounced:               ${stats.bounced}`);
    console.log(`Opened:                ${stats.opened} (${openRate}% open rate)`);
    console.log(`Clicked:               ${stats.clicked} (${clickRate}% click rate)`);
    console.log(`Unsubscribed:          ${stats.unsubscribed}`);
    console.log('────────────────────────────────────\n');

    // Show top recipients
    console.log('👥 TOP RECIPIENTS (by email count):');
    const topRecipients = Object.entries(recipients)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    topRecipients.forEach(([email, count], i) => {
      console.log(`  ${i + 1}. ${email} - ${count} email(s)`);
    });

    console.log('\n📋 RECENT EMAILS:');
    console.log('────────────────────────────────────');
    
    // Show recent emails
    const recent = emails.slice(0, 10);
    recent.forEach((email: any, i: number) => {
      const status = email.status || 'unknown';
      const lastEvent = email.last_event ? ` (${email.last_event})` : '';
      const createdAt = email.created_at 
        ? new Date(email.created_at).toLocaleDateString() 
        : 'N/A';
      console.log(`${i + 1}. ${email.to || 'Unknown'}`);
      console.log(`   Status: ${status}${lastEvent} | Sent: ${createdAt}`);
      if (email.subject) console.log(`   Subject: ${email.subject.substring(0, 50)}...`);
    });

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('────────────────────────────────────');
    
    if (parseFloat(deliveryRate) < 95) {
      console.log('⚠️  Delivery rate is below 95%. Check Resend dashboard for bounce/fail reasons.');
    }
    
    if (parseFloat(openRate) < 20) {
      console.log('⚠️  Open rate is below 20%. Consider:');
      console.log('   - Testing different subject lines');
      console.log('   - Optimizing send times');
      console.log('   - Improving email templates');
    }
    
    if (parseFloat(clickRate) < 5) {
      console.log('⚠️  Click rate is below 5%. Consider:');
      console.log('   - Making CTAs more prominent');
      console.log('   - Testing link placement');
      console.log('   - Improving content relevance');
    }

    console.log('\n🔗 NEXT STEPS:');
    console.log('────────────────────────────────────');
    console.log('1. Visit Resend dashboard: https://resend.com/emails');
    console.log('2. Filter by "alerts@hashtagweb3.com" sender');
    console.log('3. Click individual emails to see open/click events');
    console.log('4. Export data for deeper analysis');

  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error.message);
    process.exit(1);
  }
}

getEmailAnalytics();
