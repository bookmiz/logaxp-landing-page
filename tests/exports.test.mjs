import test from 'node:test';
import assert from 'node:assert/strict';
import { toCsv } from '../src/components/time-management/export/exportCsv.ts';
test('CSV preserves commas, quotes and multiline values', () => {
  const csv = toCsv([{ name: 'Amara, "Amy"', notes: 'First line\nSecond line' }], [{ header: 'Name', value: row => row.name }, { header: 'Notes', value: row => row.notes }]);
  assert.equal(csv, 'Name,Notes\n"Amara, ""Amy""","First line\nSecond line"');
});
test('CSV neutralizes spreadsheet formula payloads', () => {
  for (const value of ['=1+1', '+SUM(1)', '-1+2', '@SUM(1)', ' \t=HYPERLINK("https://example.test")']) {
    assert.ok(toCsv([{ value }], [{ header: 'Value', value: row => row.value }]).includes("'"));
  }
});
test('CSV handles empty exports and missing fields', () => {
  assert.equal(toCsv([], [{ header: 'Name', value: row => row.name }]), 'Name');
  assert.equal(toCsv([{ value: null }], [{ header: 'Value', value: row => row.value }]), 'Value\n');
});
