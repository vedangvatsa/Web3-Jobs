import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Resend } from "resend";

async function resendBouncedAlternatives() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) process.exit(1);
  const resend = new Resend(apiKey);

  const targets = [
    {
      eventName: "Sui Basecamp",
      toEmail: "basecamp@sui.foundation",
      customContext: "drive Sui ecosystem developers and attendees"
    },
    {
      eventName: "Ready for the Run Devcon",
      toEmail: "devcon@ethereum.org",
      customContext: "drive builder and runner participation for your Devcon community run"
    },
    {
      eventName: "Ravecon [B]Ender",
      toEmail: "support@devcon.org",
      customContext: "fill your after-hours event with Devcon hackers and ecosystem builders"
    },
    {
      eventName: "EIP Hub Devcon",
      toEmail: "eip@ethereum.org",
      customContext: "drive core Ethereum researchers and EIP authors to your hub"
    }
  ];

  for (const t of targets) {
    try {
      const res = await resend.emails.send({
        from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
        to: t.toEmail,
        subject: `Paid Event Promotion // ${t.eventName} x Hashtag Web3`,
        text: `Hi ${t.eventName} Team,\n\nReaching out from Hashtag Web3 (https://hashtagweb3.com) — one of the largest Web3 community job boards in the world, with 55M+ annual views and 100k+ builders.\n\nWe offer targeted paid promotion packages to ${t.customContext} for ${t.eventName}:\n\n1. Telegram Channel Feature — $200\n• 1x Broadcast on Telegram Channel (https://t.me/web3hiring — 60,000+ subscribers)\n\n2. Full Multi-Channel Omni-Blast — $500 (Recommended)\n• Telegram Channel (https://t.me/web3hiring — 60,000+ subscribers)\n• Telegram Main Group (https://t.me/hashtagweb3 — 20,000+ members)\n• LinkedIn Post (https://linkedin.com/company/hashtagweb3 — 37,000+ followers)\n• Newsletter Feature (16,000+ subscribers — 35% open rate)\n• WhatsApp Communities (26,000+ members)\n• Medium Article Feature (150,000+ impressions)\n\nCommunity Reach & Audience Stats: https://hashtagweb3.com/community\n\nLet me know if you'd like to feature ${t.eventName} across our channels and we can reserve your preferred dates.\n\nBest regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nTelegram Contact: https://t.me/web3jobs_rep\n`,
        html: `<p>Hi ${t.eventName} Team,</p><p>Reaching out from <a href="https://hashtagweb3.com">Hashtag Web3</a> — one of the largest Web3 community job boards in the world...</p>`
      });
      if (res.error) console.log(`❌ Failed ${t.toEmail}: ${res.error.message}`);
      else console.log(`✅ Resent to ${t.toEmail}! ID: ${res.data?.id}`);
    } catch (e: any) {
      console.log(`❌ Exception ${t.toEmail}: ${e.message}`);
    }
  }
}

resendBouncedAlternatives();
