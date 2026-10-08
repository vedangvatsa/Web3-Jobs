import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { gzipSync } from 'node:zlib';
import sharp from 'sharp';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ClimateVisuals } from '../src/components/nomads/climate-visuals';
import { locationMatchesCity, locationMatchesCountry } from '../src/lib/nomads/location-match';
import { nomadRelatedContent } from '../src/lib/nomads/related';
import { buildPlaceClusterIndex, clusterAppearance, isPlaceCluster } from '../src/lib/nomads/place-clusters';
import { calendarDay, nextSchengenCapacity, savingsRunway, schengenDays, taxScenario, tripError, type Trip } from '../src/lib/nomads/calculations';
import { formatOffset, overlapSlots, timezoneOffsetMinutes } from '../src/lib/nomads/timezones';
import { cityPath, safeExternalUrl } from '../src/lib/nomads/types';
import { validPassportRules } from '../src/lib/nomads/entry-rules';
import { getNomadCities, getNomadCity, getNomadExplorerCities, getNomadPlaces, getNomadServices, getNomadVisas, getPassportCountries, nomadSources } from '../src/lib/nomads/server';
import { nomadPageInfo, nomadRoutes } from '../src/lib/nomads/metadata';
import { visaData } from '../src/lib/visas';
import { getAllPopups } from '../src/lib/popups';
import { RESERVED_APP_ROUTE_SLUGS } from '../src/lib/reserved-root-slugs';
import { linkPreviewPreviewPath } from '../src/lib/social-share';
import { PREBUILD_DATA_STEPS } from './lib/prebuild-steps';
import { cityImagePlan } from '../src/lib/nomads/images';
import slugTypes from '../content/slug-types.json';
import legacyJobs from '../content/legacy-slugs-archive.json';
import { learnRoutes } from '../src/lib/learn-routes';
import { NOMAD_LEGACY_ROUTES, NOMAD_STATIC_PATHS, legacyNomadToolDestination } from '../src/lib/nomads/routes';
import { compareCityRank, comparisonSlugs, matchesClimate, rankCategory, rankingLabel, rankingValue, searchText } from '../src/lib/nomads/explorer';

const trip = (start: string, end: string): Trip => ({ id: `${start}/${end}`, start, end });

test('calendar dates reject rollover and remain independent of daylight saving', () => {
  assert.equal(calendarDay('2026-02-29'), null);
  assert.equal(calendarDay('2026-04-31'), null);
  assert.equal(calendarDay('2026-1-01'), null);
  assert.equal(calendarDay('2026-01-01T00:00:00Z'), null);
  assert.notEqual(calendarDay('2024-02-29'), null);
  assert.equal(calendarDay('2026-03-30')! - calendarDay('2026-03-28')!, 2);
  assert.ok(tripError(trip('2026-04-02', '2026-04-01')));
  assert.ok(tripError(trip('2026-04-02', '')));
});

test('Schengen counts inclusive, unique days and clips the rolling 180-day window', () => {
  assert.equal(schengenDays([trip('2026-01-01', '2026-01-01')], '2026-01-01'), 1);
  assert.equal(schengenDays([trip('2026-01-01', '2026-01-10'), trip('2026-01-05', '2026-01-15')], '2026-01-31'), 15);
  assert.equal(schengenDays([trip('2025-01-01', '2027-01-01')], '2026-05-01'), 180);
  assert.equal(schengenDays([trip('2026-01-02', '2026-01-05')], '2026-01-01'), 0);
  assert.equal(schengenDays([trip('2026-01-01', '2026-01-01')], '2026-06-29'), 1);
  assert.equal(schengenDays([trip('2026-01-01', '2026-01-01')], '2026-06-30'), 0);
  assert.equal(nextSchengenCapacity([trip('2026-01-01', '2026-03-31')], '2026-03-31'), '2026-06-30');
  assert.equal(schengenDays([trip('2026-02-31', '2026-03-05')], '2026-03-05'), 0);
});

test('Schengen interval union agrees with an independent day-by-day count', () => {
  const trips = Array.from({ length: 50 }, (_, i) => trip(
    new Date(Date.UTC(2026, 0, 1 + (i * 31) % 280)).toISOString().slice(0, 10),
    new Date(Date.UTC(2026, 0, 1 + (i * 31) % 280 + (i * 7) % 40)).toISOString().slice(0, 10),
  ));
  const end = calendarDay('2026-10-02')!;
  const expected = Array.from({ length: 180 }, (_, i) => end - i).filter(day => trips.some(value => calendarDay(value.start)! <= day && calendarDay(value.end)! >= day)).length;
  assert.equal(schengenDays(trips.reverse(), '2026-10-02'), expected);
});

