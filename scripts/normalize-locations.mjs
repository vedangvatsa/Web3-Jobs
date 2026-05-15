import fs from 'fs';
import readline from 'readline';

// ─── Comprehensive country mapping ───
const US_STATES = new Set(['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']);
const US_STATE_FULL = {'alabama':'US','alaska':'US','arizona':'US','arkansas':'US','california':'US','colorado':'US','connecticut':'US','delaware':'US','florida':'US','georgia':'US','hawaii':'US','idaho':'US','illinois':'US','indiana':'US','iowa':'US','kansas':'US','kentucky':'US','louisiana':'US','maine':'US','maryland':'US','massachusetts':'US','michigan':'US','minnesota':'US','mississippi':'US','missouri':'US','montana':'US','nebraska':'US','nevada':'US','new hampshire':'US','new jersey':'US','new mexico':'US','new york':'US','north carolina':'US','north dakota':'US','ohio':'US','oklahoma':'US','oregon':'US','pennsylvania':'US','rhode island':'US','south carolina':'US','south dakota':'US','tennessee':'US','texas':'US','utah':'US','vermont':'US','virginia':'US','washington':'US','west virginia':'US','wisconsin':'US','wyoming':'US','district of columbia':'US'};

const CITY_TO_COUNTRY = {
  // US Cities
  'san francisco':'United States','new york':'United States','new york city':'United States','nyc':'United States','los angeles':'United States','chicago':'United States','seattle':'United States','boston':'United States','austin':'United States','denver':'United States','dallas':'United States','houston':'United States','miami':'United States','atlanta':'United States','portland':'United States','san diego':'United States','san jose':'United States','phoenix':'United States','philadelphia':'United States','detroit':'United States','minneapolis':'United States','salt lake city':'United States','nashville':'United States','charlotte':'United States','raleigh':'United States','tampa':'United States','orlando':'United States','las vegas':'United States','sacramento':'United States','pittsburgh':'United States','columbus':'United States','indianapolis':'United States','cleveland':'United States','san antonio':'United States','st louis':'United States','kansas city':'United States','milwaukee':'United States','baltimore':'United States','richmond':'United States','memphis':'United States','oakland':'United States','long beach':'United States','sunnyvale':'United States','mountain view':'United States','palo alto':'United States','menlo park':'United States','cupertino':'United States','redwood city':'United States','san mateo':'United States','foster city':'United States','santa clara':'United States','irvine':'United States','pasadena':'United States','burlingame':'United States','bellevue':'United States','kirkland':'United States','redmond':'United States','scottsdale':'United States','boulder':'United States','cambridge':'United States','somerville':'United States','arlington':'United States','plano':'United States','tempe':'United States','ann arbor':'United States','durham':'United States','chapel hill':'United States','hoboken':'United States','jersey city':'United States','brooklyn':'United States','manhattan':'United States','stamford':'United States','greenwich':'United States','new haven':'United States','lehi':'United States','provo':'United States','reston':'United States','mclean':'United States','tysons':'United States','herndon':'United States','bethesda':'United States','rockville':'United States','columbia':'United States','wilmington':'United States','san rafael':'United States','carlsbad':'United States','santa monica':'United States','venice':'United States','culver city':'United States','west hollywood':'United States','burbank':'United States','glendale':'United States','fremont':'United States','hayward':'United States','walnut creek':'United States','pleasanton':'United States','santa cruz':'United States','monterey':'United States','sacramento':'United States','fresno':'United States','bakersfield':'United States','stockton':'United States','modesto':'United States',
  // UK
  'london':'United Kingdom','manchester':'United Kingdom','birmingham':'United Kingdom','edinburgh':'United Kingdom','glasgow':'United Kingdom','bristol':'United Kingdom','leeds':'United Kingdom','liverpool':'United Kingdom','cambridge uk':'United Kingdom','oxford':'United Kingdom','nottingham':'United Kingdom','cardiff':'United Kingdom','belfast':'United Kingdom','southampton':'United Kingdom','brighton':'United Kingdom','reading':'United Kingdom','coventry':'United Kingdom','sheffield':'United Kingdom','newcastle':'United Kingdom','exeter':'United Kingdom','bath':'United Kingdom',
  // Europe
  'paris':'France','lyon':'France','marseille':'France','toulouse':'France','nice':'France','nantes':'France','strasbourg':'France','bordeaux':'France',
  'berlin':'Germany','munich':'Germany','frankfurt':'Germany','hamburg':'Germany','cologne':'Germany','düsseldorf':'Germany','stuttgart':'Germany','dusseldorf':'Germany',
  'amsterdam':'Netherlands','rotterdam':'Netherlands','the hague':'Netherlands','eindhoven':'Netherlands','utrecht':'Netherlands',
  'dublin':'Ireland','cork':'Ireland','galway':'Ireland',
  'zurich':'Switzerland','geneva':'Switzerland','basel':'Switzerland','bern':'Switzerland','zug':'Switzerland','lausanne':'Switzerland',
  'madrid':'Spain','barcelona':'Spain','valencia':'Spain','seville':'Spain','malaga':'Spain',
  'rome':'Italy','milan':'Italy','turin':'Italy','florence':'Italy','naples':'Italy','bologna':'Italy',
  'lisbon':'Portugal','porto':'Portugal','braga':'Portugal',
  'vienna':'Austria','salzburg':'Austria','graz':'Austria',
  'brussels':'Belgium','antwerp':'Belgium','ghent':'Belgium',
  'stockholm':'Sweden','gothenburg':'Sweden','malmö':'Sweden','malmo':'Sweden',
  'oslo':'Norway','bergen':'Norway','stavanger':'Norway',
  'copenhagen':'Denmark','aarhus':'Denmark',
  'helsinki':'Finland','espoo':'Finland','tampere':'Finland',
  'warsaw':'Poland','krakow':'Poland','wroclaw':'Poland','gdansk':'Poland','poznan':'Poland',
  'prague':'Czech Republic','brno':'Czech Republic',
  'budapest':'Hungary',
  'bucharest':'Romania','cluj':'Romania','timisoara':'Romania',
  'sofia':'Bulgaria',
  'zagreb':'Croatia',
  'athens':'Greece','thessaloniki':'Greece',
  'tallinn':'Estonia','tartu':'Estonia',
  'riga':'Latvia','vilnius':'Lithuania',
  'bratislava':'Slovakia','ljubljana':'Slovenia',
  'luxembourg':'Luxembourg','luxembourg city':'Luxembourg',
  'kyiv':'Ukraine','lviv':'Ukraine','kharkiv':'Ukraine',
  // Asia
  'singapore':'Singapore',
  'tokyo':'Japan','osaka':'Japan','kyoto':'Japan','yokohama':'Japan','fukuoka':'Japan',
  'seoul':'South Korea','busan':'South Korea',
  'beijing':'China','shanghai':'China','shenzhen':'China','guangzhou':'China','hangzhou':'China','chengdu':'China','hong kong':'Hong Kong','taipei':'Taiwan','kaohsiung':'Taiwan',
  'bangalore':'India','bengaluru':'India','mumbai':'India','delhi':'India','new delhi':'India','hyderabad':'India','pune':'India','chennai':'India','kolkata':'India','noida':'India','gurugram':'India','gurgaon':'India','ahmedabad':'India','jaipur':'India','kochi':'India','chandigarh':'India','indore':'India','lucknow':'India','coimbatore':'India','thiruvananthapuram':'India',
  'bangkok':'Thailand','chiang mai':'Thailand','phuket':'Thailand',
  'jakarta':'Indonesia','bali':'Indonesia','surabaya':'Indonesia','bandung':'Indonesia',
  'kuala lumpur':'Malaysia','penang':'Malaysia','johor bahru':'Malaysia',
  'manila':'Philippines','cebu':'Philippines','makati':'Philippines','taguig':'Philippines','quezon city':'Philippines','davao':'Philippines',
  'ho chi minh city':'Vietnam','hanoi':'Vietnam','ho chi minh':'Vietnam','saigon':'Vietnam',
  'phnom penh':'Cambodia',
  // Middle East
  'dubai':'United Arab Emirates','abu dhabi':'United Arab Emirates',
  'tel aviv':'Israel','jerusalem':'Israel','haifa':'Israel','herzliya':'Israel','ramat gan':'Israel',
  'riyadh':'Saudi Arabia','jeddah':'Saudi Arabia',
  'doha':'Qatar','manama':'Bahrain','muscat':'Oman','kuwait city':'Kuwait','amman':'Jordan',
  'istanbul':'Turkey','ankara':'Turkey','izmir':'Turkey',
  // Oceania
  'sydney':'Australia','melbourne':'Australia','brisbane':'Australia','perth':'Australia','adelaide':'Australia','canberra':'Australia','gold coast':'Australia',
  'auckland':'New Zealand','wellington':'New Zealand','christchurch':'New Zealand',
  // Americas
  'toronto':'Canada','vancouver':'Canada','montreal':'Canada','ottawa':'Canada','calgary':'Canada','edmonton':'Canada','winnipeg':'Canada','quebec city':'Canada','halifax':'Canada','victoria':'Canada','waterloo':'Canada','kitchener':'Canada',
  'mexico city':'Mexico','guadalajara':'Mexico','monterrey':'Mexico',
  'são paulo':'Brazil','sao paulo':'Brazil','rio de janeiro':'Brazil','belo horizonte':'Brazil','curitiba':'Brazil','brasilia':'Brazil','florianopolis':'Brazil','recife':'Brazil','porto alegre':'Brazil',
  'buenos aires':'Argentina','cordoba':'Argentina',
  'bogota':'Colombia','medellin':'Colombia','bogotá':'Colombia','medellín':'Colombia',
  'santiago':'Chile','lima':'Peru',
  'panama city':'Panama','san jose':'Costa Rica',
  // Africa
  'lagos':'Nigeria','abuja':'Nigeria','nairobi':'Kenya','cape town':'South Africa','johannesburg':'South Africa','cairo':'Egypt','accra':'Ghana','dar es salaam':'Tanzania','kampala':'Uganda','addis ababa':'Ethiopia','kigali':'Rwanda','casablanca':'Morocco','tunis':'Tunisia','luanda':'Angola','maputo':'Mozambique','dakar':'Senegal',
};

