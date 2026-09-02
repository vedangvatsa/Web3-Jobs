import { readFileSync } from 'fs';

const p = JSON.parse(readFileSync('./jobs-extract-progress.json', 'utf8'));
const vals = Object.values(p);
console.log('Total jobs:', vals.length);

// Department distribution
const depts = {};
vals.forEach(v => { if(v.department) depts[v.department] = (depts[v.department]||0)+1; });
const totalWithDept = Object.values(depts).reduce((a,b)=>a+b,0);
console.log('\n=== DEPARTMENTS ===');
Object.entries(depts).sort((a,b)=>b[1]-a[1]).slice(0,15).forEach(([d,n])=>console.log(((n/totalWithDept)*100).toFixed(1)+'%  '+d+' ('+n+')'));

// Experience levels
console.log('\n=== EXPERIENCE LEVELS ===');
const levels = {};
vals.forEach(v => { if(v.experience_level) levels[v.experience_level] = (levels[v.experience_level]||0)+1; });
const totalLvl = Object.values(levels).reduce((a,b)=>a+b,0);
Object.entries(levels).sort((a,b)=>b[1]-a[1]).forEach(([l,n])=>console.log(((n/totalLvl)*100).toFixed(1)+'%  '+l+' ('+n+')'));

// Employment type
console.log('\n=== EMPLOYMENT TYPE ===');
const types = {};
vals.forEach(v => { if(v.employment_type) types[v.employment_type] = (types[v.employment_type]||0)+1; });
Object.entries(types).sort((a,b)=>b[1]-a[1]).forEach(([t,n])=>console.log(t+': '+n+' ('+ ((n/vals.length)*100).toFixed(1) +'%)'));

// Crypto focus
console.log('\n=== CRYPTO FOCUS ===');
const focus = {};
vals.forEach(v => { if(v.crypto_focus) focus[v.crypto_focus] = (focus[v.crypto_focus]||0)+1; });
Object.entries(focus).sort((a,b)=>b[1]-a[1]).slice(0,15).forEach(([f,n])=>console.log(((n/vals.length)*100).toFixed(1)+'%  '+f+' ('+n+')'));

// Top skills (normalized)
console.log('\n=== TOP 30 SKILLS (normalized) ===');
const skills = {};
vals.forEach(v => {
  if(v.skills) v.skills.split('; ').forEach(s => {
    const norm = s.trim().toLowerCase();
    if(norm && norm.length > 1) skills[norm] = (skills[norm]||0)+1;
  });
});
Object.entries(skills).sort((a,b)=>b[1]-a[1]).slice(0,30).forEach(([s,n])=>console.log(((n/vals.length)*100).toFixed(1)+'%  '+s+' ('+n+')'));

