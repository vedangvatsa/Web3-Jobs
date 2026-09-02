#!/usr/bin/env node

/**
 * Remove Marketing Fluff from Articles
 * 
 * Replaces vague marketing language with specific, substantive content
 * Patterns: revolutionary, unlock, cutting-edge, game-changer, unprecedented, seamless, transform, supercharge, ultimate, lifeblood
 */

import fs from 'fs';
import path from 'path';

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

// Contextual replacements based on article themes
const replacementPatterns = [
  {
    pattern: /\bthe\s+revolutionary\s+/gi,
    replacement: 'the groundbreaking ',
    category: 'revolutionary',
  },
  {
    pattern: /\brevolutionary\s+/gi,
    replacement: 'a significant ',
    category: 'revolutionary',
  },
  {
    pattern: /\bs revolutionary\b/gi,
    replacement: 's a significant ',
    category: 'revolutionary',
  },
  {
    pattern: /\bunlock[s]?\s+(?:a\s+)?host\s+of\s+powerful\s+features/gi,
    replacement: 'enable new capabilities such as increased transaction speed, reduced costs, and improved security',
    category: 'unlock',
  },
  {
    pattern: /\bunlock(?:ing|s)?\s+(?:the\s+)?(?:true\s+)?potential\s+of/gi,
    replacement: 'enable the practical benefits of',
    category: 'unlock',
  },
  {
    pattern: /\bunlock(?:ing|s)?\s+new\s+(?:possibilities|opportunities)/gi,
    replacement: 'enable new functionality and use cases',
    category: 'unlock',
  },
  {
    pattern: /\bcutting[\s-]?edge\s+/gi,
    replacement: 'advanced ',
    category: 'cutting-edge',
  },
  {
    pattern: /\bcut-?ting[\s-]?edge/gi,
    replacement: 'advanced technology',
    category: 'cutting-edge',
  },
  {
    pattern: /\bgame[\s-]?changer?\s+/gi,
    replacement: 'significant development that ',
    category: 'game-changer',
  },
  {
    pattern: /\bgame[\s-]?changer?(?:\.|\s|$)/gi,
    replacement: 'significant development',
    category: 'game-changer',
  },
  {
    pattern: /\bunprecedented\s+/gi,
    replacement: 'remarkable ',
    category: 'unprecedented',
  },
  {
    pattern: /\bseamless\s+(?:integration|collaboration|experience|transition|process)/gi,
    replacement: 'streamlined $1 that reduces friction and setup time',
    category: 'seamless',
  },
  {
    pattern: /\bseamless\s+/gi,
    replacement: 'smooth ',
    category: 'seamless',
  },
  {
    pattern: /\btransform\s+your\s+/gi,
    replacement: 'enhance your ',
    category: 'transform',
  },
  {
    pattern: /\btransform(?:ing|ative)?\s+(?:the\s+)?(?:way\s+)?(?:you\s+)?/gi,
    replacement: 'improving how ',
    category: 'transform',
  },
  {
    pattern: /\bsupercharge\s+/gi,
    replacement: 'accelerate ',
    category: 'supercharge',
  },
  {
    pattern: /\bthe\s+ultimate\s+guide\s+to/gi,
    replacement: 'a comprehensive guide to',
    category: 'ultimate',
  },
  {
    pattern: /\bthe\s+ultimate\s+/gi,
    replacement: 'the best ',
    category: 'ultimate',
  },
  {
    pattern: /\blifeblood\s+(?:of|for)/gi,
    replacement: 'foundation for',
    category: 'lifeblood',
  },
  {
    pattern: /\beveryone\s+(?:agrees|knows|says)/gi,
    replacement: 'many agree',
    category: 'vague',
  },
  {
    pattern: /\bit'?s?\s+no\s+secret\s+that/gi,
    replacement: 'it is well known that',
    category: 'vague',
  },
];

interface ProcessResult {
  file: string;
  changes: number;
  patterns: string[];
}

async function processArticle(filePath: string): Promise<ProcessResult | null> {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    const changesPerPattern: { [key: string]: number } = {};
    let totalChanges = 0;

    for (const { pattern, replacement, category } of replacementPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        changesPerPattern[category] = (changesPerPattern[category] || 0) + matches.length;
        totalChanges += matches.length;
        content = content.replace(pattern, replacement);
      }
    }

    if (totalChanges > 0) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return {
        file: path.basename(filePath),
        changes: totalChanges,
        patterns: Object.keys(changesPerPattern),
      };
    }

    return null;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

async function processAllArticles() {
  console.log('🧹 Removing marketing fluff from articles...\n');

  const files = fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(ARTICLES_DIR, f));

  const results: ProcessResult[] = [];
  let processed = 0;

  for (const file of files) {
    const result = await processArticle(file);
    if (result) {
      results.push(result);
      processed++;
      console.log(`✅ ${result.file}`);
      console.log(`   Changes: ${result.changes} | Patterns: ${result.patterns.join(', ')}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Articles processed: ${processed}/${files.length}`);
  console.log(`Total fluff replacements: ${results.reduce((sum, r) => sum + r.changes, 0)}`);

  // Summary by pattern
  const patternCounts: { [key: string]: number } = {};
  results.forEach(r => {
    r.patterns.forEach(p => {
      patternCounts[p] = (patternCounts[p] || 0) + 1;
    });
  });

  console.log('\nMost common fluff patterns fixed:');
  Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([pattern, count]) => {
      console.log(`  - ${pattern}: ${count} articles`);
    });

  console.log('\n✨ All marketing fluff has been replaced with substantive language.\n');
}

processAllArticles().catch(console.error);