test('timezone offsets handle DST, fractional offsets and overnight windows', () => {
  assert.equal(timezoneOffsetMinutes('America/New_York', new Date('2026-01-01T12:00:00Z')), -300);
  assert.equal(timezoneOffsetMinutes('America/New_York', new Date('2026-07-01T12:00:00Z')), -240);
  assert.equal(timezoneOffsetMinutes('Asia/Kathmandu', new Date('2026-07-01T12:00:00Z')), 345);
  assert.equal(timezoneOffsetMinutes('Australia/Adelaide', new Date('2026-01-01T12:00:00Z')), 630);
  assert.equal(formatOffset(-210), 'UTC−3:30');
  const kathmandu = overlapSlots(['Asia/Kathmandu'], '2026-07-01', 540, 1020)[0];
  assert.equal(kathmandu.filter(Boolean).length, 32);
  assert.equal(kathmandu[12], false);
  assert.equal(kathmandu[13], true);
  assert.equal(kathmandu[44], true);
  assert.equal(kathmandu[45], false);
  assert.equal(overlapSlots(['UTC'], '2026-01-01', 22 * 60, 6 * 60)[0].filter(Boolean).length, 32);
});

test('runway and tax scenarios reject invalid inputs and handle zero burn', () => {
  assert.equal(savingsRunway(12000, 2000, 1000), 10);
  assert.equal(savingsRunway(12000, 2000, 1000, 500), 20);
  assert.equal(savingsRunway(12000, 2000, 1000, 1000), Infinity);
  assert.equal(savingsRunway(1000, 2000, 1000), 0);
  assert.equal(savingsRunway(-1, 0, 1000), null);
  assert.equal(savingsRunway(1000, 0, 0), null);
  assert.deepEqual(taxScenario(5000, 20), { tax: 1000, remaining: 4000 });
  assert.equal(taxScenario(5000, 101), null);
  assert.equal(taxScenario(NaN, 20), null);
});

test('all imported cities, costs, locations, climate and source scores are internally consistent', () => {
  const cities = getNomadCities(), places = getNomadPlaces();
  assert.equal(cities.length, nomadSources.cityCount);
  assert.equal(new Set(cities.map(city => city.slug)).size, cities.length);
  assert.equal(places.length, nomadSources.placeCount);
  assert.equal(new Set(places.map(place => place.id)).size, places.length, 'Duplicate place identities');
  assert.equal(new Set(cities.map(city => city.countryCode)).size, nomadSources.countryCount);
  for (const city of cities) {
    assert.match(city.slug, /^[a-z0-9-]+$/);
    assert.match(city.countryCode, /^[A-Z]{2}$/);
    assert.ok(Number.isFinite(timezoneOffsetMinutes(city.timezone, new Date('2026-07-01T12:00:00Z'))));
    assert.equal(city.weather.monthly.length, 12, city.slug);
    assert.equal(city.spaces.total, places.filter(place => place.citySlug === city.slug).length, city.slug);
    assert.equal(city.spaces.total, Object.entries(city.spaces).filter(([key]) => key !== 'total').reduce((sum, [, value]) => sum + value, 0));
    assert.ok(Object.values(city.cost).every(value => Number.isFinite(value) && value >= 0));
    assert.equal(city.cost.monthly_total, city.cost.rent + city.cost.food + city.cost.transport + city.cost.coworking + city.cost.other, `${city.slug} budget breakdown`);
    for (const value of [city.safety, city.walkability?.walk, city.walkability?.bike, city.walkability?.transit]) assert.ok(value == null || (value >= 0 && value <= 10));
    assert.ok(city.nearby.every(slug => getNomadCity(slug)));
    assert.ok(city.communities.every(link => safeExternalUrl(link.url)));
  }
  for (const place of places) {
    assert.ok(getNomadCity(place.citySlug), place.citySlug);
    assert.ok(Number.isFinite(place.lat) && Math.abs(place.lat) <= 90);
    assert.ok(Number.isFinite(place.lon) && Math.abs(place.lon) <= 180);
    assert.ok(place.category && place.name);
    assert.ok(!place.website || safeExternalUrl(place.website));
    assert.ok(place.rating === null || (place.rating > 0 && place.rating <= 5));
  }
});

