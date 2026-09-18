import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

const dir = path.join(process.cwd(), 'content', 'companies');
const outFile = path.join(process.cwd(), 'content', 'company-profiles-runtime.json');

function main() {
  if (!fs.existsSync(dir)) {
    console.warn('[precompute-company-profiles] content/companies directory not found');
    return;
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const map: Record<string, { website?: string; description?: string }> = {};

  for (const file of files) {
    const slug = file.replace('.md', '');
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    const website = data.website || undefined;
    const bodyPlain = content.replace(/^#+.*$/gm, '').replace(/[\r\n]+/g, ' ').trim();
    const frontDesc = typeof data.description === 'string' && data.description.trim() ? data.description.trim() : '';
    let description = '';
    if (frontDesc && bodyPlain && frontDesc !== bodyPlain) {
      description = (frontDesc + '\n\n' + bodyPlain).trim();
    } else {
      description = frontDesc || bodyPlain;
    }
    map[slug] = { website, description };
  }

  fs.writeFileSync(outFile, JSON.stringify(map));
  console.log(`[precompute-company-profiles] Wrote ${files.length} company profiles to ${outFile}`);
}

main();
