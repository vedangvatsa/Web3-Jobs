const fs = require("fs");

function parseCSVLine(text) {
  const result = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cell.trim());
      cell = "";
    } else {
      cell += c;
    }
  }
  result.push(cell.trim());
  return result;
}

const raw = fs.readFileSync("scripts/sheet.csv", "utf8");
const lines = raw.split(/\r?\n/);
const events = [];

lines.forEach(line => {
  const parts = parseCSVLine(line);
  if (parts.length >= 5) {
    const title = parts[4];
    const category = parts[5];
    if (title && title !== "Event" && !title.startsWith("dd") && title !== "FEATURED EVENTS" && title !== "SUBMIT AN EVENT" && title.length > 3) {
      const lower = title.toLowerCase();
      // Filter out ETH events and Blockchain Weeks
      if (!lower.includes("eth ") && !lower.includes("ethereum") && !lower.includes("blockchain week")) {
        events.push({ title, category });
      }
    }
  }
});

// Remove duplicate titles
const uniqueMap = new Map();
events.forEach(e => {
  const cleanTitle = e.title.replace(/\s*-\s*Day\s*\d+/i, "").trim();
  if (!uniqueMap.has(cleanTitle)) {
    uniqueMap.set(cleanTitle, { title: cleanTitle, category: e.category });
  }
});

const uniqueEvents = Array.from(uniqueMap.values());

console.log("Filtered Unique Side Events from Spreadsheet (Count:", uniqueEvents.length, "):");
console.log(JSON.stringify(uniqueEvents.slice(0, 30), null, 2));
