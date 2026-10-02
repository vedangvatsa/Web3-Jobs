import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { getNomadCities, getNomadSummaries, getPassportCountries } from '../src/lib/nomads/server';
import type { EntryRule, PassportRules } from '../src/lib/nomads/types';

const output = path.resolve('public/data/nomads');
function write(relative: string, value: unknown) { const filename = path.join(output, relative); fs.mkdirSync(path.dirname(filename), { recursive: true }); fs.writeFileSync(filename, JSON.stringify(value)); }
write('cities.json', getNomadSummaries());
for (const city of getNomadCities()) write(`cities/${city.slug}.json`, city);
write('places.json', JSON.parse(fs.readFileSync('content/nomads/places.json', 'utf8')));
const countries = getPassportCountries();
const countryByName = new Map(countries.map(country => [country.name, country]));
const rules = JSON.parse(fs.readFileSync('content/nomads/passport-rules.json', 'utf8')) as Record<string, Record<string, EntryRule>>;
write('passports.json', countries.filter(country => rules[country.name]));
for (const [passport, destinations] of Object.entries(rules)) {
  const country = countryByName.get(passport);
  if (!country) throw new Error(`Missing passport country: ${passport}`);
  const data: PassportRules = { passport, destinations: Object.entries(destinations).map(([name, rule]) => ({ name, iso: countryByName.get(name)?.iso || null, rule })) };
  write(`passports/${country.id}.json`, data);
}
console.log(`Nomad catalogs: ${getNomadCities().length} city details, ${Object.keys(rules).length} passport shards, compact places.`);

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
