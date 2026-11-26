import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'content/articles');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

console.log(`Fixing formatting issues across ${files.length} articles...`);

let modifiedFilesCount = 0;
let totalFusedBulletsFixed = 0;
let totalGluedWordsFixed = 0;
let totalGluedLinksFixed = 0;
let totalGluedHyphensFixed = 0;
let totalPunctGluedFixed = 0;
let totalGluedInlineBoldFixed = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  const original = fs.readFileSync(filePath, 'utf8');

  // Split frontmatter from body
  const match = original.match(/^(---\r?\n[\s\S]*?\r?\n---)([\s\S]*)$/);
  let frontmatter = '';
  let body = original;

  if (match) {
    frontmatter = match[1];
    body = match[2];
  }

  let modifiedBody = body;

  // 1. Fused bold headings to bullets: **Heading:**- Text -> **Heading:**\n\n- Text
  const fusedBulletRegex = /\*\*([^*\n]+:)\*\*-\s*([^\n]+)/g;
  const fusedMatches = modifiedBody.match(fusedBulletRegex);
  if (fusedMatches) {
    totalFusedBulletsFixed += fusedMatches.length;
    modifiedBody = modifiedBody.replace(fusedBulletRegex, '**$1**\n\n- $2');
  }

  // 2. Bold label ending with colon glued to word: **Label:**Word -> **Label:** Word
  const gluedWordRegex = /\*\*([^*\n]+:)\*\*([A-Za-z0-9])/g;
  const gluedWordMatches = modifiedBody.match(gluedWordRegex);
  if (gluedWordMatches) {
    totalGluedWordsFixed += gluedWordMatches.length;
    modifiedBody = modifiedBody.replace(gluedWordRegex, '**$1** $2');
  }

  // 3. Bold label ending with colon glued to markdown link: **Label:**[ -> **Label:** [
  const gluedLinkRegex = /\*\*([^*\n]+:)\*\*(\[)/g;
  const gluedLinkMatches = modifiedBody.match(gluedLinkRegex);
  if (gluedLinkMatches) {
    totalGluedLinksFixed += gluedLinkMatches.length;
    modifiedBody = modifiedBody.replace(gluedLinkRegex, '**$1** $2');
  }

  // 4. Glued list item hyphens: ^-Word -> - Word
  const listHyphenRegex = /^-([A-Za-z0-9])/gm;
  const listHyphenMatches = modifiedBody.match(listHyphenRegex);
  if (listHyphenMatches) {
    totalGluedHyphensFixed += listHyphenMatches.length;
    modifiedBody = modifiedBody.replace(listHyphenRegex, '- $1');
  }

  // 5. Punctuation glued to bold heading: sentence. **Heading** or sentence.**Heading**
  const punctGluedRegex = /([.?!])\*\*([A-Z][^*\n]+(?:\*\*|$))/g;
  const punctGluedMatches = modifiedBody.match(punctGluedRegex);
  if (punctGluedMatches) {
    totalPunctGluedFixed += punctGluedMatches.length;
    modifiedBody = modifiedBody.replace(punctGluedRegex, '$1\n\n**$2');
  }

  // 6. Glued punctuation before bold link e.g. ,**[Ethereum] or and**[Solana]
  const gluedInlineBoldRegex = /([,;])\*\*(\[[^\]]+\]\([^)]+\))\s*\*\*/g;
  const gluedInlineBoldMatches = modifiedBody.match(gluedInlineBoldRegex);
  if (gluedInlineBoldMatches) {
    totalGluedInlineBoldFixed += gluedInlineBoldMatches.length;
    modifiedBody = modifiedBody.replace(gluedInlineBoldRegex, '$1 **$2**');
  }

  const andGluedRegex = /\band\*\*(\[[^\]]+\]\([^)]+\))\s*\*\*/g;
  const andGluedMatches = modifiedBody.match(andGluedRegex);
  if (andGluedMatches) {
    totalGluedInlineBoldFixed += andGluedMatches.length;
    modifiedBody = modifiedBody.replace(andGluedRegex, 'and **$1**');
  }

  const finalContent = frontmatter ? `${frontmatter}${modifiedBody}` : modifiedBody;

  if (finalContent !== original) {
    fs.writeFileSync(filePath, finalContent, 'utf8');
    modifiedFilesCount++;
  }
}

console.log(`Finished processing!`);
console.log(`Files modified: ${modifiedFilesCount}`);
console.log(`Fused bullets fixed: ${totalFusedBulletsFixed}`);
console.log(`Glued words fixed: ${totalGluedWordsFixed}`);
console.log(`Glued links fixed: ${totalGluedLinksFixed}`);
console.log(`Glued list hyphens fixed: ${totalGluedHyphensFixed}`);
console.log(`Punctuation glued to bold fixed: ${totalPunctGluedFixed}`);
console.log(`Glued inline bold fixed: ${totalGluedInlineBoldFixed}`);