test('local city images are valid WebPs and every generated shard is present', async () => {
  for (const city of getNomadCities()) {
    for (const image of [city.image, city.thumbnail, city.thumbnail?.replace('-480.webp', '-128.webp')]) {
      assert.ok(image?.startsWith('/images/nomads/'), `${city.slug} image`);
      const metadata = await sharp(`public${image}`).metadata();
      assert.equal(metadata.format, 'webp');
      assert.ok(metadata.width && metadata.height);
      assert.ok(metadata.width <= (image!.includes('-128.') ? 128 : image!.includes('-480.') ? 480 : 1280));
    }
    const plan = cityImagePlan(city.image);
    assert.ok(plan?.srcSet, `${city.slug} display variants`);
    for (const candidate of plan.srcSet.split(', ')) {
      const [image, descriptor] = candidate.split(' ');
      const actual = await sharp(`public${image}`).metadata();
      assert.equal(actual.width, Number(descriptor.slice(0, -1)), `${city.slug} truthful srcset width`);
      assert.equal(actual.width! / actual.height!, 1.6);
      assert.equal(actual.format, 'webp');
      assert.ok(fs.statSync(`public${image}`).size < (actual.width === 480 ? 50000 : 180000), `${image} image budget`);
    }
    assert.deepEqual(JSON.parse(fs.readFileSync(`public/data/nomads/cities/${city.slug}.json`, 'utf8')), city);
  }
  const step = PREBUILD_DATA_STEPS.find(step => step.id === 'nomad-catalogs')!;
  assert.ok(step);
  assert.ok(step.outputs.every(file => fs.existsSync(file)), 'A generated catalog is missing');
  assert.ok(gzipSync(fs.readFileSync('public/data/nomads/cities.json')).length < 30000, 'City index bandwidth budget');
  assert.ok(gzipSync(fs.readFileSync('public/data/nomads/places.json')).length < 180000, 'Places bandwidth budget');
});

test('passport shards are complete, self-consistent, safely named and small', () => {
  const countries = getPassportCountries();
  assert.equal(new Set(countries.map(country => country.id)).size, countries.length);
  for (const country of countries) {
    assert.match(country.id, /^[a-z0-9-]+$/);
    assert.match(country.iso || '', /^[A-Z]{2}$/, country.name);
    const raw = fs.readFileSync(`public/data/nomads/passports/${country.id}.json`);
    const data = JSON.parse(raw.toString());
    assert.ok(validPassportRules(data), country.name);
    assert.equal(data.passport, country.name);
    assert.equal(new Set(data.destinations.map(item => item.name)).size, data.destinations.length);
    assert.ok(data.destinations.length >= 190);
    assert.ok(gzipSync(raw).length < 45000, `${country.name}: full conditions and provenance must fit the measured 45 KB gzip budget`);
    assert.ok(raw.length < 180000, `${country.name}: uncompressed shard budget`);
  }
  assert.equal(validPassportRules({ passport: 'Test', destinations: [{ name: 'Test', iso: null, rule: { t: '__proto__', d: 0 } }] }), false);
});

test('visa upgrade retains existing programs and service links are safe', () => {
  const programs = getNomadVisas();
  assert.equal(new Set(programs.map(program => program.id)).size, programs.length);
  assert.equal(programs.filter(program => /UAE|Dubai|United Arab Emirates/i.test(program.country)).length, 1, 'Dubai and UAE must not become duplicate program entries');
  assert.ok(programs.find(program => program.id === 'united-arab-emirates')?.officialUrl);
  for (const previous of visaData) {
    const current = programs.find(program => program.country === previous.country);
    assert.ok(current, previous.country);
    for (const key of ['country', 'continent', 'minIncome', 'description', 'visaLength', 'requirements'] as const) assert.deepEqual(current[key], previous[key]);
  }
  for (const program of programs) assert.ok(!program.officialUrl || safeExternalUrl(program.officialUrl));
  for (const category of getNomadServices()) for (const resource of category.resources) assert.ok(resource.url === '/' || resource.url === '/interview-questions' || safeExternalUrl(resource.url));
  for (const bad of ['javascript:alert(1)', 'data:text/html,hi', 'https://user:password@example.com', '//example.com']) assert.equal(safeExternalUrl(bad), null);
});

