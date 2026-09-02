import fs from 'fs';

let tsContent = fs.readFileSync("scripts/refresh-jobs-cache.ts", "utf8");

const websiteDiscovered = [
  { name: "fuse-energy", type: "workable", board: "fuseenergy", company: "Fuse Energy" },
  { name: "breederdao", type: "workable", board: "sovrun", company: "BreederDAO" },
  { name: "interchain-foundation", type: "gh", board: "cosmoslabs", company: "Interchain Foundation" }
];

let added = 0;
for (const feed of websiteDiscovered) {
  if (tsContent.includes(`board: '${feed.board}'`) || tsContent.includes(`board: "${feed.board}"`)) {
    console.log(`Feed ${feed.name} / ${feed.board} already in ts script.`);
    continue;
  }
  
  if (feed.type === "workable") {
    const target = "const WORKABLE_BOARDS = [";
    const insert = `    { board: '${feed.board}', company: '${feed.company}' },\n`;
    tsContent = tsContent.replace(target, target + "\n" + insert);
    added++;
  } else if (feed.type === "gh") {
    const target = "const GREENHOUSE_BOARDS = [";
    const insert = `    { board: '${feed.board}', company: '${feed.company}' },\n`;
    tsContent = tsContent.replace(target, target + "\n" + insert);
    added++;
  }
}

fs.writeFileSync("scripts/refresh-jobs-cache.ts", tsContent, "utf8");
console.log(`Added ${added} new website-discovered ATS feeds into refresh-jobs-cache.ts!`);
