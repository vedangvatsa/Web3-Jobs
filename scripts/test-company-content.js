const fs = require('fs');
const path = require('path');

// Import the companies functions
async function testCompanyContent() {
  console.log('Testing company content loading...\n');
  
  const companiesWithContent = [
    'coinbase',
    'trm-labs',
    'anchorage-digital',
    'aave'
  ];
  
  for (const slug of companiesWithContent) {
    const contentPath = path.join(__dirname, '../content/companies', `${slug}.md`);
    
    if (fs.existsSync(contentPath)) {
      console.log(`✓ ${slug}.md exists`);
      const content = fs.readFileSync(contentPath, 'utf-8');
      
      // Check for frontmatter
      if (content.startsWith('---')) {
        console.log(`  - Has frontmatter`);
        
        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          console.log(`  - Frontmatter keys: ${frontmatter.split('\n').map(line => line.split(':')[0]).filter(k => k).join(', ')}`);
        }
        
        // Check content length
        const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
        console.log(`  - Content length: ${bodyContent.length} characters`);
      }
      console.log('');
    } else {
      console.log(`✗ ${slug}.md NOT FOUND\n`);
    }
  }
}

testCompanyContent().catch(console.error);
