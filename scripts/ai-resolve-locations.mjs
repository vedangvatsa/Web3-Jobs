import fs from 'fs';

const OPENAI_KEY = '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';

async function callAI(batch) {
  const prompt = `Map each location string to its COUNTRY name. Return ONLY a JSON object mapping each input string to its country. Use standard country names (e.g. "United States", "United Kingdom", "Singapore"). If it's a region use: "Remote/Global", "APAC", "EMEA", "LATAM", "Europe". If truly unknown use "Unknown".

Locations:
${JSON.stringify(batch)}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: 'json_object' },
    }),
  });
  const data = await res.json();
  if (!data.choices?.[0]?.message?.content) {
    console.error('API error:', JSON.stringify(data).slice(0, 200));
    return {};
  }
  return JSON.parse(data.choices[0].message.content);
}

async function main() {
  // Read the raw unmapped locations from previous run
  // Re-extract them
  const readline = await import('readline');
  
  function parseLine(line) {
    const fields = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) { if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; } else if (ch === '"') inQ = false; else cur += ch; }
      else { if (ch === '"') inQ = true; else if (ch === ',') { fields.push(cur); cur = ''; } else cur += ch; }
    }
    fields.push(cur); return fields;
  }

  // Quick scan to find all unmapped from normalize-locations.mjs
  // We know the deterministic mapper outputs "Other" for these
  // Import the normalize function from the other script dynamically
  const { normalize } = await import('./normalize-locations.mjs');

  async function collectUnmapped(path, locIdx) {
    const rl = readline.createInterface({ input: fs.createReadStream(path), crlfDelay: Infinity });
    let ln = 0;
    const unmapped = {};
    for await (const line of rl) {
      if (ln === 0) { ln++; continue; }
      const f = parseLine(line);
      const raw = (f[locIdx]||'').trim();
      if (!raw || raw === '-') { ln++; continue; }
      if (normalize(raw) === 'Other') {
        unmapped[raw] = (unmapped[raw]||0)+1;
      }
      ln++;
    }
    return unmapped;
  }

  console.log('Collecting unmapped locations...');
  const cvinUnmapped = await collectUnmapped('/Users/vedang/Documents/cvinbio-jobs-extracted.csv', 4);
  const web3Unmapped = await collectUnmapped('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', 7);
  
  // Merge
  const allUnmapped = {};
  for (const [k,v] of Object.entries(cvinUnmapped)) allUnmapped[k] = (allUnmapped[k]||0)+v;
  for (const [k,v] of Object.entries(web3Unmapped)) allUnmapped[k] = (allUnmapped[k]||0)+v;
  
  const uniqueStrings = Object.keys(allUnmapped);
  console.log(`Total unmapped: ${uniqueStrings.length} unique strings`);

  // Batch them (50 per API call)
  const BATCH_SIZE = 80;
  const aiMap = {};
  const batches = [];
  for (let i = 0; i < uniqueStrings.length; i += BATCH_SIZE) {
    batches.push(uniqueStrings.slice(i, i + BATCH_SIZE));
  }

  console.log(`Processing ${batches.length} batches of ${BATCH_SIZE}...`);
  
  // Process 5 concurrent batches
  const CONCURRENCY = 5;
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const chunk = batches.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(b => callAI(b)));
    results.forEach(r => Object.assign(aiMap, r));
    console.log(`  Batch ${i+1}-${Math.min(i+CONCURRENCY, batches.length)}/${batches.length} done (${Object.keys(aiMap).length} mapped)`);
  }

  // Save AI mapping
  fs.writeFileSync('/Users/vedang/web3jobs/Web3-Jobs/scripts/_ai_location_map.json', JSON.stringify(aiMap, null, 2));
  console.log(`\n✅ AI mapped ${Object.keys(aiMap).length} locations. Saved to _ai_location_map.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
