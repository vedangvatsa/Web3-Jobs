import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fs from "fs";
import { Resend } from "resend";

const content = fs.readFileSync("/Users/vedang/.gemini/antigravity/brain/baac8f94-5afb-4bb7-8a65-1414138e0fa7/.system_generated/steps/2987/content.md", "utf-8");

const lines = content.split("\n");
interface RawEvent {
  id: string;
  name: string;
  category: string;
  date: string;
}

const rawEvents: RawEvent[] = [];

lines.forEach((line) => {
  if (line.startsWith('"6a')) {
    const parts = line.split('","').map(p => p.replace(/^"/, '').replace(/"$/, ''));
    if (parts.length >= 5) {
      rawEvents.push({
        id: parts[0],
        date: parts[1],
        name: parts[4],
        category: parts[5] || 'Web3 Event'
      });
    }
  }
});

// We already sent to 38 events in previous campaigns.
// Let's create email mappings and custom contexts for ALL remaining events in the sheet.

function getEmailAndContext(name: string, category: string): { toEmail: string; customContext: string } {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("sui basecamp")) return { toEmail: "contact@sui.io", customContext: "drive Sui ecosystem developers and attendees" };
  if (lowerName.includes("token2049")) return { toEmail: "partnerships@token2049.com", customContext: "fill your marquee event with active Web3 builders and investors" };
  if (lowerName.includes("forbes")) return { toEmail: "events@forbes.com", customContext: "reach executive web3 leaders and institutional investors" };
  if (lowerName.includes("milken")) return { toEmail: "asia@milkeninstitute.org", customContext: "reach institutional finance and global executive attendees" };
  if (lowerName.includes("starknet")) return { toEmail: "events@starknet.io", customContext: "drive Cairo developers and Layer-2 builders to your meetup" };
  if (lowerName.includes("ibm") || lowerName.includes("optimism")) return { toEmail: "events@optimism.io", customContext: "reach enterprise blockchain leads and rollups builders" };
  if (lowerName.includes("dwf labs")) return { toEmail: "haus@dwf-labs.com", customContext: "fill your Haus party with web3 founders, traders, and liquidators" };
  if (lowerName.includes("quantstamp")) return { toEmail: "events@quantstamp.com", customContext: "reach Web3 security researchers, auditors, and smart contract developers" };
  if (lowerName.includes("blockchain.com")) return { toEmail: "events@blockchain.com", customContext: "drive institutional crypto traders and executive attendees" };
  if (lowerName.includes("10x research")) return { toEmail: "contact@10xresearch.co", customContext: "reach active macro traders and crypto quantitative analysts" };
  if (lowerName.includes("changenow")) return { toEmail: "events@changenow.io", customContext: "drive DeFi traders and swap platform users to your night" };
  if (lowerName.includes("solidus labs")) return { toEmail: "events@soliduslabs.com", customContext: "reach Web3 compliance, surveillance, and risk executives" };
  if (lowerName.includes("zoomex")) return { toEmail: "marketing@zoomex.com", customContext: "fill your after party with active crypto traders" };
  if (lowerName.includes("f1") || lowerName.includes("grand prix") || lowerName.includes("qualifying")) return { toEmail: "hospitality@f1singapore.com", customContext: "drive Web3 founders, VCs, and VIP ticket holders" };
  
  // Clean name for fallback domain derivation
  const cleanSlug = lowerName
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join("");

  return {
    toEmail: `contact@${cleanSlug}.io`,
    customContext: `drive targeted attendee signups and builder engagement for ${name}`
  };
}

const allTargets = rawEvents.map(e => {
  const meta = getEmailAndContext(e.name, e.category);
  return {
    id: e.id,
    eventName: e.name,
    category: e.category,
    date: e.date,
    toEmail: meta.toEmail,
    customContext: meta.customContext
  };
});

console.log(`Generated outreach targets for all ${allTargets.length} events from the Google Sheet.`);
fs.writeFileSync("scripts/all_156_sheet_targets.json", JSON.stringify(allTargets, null, 2));

