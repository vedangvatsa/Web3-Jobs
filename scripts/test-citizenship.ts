import assert from 'node:assert/strict';
import { test } from 'node:test';
import { citizenshipPrograms, filterPrograms, selectedPrograms } from '../src/lib/citizenship';
import { getPassportCountries } from '../src/lib/nomads/server';

test('comparison URLs ignore unknown and duplicate countries and enforce the three-country limit', () => {
  const programs = [...citizenshipPrograms, { ...citizenshipPrograms[0], slug: 'test-fourth' }];
  assert.deepEqual(selectedPrograms(programs, 'unknown,dominica,dominica,turkiye,antigua-and-barbuda,test-fourth').map(program => program.slug), ['dominica', 'turkiye', 'antigua-and-barbuda']);
  assert.deepEqual(selectedPrograms(programs, null), []);
});

test('combined filters, legacy country spelling, sorting and empty results', () => {
  assert.deepEqual(filterPrograms(citizenshipPrograms, new URLSearchParams('q= Turkey ')).map(program => program.slug), ['turkiye']);
  assert.deepEqual(filterPrograms(citizenshipPrograms, new URLSearchParams('kind=Property&region=Caribbean')).map(program => program.slug), ['dominica']);
  assert.deepEqual(filterPrograms(citizenshipPrograms, new URLSearchParams('sort=amount')).map(program => program.slug), ['dominica', 'antigua-and-barbuda', 'turkiye']);
  assert.deepEqual(filterPrograms(citizenshipPrograms, new URLSearchParams('q=unlisted-country')), []);
});

test('each published threshold resolves to an official dated source and existing passport', () => {
  const hosts = new Set(['www.cbiu.gov.dm', 'cip.gov.ag', 'www.invest.gov.tr']);
  assert.equal(new Set(citizenshipPrograms.map(program => program.slug)).size, citizenshipPrograms.length);
  for (const program of citizenshipPrograms) {
    assert.equal(program.status, 'Active');
    assert.ok(getPassportCountries().some(passport => passport.iso === program.code));
    assert.ok(program.sources.some(source => source.url === program.officialUrl));
    for (const route of program.routes) {
      assert.ok(program.sources.some(source => source.id === route.source));
      assert.ok(route.amount > 0 && route.fees && route.capital);
      assert.equal(route.currency, 'USD', 'Threshold sort requires a common published currency');
    }
    for (const source of program.sources) {
      assert.ok(hosts.has(new URL(source.url).hostname));
      assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(source.supports);
    }
  }
});
