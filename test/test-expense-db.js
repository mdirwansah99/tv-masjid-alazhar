import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  generateVoucherNo,
  calculateSummary,
  filterTransactions,
  validateTransaction,
  createBackupPayload,
  validateBackupPayload
} from '../expense-tracker/db.js';

test('formatCurrency formats RM numbers accurately with 2 decimal places', () => {
  assert.equal(formatCurrency(0), 'RM 0.00');
  assert.equal(formatCurrency(150), 'RM 150.00');
  assert.equal(formatCurrency(1250.5), 'RM 1,250.50');
  assert.equal(formatCurrency(1000000), 'RM 1,000,000.00');
});

test('generateVoucherNo creates standard Masjid voucher numbering', () => {
  const expenseVoucher = generateVoucherNo('EXPENSE', 2026, 1);
  assert.equal(expenseVoucher, 'MAA-BK-2026-0001');

  const incomeVoucher = generateVoucherNo('INCOME', 2026, 42);
  assert.equal(incomeVoucher, 'MAA-BM-2026-0042');
});

test('validateTransaction rejects invalid or incomplete data', () => {
  assert.deepEqual(validateTransaction({}), {
    isValid: false,
    errors: ['Tarikh diperlukan', 'Jenis transaksi diperlukan', 'Kategori diperlukan', 'Jumlah (RM) mestilah lebih daripada 0']
  });

  const valid = validateTransaction({
    date: '2026-10-01',
    type: 'EXPENSE',
    category: 'Utiliti',
    amount: 250.00,
    payeeOrPayer: 'SESB Sabah',
    description: 'Bil elektrik masjid'
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.errors.length, 0);
});

test('calculateSummary accurately calculates totals and prevents floating point inaccuracy', () => {
  const sampleTransactions = [
    { type: 'INCOME', amount: 1000.10 },
    { type: 'INCOME', amount: 500.20 },
    { type: 'EXPENSE', amount: 300.15 },
    { type: 'EXPENSE', amount: 200.15 }
  ];

  const summary = calculateSummary(sampleTransactions);
  assert.equal(summary.totalIncome, 1500.30);
  assert.equal(summary.totalExpense, 500.30);
  assert.equal(summary.netBalance, 1000.00);
  assert.equal(summary.count, 4);
});

test('filterTransactions filters by year, month, type, and search keyword', () => {
  const sample = [
    { date: '2026-01-10', type: 'INCOME', category: 'Infaq Jumaat', description: 'Kutipan tabung', payeeOrPayer: 'Jemaah' },
    { date: '2026-02-15', type: 'EXPENSE', category: 'Utiliti', description: 'Bil Elektrik SESB', payeeOrPayer: 'SESB' },
    { date: '2026-02-20', type: 'EXPENSE', category: 'Penyelenggaraan', description: 'Servis PA Sistem', payeeOrPayer: 'Kedai Audio' }
  ];

  const febItems = filterTransactions(sample, { year: '2026', month: '02' });
  assert.equal(febItems.length, 2);

  const expenseItems = filterTransactions(sample, { type: 'EXPENSE' });
  assert.equal(expenseItems.length, 2);

  const searchItems = filterTransactions(sample, { search: 'SESB' });
  assert.equal(searchItems.length, 1);
  assert.equal(searchItems[0].payeeOrPayer, 'SESB');
});

test('createBackupPayload and validateBackupPayload maintain full data integrity', () => {
  const transactions = [{ id: 1, voucherNo: 'MAA-BK-2026-0001', amount: 50, type: 'EXPENSE' }];
  const settings = { masjidName: 'Masjid Al-Azhar Kampung Sepakat Jaya Sepanggar' };

  const backup = createBackupPayload(transactions, settings);
  assert.equal(backup.appName, 'ExpenseTracker-MasjidAlAzhar');
  assert.equal(backup.version, 1);
  assert.equal(backup.transactions.length, 1);

  const validation = validateBackupPayload(backup);
  assert.equal(validation.isValid, true);

  const invalid = validateBackupPayload({ someRandom: 'data' });
  assert.equal(invalid.isValid, false);
});
