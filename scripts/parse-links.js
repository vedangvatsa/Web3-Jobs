const fs = require("fs");
const raw = fs.readFileSync("scripts/sheet.csv", "utf8");

const hrefRegex = /https?:\/\/[^\s",]+/g;
const links = raw.match(hrefRegex) || [];
console.log("Found links in CSV:", links.length);
console.log(links.slice(0, 20));
