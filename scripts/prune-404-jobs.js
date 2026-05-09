const fs = require('fs');
const https = require('https');

function parseCSV(text) {
  const rows = []; let cur = []; let field = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"' && text[i+1] === '"') { field += '"'; i++; } else if (ch === '"') inQ = false; else field += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { cur.push(field); field = ''; } else if (ch === '\n' || (ch === '\r' && text[i+1] === '\n')) { cur.push(field); field = ''; if (cur.length >= 14) rows.push(cur); cur = []; if (ch === '\r') i++; } else field += ch; }
  }
  if (cur.length > 0) rows.push(cur);
  return rows;
}

const esc = v => { const s = String(v||'-'); if (s.includes(',')||s.includes('"')||s.includes('\n')) return '"'+s.replace(/"/g,'""')+'"'; return s; };

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) });
    return res.status;
  } catch (err) {
    return 0; // 0 means timeout or network error (keep it just in case)
  }
}

async function main() {
  console.log('Reading jobs-extracted.csv...');
  const csvContent = fs.readFileSync('LOCAL_PATH/jobs-extracted.csv', 'utf8');
  const rows = parseCSV(csvContent);
  const header = rows[0];
  const jobs = rows.slice(1);
  
  console.log(`Checking ${jobs.length} jobs for 404s (this may take a few minutes)...`);
  
  const validJobs = [];
  const removedJobs = [];
  
  const concurrency = 50;
  for (let i = 0; i < jobs.length; i += concurrency) {
    const chunk = jobs.slice(i, i + concurrency);
    
    await Promise.all(chunk.map(async (row) => {
      if (!row || !row[0]) return;
      const url = row[0];
      const status = await checkUrl(url);
      
      // If exactly 404, we drop it. If 403 or 0 (network error), we KEEP it to be safe 
      // because Cloudflare blocks headless requests.
      if (status === 404) {
        removedJobs.push({ url, company: row[1] });
      } else {
        validJobs.push(row);
      }
    }));
    
    process.stdout.write(`\rProcessed ${Math.min(i + concurrency, jobs.length)} / ${jobs.length} | Removed: ${removedJobs.length} `);
  }
  
  console.log(`\n\nFinished! Found ${removedJobs.length} 404 dead links.`);
  
  // Save the cleaned CSV
  const lines = [header.map(esc).join(',')];
  for (const row of validJobs) {
    lines.push(row.map(esc).join(','));
  }
  
  fs.writeFileSync('LOCAL_PATH/jobs-extracted.csv', lines.join('\n'));
  console.log(`Successfully updated jobs-extracted.csv with ${validJobs.length} active jobs.`);
  
  // Save log of removed jobs
  fs.writeFileSync('LOCAL_PATH/scripts/removed-404-jobs.json', JSON.stringify(removedJobs, null, 2));
}

main();
