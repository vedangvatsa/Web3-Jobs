import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasEventEnded } from './event-dates.mjs';

test('date-only events remain visible through their local final day', () => {
  const event = { startDate: '2026-09-28', endDate: '2026-09-28', timezone: 'Asia/Singapore' };
  assert.equal(hasEventEnded(event, Date.parse('2026-09-28T09:00:00+08:00')), false);
  assert.equal(hasEventEnded(event, Date.parse('2026-09-28T23:59:59+08:00')), false);
  assert.equal(hasEventEnded(event, Date.parse('2026-09-29T00:00:00+08:00')), true);
});

test('timestamped events use their actual end instant and invalid dates fail closed', () => {
  assert.equal(hasEventEnded({ startDate: '2026-10-01T10:00:00Z', endDate: '2026-10-01T12:00:00Z' }, Date.parse('2026-10-01T13:00:00Z')), true);
  assert.equal(hasEventEnded({ startDate: 'invalid' }), true);
});
