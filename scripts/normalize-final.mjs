import fs from 'fs';
import readline from 'readline';
import { normalize } from './normalize-locations.mjs';

// ─── Extended patterns that the base normalizer misses ───
const EXTRA_MAP = {
  // US patterns
  'san francisco bay area':'United States','bay area':'United States','sf office':'United States',
  'san francisco (hq)':'United States','huntington beach':'United States','scotts valley':'United States',
  'emeryville hq':'United States','emeryville':'United States','nerdwallet us':'United States',
  'mapbox us':'United States','livermore':'United States','berkeley':'United States',
  'redwood shores':'United States','san bruno':'United States','milpitas':'United States',
  'santa barbara':'United States','corte madera':'United States','half moon bay':'United States',
  'mountain view, california':'United States','palo alto, ca':'United States',
  'south san francisco':'United States','daly city':'United States','union city':'United States',
  'sausalito':'United States','larkspur':'United States','tiburon':'United States',
  'mill valley':'United States','novato':'United States','petaluma':'United States',
  'napa':'United States','sonoma':'United States','vallejo':'United States',
  'concord':'United States','antioch':'United States','san ramon':'United States',
  'danville':'United States','dublin':'United States','newark':'United States',
  'hq':'Unknown','full-time':'Unknown','hybrid':'Unknown','any':'Remote/Global','tbd':'Unknown',
  'americas':'Remote/Global','namer':'Remote/Global','global / remote':'Remote/Global',
  'washington d.c.':'United States','washington dc':'United States','d.c.':'United States',
  'us virgin islands':'United States','us tx austin':'United States',
  'los angeles metropolitan area':'United States','metro manila':'Philippines',
  'united states (us)':'United States','united states (remote)':'United States',
  'gibraltar':'Gibraltar',
  // UK patterns
  'bradford, west yorkshire':'United Kingdom','leyland, lancashire':'United Kingdom',
  'leyland':'United Kingdom','lancashire':'United Kingdom',
  // Europe
  'belgrade':'Serbia','yerevan':'Armenia','limassol':'Cyprus','nicosia':'Cyprus',
  'ypsonas':'Cyprus','cyprus, ypsonas':'Cyprus','limassol cyprus':'Cyprus',
  'limassol, limassol':'Cyprus','limassol, cyprus':'Cyprus',
  'delft':'Netherlands','zürich':'Switzerland','zuerich':'Switzerland',
  'onsite zurich':'Switzerland','mapbox helsinki':'Finland',
  'malta':'Malta','tas-sliema, malta':'Malta','mriehel':'Malta','sliema':'Malta',
  'lacaussade':'France','montpellier':'France',
  'pisa':'Italy','torino':'Italy','padova':'Italy','verona':'Italy',
  'almaty':'Kazakhstan','almaty, kz':'Kazakhstan',
  // Asia
  'makati city':'Philippines','hong kong sar':'Hong Kong','tlv':'Israel',
  'nugegoda':'Sri Lanka','nugegoda, western':'Sri Lanka',
  'bangkok (central world office)':'Thailand',
  // Africa
  'banjul':'Gambia','the gambia':'Gambia','abidjan':'Ivory Coast',"côte d'ivoire":'Ivory Coast',
  'kinshasa':'Democratic Republic of the Congo','bamako':'Mali','ouagadougou':'Burkina Faso',
  'niamey':'Niger','freetown':'Sierra Leone','malawi':'Malawi','berekuso':'Ghana',
  'berekuso, eastern region':'Ghana',
  // Middle East
  'king abdullah economic city':'Saudi Arabia','king abdullah economic city, 02':'Saudi Arabia',
  // South America
  'campinas':'Brazil','campinas, sp':'Brazil','sp':'Brazil',
  // Central Asia
  'bishkek':'Kyrgyzstan','kyrgyzstan, bishkek':'Kyrgyzstan',
  'astana':'Kazakhstan','kazakhstan, astana':'Kazakhstan',
  'tashkent':'Uzbekistan','tashkent, uzbekistan':'Uzbekistan',
  // Remaining high-count unmapped
  'el segundo':'United States','sf':'United States','mississauga':'Canada',
  'pretoria':'South Africa','sderot':'Israel','courbevoie':'France',
  'bracknell':'United Kingdom','bracknell, berkshire':'United Kingdom',
  'shoreditch':'United Kingdom','london (shoreditch)':'United Kingdom',
  'deep creek, eleuthera':'Bahamas','eleuthera':'Bahamas',
  'ruda śląska':'Poland','śląsk':'Poland',
  'noida, uttar pradesh':'India',
};

