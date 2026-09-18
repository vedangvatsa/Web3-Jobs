import fs from 'fs';
import path from 'path';
import { getArticle } from '../src/lib/articles';

const OUT_DIR = path.join(process.cwd(), 'public/articles-data');
const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md') && f !== 'AGENTS.md' && f !== 'README.md');
  console.log(`[generate-articles-data] Processing ${files.length} articles...`);

  let count = 0;
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const article = await getArticle(slug);
    if (article) {
      fs.writeFileSync(path.join(OUT_DIR, `${slug}.json`), JSON.stringify(article));
      count++;
    }
  }

  console.log(`[generate-articles-data] Successfully wrote ${count} articles to ${OUT_DIR}`);
}

main().catch(err => {
  console.error('[generate-articles-data] Error:', err);
  process.exit(1);
});
