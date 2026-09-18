import * as fs from 'fs';
import * as path from 'path';
import type { ResourcePage } from '../src/types/pseo';

const GENERATED_DIR = path.join(process.cwd(), 'content', 'generated');
const OUT_FILE = path.join(process.cwd(), 'content', 'pseo-resources-runtime.json');

function main() {
  const pages: ResourcePage[] = [];

  if (fs.existsSync(GENERATED_DIR)) {
    const types = fs.readdirSync(GENERATED_DIR).filter(f => 
      fs.statSync(path.join(GENERATED_DIR, f)).isDirectory()
    );
    
    for (const type of types) {
      const typeDir = path.join(GENERATED_DIR, type);
      if (!fs.existsSync(typeDir)) continue;
      
      const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const data = JSON.parse(fs.readFileSync(path.join(typeDir, file), 'utf-8'));
        pages.push(data as ResourcePage);
      }
    }
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(pages));
  console.log(`[precompute-pseo] Wrote ${pages.length} resource pages to ${OUT_FILE}`);
}

main();
