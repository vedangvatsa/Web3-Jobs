#!/usr/bin/env node

/**
 * Script to remove all "Related Career Guides" and "Related Articles" sections from articles
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
    
    // Remove "## Related Articles & Career Guides" and following list
    content = content.replace(/## Related Articles & Career Guides\n\n[\s\S]*?(?=\n## |\n###|\Z)/g, '');
    
    // Remove "## Related Career Guides" and following list
    content = content.replace(/## Related Career Guides\n\n[\s\S]*?(?=\n## |\n###|\Z)/g, '');
    
    // Remove "### Related Career Guides" and following list
    content = content.replace(/### Related Career Guides\n[\s\S]*?(?=\n## |\n###|\Z)/g, '');
    
    // Remove "### Related Guides" and following list
    content = content.replace(/### Related Guides\n[\s\S]*?(?=\n## |\n###|\Z)/g, '');
    
    if (content !== originalContent) {
      await fs.writeFile(filePath, content);
      filesModified++;
      console.log(`✅ ${file}`);
    }
  }
  
  console.log(`\n✅ Removed "Related" sections from ${filesModified} articles`);
}

removeRelatedSections().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