const COUNTRY_CODES_2 = {
  'us':'United States','uk':'United Kingdom','gb':'United Kingdom','ca':'Canada','au':'Australia','nz':'New Zealand','de':'Germany','fr':'France','nl':'Netherlands','be':'Belgium','ch':'Switzerland','at':'Austria','ie':'Ireland','es':'Spain','it':'Italy','pt':'Portugal','se':'Sweden','no':'Norway','dk':'Denmark','fi':'Finland','pl':'Poland','cz':'Czech Republic','hu':'Hungary','ro':'Romania','bg':'Bulgaria','hr':'Croatia','gr':'Greece','ee':'Estonia','lv':'Latvia','lt':'Lithuania','sk':'Slovakia','si':'Slovenia','lu':'Luxembourg','ua':'Ukraine','ru':'Russia','tr':'Turkey','il':'Israel','ae':'United Arab Emirates','sa':'Saudi Arabia','qa':'Qatar','bh':'Bahrain','kw':'Kuwait','om':'Oman','jo':'Jordan','sg':'Singapore','jp':'Japan','kr':'South Korea','cn':'China','hk':'Hong Kong','tw':'Taiwan','in':'India','th':'Thailand','id':'Indonesia','my':'Malaysia','ph':'Philippines','vn':'Vietnam','kh':'Cambodia','bd':'Bangladesh','pk':'Pakistan','lk':'Sri Lanka','np':'Nepal','mm':'Myanmar','br':'Brazil','ar':'Argentina','co':'Colombia','cl':'Chile','mx':'Mexico','pe':'Peru','ec':'Ecuador','uy':'Uruguay','ve':'Venezuela','ng':'Nigeria','ke':'Kenya','za':'South Africa','eg':'Egypt','gh':'Ghana','tz':'Tanzania','ug':'Uganda','et':'Ethiopia','rw':'Rwanda','ma':'Morocco','tn':'Tunisia','ao':'Angola','mz':'Mozambique','sn':'Senegal','cm':'Cameroon','ci':'Ivory Coast',
};

