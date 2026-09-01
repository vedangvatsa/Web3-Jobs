import fs from 'fs';
import path from 'path';

const cache = JSON.parse(fs.readFileSync("content/jobs-cache.json", "utf8"));
const uniqueCompanies = [...new Set(cache.map(j => j.company))];

function createSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const logoAliases = {
  'chainlink': 'chainlink-labs',
  'ethena-labs': 'ethena',
  'hedera-hashgraph': 'hedera',
  'ava-labs': 'ava',
};

function hasLocalLogo(slug) {
  const candidates = [slug];
  const alias = logoAliases[slug.toLowerCase()];
  if (alias) candidates.push(alias);

  for (const cand of candidates) {
    const exts = ['.png', '.jpg', '.svg'];
    for (const ext of exts) {
      if (fs.existsSync(path.join(process.cwd(), 'public/logo/companies', `${cand}${ext}`)) ||
          fs.existsSync(path.join(process.cwd(), 'public/logo/job', `${cand}${ext}`)) ||
          fs.existsSync(path.join(process.cwd(), 'public/logo/partners', `${cand}${ext}`))) {
        return true;
      }
    }
  }
  return false;
}

let withLocalLogo = 0;
let withFavicon = 0;
let missingBoth = 0;

const noLocalLogoList = [];

for (const company of uniqueCompanies) {
  const slug = createSlug(company);
  if (hasLocalLogo(slug)) {
    withLocalLogo++;
  } else {
    noLocalLogoList.push({ company, slug });
  }
}

console.log(`Total active companies: ${uniqueCompanies.length}`);
console.log(`Companies with custom local static logo: ${withLocalLogo}`);
console.log(`Companies using automatic high-res domain favicon fallback: ${noLocalLogoList.length}`);
console.log("\nSample companies using high-res favicon fallback:", noLocalLogoList.slice(0, 15));
