import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import countries from '../content/nomads/countries.json';
import { parsePassportIndexHtml, validatePassportIndexSnapshot, type PassportIndexSnapshot } from './lib/passport-index';

const { values } = parseArgs({ options: { html: { type: 'string' }, 'html-dir': { type: 'string' }, 'fetched-at': { type: 'string' }, 'user-agent': { type: 'string' }, passport: { type: 'string' }, all: { type: 'boolean' }, write: { type: 'boolean' } } });
const codes = countries.map(country => country.iso!);
const cache = path.resolve('.cache/nomads/passport-index');
const output = path.resolve('content/nomads/passport-index.json');

async function main() {
  assert.ok(!(values.html && values['html-dir']), 'Choose --html or --html-dir');
  assert.ok(!(values.all && values.passport), 'Choose --all or --passport');
  const local = values.html || values['html-dir'];
  if (local) assert.ok(values['fetched-at'] && Number.isFinite(Date.parse(values['fetched-at'])), 'Saved HTML requires its actual --fetched-at timestamp');
  const incoming: PassportIndexSnapshot = { version: 1, passports: {} };
  let directory: Record<string, string> = {};
  const ingest = (html: string, fetchedAt: string, expected?: string) => {
    const parsed = parsePassportIndexHtml(html, codes, fetchedAt, expected);
    assert.ok(!incoming.passports[parsed.passport], `Duplicate passport ${parsed.passport}`);
    incoming.passports[parsed.passport] = parsed.page;
    if (Object.keys(parsed.directory).length) directory = parsed.directory;
    fs.mkdirSync(cache, { recursive: true });
    fs.writeFileSync(path.join(cache, `${parsed.passport}.html`), html);
  };
  if (values.html) ingest(fs.readFileSync(values.html, 'utf8'), values['fetched-at']!, values.passport?.toUpperCase());
  else if (values['html-dir']) {
    const files = fs.readdirSync(values['html-dir']).filter(file => file.endsWith('.html'));
    assert.ok(files.length, 'No saved HTML pages found');
    for (const file of files) ingest(fs.readFileSync(path.join(values['html-dir'], file), 'utf8'), values['fetched-at']!);
  } else {
    const selected = values.passport?.toUpperCase();
    assert.ok(values.all || selected, 'Specify --passport CODE, --all, or saved HTML');
    assert.ok(!selected || codes.includes(selected), 'Unknown passport code');
    const seedPath = path.join(cache, 'IN.html');
    if (fs.existsSync(seedPath)) directory = parsePassportIndexHtml(fs.readFileSync(seedPath, 'utf8'), codes, new Date().toISOString(), 'IN').directory;
    const fetchPage = async (iso: string, url: string) => {
      const response = await fetch(url, { headers: { 'User-Agent': values['user-agent'] || 'HashtagWeb3-PassportReference/1.0', Accept: 'text/html', 'Accept-Language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(45000) });
      if (!response.ok || response.headers.get('cf-mitigated') === 'challenge') throw new Error(`Passport Index returned ${response.status} for ${iso}; import authorised saved HTML or an export. Existing data was not replaced.`);
      ingest(await response.text(), new Date().toISOString(), iso);
      console.log(`Fetched ${iso}: ${codes.length - 1} destinations`);
    };
    if (!Object.keys(directory).length) await fetchPage('IN', 'https://www.passportindex.org/passport/india/');
    assert.equal(Object.keys(directory).length, codes.length, 'Incomplete passport directory');
    for (const iso of values.all ? codes : [selected!]) {
      if (incoming.passports[iso]) continue;
      await delay(5000);
      await fetchPage(iso, directory[iso]);
    }
    if (!values.all && selected !== 'IN') delete incoming.passports.IN;
  }
  if (values.all) assert.equal(Object.keys(incoming.passports).length, codes.length, '--all requires every passport; refusing partial replacement');
  assert.ok(Object.keys(incoming.passports).length, 'No complete pages imported');
  const existing = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) as PassportIndexSnapshot : { version: 1, passports: {} };
  assert.equal(existing.version, 1);
  const next: PassportIndexSnapshot = { version: 1, passports: { ...existing.passports, ...incoming.passports } };
  validatePassportIndexSnapshot(next, codes);
  fs.mkdirSync(cache, { recursive: true });
  fs.writeFileSync(path.join(cache, 'candidate.json'), `${JSON.stringify(next)}\n`);
  if (values.write) {
    fs.writeFileSync(`${output}.tmp`, `${JSON.stringify(next)}\n`);
    fs.renameSync(`${output}.tmp`, output);
  }
  console.log(JSON.stringify({ mode: values.write ? 'write' : 'review', importedPassports: Object.keys(incoming.passports), passportCount: Object.keys(next.passports).length, routeCount: Object.values(next.passports).reduce((count, page) => count + Object.keys(page.rules).length, 0), officialOverrides: 'Applied separately during catalog generation' }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
