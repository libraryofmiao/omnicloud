import test from 'node:test';
import assert from 'node:assert/strict';

test('sync service module loads without starting a scheduler', async () => {
  const module = await import('../src/services/syncService.js');
  assert.equal(typeof module.runDeltaSync, 'function');
  assert.equal(typeof module.scheduleSync, 'function');
  assert.equal(typeof module.getLastSyncReport, 'function');
  assert.equal(typeof module.syncAccount, 'function');
});
