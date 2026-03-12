const fs = require('fs');
const path = require('path');

const GENERATED_DIR = path.join(process.cwd(), 'content', 'generated');
const urls = new Set();

function extractUrls(obj) {
  if (typeof obj === 'string' && obj.startsWith('http')) {
    urls.add(obj);
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key of Object.keys(obj)) {
      if (key === 'url' && typeof obj[key] === 'string') {
        urls.add(obj[key]);
      }
      extractUrls(obj[key]);
    }
  }
}

const types = fs.readdirSync(GENERATED_DIR).filter(f => fs.statSync(path.join(GENERATED_DIR, f)).isDirectory());
for (const type of types) {
  const typeDir = path.join(GENERATED_DIR, type);
  const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(typeDir, file), 'utf-8'));
    extractUrls(data);
  }
}

console.log([...urls].sort().join('\n'));
console.log('---');
console.log('Total unique URLs:', urls.size);
