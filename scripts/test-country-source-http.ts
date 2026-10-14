import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPublicAddress, publicCountryUrl, countryGet } from './lib/country-source-http';

test('public GET rejects internal URL forms before any network request, including normalized IPv4 encodings',async()=>{
  for(const url of ['http://example.com/', 'https://user:password@example.com/', 'https://127.0.0.1/', 'https://2130706433/', 'https://0x7f000001/', 'https://[::1]/', 'https://metadata.google.internal/', 'https://service.local/', 'https://localhost/', 'https://example.com:8443/']) {
    assert.throws(()=>publicCountryUrl(url));
    await assert.rejects(countryGet(url));
  }
  assert.equal(publicCountryUrl('https://jobs.ashbyhq.com/Arrakis').hostname,'jobs.ashbyhq.com');
});
test('resolved private destinations cannot bypass URL checks through public-looking DNS names',()=>{
  for(const ip of ['0.0.0.0','10.1.2.3','127.0.0.1','169.254.169.254','172.16.0.1','172.31.255.255','192.168.1.1','192.0.0.1','100.64.0.1','198.18.0.1','224.0.0.1','255.255.255.255','::1'])assert.throws(()=>assertPublicAddress(ip));
  for(const ip of ['1.1.1.1','8.8.8.8','172.32.0.1','192.0.78.13'])assert.doesNotThrow(()=>assertPublicAddress(ip));
});
