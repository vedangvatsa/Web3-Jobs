import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Resend } from "resend";

interface TargetSideEvent {
  eventName: string;
  to: string;
  customContext?: string;
}

const TARGET_SIDE_EVENTS: TargetSideEvent[] = [
  {
    eventName: "Sui Basecamp 2026",
    to: "sponsorship@sui.io",
    customContext: "boost developer attendance and ecosystem builder participation"
  },
  {
    eventName: "Chainlink SmartCon 2026",
    to: "smartcon@chain.link",
    customContext: "drive smart contract developer and oracle builder registration"
  },
  {
    eventName: "Solana Breakpoint 2026",
    to: "breakpoint@solana.org",
    customContext: "maximize developer attendance and Rust/Solana builder engagement"
  },
  {
    eventName: "Cardano Summit 2026",
    to: "event-support@cardanofoundation.org",
    customContext: "amplify community reach and conference ticket sales"
  },
  {
    eventName: "Cosmoverse 2026",
    to: "contact@cosmoverse.org",
    customContext: "drive Cosmos ecosystem developer and founder attendance"
  },
  {
    eventName: "Avalanche Summit NYC",
    to: "hello@avalanche.vc",
    customContext: "boost Subnet developer and builder registrations"
  },
  {
    eventName: "Permissionless 2026",
    to: "registration@blockworks.co",
    customContext: "maximize Web3 executive, founder, and investor attendance"
  },
  {
    eventName: "DeFi Security Summit",
    to: "contact@defisecuritysummit.org",
    customContext: "reach smart contract security auditors, researchers, and DeFi engineers"
  },
  {
    eventName: "QuillAudits Security Sessions @ Devcon",
    to: "partnerships@quillaudits.com",
    customContext: "drive developer signups for your security & audit side sessions"
  },
  {
    eventName: "Quantstamp x Common Defense Lounge",
    to: "media@quantstamp.com",
    customContext: "fill your security lounge with top Web3 engineers and founders"
  },
  {
    eventName: "Rayls in Seoul",
    to: "contact@rayls.com",
    customContext: "drive institutional and privacy tech developer attendance"
  },
  {
    eventName: "DeSci Singapore (Molecule Showcase)",
    to: "hello@molecule.to",
    customContext: "reach DeSci researchers, IP-NFT builders, and bio-tech founders"
  },
  {
    eventName: "Stablecon 2026",
    to: "hello@stablecon.com",
    customContext: "amplify attendance across stablecoin founders and payment builders"
  },
  {
    eventName: "CONF3RENCE Dortmund",
    to: "contact@conf3rence.com",
    customContext: "boost European Web3 & AI enterprise conference registrations"
  },
  {
    eventName: "CV Summit Zurich",
    to: "events@cvvc.com",
    customContext: "drive Swiss & European crypto VC, founder, and institutional signups"
  }
];

function generateCustomEmailText(event: TargetSideEvent): string {
  const goalText = event.customContext || "boost attendance, ticket sales, and developer visibility";
  return `Hi ${event.eventName} Team,

Reaching out from Hashtag Web3 (https://hashtagweb3.com) — one of the largest Web3 community job boards in the world, with 55M+ annual views and 100k+ builders.

We offer targeted paid promotion packages to ${goalText} for ${event.eventName}:

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

function generateCustomEmailHtml(event: TargetSideEvent): string {
  const goalText = event.customContext || "boost attendance, ticket sales, and developer visibility";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi ${event.eventName} Team,</p>
  
  <p>Reaching out from <a href="https://hashtagweb3.com" style="color: #2563eb; font-weight: 600;">Hashtag Web3</a> — one of the largest Web3 community job boards in the world, with 55M+ annual views and 100k+ builders.</p>
  
  <p>We offer targeted paid promotion packages to ${goalText} for <strong>${event.eventName}</strong>:</p>
  
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

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPaidOutreach() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY");
    process.exit(1);
  }
  const resend = new Resend(apiKey);

  console.log(`Starting paid promotion outreach to ${TARGET_SIDE_EVENTS.length} side events & conferences...\n`);

  for (let i = 0; i < TARGET_SIDE_EVENTS.length; i++) {
    const target = TARGET_SIDE_EVENTS[i];
    console.log(`[${i + 1}/${TARGET_SIDE_EVENTS.length}] Sending to ${target.eventName} (${target.to})...`);

    try {
      const res = await resend.emails.send({
        from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
        to: target.to,
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

    await sleep(2000); // 2 second pause between sends to respect rate limits
  }

  console.log("\nFinished sending all paid event promotion emails!");
}

runPaidOutreach();
