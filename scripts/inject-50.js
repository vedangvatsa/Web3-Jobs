const fs = require('fs');

const found = require('process.cwd() + '/found-50.json');
const targetFile = 'process.cwd() + '/scripts/refresh-jobs-cache.ts';
let content = fs.readFileSync(targetFile, 'utf8');

let added = 0;

for (const item of found) {
  const { platform, slug } = item;
  
  // Check if slug already exists anywhere in the file (case-insensitive)
  if (content.toLowerCase().includes("'" + slug.toLowerCase() + "'")) {
    continue;
  }
  
  let companyName = slug.charAt(0).toUpperCase() + slug.slice(1);
  if (companyName === '1inch') companyName = '1inch';
  if (companyName === 'Dvtrading') companyName = 'DV Trading';
  
  const entry = `    { board: '${slug}', company: '${companyName}' },\n`;
  
  if (platform === 'greenhouse') {
    const ghMarker = "const GREENHOUSE_BOARDS = [";
    content = content.replace(ghMarker, `${ghMarker}\n${entry}`);
    added++;
  } else if (platform === 'lever') {
    const lvMarker = "const LEVER_BOARDS = [";
    content = content.replace(lvMarker, `${lvMarker}\n${entry}`);
    added++;
  } else if (platform === 'ashby') {
    const abMarker = "const ASHBY_BOARDS = [";
    content = content.replace(abMarker, `${abMarker}\n${entry}`);
    added++;
  }
}

fs.writeFileSync(targetFile, content);
console.log(`Successfully injected ${added} completely new companies into refresh-jobs-cache.ts!`);
