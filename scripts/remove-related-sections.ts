#!/usr/bin/env node

/**
 * Script to remove all "Related Career Guides", "Related Articles", and related content references from articles
 * Run with: npx tsx scripts/remove-related-sections.ts
 */

import fs from 'fs/promises';
import path from 'path';

async function removeRelatedSections() {
  const articlesDir = path.join(process.cwd(), 'content/articles');
  const files = await fs.readdir(articlesDir);
  const articleFiles = files.filter(f => f.endsWith('.md'));

  console.log(`📝 Processing ${articleFiles.length} articles...`);
  
  let filesModified = 0;
  
  for (const file of articleFiles) {
    const filePath = path.join(articlesDir, file);
    let content = await fs.readFile(filePath, 'utf-8');
    const originalContent = content;
    
    // Remove "## Related Articles & Career Guides" section and all content until next heading
    content = content.replace(/## Related Articles & Career Guides\n\n[\s\S]*?(?=\n## |\n###|\Z)/g, '');
    
    // Remove "## Related Career Guides" section and all content until next heading
    content = content.replace(/## Related Career Guides\n[\s\S]*?(?=\n## |\n###|\Z)/g, '');
    
    // Remove "## Related Articles" section
    content = content.replace(/## Related Articles\n[\s\S]*?(?=\n## |\n###|\Z)/g, '');
    
    // Remove "### Related Career Guides" section
    content = content.replace(/### Related Career Guides\n[\s\S]*?(?=\n## |\n###|\Z)/g, '');
    
    // Remove "### Related Guides" section
    content = content.replace(/### Related Guides\n[\s\S]*?(?=\n## |\n###|\Z)/g, '');
    
    // Remove "### Related Content" section
    content = content.replace(/### Related Content\n[\s\S]*?(?=\n## |\n###|\Z)/g, '');
    
    // Remove "### Related Articles" section
    content = content.replace(/### Related Articles\n[\s\S]*?(?=\n## |\n###|\Z)/g, '');
    
    // Remove any standalone lines that are just "[article-link](path)"
    // This catches leftover related article references
    content = content.replace(/^- \[.+?\]\(.*?\)$/gm, (match) => {
      // Only remove if it looks like a related article reference (common patterns)
      const patterns = ['guide', 'career', 'path', 'how-to', 'intro', 'explained', 'complete'];
      if (patterns.some(p => match.toLowerCase().includes(p))) {
        return '';
      }
      return match;
    });
    
    // Remove empty bullet points that might be left
    content = content.replace(/^\s*- \s*$/gm, '');
    
    // Clean up multiple consecutive blank lines (reduce to max 2)
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    if (content !== originalContent) {
      await fs.writeFile(filePath, content);
      filesModified++;
      console.log(`✅ ${file}`);
    }
  }
  
  console.log(`\n✅ Cleaned embedded related content from ${filesModified} articles`);
}

removeRelatedSections().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
