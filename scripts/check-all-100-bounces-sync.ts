import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Resend } from "resend";

async function checkAllOutboundBounces() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) process.exit(1);
  const resend = new Resend(apiKey);

  const listRes = await resend.emails.list();
  const emails = listRes.data?.data || [];
  console.log(`Analyzing total ${emails.length} email records...`);

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

  console.log(`\n========================================`);
  console.log(`TOTAL SENT: ${emails.length}`);
  console.log(`DELIVERED: ${delivered.length}`);
  console.log(`BOUNCED: ${bounced.length}`);
  console.log(`========================================\n`);

  console.log("=== ALL BOUNCED TARGETS ===");
  bounced.forEach((b, idx) => {
    console.log(`${idx + 1}. To: ${b.to} | Subject: ${b.subject}`);
  });
}

checkAllOutboundBounces();
