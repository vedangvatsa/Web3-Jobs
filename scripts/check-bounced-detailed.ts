import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Resend } from "resend";

async function checkRecentOutboundEmails() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY");
    process.exit(1);
  }
  const resend = new Resend(apiKey);

  try {
    const listRes = await resend.emails.list();
    const emails = listRes.data?.data || [];
    console.log(`Fetched ${emails.length} email records.`);

    const bounced: any[] = [];
    const delivered: any[] = [];

    for (const email of emails) {
      try {
        const detail = await resend.emails.get(email.id);
        const status = detail.data?.last_event;
        const recipient = Array.isArray(email.to) ? email.to.join(", ") : email.to;
        
        if (status === "bounced" || status === "failed" || status === "rejected") {
          bounced.push({ id: email.id, to: recipient, subject: email.subject, status });
        } else {
          delivered.push({ id: email.id, to: recipient, subject: email.subject, status });
        }
      } catch (e) {}
    }

    console.log(`\n=== BOUNCED EMAILS (${bounced.length}) ===`);
    bounced.forEach(b => console.log(`- ${b.to} | Subject: ${b.subject} | Status: ${b.status}`));

    console.log(`\n=== DELIVERED EMAILS (${delivered.length}) ===`);
    delivered.forEach(d => console.log(`- ${d.to} | Status: ${d.status}`));

  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

checkRecentOutboundEmails();
