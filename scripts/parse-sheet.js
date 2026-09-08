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
    const price = parts[6];
    if (title && title !== "Event" && !title.startsWith("dd") && title !== "FEATURED EVENTS" && title !== "SUBMIT AN EVENT" && title.length > 2) {
      events.push({ title, category, price });
    }
  }
});

console.log("Parsed", events.length, "spreadsheet side events cleanly:");
console.log(JSON.stringify(events.slice(0, 30), null, 2));
