import test from 'node:test';
import assert from 'node:assert/strict';
import { formatIsoDate, leaveCalendarDate } from '../src/lib/leave/leave.types.ts';
import { clockSummaryMinutes } from '../src/lib/time-management/summaryMinutes.ts';

test('clock totals match API rows, including breaks already deducted by the API', () => {
  const result = { totalMinutes: 510, items: [{ workedMinutes: 450 }, { workedMinutes: 60 }] };
  assert.equal(clockSummaryMinutes(result), 510);
  assert.equal(clockSummaryMinutes({ data: result }), 510);
  assert.equal(clockSummaryMinutes({ items: [] }), 0);
});

test('leave calendar dates do not move in western/eastern timezones or across DST', () => {
  const original = process.env.TZ;
  try {
    for (const zone of ['America/Chicago', 'America/Los_Angeles', 'UTC', 'Asia/Tokyo']) {
      process.env.TZ = zone;
      for (const iso of ['2026-09-21', '2026-03-08', '2026-11-01']) {
        const expected = new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
        assert.equal(formatIsoDate(`${iso}T00:00:00.000Z`), expected, `${zone}: ${iso}`);
        assert.equal(formatIsoDate(iso), expected);
        const calendar = leaveCalendarDate(`${iso}T00:00:00.000Z`);
        assert.equal(calendar.getFullYear(), Number(iso.slice(0, 4)));
        assert.equal(calendar.getMonth() + 1, Number(iso.slice(5, 7)));
        assert.equal(calendar.getDate(), Number(iso.slice(8, 10)));
      }
    }
    assert.equal(formatIsoDate(null), '—');
    assert.equal(formatIsoDate('invalid'), 'invalid');
  } finally { if (original === undefined) delete process.env.TZ; else process.env.TZ = original; }
});