// Location distribution
console.log('\n=== LOCATION DISTRIBUTION ===');
const locs = {};
vals.forEach(v => {
  if(v.location) {
    const loc = v.location.toLowerCase();
    if(loc.includes('remote')) locs['Remote'] = (locs['Remote']||0)+1;
    else if(loc.includes('singapore')) locs['Singapore'] = (locs['Singapore']||0)+1;
    else if(loc.includes('london') || loc.includes('uk') || loc.includes('united kingdom') || loc.includes('england')) locs['UK'] = (locs['UK']||0)+1;
    else if(loc.includes('hong kong')) locs['Hong Kong'] = (locs['Hong Kong']||0)+1;
    else if(loc.includes('india') || loc.includes('mumbai') || loc.includes('bangalore') || loc.includes('delhi') || loc.includes('gurugram') || loc.includes('hyderabad')) locs['India'] = (locs['India']||0)+1;
    else if(loc.includes('japan') || loc.includes('tokyo')) locs['Japan'] = (locs['Japan']||0)+1;
    else if(loc.includes('dubai') || loc.includes('uae') || loc.includes('abu dhabi')) locs['UAE'] = (locs['UAE']||0)+1;
    else if(loc.includes('new york') || loc.includes('san francisco') || loc.includes('usa') || loc.includes('united states') || loc.includes('california') || loc.includes('chicago') || loc.includes('seattle') || loc.includes('boston') || loc.includes('austin') || loc.includes('miami')) locs['USA'] = (locs['USA']||0)+1;
    else if(loc.includes('europe') || loc.includes('germany') || loc.includes('france') || loc.includes('netherlands') || loc.includes('spain') || loc.includes('portugal') || loc.includes('austria') || loc.includes('switzerland') || loc.includes('berlin') || loc.includes('amsterdam') || loc.includes('paris') || loc.includes('lisbon') || loc.includes('vienna')) locs['Europe'] = (locs['Europe']||0)+1;
    else if(loc.includes('brazil') || loc.includes('mexico') || loc.includes('latam') || loc.includes('argentina') || loc.includes('colombia') || loc.includes('latin america')) locs['LATAM'] = (locs['LATAM']||0)+1;
    else if(loc.includes('nigeria') || loc.includes('africa') || loc.includes('kenya') || loc.includes('senegal') || loc.includes('south africa') || loc.includes('ghana') || loc.includes('tanzania') || loc.includes('uganda') || loc.includes('ivory coast') || loc.includes('mali')) locs['Africa'] = (locs['Africa']||0)+1;
    else locs['Other'] = (locs['Other']||0)+1;
  }
});
Object.entries(locs).sort((a,b)=>b[1]-a[1]).forEach(([l,n])=>console.log(((n/vals.length)*100).toFixed(1)+'%  '+l+' ('+n+')'));

// Compensation stats
console.log('\n=== COMPENSATION STATS ===');
const comps = vals.filter(v => v.compensation && v.compensation.match(/\$[\d,]+/));
console.log('Jobs with explicit salary:', comps.length);
const salaries = comps.map(v => {
  const match = v.compensation.match(/\$([\d,]+)/);
  return match ? parseInt(match[1].replace(/,/g,'')) : 0;
}).filter(s => s > 10000 && s < 500000);
if(salaries.length > 0) {
  salaries.sort((a,b)=>a-b);
  console.log('Median:', '$' + salaries[Math.floor(salaries.length/2)].toLocaleString());
  console.log('P25:', '$' + salaries[Math.floor(salaries.length*0.25)].toLocaleString());
  console.log('P75:', '$' + salaries[Math.floor(salaries.length*0.75)].toLocaleString());
  console.log('Min:', '$' + salaries[0].toLocaleString());
  console.log('Max:', '$' + salaries[salaries.length-1].toLocaleString());
}

// Salary by department
console.log('\n=== MEDIAN SALARY BY DEPARTMENT ===');
const deptSalaries = {};
comps.forEach(v => {
  if(!v.department) return;
  const match = v.compensation.match(/\$([\d,]+)/);
  if(!match) return;
  const sal = parseInt(match[1].replace(/,/g,''));
  if(sal < 10000 || sal > 500000) return;
  if(!deptSalaries[v.department]) deptSalaries[v.department] = [];
  deptSalaries[v.department].push(sal);
});
Object.entries(deptSalaries)
  .filter(([,arr])=>arr.length >= 3)
  .map(([dept,arr])=>{
    arr.sort((a,b)=>a-b);
    return [dept, arr[Math.floor(arr.length/2)], arr.length];
  })
  .sort((a,b)=>b[1]-a[1])
  .forEach(([dept,med,n])=>console.log('$'+med.toLocaleString()+'  '+dept+' (n='+n+')'));

// Top companies
console.log('\n=== TOP 20 COMPANIES ===');
const cos = {};
vals.forEach(v => { if(v.company_name) cos[v.company_name] = (cos[v.company_name]||0)+1; });
Object.entries(cos).sort((a,b)=>b[1]-a[1]).slice(0,20).forEach(([c,n])=>console.log(n+' '+c));

// Unique companies
console.log('\nTotal unique companies:', Object.keys(cos).length);
