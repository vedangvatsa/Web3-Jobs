import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import sharp from 'sharp';
import { CITY_TIMEZONES } from '../src/lib/nomads/timezones';
import { safeExternalUrl, type NomadCity, type ServiceCategory, type TaxReference, type VisaProgram, type CompactPlaces } from '../src/lib/nomads/types';
import { visaData } from '../src/lib/visas';

const root = process.argv.find(arg => arg.startsWith('--from='))?.slice(7);
if (!root) throw new Error('Provide --from=/path/to/PDFtoWebsite');
const sourceRoot = path.resolve(root);
const output = path.resolve('content/nomads');
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const readJson = (file: string) => JSON.parse(fs.readFileSync(path.join(sourceRoot, file), 'utf8'));
const write = (file: string, value: unknown) => fs.writeFileSync(path.join(output, file), `${JSON.stringify(value)}\n`);

function literal(node: ts.Expression): unknown {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) return -Number(literal(node.operand));
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(value => literal(value as ts.Expression));
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.flatMap(property => {
    if (!ts.isPropertyAssignment(property)) throw new Error('Unsupported data property');
    const key = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : property.name.getText();
    return key === 'icon' ? [] : [[key, literal(property.initializer)]];
  }));
  throw new Error(`Expected literal data, got ${ts.SyntaxKind[node.kind]}`);
}

function readConstant<T>(file: string, name: string): T {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(sourceRoot, file), 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  let result: unknown;
  function visit(node: ts.Node) { if (ts.isVariableDeclaration(node) && node.name.getText(source) === name && node.initializer) result = literal(node.initializer); else ts.forEachChild(node, visit); }
  visit(source);
  if (result === undefined) throw new Error(`Missing ${name} in ${file}`);
  return result as T;
}

