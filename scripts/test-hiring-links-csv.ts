import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCsv } from './lib/hiring-links-csv';

test('quoted commas, escaped quotation marks, CRLF, empty counts and embedded newlines preserve columns',()=>{
  assert.deepEqual(parseCsv('company,evidence,count\r\n"Employer, Inc.","Says ""crypto"",\nnot vacancies",\r\n'),[{company:'Employer, Inc.',evidence:'Says "crypto",\nnot vacancies',count:''}]);
});
test('missing final newline and blank trailing records do not lose or create employers',()=>{
  assert.deepEqual(parseCsv('company,url\na,https://a.invalid'),[{company:'a',url:'https://a.invalid'}]);
  assert.equal(parseCsv('company,url\na,b\n\n').length,1);
});
test('malformed records and duplicate headers fail rather than shift employer identity fields',()=>{
  assert.throws(()=>parseCsv('company,url\na,b,c'),/column mismatch/);
  assert.throws(()=>parseCsv('company,url\n"a,b'),/Unterminated/);
  assert.throws(()=>parseCsv('company,company\na,b'));
});
