const fs = require('fs');
const path = require('path');

const dir = 'content/generated/mistakes';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  let changed = false;
  
  // Fix sections that use "mistakes" instead of "items"
  data.content.sections.forEach(section => {
    if (section.mistakes && !section.items) {
      section.items = section.mistakes;
      delete section.mistakes;
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Fixed:', file);
  } else {
    console.log('OK:', file);
  }
});
