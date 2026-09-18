import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string, base = ''): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full, path.join(base, file)));
    } else {
      results.push('/logo/' + path.join(base, file));
    }
  }
  return results;
}

const all = walk(path.join(process.cwd(), 'public/logo'));
fs.writeFileSync(path.join(process.cwd(), 'content/company-logos-index.json'), JSON.stringify(all));
console.log(`Wrote ${all.length} logo paths to content/company-logos-index.json`);
