import test from 'node:test';
import assert from 'node:assert/strict';
import CloudModule from '../expense-tracker/cloud.js';

const {
  verifyPin,
  setStoredPin,
  getStoredPin,
  validateCloudConfig,
  formatTransactionForCloud,
  parseTransactionFromCloud
} = CloudModule;

test('verifyPin correctly validates default PIN and custom PIN', () => {
  // Mock localStorage
  const mockStorage = {};
  const storageGetter = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = v; }
  };

  assert.equal(verifyPin('123456', storageGetter), true);
  assert.equal(verifyPin('999999', storageGetter), false);

  setStoredPin('888888', storageGetter);
  assert.equal(getStoredPin(storageGetter), '888888');
  assert.equal(verifyPin('888888', storageGetter), true);
  assert.equal(verifyPin('123456', storageGetter), false);
});

test('validateCloudConfig checks required Firebase fields', () => {
  const invalid = validateCloudConfig({});
  assert.equal(invalid.isValid, false);

  const valid = validateCloudConfig({
    projectId: 'masjid-alazhar-kewangan',
    apiKey: 'AIzaSyExampleKey12345'
  });
  assert.equal(valid.isValid, true);
});

test('formatTransactionForCloud and parseTransactionFromCloud serialize properly', () => {
  const tx = {
    id: 1,
    voucherNo: 'MAA-BK-2026-0001',
    date: '2026-10-09',
    type: 'EXPENSE',
    category: 'Utiliti',
    amount: 150.00,
    payeeOrPayer: 'SESB',
    receiptImage: 'data:image/png;base64,abc123'
  };

  const cloudDoc = formatTransactionForCloud(tx);
  assert.ok(cloudDoc);

  const parsed = parseTransactionFromCloud(cloudDoc);
  assert.equal(parsed.voucherNo, 'MAA-BK-2026-0001');
  assert.equal(parsed.amount, 150.00);
  assert.equal(parsed.type, 'EXPENSE');
});
