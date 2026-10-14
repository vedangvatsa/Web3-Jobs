import assert from 'node:assert/strict';

export function parseCsv(input:string):Record<string,string>[] {
  const rows:string[][]=[];let row:string[]=[],field='',quoted=false;
  for(let i=0;i<input.length;i++){
    const c=input[i];
    if(c==='"'){if(quoted&&input[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
    else if(!quoted&&(c===','||c==='\n')){row.push(field.replace(/\r$/,''));field='';if(c==='\n'){rows.push(row);row=[];}}
    else field+=c;
  }
  assert.ok(!quoted,'Unterminated quoted CSV field');
  if(field||row.length){row.push(field);rows.push(row);}
  const header=rows.shift();assert.ok(header?.length,'Missing CSV header');assert.equal(new Set(header).size,header.length);
  return rows.filter(r=>r.some(Boolean)).map(r=>{assert.equal(r.length,header.length,'CSV column mismatch');return Object.fromEntries(header.map((h,i)=>[h,r[i]]));});
}
