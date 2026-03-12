const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const GENERATED_DIR = path.join(process.cwd(), 'content', 'generated');
const urls = new Set();
const urlToFile = new Map();

function extractUrls(obj, filename) {
  if (typeof obj === 'object' && obj !== null) {
    for (const key of Object.keys(obj)) {
      if (key === 'url' && typeof obj[key] === 'string') {
        urls.add(obj[key]);
        if (!urlToFile.has(obj[key])) urlToFile.set(obj[key], []);
        urlToFile.get(obj[key]).push(filename);
      }
      extractUrls(obj[key], filename);
    }
  }
}

// Load all URLs
const types = fs.readdirSync(GENERATED_DIR).filter(f => fs.statSync(path.join(GENERATED_DIR, f)).isDirectory());
for (const type of types) {
  const typeDir = path.join(GENERATED_DIR, type);
  const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(typeDir, file), 'utf-8'));
    extractUrls(data, `${type}/${file}`);
  }
}

async function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; URL checker)' } }, (res) => {
      resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    });
    req.on('error', (e) => resolve({ url, status: 0, ok: false, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, ok: false, error: 'timeout' }); });
    req.end();
  });
}

async function main() {
  const urlList = [...urls];
  console.log(`Checking ${urlList.length} URLs...\n`);
  
  const failed = [];
  const batchSize = 10;
  
  for (let i = 0; i < urlList.length; i += batchSize) {
    const batch = urlList.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(checkUrl));
    
    for (const r of results) {
      if (!r.ok) {
        failed.push(r);
        console.log(`❌ ${r.status || r.error}: ${r.url}`);
        console.log(`   Used in: ${urlToFile.get(r.url).join(', ')}`);
      }
    }
    
    process.stdout.write(`Progress: ${Math.min(i + batchSize, urlList.length)}/${urlList.length}\r`);
  }
  
  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total URLs: ${urlList.length}`);
  console.log(`Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log(`\nFailed URLs:`);
    failed.forEach(f => console.log(`  ${f.url} (${f.status || f.error})`));
  }
}

main();