test('root-level tool and city routes preserve existing published identities and share shells', () => {
  const routes = nomadRoutes();
  assert.equal(routes.length, 102);
  assert.deepEqual(NOMAD_STATIC_PATHS, ['/nomads', '/visas']);
  assert.equal(legacyNomadToolDestination('/digital-nomad-visas'), '/visas');
  assert.equal(legacyNomadToolDestination('/nomads/schengen'), '/visas?tab=checker');
  assert.equal(legacyNomadToolDestination('/nomads/taxes'), '/visas');
  for (const [oldPath, destination] of Object.entries(NOMAD_LEGACY_ROUTES)) {
    assert.ok(RESERVED_APP_ROUTE_SLUGS.includes(oldPath.slice(1)), `${oldPath} must stay reserved`);
    assert.equal(nomadPageInfo(oldPath), null);
    assert.equal(legacyNomadToolDestination(oldPath), destination);
    assert.ok(!routes.some(route => route.path === oldPath));
  }
  assert.equal(new Set(routes.map(route => route.path)).size, routes.length);
  for (const { path } of routes) {
    assert.match(path, /^\/[a-z0-9-]+$/, 'Toolkit pages must use root-level slugs');
    const info = nomadPageInfo(path);
    assert.ok(info?.title && info.description, path);
    assert.equal(info.path, path);
    assert.equal(linkPreviewPreviewPath(`${path}/tg`, 'TelegramBot', true), `/preview${path}.html`);
    assert.ok(RESERVED_APP_ROUTE_SLUGS.includes(path.slice(1)));
    for (const [category, slugs] of Object.entries(slugTypes)) {
      if (category !== 'staticPages' && Array.isArray(slugs)) assert.ok(!slugs.includes(path.slice(1)), `${path} collides with ${category}`);
    }
    assert.ok(!Object.hasOwn(legacyJobs, path.slice(1)), `${path} is a historical job URL`);
    assert.ok(!learnRoutes.some(route => route.slug === path.slice(1)), `${path} is an existing learning page`);
  }
  assert.ok(RESERVED_APP_ROUTE_SLUGS.includes('nomads'));
  assert.ok(getAllPopups().some(popup => popup.slug === 'nomad'));
  assert.equal(nomadPageInfo('/nomad'), null);
  assert.equal(nomadPageInfo('/nomads/cities/not-a-city'), null);
  assert.equal(nomadPageInfo('/tax'), null);
  assert.ok(routes.some(route => route.path === cityPath('lisbon')));
  assert.equal(cityPath('lisbon'), '/lisbon');
});

test('location matching uses country evidence, aliases and disambiguates similarly named places', () => {
  const lisbon = getNomadCity('lisbon')!, london = getNomadCity('london')!, paris = getNomadCity('paris')!;
  assert.equal(locationMatchesCity('Lisbon, Portugal', lisbon), true);
  assert.equal(locationMatchesCountry('Porto, Portugal', lisbon), true);
  assert.equal(locationMatchesCity('Porto, Portugal', lisbon), false);
  assert.equal(locationMatchesCity('London, Ontario, Canada', london), false);
  assert.equal(locationMatchesCountry('Paris, TX', paris), false);
  assert.equal(locationMatchesCity('Bengaluru, India', getNomadCity('bangalore')!), true);
  assert.equal(locationMatchesCity('Canggu, Indonesia', getNomadCity('bali')!), true);
  assert.equal(locationMatchesCity('San Francisco, CA', getNomadCity('san-francisco')!), true);
  assert.equal(locationMatchesCountry('San Francisco, CA', getNomadCity('toronto')!), false);
  assert.equal(locationMatchesCountry('Atlanta, Georgia, United States', getNomadCity('tbilisi')!), false);
  assert.equal(locationMatchesCountry('Remote', lisbon), false);
});

test('related results keep payloads lean and distinguish city matches from country-wide results', async () => {
  for (const slug of ['lisbon', 'bangkok', 'san-francisco']) {
    const city = getNomadCity(slug)!, related = await nomadRelatedContent(city);
    for (const group of [related.jobs, related.events, related.companies, related.popups]) {
      assert.ok(group.items.length <= 3);
      assert.ok(group.total >= group.items.length);
      assert.ok([city.name, city.country].includes(group.location));
    }
    for (const job of related.jobs.items) {
      assert.ok(locationMatchesCountry(job.location || '', city));
      if (related.jobs.location === city.name) assert.ok(locationMatchesCity(job.location || '', city));
      assert.equal(job.description, undefined);
    }
    for (const popup of related.popups.items) {
      assert.ok(locationMatchesCountry(popup.location, city));
      assert.equal('body' in popup, false);
      assert.equal('posts' in popup, false);
    }
    for (const company of related.companies.items) assert.ok(company.localJobCount > 0 && company.localJobCount <= company.jobCount);
  }
});

