import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Resend } from "resend";

interface SpreadsheetEventTarget {
  eventName: string;
  toEmail: string;
  customContext: string;
}

// Extracted & mapped side events directly from the official TOKEN2049 & Side Events Google Spreadsheet
const SPREADSHEET_TARGETS: SpreadsheetEventTarget[] = [
  {
    eventName: "0G Dev Day: ZERO TO INFINITY",
    toEmail: "contact@0g.ai",
    customContext: "drive AI & Modular blockchain developer attendance"
  },
  {
    eventName: "Digital Asset Summit Asia 2026",
    toEmail: "events@blockworks.co",
    customContext: "boost institutional investor & digital asset executive registrations"
  },
  {
    eventName: "All That Matters 2026",
    toEmail: "info@branded.live",
    customContext: "drive Web3, gaming, and entertainment leadership attendance"
  },
  {
    eventName: "VNTR Investor Forum Singapore",
    toEmail: "singapore@vntr.vc",
    customContext: "fill your investor forum with top crypto VCs, LPs, and founders"
  },
  {
    eventName: "Animoca Portfolio Day - GTM in the Agentic Era",
    toEmail: "events@animocabrands.com",
    customContext: "drive developer and portfolio founder participation"
  },
  {
    eventName: "OKX Dev Day",
    toEmail: "developer@okx.com",
    customContext: "maximize engineer & ecosystem builder signups"
  },
  {
    eventName: "Solana Summit & Capital Forum",
    toEmail: "events@solana.org",
    customContext: "drive Solana ecosystem founders, VCs, and Rust developers"
  },
  {
    eventName: "Mantle RWA Day",
    toEmail: "partnerships@mantle.xyz",
    customContext: "reach real-world asset tokenization protocols and institutional builders"
  },
  {
    eventName: "The Capital Summit x Asia Stablecoin Conference",
    toEmail: "contact@coinmarketcap.com",
    customContext: "amplify attendance across payment founders and stablecoin issuers"
  },
  {
    eventName: "Proof of Health Singapore 2026",
    toEmail: "hello@proofofhealth.org",
    customContext: "reach DeSci researchers, biotech founders, and healthtech builders"
  },
  {
    eventName: "AI Founders & Investors Forum",
    toEmail: "events@aifounders.org",
    customContext: "drive AI x Web3 founder and venture capital registrations"
  },
  {
    eventName: "Global Onchain Summit",
    toEmail: "contact@onchain.org",
    customContext: "maximize developer and liquidity provider attendance"
  }
];

function generateCustomEmailHtml(event: SpreadsheetEventTarget): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi ${event.eventName} Team,</p>
  
  <p>Reaching out from <a href="https://hashtagweb3.com" style="color: #2563eb; font-weight: 600;">Hashtag Web3</a> — one of the largest Web3 community job boards in the world, with 55M+ annual views and 100k+ builders.</p>
  
  <p>We offer targeted paid promotion packages to ${event.customContext} for <strong>${event.eventName}</strong>:</p>
  
  <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">1. Telegram Channel Feature — $200</p>
  <ul style="padding-left: 20px; margin-top: 4px; margin-bottom: 16px;">
    <li>1x Broadcast on <a href="https://t.me/web3hiring" style="color: #2563eb;">Telegram Channel</a> (60,000+ subscribers)</li>
  </ul>

  <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">2. Full Multi-Channel Omni-Blast — $500 (Recommended)</p>
  <ul style="padding-left: 20px; margin-top: 4px; margin-bottom: 20px;">
    <li><a href="https://t.me/web3hiring" style="color: #2563eb;">Telegram Channel</a> (60,000+ subscribers)</li>
    <li><a href="https://t.me/hashtagweb3" style="color: #2563eb;">Telegram Main Group</a> (20,000+ members)</li>
    <li><a href="https://linkedin.com/company/hashtagweb3" style="color: #2563eb;">LinkedIn Post</a> (37,000+ followers)</li>
    <li>Newsletter Feature (16,000+ subscribers — 35% open rate)</li>
    <li>WhatsApp Communities (26,000+ members)</li>
    <li>Medium Article Feature (150,000+ impressions)</li>
  </ul>

  <p><a href="https://hashtagweb3.com/community" style="color: #2563eb; font-weight: 600;">View Community Reach & Audience Stats</a></p>

  <p>Let me know if you'd like to feature <strong>${event.eventName}</strong> across our channels and we can reserve your preferred dates.</p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
  <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Alex</strong><br />
  Partnerships Lead | Hashtag Web3<br />
  <a href="https://t.me/web3jobs_rep" style="color: #2563eb;">Telegram Contact</a></p>
</body>
</html>`;
}

function generateCustomEmailText(event: SpreadsheetEventTarget): string {
  return `Hi ${event.eventName} Team,

Reaching out from Hashtag Web3 (https://hashtagweb3.com) — one of the largest Web3 community job boards in the world, with 55M+ annual views and 100k+ builders.

We offer targeted paid promotion packages to ${event.customContext} for ${event.eventName}:

1. Telegram Channel Feature — $200
• 1x Broadcast on Telegram Channel (https://t.me/web3hiring — 60,000+ subscribers)

2. Full Multi-Channel Omni-Blast — $500 (Recommended)
• Telegram Channel (https://t.me/web3hiring — 60,000+ subscribers)
• Telegram Main Group (https://t.me/hashtagweb3 — 20,000+ members)
• LinkedIn Post (https://linkedin.com/company/hashtagweb3 — 37,000+ followers)
• Newsletter Feature (16,000+ subscribers — 35% open rate)
• WhatsApp Communities (26,000+ members)
• Medium Article Feature (150,000+ impressions)

Community Reach & Audience Stats: https://hashtagweb3.com/community

Let me know if you'd like to feature ${event.eventName} across our channels and we can reserve your preferred dates.

Best regards,

Alex
Partnerships Lead | Hashtag Web3
Telegram Contact: https://t.me/web3jobs_rep
`;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSpreadsheetCampaign() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY");
    process.exit(1);
  }
  const resend = new Resend(apiKey);

  console.log(`Starting paid promotion campaign to ${SPREADSHEET_TARGETS.length} spreadsheet side events...\n`);

  for (let i = 0; i < SPREADSHEET_TARGETS.length; i++) {
    const target = SPREADSHEET_TARGETS[i];
    console.log(`[${i + 1}/${SPREADSHEET_TARGETS.length}] Sending to ${target.eventName} (${target.toEmail})...`);

    try {
      const res = await resend.emails.send({
        from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
        to: target.toEmail,
        subject: `Paid Event Promotion // ${target.eventName} x Hashtag Web3`,
        text: generateCustomEmailText(target),
        html: generateCustomEmailHtml(target)
      });

      if (res.error) {
        console.error(`  ❌ Failed: ${res.error.message}`);
      } else {
        console.log(`  ✅ Sent! Resend ID: ${res.data?.id}`);
      }
    } catch (err: any) {
      console.error(`  ❌ Exception: ${err.message}`);
    }

    await sleep(2000);
  }

  console.log("\nFinished sending all spreadsheet side event promotion emails!");
}

runSpreadsheetCampaign();
