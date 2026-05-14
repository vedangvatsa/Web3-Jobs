import { getJobs } from '../src/lib/jobs';
import { sendBatchJobAlerts } from '../src/lib/email';
// No dotenv needed, will inject via CLI

async function testSend() {
  console.log("Fetching jobs from RSS...");
  const allJobs = await getJobs();
  
  if (!allJobs || allJobs.length === 0) {
    console.error("No jobs found!");
    process.exit(1);
  }

  const companyCounts = new Map<string, number>();
  const newJobs: any[] = [];

  for (const j of allJobs) {
    if (newJobs.length >= 15) break;
    
    const company = typeof j.company === 'string' ? j.company : (j.company?.name || 'Unknown Company');
    const count = companyCounts.get(company) || 0;
    if (count >= 2) continue; // enforce max 2 per company capping

    companyCounts.set(company, count + 1);
    
    newJobs.push({
      title: j.title || 'Software Engineer',
      company,
      location: Array.isArray(j.location) ? j.location[0] : (j.location || 'Remote'),
      url: j.link || j.url || 'https://hashtagweb3.com',
      date: j.date || new Date().toISOString(),
      tags: j.tags || []
    });
  }

  const testEmail = [process.env.TEST_EMAIL || 'test@example.com'];
  
  console.log(`Sending test email to ${testEmail} with ${newJobs.length} jobs...`);
  
  try {
    await sendBatchJobAlerts(testEmail, newJobs);
    console.log("✅ Test email sent successfully!");
  } catch (error: any) {
    console.error("❌ Failed to send email:", error.message);
  }
}

testSend();
