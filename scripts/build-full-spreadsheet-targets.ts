import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Resend } from "resend";

interface FullTarget {
  eventName: string;
  toEmail: string;
  customContext: string;
}

const EXTENDED_SPREADSHEET_TARGETS: FullTarget[] = [
  // --- Round 2 Spreadsheet Targets ---
  {
    eventName: "CoinFerenceX Summit",
    toEmail: "contact@coinferencex.com",
    customContext: "drive Web3 conference attendee & founder signups"
  },
  {
    eventName: "HyprEarn Perp Traders Mixer",
    toEmail: "partners@hyprearn.com",
    customContext: "reach active perps traders, liquidators, and DeFi yield farmers"
  },
  {
    eventName: "RWA Capital Forum Singapore",
    toEmail: "events@rwacapital.forum",
    customContext: "drive institutional RWA investors, issuers, and tokenization founders"
  },
  {
    eventName: "Spacey Ventures Web3 Synergy Night",
    toEmail: "contact@spacey.ventures",
    customContext: "fill your synergy night with top Web3 founders and ecosystem builders"
  },
  {
    eventName: "Skyline Social & Allocators VIP Dinner",
    toEmail: "vip@skylinesocial.xyz",
    customContext: "reach accredited allocators, fund managers, and Web3 VCs"
  },
  {
    eventName: "Gamma Prime Investing Summit",
    toEmail: "contact@gammaprime.io",
    customContext: "drive crypto trader, investor, and hedge fund registrations"
  },
  {
    eventName: "APAC Enterprise & Tokenization Breakfast",
    toEmail: "events@apactokenization.org",
    customContext: "reach enterprise blockchain leads and Web3 tokenization executives"
  },
  {
    eventName: "DeltaV Demo Day",
    toEmail: "demoday@deltav.ai",
    customContext: "drive Web3 investor and mentor registrations for your demo day"
  },
  {
    eventName: "Founder x VC Summit",
    toEmail: "summit@founderxvc.com",
    customContext: "fill your summit with vetted Web3 founders and venture capitalists"
  },
  {
    eventName: "Solana Capital Forum & Superteam Night",
    toEmail: "asia@superteam.fun",
    customContext: "drive Solana ecosystem developers and venture partner attendance"
  },
  {
    eventName: "Hyperliquid & Perps Trader Lounge",
    toEmail: "lounge@hyperliquid.xyz",
    customContext: "fill your marquee venue with active perps traders and market makers"
  },
  {
    eventName: "Arbitrum Stylus & Rust Dev House",
    toEmail: "build@arbitrum.foundation",
    customContext: "drive Rust and Stylus smart contract developer registrations"
  },
  {
    eventName: "Real World Asset (RWA) Tokenization Summit",
    toEmail: "rwa@tokenization.events",
    customContext: "reach institutional tokenization founders, treasuries, and RWA protocols"
  },
  {
    eventName: "Autonomous AI Agents & On-Chain Intelligence Night",
    toEmail: "agents@onchainai.org",
    customContext: "reach AI agent developers, LLM engineers, and autonomous protocol builders"
  },
  {
    eventName: "London DeFi & Fintech VC Breakfast",
    toEmail: "london@fintechvc.co",
    customContext: "drive European DeFi founders, VCs, and fintech executives"
  },
  {
    eventName: "Denver Zero-Knowledge Proofs & Coprocessor Summit",
    toEmail: "zk@coprocessors.org",
    customContext: "reach ZK researchers, prover engineers, and rollups infrastructure builders"
  },
  {
    eventName: "DAO Governance & On-Chain Legal Roundtable",
    toEmail: "governance@daolegal.org",
    customContext: "reach DAO delegates, core contributors, and Web3 legal counsel"
  },
  {
    eventName: "MIP-20: Road to Devcon",
    toEmail: "mip20@devcon.org",
    customContext: "drive developer registrations for your pre-Devcon builder series"
  },
  {
    eventName: "IBW Institutional Forum & VIP Night",
    toEmail: "institutional@indiablockchainweek.com",
    customContext: "fill your VIP night with institutional investors and ecosystem leaders"
  },
  {
    eventName: "Onchain Dev City India",
    toEmail: "devcity@indiablockchainweek.com",
    customContext: "maximize developer and smart contract hacker registrations"
  },
  {
    eventName: "AI Economic Forum (AIEF) - Truth Intelligence Summit",
    toEmail: "aief@truthintelligence.ai",
    customContext: "reach AI economic researchers, oracle builders, and data intelligence founders"
  },
  {
    eventName: "EIP Hub Devcon",
    toEmail: "eiphub@ethereum.org",
    customContext: "drive core Ethereum researchers and EIP authors to your hub"
  },
  {
    eventName: "Ravecon [B]Ender",
    toEmail: "ravecon@devcon.org",
    customContext: "fill your after-hours event with Devcon hackers and ecosystem builders"
  },
  {
    eventName: "Pragma Mumbai (ETHGlobal)",
    toEmail: "pragma@ethglobal.com",
    customContext: "drive high-tier founder and developer registrations for Pragma"
  },
  {
    eventName: "Unchained Summit Mumbai",
    toEmail: "unchained@summit.org",
    customContext: "maximize attendee signups across your two-day summit"
  },
  {
    eventName: "Ready for the Run Devcon",
    toEmail: "run@devcon.org",
    customContext: "drive builder and runner participation for your Devcon community run"
  }
];

function generateCustomEmailText(target: FullTarget): string {
  return `Hi ${target.eventName} Team,

Reaching out from Hashtag Web3 (https://hashtagweb3.com) — one of the largest Web3 community job boards in the world, with 55M+ annual views and 100k+ builders.

We offer targeted paid promotion packages to ${target.customContext} for ${target.eventName}:

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

Let me know if you'd like to feature ${target.eventName} across our channels and we can reserve your preferred dates.

Best regards,

Alex
Partnerships Lead | Hashtag Web3
Telegram Contact: https://t.me/web3jobs_rep
`;
}

function generateCustomEmailHtml(target: FullTarget): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi ${target.eventName} Team,</p>
  
  <p>Reaching out from <a href="https://hashtagweb3.com" style="color: #2563eb; font-weight: 600;">Hashtag Web3</a> — one of the largest Web3 community job boards in the world, with 55M+ annual views and 100k+ builders.</p>
  
  <p>We offer targeted paid promotion packages to ${target.customContext} for <strong>${target.eventName}</strong>:</p>
  
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

  <p>Let me know if you'd like to feature <strong>${target.eventName}</strong> across our channels and we can reserve your preferred dates.</p>

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

async function runExtendedSpreadsheetCampaign() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY");
    process.exit(1);
  }
  const resend = new Resend(apiKey);

  console.log(`Starting extended paid promotion campaign to ${EXTENDED_SPREADSHEET_TARGETS.length} spreadsheet side events...\n`);

  for (let i = 0; i < EXTENDED_SPREADSHEET_TARGETS.length; i++) {
    const target = EXTENDED_SPREADSHEET_TARGETS[i];
    console.log(`[${i + 1}/${EXTENDED_SPREADSHEET_TARGETS.length}] Sending to ${target.eventName} (${target.toEmail})...`);

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

  console.log("\nFinished sending all extended spreadsheet side event promotion emails!");
}

runExtendedSpreadsheetCampaign();
