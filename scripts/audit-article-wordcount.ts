import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface ArticleAudit {
  slug: string;
  title: string;
  category: string;
  wordCount: number;
  status: 'needs-expansion' | 'good' | 'excellent';
  lastModified: string;
}

const articlesDir = path.join(process.cwd(), 'content', 'articles');

export function auditArticleWordCounts() {
  console.log('📊 Auditing article word counts...\n');

  const files = fs.readdirSync(articlesDir);
  const results: ArticleAudit[] = [];

  files
    .filter(f => f.endsWith('.md'))
    .forEach(file => {
      const filePath = path.join(articlesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { data, content: markdown } = matter(content);

      const wordCount = markdown.trim().split(/\s+/).length;
      const stats = fs.statSync(filePath);

      let status: 'needs-expansion' | 'good' | 'excellent' = 'good';
      if (wordCount < 1500) status = 'needs-expansion';
      if (wordCount >= 2000) status = 'excellent';

      results.push({
        slug: file.replace('.md', ''),
        title: data.title || 'Untitled',
        category: data.category || 'Uncategorized',
        wordCount,
        status,
        lastModified: stats.mtime.toISOString()
      });
    });

  // Sort by word count
  results.sort((a, b) => a.wordCount - b.wordCount);

  // Generate report
  const needsExpansion = results.filter(r => r.status === 'needs-expansion');
  const good = results.filter(r => r.status === 'good');
  const excellent = results.filter(r => r.status === 'excellent');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║               ARTICLE WORD COUNT AUDIT REPORT               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`📈 SUMMARY`);
  console.log(`├─ Total Articles: ${results.length}`);
  console.log(`├─ Needs Expansion (<1500): ${needsExpansion.length} (${((needsExpansion.length / results.length) * 100).toFixed(1)}%)`);
  console.log(`├─ Good (1500-1999): ${good.length} (${((good.length / results.length) * 100).toFixed(1)}%)`);
  console.log(`└─ Excellent (2000+): ${excellent.length} (${((excellent.length / results.length) * 100).toFixed(1)}%)\n`);

  // Detailed breakdown by category
  const byCategory = results.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = { total: 0, needsExpansion: 0 };
    }
    acc[article.category].total++;
    if (article.status === 'needs-expansion') {
      acc[article.category].needsExpansion++;
    }
    return acc;
  }, {} as Record<string, { total: number; needsExpansion: number }>);

  console.log('📂 BREAKDOWN BY CATEGORY');
  Object.entries(byCategory)
    .sort((a, b) => b[1].needsExpansion - a[1].needsExpansion)
    .forEach(([category, stats]) => {
      console.log(`├─ ${category}`);
      console.log(`│  ├─ Total: ${stats.total}`);
      console.log(`│  └─ Needs Expansion: ${stats.needsExpansion}`);
    });

  console.log('\n📋 ARTICLES NEEDING EXPANSION (Word Count < 1500)\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║ # │ Word Count │ Category                  │ Title                         ║');
  console.log('╠═══════════════════════════════════════════════════════════════════════════╣');

  needsExpansion.forEach((article, index) => {
    const num = String(index + 1).padStart(2, ' ');
    const wc = String(article.wordCount).padStart(4, ' ');
    const cat = article.category.padEnd(23, ' ').substring(0, 23);
    const title = article.title.substring(0, 29).padEnd(29, ' ');
    console.log(`║${num} │     ${wc}   │ ${cat} │ ${title}║`);
  });

  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  // Export to JSON for processing
  const auditPath = path.join(process.cwd(), 'article-audit.json');
  fs.writeFileSync(auditPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    summary: {
      total: results.length,
      needsExpansion: needsExpansion.length,
      good: good.length,
      excellent: excellent.length
    },
    articles: results
  }, null, 2));

  console.log(`✅ Audit complete! Results saved to: article-audit.json`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review the list above`);
  console.log(`   2. Prioritize high-traffic articles`);
  console.log(`   3. Use the article-audit.json for bulk updates\n`);

  return {
    total: results.length,
    needsExpansion: needsExpansion.length,
    good: good.length,
    excellent: excellent.length,
    articles: results
  };
}

// Run if called directly
if (require.main === module) {
  auditArticleWordCounts();
}