test('climate visuals handle gaps and flat data without fabricated zero-temperature measurements', () => {
  const html = renderToStaticMarkup(createElement(ClimateVisuals, { name: 'Test city', months: [
    { month: 'Jan', temp: 20, rain: 0, humidity: 50 },
    { month: 'Feb', temp: null, rain: null, humidity: null },
    { month: 'Mar', temp: 20, rain: 0, humidity: 50 },
  ] }));
  assert.doesNotMatch(html, /NaN|Infinity|undefined/);
  assert.equal((html.match(/data-climate-month=/g) || []).length, 3);
  assert.equal((html.match(/<circle /g) || []).length, 2);
  assert.match(html, /monthly temperature/);
  assert.match(html, /monthly rainfall/);
});

test('map clustering preserves every place and expands accurately after filtering', () => {
  const all = getNomadPlaces();
  for (const places of [all, all.filter(place => place.category === 'coworking'), all.filter(place => place.citySlug === 'lisbon')]) {
    const index = buildPlaceClusterIndex(places);
    for (const zoom of [0, 2, 6, 12, 16]) {
      const features = index.getClusters([-180, -85, 180, 85], zoom);
      assert.equal(features.reduce((sum, feature) => sum + (isPlaceCluster(feature) ? feature.properties.point_count : 1), 0), places.length);
    }
    const cluster = index.getClusters([-180, -85, 180, 85], 2).find(isPlaceCluster);
    if (cluster) {
      assert.equal(index.getLeaves(cluster.properties.cluster_id, Infinity).length, cluster.properties.point_count);
      assert.ok(index.getClusterExpansionZoom(cluster.properties.cluster_id) > 2);
    }
  }
  assert.deepEqual(buildPlaceClusterIndex([]).getClusters([-180, -85, 180, 85], 2), []);
  assert.equal(clusterAppearance(49).color, '#3b82f6');
  assert.equal(clusterAppearance(50).color, '#8b5cf6');
  assert.equal(clusterAppearance(200).color, '#ef4444');
});

test('explorer ranking puts unknown values last in both directions and preserves zeroes', () => {
  const known = getNomadCity('lisbon')!, unknown = {...known, name: 'Unknown', safety: null};
  assert.match(rankingLabel(known, 'score', 0), / \/ 100$/);
  for (const ascending of [true, false]) assert.ok(compareCityRank(known, unknown, 'safety', 0, ascending) < 0);
  const zero = {...known, weather: {...known.weather, monthly: [{month: 'Jan', temp: 0, rain: 0, humidity: 0}]}};
  assert.equal(rankingValue(zero, 'temperature', 0), 0);
  assert.equal(rankingValue(zero, 'rainfall', 1), null);
  assert.equal(rankCategory('climate'), 'temperature');
  assert.equal(rankCategory('monthly_total'), 'cost');
  assert.equal(rankCategory('unknown'), 'score');
  assert.equal(searchText('São-Paulo'), 'sao paulo');
  const cheaper = {...known, cost: {...known.cost, monthly_total: 1}};
  assert.ok(compareCityRank(cheaper, known, 'cost', 0, true) < 0);
});

test('comparison shares recover legacy pairs and cannot select the same city twice', () => {
  const cities = getNomadExplorerCities();
  assert.deepEqual(comparisonSlugs(cities, new URLSearchParams('cities=bangalore,london')), ['bangalore', 'london']);
  assert.deepEqual(comparisonSlugs(cities, new URLSearchParams('a=lisbon&b=lisbon')), ['lisbon', 'chiang-mai']);
  assert.deepEqual(comparisonSlugs(cities, new URLSearchParams('a=invalid&b=invalid')), ['lisbon', 'chiang-mai']);
  for (const city of cities) assert.ok(!('nearby' in city) && !('communities' in city));
});

test('weather filters retain missing-data meaning and include range boundaries', () => {
  const city = {...getNomadCity('lisbon')!, weather: {avg_temp: 20, annual_rain: 50, monthly: [{month: 'Jan', temp: 20, rain: 50, humidity: 40}, {month: 'Feb', temp: null, rain: null, humidity: null}]}};
  assert.equal(matchesClimate(city, 0, {min: '20', max: '20', rain: 'dry', humidity: 'medium'}), true);
  assert.equal(matchesClimate(city, 0, {min: '21', max: '', rain: '', humidity: ''}), false);
  assert.equal(matchesClimate(city, 1, {min: '', max: '', rain: 'dry', humidity: ''}), false);
  assert.equal(matchesClimate(city, 1, {min: '', max: '', rain: '', humidity: ''}), true);
});