function imageBytes(url: string, redirects = 0): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { family: 4 }, response => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirects < 3) { response.resume(); imageBytes(new URL(response.headers.location, url).toString(), redirects + 1).then(resolve, reject); return; }
      if (response.statusCode !== 200) { response.resume(); reject(new Error(`HTTP ${response.statusCode}`)); return; }
      const chunks: Buffer[] = []; let size = 0;
      response.on('data', chunk => { size += chunk.length; if (size > 12 * 1024 * 1024) request.destroy(new Error('Image too large')); else chunks.push(chunk); });
      response.on('end', () => resolve(Buffer.concat(chunks))); response.on('error', reject);
    });
    request.setTimeout(15000, () => request.destroy(new Error('Image timeout'))); request.on('error', reject);
  });
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const cities = readJson('src/lib/nomad-cities.json') as Array<NomadCity & { nomad_score: number }>;
  const images = readConstant<Record<string, string>>('src/lib/utils.ts', 'CITY_IMAGES');
  const safety = readConstant<Record<string, number>>('src/lib/nomad-rankings-data.ts', 'SAFETY');
  const walkability = Object.fromEntries(Object.entries(readConstant<Record<string, NonNullable<NomadCity['walkability']>>>('src/lib/nomad-rankings-data.ts', 'WALKABILITY')).map(([key, value]) => [slugify(key), value]));
  const communities = readJson('src/lib/nomad-communities.json') as Record<string, NomadCity['communities']>;
  const unknownTimezones = cities.filter(city => !CITY_TIMEZONES[city.slug]).map(city => `${city.slug} (${city.countryCode})`);
  if (unknownTimezones.length) throw new Error(`Supply IANA zones before import: ${unknownTimezones.join(', ')}`);
  const cityByName = new Map(cities.flatMap(city => [[slugify(city.name), city.slug], [city.slug, city.slug]]));
  const aliases: Record<string, string> = { 'bali-canggu-ubud': 'bali', 'bali-cangguubud': 'bali', canggu: 'bali', 'gran-canaria-las-palmas': 'las-palmas', 'madeira-funchal': 'madeira-funchal', 'florianopolis-2': 'florianopolis' };
  const compactSource = readJson('public/nomad-data-v2.json') as { c: string[]; d: CompactPlaces['rows'] };
  const compact: CompactPlaces = { cities: compactSource.c.map(value => {
    const cityName = value.split('|')[0], slug = slugify(cityName);
    const match = aliases[slug] || cityByName.get(slug);
    if (!match) throw new Error(`Unmapped place city: ${value}`);
    return match;
  }), rows: compactSource.d.map(row => [String(row[0]), row[1], row[2], row[3], row[4], row[5], safeExternalUrl(row[6]) || '', row[7] || 0, row[8] || 0, row[9] || 0, row[10] || '']) };
  const categories = ['coliving', 'hostel', 'apartment', 'guesthouse', 'coworking'] as const;
  const normalized: NomadCity[] = cities.map(city => {
    const spaces = { coliving: 0, hostel: 0, apartment: 0, guesthouse: 0, coworking: 0, total: 0 };
    for (const row of compact.rows) if (compact.cities[row[5]] === city.slug) { spaces[categories[row[2]]]++; spaces.total++; }
    return { slug: city.slug, name: city.name, country: city.country, countryCode: city.countryCode, continent: city.continent, lat: city.lat, lon: city.lon, timezone: CITY_TIMEZONES[city.slug], emoji: city.emoji, cost: city.cost, weather: city.weather, internet: city.internet || null, spaces, score: city.nomad_score ?? null, safety: safety[city.slug] ?? null, walkability: walkability[city.slug] ?? null, nearby: city.nearby.filter(slug => cities.some(candidate => candidate.slug === slug)), communities: (communities[city.slug] || []).filter(link => safeExternalUrl(link.url)).map(link => ({ ...link, url: safeExternalUrl(link.url)! })), image: null, thumbnail: null };
  });
  const sourceVisaPrograms = readConstant<Array<{ country: string; continent: string; minIncome: number; minIncomeDisplay: string; duration: string; description: string; documents: string[]; officialUrl: string; fee: string; taxImplications: string }>>('src/lib/visas-data.ts', 'VISAS');
  const visaKey = (name: string) => {
    const key = slugify(name.replace(/\([^)]*\)/g, '').trim());
    return ['uae', 'dubai'].includes(key) ? 'united-arab-emirates' : key;
  };
  const programs: VisaProgram[] = visaData.map(program => {
    const extra = sourceVisaPrograms.find(row => visaKey(row.country) === visaKey(program.country));
    return { ...program, id: visaKey(program.country), source: 'Hashtag Web3 reference library', ...(extra && { officialUrl: safeExternalUrl(extra.officialUrl) || undefined, fee: extra.fee, taxNotes: extra.taxImplications, referenceIncome: extra.minIncomeDisplay }) };
  });
  for (const program of sourceVisaPrograms) if (!programs.some(row => row.id === visaKey(program.country))) programs.push({ id: visaKey(program.country), country: program.country, continent: program.continent, minIncome: program.minIncome, visaLength: program.duration, description: program.description, requirements: program.documents, officialUrl: safeExternalUrl(program.officialUrl) || undefined, fee: program.fee, taxNotes: program.taxImplications, source: 'CVin.Bio reference library' });
  const services = readConstant<ServiceCategory[]>('src/app/resources/page.tsx', 'CATEGORIES');
  const seenServices = new Set<string>();
  for (const category of services) category.resources = category.resources.flatMap(resource => {
    const url = resource.url === '/jobs' || resource.url === 'https://hashtagweb3.com' ? '/' : resource.url === '/aiq' ? '/interview-questions' : safeExternalUrl(resource.url);
    if (!url || seenServices.has(url)) return [];
    seenServices.add(url);
    return [{ ...resource, url, ...(url === '/' && { name: 'Hashtag Web3 Jobs', description: 'Find Web3, crypto and blockchain roles, including remote opportunities.', tag: undefined }), ...(url === '/interview-questions' && { name: 'Interview Question Bank', description: 'Practice technical and non-technical Web3 interview questions, answers and follow-ups.', tag: undefined }) }];
  });
  const passportRules = readJson('public/visa-requirements.json') as Record<string, Record<string, { t: string; d: number }>>;
  const sourceRequire = createRequire(path.join(sourceRoot, 'package.json'));
  const isoCountries = sourceRequire('i18n-iso-countries'); isoCountries.registerLocale(sourceRequire('i18n-iso-countries/langs/en.json'));
  const isoOverrides: Record<string, string> = { 'Cape Verde': 'CV', 'DR Congo': 'CD', 'Swaziland': 'SZ', 'Laos': 'LA', 'Moldova': 'MD', 'Syria': 'SY', 'Brunei': 'BN', 'Micronesia': 'FM', 'Vatican': 'VA', 'Kosovo': 'XK' };
  const countries = [...new Set([...Object.keys(passportRules), ...Object.values(passportRules).flatMap(Object.keys)])].map(name => ({ id: slugify(name), name, iso: isoOverrides[name] || isoCountries.getAlpha2Code(name, 'en') || null }));
  write('cities.json', normalized);
  write('places.json', compact);
  write('visas.json', programs);
  write('passport-rules.json', passportRules);
  write('countries.json', countries);
  write('services.json', services);
  write('taxes.json', readConstant<TaxReference[]>('src/lib/nomad-tax.ts', 'TAX_DATA'));
  const previousSources = path.join(output, 'sources.json');
  const imageSources: Record<string, string> = fs.existsSync(previousSources) ? JSON.parse(fs.readFileSync(previousSources, 'utf8')).imageSources || {} : {};
  for (const city of normalized) {
    const base = `/images/nomads/${city.slug}`;
    if (fs.existsSync(`public${base}.webp`) && fs.existsSync(`public${base}-480.webp`)) {
      city.image = `${base}.webp`; city.thumbnail = `${base}-480.webp`;
    }
  }
  if (process.argv.includes('--images')) {
    const destination = path.resolve('public/images/nomads'); fs.mkdirSync(destination, { recursive: true });
    let cursor = 0;
    await Promise.all(Array.from({ length: 5 }, async () => {
      while (cursor < normalized.length) {
        const city = normalized[cursor++], image = images[city.slug];
        if (!image) continue;
        const base = `/images/nomads/${city.slug}`;
        try {
          if (!fs.existsSync(`public${base}.webp`) || !fs.existsSync(`public${base}-480.webp`)) {
            const bytes = image.startsWith('/images/cities/') ? fs.readFileSync(path.join(sourceRoot, 'public', image)) : await imageBytes(image);
            await sharp(bytes).rotate().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`public${base}.webp`);
            await sharp(bytes).rotate().resize({ width: 480, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`public${base}-480.webp`);
          }
          city.image = `${base}.webp`; city.thumbnail = `${base}-480.webp`;
          imageSources[city.slug] = image.startsWith('/') ? `https://cvin.bio${image}` : image;
        } catch (error) { console.warn(`City image ${city.slug}: ${(error as Error).message}; using a text fallback.`); }
      }
    }));
  }
  write('cities.json', normalized);
  write('sources.json', { version: 1, sourceRepository: 'https://github.com/vedangvatsa/PDFtoWebsite', sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot, encoding: 'utf8' }).trim(), importedAt: new Date().toISOString().slice(0, 10), referencePeriod: 'June 2026', directorySource: 'https://www.openstreetmap.org/copyright', internetSource: 'https://github.com/teamookla/ookla-open-data', internetLicense: 'CC BY-NC-SA 4.0 (as attributed by source project)', passportSource: 'https://github.com/ilyankou/passport-index-dataset', cityCount: normalized.length, countryCount: new Set(normalized.map(city => city.countryCode)).size, placeCount: compact.rows.length, imageSources });
  console.log(JSON.stringify({ cities: normalized.length, places: compact.rows.length, visaPrograms: programs.length, passports: Object.keys(passportRules).length, services: services.reduce((count, category) => count + category.resources.length, 0), images: Object.keys(imageSources).length }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