// ─── Second-pass normalizer ───
function normalizeV2(raw) {
  // First try the base normalizer
  const base = normalize(raw);
  if (base !== 'Other') return base;
  
  const s = raw.trim();
  const lower = s.toLowerCase().trim();
  
  // Check extra map (exact)
  if (EXTRA_MAP[lower]) return EXTRA_MAP[lower];
  
  // Check extra map (substring)
  for (const [pattern, country] of Object.entries(EXTRA_MAP)) {
    if (lower.includes(pattern)) return country;
  }
  
  // "State - City" pattern (US)
  const stateCity = lower.match(/^(california|massachusetts|texas|new york|virginia|washington|florida|illinois|colorado|georgia|ohio|pennsylvania|michigan|arizona|maryland|north carolina|minnesota|connecticut|oregon|utah|indiana|tennessee|missouri|wisconsin|nevada|iowa|kansas|nebraska|new jersey|south carolina|alabama|louisiana|oklahoma|kentucky|arkansas|mississippi)\s*[-–]\s*/i);
  if (stateCity) return 'United States';
  
  // "US XX City" pattern
  if (/^us\s+[a-z]{2}\s+/i.test(lower)) return 'United States';
  
  // "Country - City" patterns
  const countryCity = [
    [/^(south africa|united kingdom|australia|germany|france|canada|india|brazil|japan|singapore|ireland|netherlands|switzerland|spain|italy|portugal|sweden|norway|denmark|finland|poland)\s*[-–]\s*/i, null],
    [/^(uk|us|usa|uae)\s*[-–]\s*/i, null],
  ];
  for (const [re] of countryCity) {
    const m = lower.match(re);
    if (m) {
      const cn = m[1].toLowerCase();
      const map = {'uk':'United Kingdom','us':'United States','usa':'United States','uae':'United Arab Emirates','south africa':'South Africa'};
      return map[cn] || cn.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
    }
  }
  
  // "City (something)" or "City HQ" or "Hybrid - City" patterns
  const hybridMatch = lower.match(/^hybrid\s*[-–]\s*(.+)/i);
  if (hybridMatch) return normalizeV2(hybridMatch[1]);

  // "US | State | City" pipe-separated
  const pipeMatch = lower.match(/^(us|uk|usa)\s*\|\s*/i);
  if (pipeMatch) return pipeMatch[1].toLowerCase() === 'uk' ? 'United Kingdom' : 'United States';

  // "China-City" or "Country-City" with dash
  const countryDash = lower.match(/^(china|japan|korea|india|brazil|france|germany|spain|italy)\s*[-–]\s*/i);
  if (countryDash) {
    const cn = countryDash[1].toLowerCase();
    const cmap = {'china':'China','japan':'Japan','korea':'South Korea','india':'India','brazil':'Brazil','france':'France','germany':'Germany','spain':'Spain','italy':'Italy'};
    return cmap[cn] || cn.charAt(0).toUpperCase()+cn.slice(1);
  }

  // Strip company prefixes like "Mapbox Helsinki", "Runna London", "NerdWallet US"
  const companyCity = lower.match(/^(?:mapbox|runna|nerdwallet|stripe|meta|google|amazon|apple|microsoft|coinbase)\s+(.+)/i);
  if (companyCity) return normalizeV2(companyCity[1]);
  
  // "(Remote)" suffix
  const remoteParens = lower.match(/^(.+?)\s*\((?:remote|hq|headquarters|onsite|hybrid|office)\)/i);
  if (remoteParens) return normalizeV2(remoteParens[1]);
  
  // "City or City" → take first
  const orMatch = lower.match(/^(.+?)\s+or\s+/i);
  if (orMatch) return normalizeV2(orMatch[1]);
  
  // "City; City" → take first
  const semiMatch = lower.split(';')[0].trim();
  if (semiMatch !== lower) return normalizeV2(semiMatch);
  
  // "City - description" → take first part
  const dashMatch = lower.match(/^([^-–]+?)\s*[-–]\s/);
  if (dashMatch && dashMatch[1].length > 2) {
    const test = normalizeV2(dashMatch[1].trim());
    if (test !== 'Other') return test;
  }
  
  // "City, Province/State" for Canada
  const canadaProvs = ['ontario','quebec','british columbia','alberta','manitoba','saskatchewan','nova scotia','new brunswick','newfoundland','prince edward island'];
  for (const prov of canadaProvs) {
    if (lower.includes(prov)) return 'Canada';
  }
  
  // Known regions/states
  if (/\b(ontario|québec|québec)\b/i.test(lower)) return 'Canada';
  if (/\b(karnataka|maharashtra|tamil nadu|telangana|kerala|gujarat|rajasthan|west bengal|uttar pradesh|andhra pradesh|madhya pradesh|haryana)\b/i.test(lower)) return 'India';
  if (/\b(bayern|nordrhein|baden|hessen|sachsen|niedersachsen)\b/i.test(lower)) return 'Germany';
  if (/\b(catalonia|andalusia|comunidad|comunitat)\b/i.test(lower)) return 'Spain';
  if (/\b(île-de-france|ile de france|provence|occitanie|hauts-de-france|bretagne|normandie)\b/i.test(lower)) return 'France';
  if (/\b(lombardy|lazio|veneto|piemonte|emilia|toscana|campania)\b/i.test(lower)) return 'Italy';
  if (/\b(england|scotland|wales|northern ireland|greater london|west midlands|south east|east anglia|yorkshire)\b/i.test(lower)) return 'United Kingdom';
  if (/\b(new south wales|nsw|victoria|queensland|western australia)\b/i.test(lower)) return 'Australia';
  
  return 'Other';
}

