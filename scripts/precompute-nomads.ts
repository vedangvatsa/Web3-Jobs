import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { getNomadCities, getNomadSummaries, getPassportCountries } from '../src/lib/nomads/server';
import { compilePassportRules } from './lib/passport-policies';
import policies from '../content/nomads/entry-policies.json';
import { validatePassportIndexSnapshot, type PassportIndexSnapshot } from './lib/passport-index';
import { validateFactchecks, factcheckCounts, type Factchecks } from './lib/passport-factchecks';

const output = path.resolve('public/data/nomads');
function write(relative: string, value: unknown) { const filename = path.join(output, relative); fs.mkdirSync(path.dirname(filename), { recursive: true }); fs.writeFileSync(filename, JSON.stringify(value)); }
write('cities.json', getNomadSummaries());
for (const city of getNomadCities()) write(`cities/${city.slug}.json`, city);
write('places.json', JSON.parse(fs.readFileSync('content/nomads/places.json', 'utf8')));
const countries = getPassportCountries();
const reference = JSON.parse(fs.readFileSync('content/nomads/passport-index.json', 'utf8')) as PassportIndexSnapshot;
validatePassportIndexSnapshot(reference, countries.map(country => country.iso!));
write('passports.json', countries);
const audit = JSON.parse(fs.readFileSync('content/nomads/entry-factchecks.json', 'utf8')) as Factchecks;
validateFactchecks(audit, countries.map(country => country.iso!));
for (const country of countries) write(`passports/${country.id}.json`, compilePassportRules(country, countries, policies, undefined, reference, audit));
console.log(`Nomad catalogs: ${getNomadCities().length} city details, ${countries.length} audited passport shards, compact places.`, factcheckCounts(audit));

async function cityThumbnails() {
  let written = 0;
  for (const city of getNomadCities()) {
    if (!city.thumbnail) continue;
    const source = path.resolve(`public${city.thumbnail}`);
    const target = source.replace(/-480\.webp$/, '-128.webp');
    if (target === source) throw new Error(`Unexpected thumbnail path: ${city.thumbnail}`);
    if (fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs) continue;
    await sharp(source).resize(128, 96, { fit: 'cover' }).webp({ quality: 76 }).toFile(target);
    written++;
  }
  console.log(`City table thumbnails: ${written} written.`);
}
cityThumbnails().catch(error => { console.error(error); process.exitCode = 1; });
