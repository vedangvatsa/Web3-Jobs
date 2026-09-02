import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/lib/company-profiles.ts');
let fileText = fs.readFileSync(filePath, 'utf8');

const LAST_4 = {
  "anagram": " The firm works closely with early-stage teams across multi-chain ecosystems to build resilient decentralized applications.",
  "logos": " Logos provides open-source privacy primitives that empower developers to build censorship-resistant decentralized applications.",
  "stronghold": " Stronghold accelerates liquidity settlement and merchant payment processing across global digital asset financial networks.",
  "brale": " Brale powers enterprise stablecoin liquidity and programmable fiat asset management for institutional digital finance."
};

let codeStr = fileText;
for (const [slug, exp] of Object.entries(LAST_4)) {
  const pattern = new RegExp(`("${slug}":\\s*\`[^\`]+\`)`, 'g');
  if (pattern.test(codeStr)) {
    codeStr = codeStr.replace(pattern, (match, p1) => {
      const baseText = p1.slice(p1.indexOf('`') + 1, -1);
      const newText = baseText.trim() + exp;
      return `"${slug}": \`${newText}\``;
    });
  }
}

fs.writeFileSync(filePath, codeStr, 'utf8');

// Sync markdown profile files
for (const [slug, exp] of Object.entries(LAST_4)) {
  const mdPath = path.join(process.cwd(), 'content/companies', `${slug}.md`);
  if (fs.existsSync(mdPath)) {
    let md = fs.readFileSync(mdPath, 'utf8');
    const fullMatch = codeStr.match(new RegExp(`"${slug}":\\s*\`([^\`]+)\``));
    if (fullMatch && fullMatch[1]) {
      const fullText = fullMatch[1];
      md = md.replace(/description:.*$/m, `description: "${fullText.replace(/"/g, '\\"')}"`);
      fs.writeFileSync(mdPath, md, 'utf8');
    }
  }
}
console.log('Final 4 expanded!');
