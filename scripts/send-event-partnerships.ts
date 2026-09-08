import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Resend } from "resend";

interface TargetEvent {
  eventName: string;
  to: string;
  cc: string[];
}

const TARGETS: TargetEvent[] = [
  {
    eventName: "Korea Blockchain Week",
    to: "sponsorship@koreablockchainweek.com",
    cc: ["media@koreablockchainweek.com", "contact@koreablockchainweek.com"]
  },
  {
    eventName: "Devcon 2026",
    to: "supporters@devcon.org",
    cc: ["support@devcon.org", "press@ethereum.org"]
  },
  {
    eventName: "India Blockchain Week",
    to: "sponsor@indiablockchainweek.com",
    cc: ["press@indiablockchainweek.com", "hello@indiablockchainweek.com"]
  },
  {
    eventName: "ETHIndia 2026",
    to: "partner@devfolio.co",
    cc: ["ethindia@devfolio.co", "hello@devfolio.co"]
  },
  {
    eventName: "ETHGlobal Tokyo & Mumbai",
    to: "partner@ethglobal.com",
    cc: ["hello@ethglobal.com", "community@ethglobal.com"]
  },
  {
    eventName: "ETHDenver 2027",
    to: "sponsor@ethdenver.com",
    cc: ["media@ethdenver.com", "debra@yapglobal.com"]
  },
  {
    eventName: "Devconnect Bangkok",
    to: "support@devconnect.org",
    cc: ["supporters@devcon.org", "polina@epicweb3.com"]
  },
  {
    eventName: "ETHTokyo Week",
    to: "contact@ethereum-japan.org",
    cc: ["info@ethereum-japan.org"]
  },
  {
    eventName: "ETHTaipei",
    to: "gm@ethtaipei.org",
    cc: ["partners@taipeiblockchainweek.com", "contact@taipeiblockchainweek.com"]
  },
  {
    eventName: "ETHRome",
    to: "gm@ethrome.org",
    cc: ["hello@urbe.build"]
  },
  {
    eventName: "ETHSpain & European Blockchain Convention",
    to: "hello@ethspain.org",
    cc: ["media@eblockchainconvention.com", "contact@eblockchainconvention.com"]
  },
  {
    eventName: "ETHSofia & Bulgaria Blockchain Week",
    to: "partners@blockchainweek.bg",
    cc: ["partners@ethsofia.com", "contact@blockchainweek.bg"]
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
1. Our logo on your website\x27s partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).
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
<body style="font-family: -apple-system, BlinkMacSystemFont, \x27Segoe UI\x27, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi there,</p>
  <p>Hope you\x27re having a wonderful week!</p>
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

  <p>Please let me know if this sounds good to you, and we’ll be glad to coordinate and share the code with our community!</p>

  <p style="margin-top: 24px;">Warm regards,</p>
  <p style="margin: 0;"><strong>Alex</strong><br>
  Partnerships Lead | Hashtag Web3<br>
  Website: <a href="https://hashtagweb3.com" style="color: #2563eb;">hashtagweb3.com</a><br>
  Telegram: <a href="https://t.me/web3jobs_rep" style="color: #2563eb;">t.me/web3jobs_rep</a></p>
</body>
</html>`;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY in .env.local");
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  console.log("Starting dispatch to " + TARGETS.length + " major events...\n");

  const results: any[] = [];

  for (let i = 0; i < TARGETS.length; i++) {
    const t = TARGETS[i];
    console.log(`[${i + 1}/${TARGETS.length}] Sending to ${t.eventName} (${t.to})...`);

    try {
      const resp = await resend.emails.send({
        from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
        to: [t.to],
        cc: t.cc,
        reply_to: "contact@hashtagweb3.com",
        subject: `Community Partnership with ${t.eventName}`,
        text: generateEmailText(t.eventName),
        html: generateEmailHtml(t.eventName)
      });

      if (resp.error) {
        console.error(`  ❌ Error for ${t.eventName}:`, resp.error);
        results.push({ event: t.eventName, to: t.to, success: false, error: resp.error });
      } else {
        console.log(`  ✅ Sent successfully! ID: ${resp.data?.id}`);
        results.push({ event: t.eventName, to: t.to, success: true, id: resp.data?.id });
      }
    } catch (err: any) {
      console.error(`  ❌ Exception for ${t.eventName}:`, err.message);
      results.push({ event: t.eventName, to: t.to, success: false, error: err.message });
    }

    if (i < TARGETS.length - 1) {
      await sleep(1200);
    }
  }

  console.log("\n========================================");
  console.log("Dispatch Summary:");
  const successful = results.filter(r => r.success).length;
  console.log(`Successfully sent: ${successful}/${TARGETS.length}`);
  console.log("========================================");
}

run();
