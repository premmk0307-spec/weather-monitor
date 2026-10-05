import test from 'node:test';
import assert from 'node:assert/strict';
import { nextHours } from './forecast.js';
function hours(start) {
  return { time: Array.from({ length: 48 }, (_, i) => Date.parse(start) / 1000 + i * 3600), temperature_2m: Array.from({ length: 48 }, (_, i) => i) };
}
test('starts at current hour rather than midnight', () => {
  const result = nextHours(hours('2026-10-05T00:00:00Z'), Date.parse('2026-10-05T18:37:00Z'));
  assert.equal(result.hourlyTimes[0], '2026-10-05T18:00:00.000Z');
  assert.equal(result.hourlyTemps[0], 18);
  assert.equal(result.hourlyTimes.length, 12);
  assert.equal(result.hourlyTimes[11], '2026-10-06T05:00:00.000Z');
});
test('preserves distinct hours during the UK clock change', () => {
  const result = nextHours(hours('2026-10-25T00:00:00Z'), Date.parse('2026-10-25T00:30:00Z'));
  assert.equal(new Set(result.hourlyTimes).size, 12);
  const format = time => new Date(time).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' });
  assert.equal(format(result.hourlyTimes[0]), '01:00');
  assert.equal(format(result.hourlyTimes[1]), '01:00');
});
test('rejects missing temperatures and insufficient forecasts', () => {
  assert.throws(() => nextHours({ time: [] }));
  const data = hours('2026-10-05T00:00:00Z');
  data.temperature_2m[18] = null;
  assert.throws(() => nextHours(data, Date.parse('2026-10-05T18:00:00Z')));
});
