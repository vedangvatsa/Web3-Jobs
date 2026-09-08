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

  console.log("Fetching recent sent emails from Resend API...");
  try {
    const listRes = await resend.emails.list();
    console.log(`Fetched ${listRes.data?.data?.length || 0} recent email records.`);
    
    // Group emails by delivery status
    const bounced: any[] = [];
    const delivered: any[] = [];

    for (const email of (listRes.data?.data || [])) {
      try {
        const detail = await resend.emails.get(email.id);
        const status = detail.data?.last_event;
        if (status === "bounced" || status === "failed" || status === "rejected" || status === "delivery_delayed") {
          bounced.push({ id: email.id, to: email.to, subject: email.subject, status });
        } else {
          delivered.push({ id: email.id, to: email.to, subject: email.subject, status });
        }
      } catch (err) {
        // ignore individual get errors
      }
    }

    console.log(`\n--- BOUNCED / FAILED EMAILS (${bounced.length}) ---`);
    console.log(bounced);

    console.log(`\n--- DELIVERED / SENT EMAILS (${delivered.length}) ---`);
    console.log(`Count: ${delivered.length}`);

  } catch (err: any) {
    console.error("Error fetching emails:", err.message);
  }
}

checkRecentOutboundEmails();
