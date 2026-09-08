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
const items = [];

lines.forEach(line => {
  const parts = parseCSVLine(line);
  if (parts.length >= 8) {
    const title = parts[4];
    const category = parts[5];
    const regUrl = parts[7] || parts[8] || "";
    if (title && title !== "Event" && !title.startsWith("dd") && title !== "FEATURED EVENTS" && title !== "SUBMIT AN EVENT" && title.length > 3) {
      const lower = title.toLowerCase();
      if (!lower.includes("eth ") && !lower.includes("ethereum") && !lower.includes("blockchain week")) {
        items.push({ title, category, regUrl });
      }
    }
  }
});

console.log("Total spreadsheet rows (non-ETH/Blockchain Week):", items.length);
console.log(JSON.stringify(items.slice(0, 30), null, 2));
