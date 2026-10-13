import assert from 'node:assert/strict';
import { test } from 'node:test';
import { citizenshipPrograms, filterPrograms, officialProgramUrl, selectedPrograms, startingInvestments, type CitizenshipProgram } from '../src/lib/citizenship';
import { getPassportCountries } from '../src/lib/nomads/server';

test('comparison URLs ignore unknown and duplicate countries and enforce the three-country limit', () => {
  const programs = [...citizenshipPrograms, { ...citizenshipPrograms[0], slug: 'test-fourth' }];
  const slugs = programs.map(program => program.slug);
  assert.deepEqual(selectedPrograms(programs, ['unknown', slugs[0], ...slugs].join(',')).map(program => program.slug), slugs.slice(0, 3));
  assert.deepEqual(selectedPrograms(programs, null), []);
});

test('combined filters, legacy country spelling and empty results follow the catalog', () => {
  assert.deepEqual(filterPrograms(citizenshipPrograms, new URLSearchParams('q= Turkey ')).map(program => program.slug), ['turkiye']);
  for (const program of citizenshipPrograms) {
    for (const route of program.routes) {
      const matches = filterPrograms(citizenshipPrograms, new URLSearchParams({ kind: route.kind, region: program.region }));
      assert.ok(matches.some(item => item.slug === program.slug));
      assert.ok(matches.every(item => item.region === program.region && item.routes.some(item => item.kind === route.kind)));
    }
  }
  assert.deepEqual(filterPrograms(citizenshipPrograms, new URLSearchParams('q=unlisted-country')), []);
});

test('the directory stays alphabetical and starting amounts keep currencies separate', () => {
  const base = citizenshipPrograms[0];
  const route = base.routes[0];
  const programs: CitizenshipProgram[] = [
    { ...base, slug: 'usd-high', country: 'USD High', routes: [{ ...route, kind: 'Property', amount: 500000, currency: 'USD' }, { ...route, kind: 'Contribution', amount: 150000, currency: 'USD' }] },
    { ...base, slug: 'usd-low', country: 'USD Low', routes: [{ ...route, kind: 'Property', amount: 300000, currency: 'USD' }] },
    { ...base, slug: 'jod', country: 'JOD', routes: [{ ...route, kind: 'Business', amount: 750000, currency: 'JOD' }] },
  ];
  assert.deepEqual(filterPrograms(programs, new URLSearchParams('sort=amount')).map(program => program.slug), ['jod', 'usd-high', 'usd-low']);
  assert.deepEqual(filterPrograms(programs, new URLSearchParams('sort=amount&kind=Property')).map(program => program.slug), ['usd-high', 'usd-low']);
  assert.deepEqual(startingInvestments(programs.flatMap(program => program.routes)).map(route => [route.currency, route.amount]), [['JOD', 750000], ['USD', 150000]]);
  assert.deepEqual(filterPrograms(programs, new URLSearchParams('kind=Business')).map(program => program.slug), ['jod']);
});

test('official links use the program default unless a route filter selects a specific source', () => {
  const base = citizenshipPrograms[0];
  const program: CitizenshipProgram = {
    ...base,
    officialUrl: 'https://authority.example/program',
    routes: [{ ...base.routes[0], kind: 'Deposit', amount: 500000, source: 'deposit' }, { ...base.routes[0], kind: 'Deposit', amount: 250000, source: 'lower-deposit' }],
    sources: [{ ...base.sources[0], id: 'deposit', url: 'https://authority.example/deposit' }, { ...base.sources[0], id: 'lower-deposit', url: 'https://authority.example/lower-deposit' }],
  };
  assert.equal(officialProgramUrl(program), program.officialUrl);
  assert.equal(officialProgramUrl(program, 'Deposit'), 'https://authority.example/lower-deposit');
  assert.equal(officialProgramUrl(program, 'unknown'), program.officialUrl);
});

test('each published threshold resolves to an official dated source and existing passport', () => {
  assert.equal(new Set(citizenshipPrograms.map(program => program.slug)).size, citizenshipPrograms.length);
  for (const program of citizenshipPrograms) {
    assert.ok(['Active', 'Discretionary', 'Intake unverified'].includes(program.status));
    assert.ok(getPassportCountries().some(passport => passport.iso === program.code));
    assert.ok(program.sources.some(source => source.url === program.officialUrl));
    for (const route of program.routes) {
      assert.ok(program.sources.some(source => source.id === route.source));
      assert.ok(route.fees && route.capital);
      if (route.amount === null) {
        assert.notEqual(program.status, 'Active');
        assert.equal(route.currency, null);
      } else {
        assert.ok(route.amount > 0);
        assert.match(route.currency || '', /^[A-Z]{3}$/);
      }
      assert.ok(route.kind && route.name);
    }
    for (const source of program.sources) {
      assert.equal(new URL(source.url).protocol, 'https:');
      assert.ok(source.title);
      assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(source.supports);
    }
  }
});