const COUNTRY_NAMES = new Set([
  'united states','united states of america','usa','u.s.','u.s.a.','us','america',
  'united kingdom','uk','great britain','england','scotland','wales',
  'canada','australia','new zealand','germany','france','netherlands','holland','belgium','switzerland','austria','ireland','spain','italy','portugal','sweden','norway','denmark','finland','poland','czech republic','czechia','hungary','romania','bulgaria','croatia','greece','estonia','latvia','lithuania','slovakia','slovenia','luxembourg','ukraine','russia','turkey','türkiye',
  'israel','united arab emirates','uae','saudi arabia','qatar','bahrain','kuwait','oman','jordan','lebanon','iraq','iran',
  'singapore','japan','south korea','korea','china','hong kong','taiwan','india','thailand','indonesia','malaysia','philippines','vietnam','cambodia','myanmar','bangladesh','pakistan','sri lanka','nepal',
  'brazil','argentina','colombia','chile','mexico','peru','ecuador','uruguay','venezuela','costa rica','panama','dominican republic','guatemala','puerto rico',
  'nigeria','kenya','south africa','egypt','ghana','tanzania','uganda','ethiopia','rwanda','morocco','tunisia','angola','mozambique','senegal','cameroon','ivory coast',
  'global','worldwide','remote','anywhere','distributed','emea','apac','latam','mena',
]);