// ─── CSV Parser ───
function parseLine(line) {
  const fields = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) { if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; } else if (ch === '"') inQ = false; else cur += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { fields.push(cur); cur = ''; } else cur += ch; }
  }
  fields.push(cur); return fields;
}

async function processFile(path, locIdx, label) {
  const rl = readline.createInterface({ input: fs.createReadStream(path), crlfDelay: Infinity });
  let ln = 0, total = 0;
  const countries = {};
  const unmapped = {};
  for await (const line of rl) {
    if (ln === 0) { ln++; continue; }
    const f = parseLine(line);
    const raw = (f[locIdx]||'').trim();
    if (!raw || raw === '-') { ln++; continue; }
    total++;
    const country = normalizeV2(raw);
    countries[country] = (countries[country]||0)+1;
    if (country === 'Other') unmapped[raw] = (unmapped[raw]||0)+1;
    ln++;
  }
  const unmappedCount = Object.values(unmapped).reduce((a,b)=>a+b, 0);
  console.log(`${label}: ${total} jobs → ${Object.keys(countries).length} countries, ${unmappedCount} unmapped (${(unmappedCount/total*100).toFixed(1)}%)`);
  const topU = Object.entries(unmapped).sort((a,b)=>b[1]-a[1]).slice(0,15);
  if (topU.length) { console.log('  Remaining unmapped:'); topU.forEach(([k,v])=>console.log(`    ${v.toString().padStart(5)}  "${k}"`)); }
  return { countries, total };
}

async function main() {
  const cvin = await processFile('path/to/local', 4, 'CVin.bio');
  const web3 = await processFile('jobs-extracted.csv', 7, 'Web3 Jobs');
  
  // Merge
  const allCountries = new Set([...Object.keys(cvin.countries), ...Object.keys(web3.countries)]);
  const merged = [];
  for (const c of allCountries) {
    merged.push({ country: c, cvin: cvin.countries[c]||0, web3: web3.countries[c]||0, total: (cvin.countries[c]||0)+(web3.countries[c]||0) });
  }
  merged.sort((a,b) => b.total - a.total);
  const grandTotal = cvin.total + web3.total;
  
  // Write CSV
  const esc = v => '"' + String(v||'').replace(/"/g,'""') + '"';
  const rows = ['Country,CVin.bio Jobs,CVin.bio %,Web3 Jobs,Web3 %,Combined Total,Combined %'];
  merged.forEach(r => {
    rows.push([
      esc(r.country),
      r.cvin, r.cvin ? (r.cvin/cvin.total*100).toFixed(1)+'%' : '0%',
      r.web3, r.web3 ? (r.web3/web3.total*100).toFixed(1)+'%' : '0%',
      r.total, (r.total/grandTotal*100).toFixed(1)+'%'
    ].join(','));
  });
  
  fs.writeFileSync('path/to/local', rows.join('\n'));
  console.log(`\n✅ Written path/to/local (${merged.length} countries)`);
  
  // Save for Excel rebuild
  fs.writeFileSync('scripts/_country_data.json', JSON.stringify({ cvin: cvin.countries, web3: web3.countries, cvinTotal: cvin.total, web3Total: web3.total }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
