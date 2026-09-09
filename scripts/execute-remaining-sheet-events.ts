import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fs from "fs";
import { Resend } from "resend";

interface Target {
  id: string;
  eventName: string;
  category: string;
  date: string;
  toEmail: string;
  customContext: string;
}

const targets: Target[] = JSON.parse(fs.readFileSync("scripts/all_156_sheet_targets.json", "utf-8"));

// Exclude exact duplicates or previous sent targets if needed, or process in chunks
console.log(`Loaded ${targets.length} targets.`);

// Filter out known ETH main track events if any, but keep all side events
const sideEventTargets = targets.filter(t => {
  const name = t.eventName.toLowerCase();
  // Filter out any core ETH main track event if required, but all spreadsheet events here are Singapore/TOKEN2049 side events
  return true;
});

console.log(`Ready to send paid promotion offers to ${sideEventTargets.length} spreadsheet side events!`);

function generateCustomEmailText(target: Target): string {
  return `Hi ${target.eventName} Team,\n\nReaching out from Hashtag Web3 (https://hashtagweb3.com) — one of the largest Web3 community job boards in the world, with 55M+ annual views and 100k+ builders.\n\nWe offer targeted paid promotion packages to ${target.customContext} for ${target.eventName}:\n\n1. Telegram Channel Feature — $200\n• 1x Broadcast on Telegram Channel (https://t.me/web3hiring — 60,000+ subscribers)\n\n2. Full Multi-Channel Omni-Blast — $500 (Recommended)\n• Telegram Channel (https://t.me/web3hiring — 60,000+ subscribers)\n• Telegram Main Group (https://t.me/hashtagweb3 — 20,000+ members)\n• LinkedIn Post (https://linkedin.com/company/hashtagweb3 — 37,000+ followers)\n• Newsletter Feature (16,000+ subscribers — 35% open rate)\n• WhatsApp Communities (26,000+ members)\n• Medium Article Feature (150,000+ impressions)\n\nCommunity Reach & Audience Stats: https://hashtagweb3.com/community\n\nLet me know if you'd like to feature ${target.eventName} across our channels and we can reserve your preferred dates.\n\nBest regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nTelegram Contact: https://t.me/web3jobs_rep\n`;
}

function generateCustomEmailHtml(target: Target): string {
  return `<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"></head>\n<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">\n  <p>Hi ${target.eventName} Team,</p>\n  \n  <p>Reaching out from <a href="https://hashtagweb3.com" style="color: #2563eb; font-weight: 600;">Hashtag Web3</a> — one of the largest Web3 community job boards in the world, with 55M+ annual views and 100k+ builders.</p>\n  \n  <p>We offer targeted paid promotion packages to ${target.customContext} for <strong>${target.eventName}</strong>:</p>\n  \n  <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">1. Telegram Channel Feature — $200</p>\n  <ul style="padding-left: 20px; margin-top: 4px; margin-bottom: 16px;">\n    <li>1x Broadcast on <a href="https://t.me/web3hiring" style="color: #2563eb;">Telegram Channel</a> (60,000+ subscribers)</li>\n  </ul>\n\n  <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">2. Full Multi-Channel Omni-Blast — $500 (Recommended)</p>\n  <ul style="padding-left: 20px; margin-top: 4px; margin-bottom: 20px;">\n    <li><a href="https://t.me/web3hiring" style="color: #2563eb;">Telegram Channel</a> (60,000+ subscribers)</li>\n    <li><a href="https://t.me/hashtagweb3" style="color: #2563eb;">Telegram Main Group</a> (20,000+ members)</li>\n    <li><a href="https://linkedin.com/company/hashtagweb3" style="color: #2563eb;">LinkedIn Post</a> (37,000+ followers)</li>\n    <li>Newsletter Feature (16,000+ subscribers — 35% open rate)</li>\n    <li>WhatsApp Communities (26,000+ members)</li>\n    <li>Medium Article Feature (150,000+ impressions)</li>\n  </ul>\n\n  <p><a href="https://hashtagweb3.com/community" style="color: #2563eb; font-weight: 600;">View Community Reach & Audience Stats</a></p>\n\n  <p>Let me know if you'd like to feature <strong>${target.eventName}</strong> across our channels and we can reserve your preferred dates.</p>\n\n  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />\n  <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Alex</strong><br />\n  Partnerships Lead | Hashtag Web3<br />\n  <a href="https://t.me/web3jobs_rep" style="color: #2563eb;">Telegram Contact</a></p>\n</body>\n</html>`;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runFullSpreadsheetCampaign() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY");
    process.exit(1);
  }
  const resend = new Resend(apiKey);

  console.log(`Starting campaign across all ${sideEventTargets.length} spreadsheet events...\n`);

  for (let i = 0; i < sideEventTargets.length; i++) {
    const target = sideEventTargets[i];
    console.log(`[${i + 1}/${sideEventTargets.length}] Sending to ${target.eventName} (${target.toEmail})...`);

    try {
      const res = await resend.emails.send({
        from: "Alex from Hashtag Web3 <alex@hi.hashtagweb3.com>",
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

    await sleep(600);
  }

  console.log("\nFinished processing all 156 spreadsheet events!");
}

runFullSpreadsheetCampaign();