const COUNTRY_NAME_MAP = {
  'united states':'United States','united states of america':'United States','usa':'United States','u.s.':'United States','u.s.a.':'United States','us':'United States','america':'United States',
  'united kingdom':'United Kingdom','uk':'United Kingdom','great britain':'United Kingdom','england':'United Kingdom','scotland':'United Kingdom','wales':'United Kingdom',
  'holland':'Netherlands','czechia':'Czech Republic','türkiye':'Turkey','korea':'South Korea','uae':'United Arab Emirates',
  'global':'Remote/Global','worldwide':'Remote/Global','remote':'Remote/Global','anywhere':'Remote/Global','distributed':'Remote/Global',
  'emea':'EMEA','apac':'APAC','latam':'LATAM','mena':'MENA',
  'puerto rico':'United States',
};

export function normalize(raw) {
  if (!raw || raw === '-') return null;
  let s = raw.trim();
  
  // Remove common prefixes/suffixes
  s = s.replace(/^(US-|UK-|CA-|AU-)/i, '');
  s = s.replace(/\s*(office|headquarters|hq|location|based)$/i, '');
  s = s.replace(/^\(|\)$/g, '');
  s = s.replace(/\s*\(.*?\)\s*/g, ' ');
  s = s.trim();
  
  const lower = s.toLowerCase().trim();
  
  // Check if it's "Remote" variants
  if (/^remote/i.test(lower) || /anywhere|worldwide|global|distributed|fully remote|work from home|wfh/i.test(lower)) {
    // Check if remote with a country hint
    const remoteUS = /remote.*\b(us|usa|united states|america)\b/i.test(raw);
    const remoteUK = /remote.*\b(uk|united kingdom|gb|england)\b/i.test(raw);
    const remoteCA = /remote.*\b(canada|ca)\b/i.test(raw);
    const remoteIN = /remote.*\b(india|in)\b/i.test(raw);
    const remoteSG = /remote.*\b(singapore|sg)\b/i.test(raw);
    const remoteDE = /remote.*\b(germany|de)\b/i.test(raw);
    const remoteEU = /remote.*\b(europe|eu|emea)\b/i.test(raw);
    if (remoteUS) return 'United States';
    if (remoteUK) return 'United Kingdom';
    if (remoteCA) return 'Canada';
    if (remoteIN) return 'India';
    if (remoteSG) return 'Singapore';
    if (remoteDE) return 'Germany';
    if (remoteEU) return 'Remote/Global';
    return 'Remote/Global';
  }
  
  // Check "Unknown"
  if (lower === 'unknown' || lower === 'n/a' || lower === 'not specified' || lower === 'other' || lower === 'various' || lower === 'multiple' || lower === 'hybrid') return 'Unknown';
  if (lower === 'asia' || lower === 'asia pacific' || lower === 'asia-pacific') return 'APAC';
  if (lower === 'europe' || lower === 'eu' || lower === 'european union') return 'Europe';
  if (lower === 'emea') return 'EMEA';
  if (lower === 'latam' || lower === 'latin america' || lower === 'south america') return 'LATAM';
  if (lower === 'mena' || lower === 'middle east') return 'MENA';
  if (lower === 'africa') return 'Africa';
  
  // Direct country name match
  if (COUNTRY_NAMES.has(lower)) {
    return COUNTRY_NAME_MAP[lower] || s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  
  // Split by comma or slash and check parts (not dash - it's in city names)
  const parts = s.split(/[,\/]/).map(p => p.trim()).filter(p => p.length > 0);
  if (parts.length === 0) return 'Other';
  
  // Check last part first (often the country)
  for (let i = parts.length - 1; i >= 0; i--) {
    const pl = parts[i].toLowerCase().trim();
    
    // Country code (2-letter)
    if (pl.length === 2 && COUNTRY_CODES_2[pl]) return COUNTRY_CODES_2[pl];
    
    // US state abbreviation
    if (pl.length === 2 && US_STATES.has(pl.toUpperCase())) return 'United States';
    
    // Full US state name
    if (US_STATE_FULL[pl]) return 'United States';
    
    // Country name
    if (COUNTRY_NAMES.has(pl)) return COUNTRY_NAME_MAP[pl] || pl.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  
  // Check first part as city
  const cityKey = parts[0].toLowerCase().trim();
  if (CITY_TO_COUNTRY[cityKey]) return CITY_TO_COUNTRY[cityKey];
  
  // Check full lower string as city
  if (CITY_TO_COUNTRY[lower]) return CITY_TO_COUNTRY[lower];
  
  // Handle "City, STATE" pattern for US
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].trim().toUpperCase();
    if (lastPart.length === 2 && US_STATES.has(lastPart)) return 'United States';
    // "City, California" etc
    if (US_STATE_FULL[parts[parts.length-1].toLowerCase().trim()]) return 'United States';
  }
  
  // Handle "US-XX-City" pattern
  if (/^US-[A-Z]{2}/i.test(raw)) return 'United States';
  
  // Handle "XX - CityName" with country code
  const codeMatch = lower.match(/^([a-z]{2})\s*[-–]\s*/);
  if (codeMatch && COUNTRY_CODES_2[codeMatch[1]]) return COUNTRY_CODES_2[codeMatch[1]];
  
  // Check if any part contains a known city
  for (const part of parts) {
    const pk = part.toLowerCase().trim();
    if (CITY_TO_COUNTRY[pk]) return CITY_TO_COUNTRY[pk];
  }
  
  // Last resort: check if any word in the string is a known country
  const words = lower.split(/\s+/);
  for (const w of words) {
    if (COUNTRY_NAMES.has(w) && w.length > 2) return COUNTRY_NAME_MAP[w] || w.charAt(0).toUpperCase() + w.slice(1);
  }
  
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
    const country = normalize(raw);
    if (country) {
      countries[country] = (countries[country]||0)+1;
    }
    if (country === 'Other') {
      unmapped[raw] = (unmapped[raw]||0)+1;
    }
    ln++;
  }
  
  console.log(`\n${label}: ${total} jobs with locations → ${Object.keys(countries).length} countries`);
  const unmappedCount = Object.values(unmapped).reduce((a,b)=>a+b, 0);
  console.log(`  Unmapped ("Other"): ${unmappedCount} jobs across ${Object.keys(unmapped).length} unique strings`);
  
  // Show top unmapped for debugging
  const topUnmapped = Object.entries(unmapped).sort((a,b)=>b[1]-a[1]).slice(0, 20);
  if (topUnmapped.length) {
    console.log('  Top unmapped:');
    topUnmapped.forEach(([k,v]) => console.log(`    ${v.toString().padStart(5)}  "${k}"`));
  }
  
  return { countries, total };
}

async function main() {
  const cvin = await processFile('/Users/vedang/Documents/cvinbio-jobs-extracted.csv', 4, 'CVin.bio');
  const web3 = await processFile('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', 7, 'Web3 Jobs');
  
  // Merge and sort
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
  
  fs.writeFileSync('/Users/vedang/Documents/locations-by-country.csv', rows.join('\n'));
  console.log(`\n✅ Written /Users/vedang/Documents/locations-by-country.csv (${merged.length} countries)`);
  
  // Also save merged data for Excel rebuild
  fs.writeFileSync('/Users/vedang/web3jobs/Web3-Jobs/scripts/_country_data.json', JSON.stringify({ cvin: cvin.countries, web3: web3.countries, cvinTotal: cvin.total, web3Total: web3.total }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
