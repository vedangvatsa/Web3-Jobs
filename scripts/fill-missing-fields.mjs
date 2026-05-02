import fs from 'fs';

const CONCURRENCY = 50;

function parseCSV(text) {
  const rows = []; let cur = []; let field = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"' && text[i+1] === '"') { field += '"'; i++; } else if (ch === '"') inQ = false; else field += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { cur.push(field); field = ''; } else if (ch === '\n' || (ch === '\r' && text[i+1] === '\n')) { cur.push(field); field = ''; if (cur.length >= 14) rows.push(cur); cur = []; if (ch === '\r') i++; } else field += ch; }
  }
  if (cur.length >= 14) rows.push(cur);
  return rows;
}

// ─── Deterministic extractors ───

function extractLocation(desc, title) {
  const text = desc + ' ' + title;
  // Look for location patterns
  const patterns = [
    /(?:location|based in|located in|office in|position in)[:\s]+([A-Z][a-zA-Z\s,]+)/i,
    /(?:remote|hybrid|on-?site)\s*[-–]\s*([A-Z][a-zA-Z\s,]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim().slice(0, 60);
  }
  // Check for "Remote" keyword
  if (/\bfully remote\b|\bremote position\b|\bwork from anywhere\b|\bremote[,\s]*global\b/i.test(text)) return 'Remote';
  if (/\bremote\b/i.test(text) && !/\bremote.*possible\b/i.test(text)) return 'Remote';
  return '';
}

function extractEmploymentType(desc, title) {
  const text = (desc + ' ' + title).toLowerCase();
  if (/\bintern(ship)?\b/.test(text)) return 'Internship';
  if (/\bcontract(or)?\b|\bfreelance\b|\btemp(orary)?\b/.test(text)) return 'Contract';
  if (/\bpart[-\s]?time\b/.test(text)) return 'Part-time';
  if (/\bfull[-\s]?time\b/.test(text)) return 'Full-time';
  return 'Full-time'; // default for crypto jobs
}

function extractExperienceLevel(desc, title) {
  const text = (desc + ' ' + title).toLowerCase();
  if (/\b(?:principal|distinguished|fellow)\b/.test(text)) return 'Principal';
  if (/\bstaff\b/.test(text)) return 'Staff';
  if (/\b(?:director|vp|vice president|head of)\b/.test(text)) return 'Director';
  if (/\blead\b/.test(text)) return 'Lead';
  if (/\bsenior\b|\bsr\.?\b/.test(text)) return 'Senior';
  if (/\bjunior\b|\bjr\.?\b|\bentry[- ]level\b/.test(text)) return 'Entry';
  if (/\bintern(ship)?\b/.test(text)) return 'Entry';
  if (/\b(?:5\+|6\+|7\+|8\+|10\+)\s*years?\b/.test(text)) return 'Senior';
  if (/\b(?:3\+|4\+)\s*years?\b/.test(text)) return 'Mid';
  if (/\b(?:1\+|2\+|0-2)\s*years?\b/.test(text)) return 'Entry';
  return 'Mid'; // default
}

function extractDepartment(desc, title) {
  const text = (desc + ' ' + title).toLowerCase();
  if (/\b(?:solidity|smart contract|blockchain engineer|protocol engineer|rust.*engineer|backend.*engineer|frontend.*engineer|full.?stack|software engineer|devops|sre|infrastructure|platform engineer|mobile engineer)\b/.test(text)) return 'Engineering';
  if (/\b(?:data scien|machine learning|ml engineer|ai engineer|data engineer|analytics)\b/.test(text)) return 'Data & AI';
  if (/\b(?:product manager|product design|ux|ui|designer)\b/.test(text)) return 'Product & Design';
  if (/\b(?:marketing|growth|content|social media|community|brand|seo)\b/.test(text)) return 'Marketing';
  if (/\b(?:business development|sales|account executive|partnerships|bd manager)\b/.test(text)) return 'Business Development';
  if (/\b(?:finance|accounting|treasury|controller|cfo|tax)\b/.test(text)) return 'Finance';
  if (/\b(?:legal|counsel|compliance|regulatory|aml|kyc)\b/.test(text)) return 'Legal & Compliance';
  if (/\b(?:hr|human resources|talent|recruiting|people)\b/.test(text)) return 'People & HR';
  if (/\b(?:operations|ops manager|project manager|program manager)\b/.test(text)) return 'Operations';
  if (/\b(?:security|infosec|penetration|vulnerability)\b/.test(text)) return 'Security';
  if (/\b(?:research|researcher|economist|analyst)\b/.test(text)) return 'Research';
  if (/\b(?:support|customer success|customer service|helpdesk)\b/.test(text)) return 'Customer Support';
  return '';
}

function extractCryptoFocus(desc, title) {
  const text = (desc + ' ' + title).toLowerCase();
  if (/\b(?:defi|decentralized finance|lending protocol|amm|dex|liquidity)\b/.test(text)) return 'DeFi';
  if (/\b(?:nft|non.?fungible|digital collectible|metaverse)\b/.test(text)) return 'NFT & Gaming';
  if (/\b(?:infrastructure|node|validator|rpc|indexer|oracle)\b/.test(text)) return 'Infrastructure';
  if (/\b(?:trading|exchange|spot|derivatives|perpetual|orderbook)\b/.test(text)) return 'Trading';
  if (/\b(?:payment|stablecoin|remittance|settlement|cross.?border)\b/.test(text)) return 'Payments';
  if (/\b(?:layer.?2|l2|rollup|scaling|zk.?proof|zero.?knowledge)\b/.test(text)) return 'Layer 2 & Scaling';
  if (/\b(?:wallet|custody|key management|self.?custody)\b/.test(text)) return 'Wallets & Custody';
  if (/\b(?:dao|governance|token|tokenomics)\b/.test(text)) return 'DAO & Governance';
  if (/\b(?:security|audit|exploit|vulnerability|smart contract security)\b/.test(text)) return 'Security';
  if (/\b(?:compliance|regulation|aml|kyc|regtech)\b/.test(text)) return 'Compliance';
  return '';
}

async function main() {
  const content = fs.readFileSync('LOCAL_PATH/jobs-extracted.csv', 'utf8');
  const rows = parseCSV(content);
  const header = rows[0];
  const data = rows.slice(1);
  
  // Fields: 7:Location, 8:EmploymentType, 9:ExperienceLevel, 10:Department, 11:CryptoFocus
  let locFilled = 0, typeFilled = 0, lvlFilled = 0, deptFilled = 0, cryptoFilled = 0, urlFilled = 0;
  
  for (const row of data) {
    const desc = (row[4]||'').trim();
    const title = (row[3]||'').trim();
    const company = (row[1]||'').trim();
    
    // Only fill if currently empty
    if (!(row[7]||'').trim() || row[7] === '-') {
      const loc = extractLocation(desc, title);
      if (loc) { row[7] = loc; locFilled++; }
    }
    if (!(row[8]||'').trim() || row[8] === '-') {
      const type = extractEmploymentType(desc, title);
      if (type) { row[8] = type; typeFilled++; }
    }
    if (!(row[9]||'').trim() || row[9] === '-') {
      const lvl = extractExperienceLevel(desc, title);
      if (lvl) { row[9] = lvl; lvlFilled++; }
    }
    if (!(row[10]||'').trim() || row[10] === '-') {
      const dept = extractDepartment(desc, title);
      if (dept) { row[10] = dept; deptFilled++; }
    }
    if (!(row[11]||'').trim() || row[11] === '-') {
      const crypto = extractCryptoFocus(desc, title);
      if (crypto) { row[11] = crypto; cryptoFilled++; }
    }
    // Fill Company URL if missing
    if (!(row[2]||'').trim() || row[2] === '-') {
      const known = {
        'binance':'binance.com','coinbase':'coinbase.com','ripple':'ripple.com','circle':'circle.com',
        'phantom':'phantom.app','alchemy':'alchemy.com','revolut':'revolut.com','stripe':'stripe.com',
        'robinhood':'robinhood.com','a16z':'a16z.com','polymarket':'polymarket.com','uniswap':'uniswap.org',
      };
      const key = company.toLowerCase();
      if (known[key]) { row[2] = known[key]; urlFilled++; }
    }
  }
  
  console.log('Fields filled:');
  console.log('  Location:', locFilled);
  console.log('  Employment Type:', typeFilled);
  console.log('  Experience Level:', lvlFilled);
  console.log('  Department:', deptFilled);
  console.log('  Crypto Focus:', cryptoFilled);
  console.log('  Company URL:', urlFilled);
  
  // Write back
  const esc = v => { const s = String(v||''); if (s.includes(',')||s.includes('"')||s.includes('\n')) return '"'+s.replace(/"/g,'""')+'"'; return s; };
  const out = [header.map(h => esc(h)).join(',')];
  for (const row of data) out.push(row.map(v => esc(v)).join(','));
  fs.writeFileSync('LOCAL_PATH/jobs-extracted.csv', out.join('\n'));
  
  // Final audit
  console.log('\n✅ Final coverage:');
  header.forEach((h,i) => {
    const filled = data.filter(r => (r[i]||'').trim() && r[i] !== '-').length;
    console.log('  ' + h.padEnd(22) + filled.toString().padStart(5) + '/' + data.length + ' (' + (filled/data.length*100).toFixed(1) + '%)');
  });
}

main().catch(e => { console.error(e); process.exit(1); });
