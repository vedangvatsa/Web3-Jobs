import { readFileSync } from 'fs';
const p = JSON.parse(readFileSync('./jobs-extract-progress.json', 'utf8'));
const v = Object.values(p);
console.log('Total analyzed:', v.length);
const remote = v.filter(j => j.location && j.location.toLowerCase().includes('remote')).length;
console.log('Remote:', remote, '(' + (remote / v.length * 100).toFixed(1) + '%)');
console.log('With location:', v.filter(j => j.location).length);
console.log('With skills:', v.filter(j => j.skills).length);
const withComp = v.filter(j => j.compensation && j.compensation.match(/\$[\d,]+/));
console.log('With compensation:', withComp.length);

// Check report for emdashes and slop
const report = readFileSync('./src/app/web3-hiring-report/page.tsx', 'utf8');
const emdashes = (report.match(/—/g) || []).length;
console.log('\nEmdashes in report:', emdashes);
const slop = ['robust', 'leverage', 'utilize', 'foster', 'realm', 'tapestry', 'delve', 'crucial', 'landscape', 'paradigm', 'ecosystem'];
slop.forEach(w => {
  const count = (report.toLowerCase().match(new RegExp(w, 'g')) || []).length;
  if (count > 0) console.log('SLOP:', w, count);
});
