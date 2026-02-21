import * as fs from 'fs';
import * as path from 'path';
import { sendJobAlertEmail, type JobListing } from '@/lib/email';

async function sendTestEmail() {
  try {
    // Check for API key
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set in environment variables');
      process.exit(1);
    }

    // Get recipient email from command line or default
    const recipientEmail = process.argv[2] || 'REMOVED_EMAIL';
    console.log(`📧 Sending test email to: ${recipientEmail}\n`);

    // Read jobs from cache
    const cacheFile = path.join(process.cwd(), 'content', 'jobs-cache.json');
    if (!fs.existsSync(cacheFile)) {
      console.error('❌ jobs-cache.json not found');
      process.exit(1);
    }

    const allJobs = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    console.log(`📦 Loaded ${allJobs.length} jobs from cache`);

    // Take first 5 jobs and format them
    const jobs: JobListing[] = allJobs.slice(0, 5).map((job: any) => ({
      title: job.title,
      company: job.company,
      location: 'Remote',
      url: 'https://hashtagweb3.com',
      tags: [],
    }));

    console.log(`\n📤 Sending ${jobs.length} jobs:\n`);
    jobs.forEach(job => {
      console.log(`  • ${job.title} at ${job.company}`);
    });

    // Send the email
    const result = await sendJobAlertEmail(recipientEmail, jobs);

    if (result.success) {
      console.log(`\n✅ Email sent successfully to ${recipientEmail}!`);
    } else {
      console.error(`\n❌ Failed to send email: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

sendTestEmail();
