#!/usr/bin/env node

/**
 * Test script to send a sample job alert email
 * Usage: RESEND_API_KEY=xxx npx tsx scripts/test-email.ts [email]
 */

import { sendJobAlertEmail, type JobListing } from '../src/lib/email';

const recipientEmail = process.argv[2] || 'vatsvedang@gmail.com';

const sampleJobs: JobListing[] = [
  {
    title: 'Senior Solidity Engineer',
    company: 'Uniswap Labs',
    location: 'Remote',
    salary: '$150k - $250k',
    url: 'https://hashtagweb3.com/jobs/1',
    tags: ['Solidity', 'DeFi', 'Smart Contracts', 'Ethereum'],
  },
  {
    title: 'Protocol Engineer',
    company: 'Aave',
    location: 'Remote (US/EU)',
    salary: '$180k - $300k',
    url: 'https://hashtagweb3.com/jobs/2',
    tags: ['Rust', 'Blockchain', 'DeFi', 'Protocol Design'],
  },
  {
    title: 'Full Stack Web3 Developer',
    company: 'OpenSea',
    location: 'New York, NY',
    salary: '$120k - $200k',
    url: 'https://hashtagweb3.com/jobs/3',
    tags: ['React', 'Node.js', 'Web3.js', 'NFT'],
  },
];

async function sendTestEmail() {
  console.log('📧 Test Email Sender');
  console.log(`To: ${recipientEmail}`);
  console.log(`Jobs: ${sampleJobs.length}`);
  console.log('');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set');
    console.log('');
    console.log('Add to .env.local:');
    console.log('RESEND_API_KEY=re_xxxxxxxxxxxxx');
    console.log('');
    console.log('Get your API key from https://resend.com/api-keys');
    process.exit(1);
  }

  console.log('📤 Sending email...');
  const result = await sendJobAlertEmail(recipientEmail, sampleJobs);

  if (result.success) {
    console.log('');
    console.log('✅ SUCCESS! Email sent to', recipientEmail);
    console.log('');
    console.log('Check your inbox (and spam folder)');
  } else {
    console.log('');
    console.log('❌ FAILED:', result.error);
    console.log('');
    console.log('Common issues:');
    console.log('- Invalid API key');
    console.log('- Email domain not verified in Resend');
    console.log('- Rate limit exceeded');
  }
}

sendTestEmail().catch(console.error);
