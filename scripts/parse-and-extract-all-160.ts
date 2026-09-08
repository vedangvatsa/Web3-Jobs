import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fs from "fs";

const content = fs.readFileSync("/Users/vedang/.gemini/antigravity/brain/baac8f94-5afb-4bb7-8a65-1414138e0fa7/.system_generated/steps/2987/content.md", "utf-8");

const lines = content.split("\n");
const events: { lineNum: number; id: string; date: string; timeStart: string; name: string; category: string; price: string }[] = [];

lines.forEach((line, idx) => {
  if (line.startsWith('"6a')) {
    // Parse CSV line
    const parts = line.split('","').map(p => p.replace(/^"/, '').replace(/"$/, ''));
    if (parts.length >= 5) {
      events.push({
        lineNum: idx + 1,
        id: parts[0],
        date: parts[1],
        timeStart: parts[2],
        name: parts[4],
        category: parts[5] || '',
        price: parts[6] || ''
      });
    }
  }
});

console.log(`Total parsed events: ${events.length}`);
console.log("Sample events:");
console.log(events.slice(0, 10));

