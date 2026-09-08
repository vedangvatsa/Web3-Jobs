import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Resend } from "resend";

interface TargetEvent {
  eventName: string;
  to: string;
  cc: string[];
}

const TARGETS_BATCH_3: TargetEvent[] = [
  {
    eventName: "Ethereum Brasil",
    to: "contact@ethereumbrasil.com",
    cc: ["sponsors@ethereumbrasil.com", "partnerships@ethereumbrasil.com"]
  },
  {
    eventName: "Boston Blockchain Week",
    to: "hello@bostonblockchainweek.com",
    cc: ["john@qubiclabs.com", "privacy@bostonblockchainweek.com"]
  }
];

function generateEmailText(eventName: string): string {
  return `Hi there,

Hope you are having a wonderful week!

I am reaching out from Hashtag Web3 to explore an official community partnership for ${eventName}. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.

Hashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.

A quick snapshot of our reach:
- Platform Scale: 55M+ annual job board views connecting top developers, founders, and Web3 professionals.
- X (Twitter) Spaces: Weekly sessions attended by 20k-40k live listeners (guests include EY Partners, Microsoft CSO, Pink Floyd band member).
- Social & Content: 26M views last year on LinkedIn | 16,000 newsletter subscribers.
- Direct Messaging: 75,000+ on Telegram (channel & group) and 22,000+ in WhatsApp communities.
- Past Event Partners: TOKEN2049, Harvard Blockchain Conference, Taipei Blockchain Week, ETH Vietnam, EDCON Tokyo, GITEX, ETH Brussels, etc.

Community Overview: https://hashtagweb3.com/community

In return, we would love:
1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).
2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.

Please let me know if this sounds good to you, and we will be glad to coordinate and share the code with our community!

Warm regards,

Alex
Partnerships Lead | Hashtag Web3
Website: https://hashtagweb3.com
Telegram: https://t.me/web3jobs_rep
`;
}

function generateEmailHtml(eventName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi there,</p>
  <p>Hope you're having a wonderful week!</p>
  <p>I’m reaching out from <strong>Hashtag Web3</strong> to explore an official community partnership for <strong>${eventName}</strong>. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.</p>
  <p><strong>Hashtag Web3</strong> is one of the largest Web3 job boards in the world, with <strong>55 million annual views</strong> and a <strong>100k+ member</strong> builder network.</p>

  <h3 style="font-size: 15px; color: #0f172a; margin-top: 20px; margin-bottom: 8px;">A quick snapshot of our reach:</h3>
  <ul style="padding-left: 20px; margin: 0 0 16px 0;">
    <li><strong>Platform Scale:</strong> 55M+ annual job board views connecting top developers, founders, and Web3 professionals.</li>
    <li><strong>X (Twitter) Spaces:</strong> Weekly sessions attended by 20k–40k live listeners (guests include EY Partners, Microsoft CSO, Pink Floyd band member).</li>
    <li><strong>Social &amp; Content:</strong> 26M views last year on LinkedIn | 16,000 newsletter subscribers.</li>
    <li><strong>Direct Messaging:</strong> 75,000+ on Telegram (channel &amp; group) and 22,000+ in WhatsApp communities.</li>
    <li><strong>Past Event Partners:</strong> TOKEN2049, Harvard Blockchain Conference, Taipei Blockchain Week, ETH Vietnam, EDCON Tokyo, GITEX, ETH Brussels, etc.</li>
  </ul>

  <p><strong>Community Overview:</strong> <a href="https://hashtagweb3.com/community" style="color: #2563eb;">https://hashtagweb3.com/community</a></p>

  <h3 style="font-size: 15px; color: #0f172a; margin-top: 20px; margin-bottom: 8px;">In return, we would love:</h3>
  <ol style="padding-left: 20px; margin: 0 0 16px 0;">
    <li>Our logo on your website’s partner section with a backlink (high-res transparent logo: <a href="https://hashtagweb3.com/logo/HashtagWeb3.png" style="color: #2563eb;">Download Logo</a>).</li>
    <li>An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.</li>
  </ol>

  <p>Please let me know if this sounds good to you, and we will be glad to coordinate and share the code with our community!</p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
  <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Alex</strong><br />
  Partnerships Lead | Hashtag Web3<br />
  Website: <a href="https://hashtagweb3.com" style="color: #2563eb;">hashtagweb3.com</a><br />
  Telegram: <a href="https://t.me/web3jobs_rep" style="color: #2563eb;">t.me/web3jobs_rep</a></p>
</body>
</html>`;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY in environment or .env.local");
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  console.log(`Starting dispatch to 2 additional events: Ethereum Brasil & Boston Blockchain Week...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < TARGETS_BATCH_3.length; i++) {
    const target = TARGETS_BATCH_3[i];
    const subject = `Official Community Partnership Proposal // ${target.eventName} x Hashtag Web3`;

    console.log(`\n[${i + 1}/${TARGETS_BATCH_3.length}] Sending to ${target.eventName} (${target.to})...`);

    try {
      const { data, error } = await resend.emails.send({
        from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
        to: target.to,
        cc: target.cc && target.cc.length > 0 ? target.cc : undefined,
        replyTo: "contact@hashtagweb3.com",
        subject: subject,
        text: generateEmailText(target.eventName),
        html: generateEmailHtml(target.eventName),
      });

      if (error) {
        console.error(`  ❌ Failed to send to ${target.eventName}:`, error);
        failCount++;
      } else {
        console.log(`  ✅ Sent successfully! ID: ${data?.id}`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ Exception sending to ${target.eventName}:`, err);
      failCount++;
    }

    if (i < TARGETS_BATCH_3.length - 1) {
      await sleep(1500); // Respect rate limit
    }
  }

  console.log(`\n========================================`);
  console.log(`Dispatch Summary Batch 3:`);
  console.log(`Successfully sent: ${successCount}/${TARGETS_BATCH_3.length}`);
  if (failCount > 0) {
    console.log(`Failed: ${failCount}`);
  }
  console.log(`========================================\n`);
}

main().catch(console.error);
