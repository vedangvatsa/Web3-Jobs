const fs = require('fs');
const path = require('path');

['ideas', 'mistakes', 'tools', 'checklists'].forEach(type => {
  console.log('\n=== ' + type.toUpperCase() + ' ===');
  const dir = 'content/generated/' + type;
  if (!fs.existsSync(dir)) return;
  
  let totalItems = 0;
  let fileCount = 0;
  
  fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(file => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
      const items = data.content.sections.reduce((a,s) => a + s.items.length, 0);
      totalItems += items;
      fileCount++;
      const status = items < 30 ? '⚠️ LOW' : '✅';
      console.log(status, file.substring(0, 50).padEnd(52), 'Sections:', data.content.sections.length, 'Items:', items);
    } catch(e) {
      console.log('❌', file, 'ERROR:', e.message);
    }
  });
  
  console.log('Total:', fileCount, 'files,', totalItems, 'items');
});
