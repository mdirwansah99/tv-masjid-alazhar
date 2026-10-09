/**
 * db.js - Pangkalan Data & Utiliti Kewangan Masjid Al-Azhar
 * Menyokong IndexedDB tempatan (melalui Dexie.js), format UMD untuk keserasian
 * luar talian (file:///) dan persekitaran ujian Node.js.
 */

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.MasjidDB = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {

  // 1. UTILITI PENGIRAAN & FORMAT MATA WANG
  function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return 'RM ' + num.toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // 1b. PENUKARAN JUMLAH KE PERKATAAN BAHASA MELAYU (RINGGIT & SEN)
  function numberToWordsMY(amount) {
    const num = Number(amount) || 0;
    const whole = Math.floor(num);
    const cents = Math.round((num - whole) * 100);

    const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Lapan', 'Sembilan'];

    function convertChunk(n) {
      if (n === 0) return '';
      if (n < 10) return units[n];
      if (n === 10) return 'Sepuluh';
      if (n === 11) return 'Sebelas';
      if (n < 20) return units[n - 10] + ' Belas';
      if (n < 100) {
        const tens = Math.floor(n / 10);
        const rem = n % 10;
        return units[tens] + ' Puluh' + (rem ? ' ' + units[rem] : '');
      }
      if (n < 1000) {
        const hundreds = Math.floor(n / 100);
        const rem = n % 100;
        const hStr = hundreds === 1 ? 'Seratus' : units[hundreds] + ' Ratus';
        return hStr + (rem ? ' ' + convertChunk(rem) : '');
      }
      return '';
    }

    function convertNumber(n) {
      if (n === 0) return 'Kosong';
      let res = '';
      const millions = Math.floor(n / 1000000);
      const thousands = Math.floor((n % 1000000) / 1000);
      const remainder = n % 1000;

      if (millions > 0) {
        res += (millions === 1 ? 'Sejuta' : convertChunk(millions) + ' Juta');
      }
      if (thousands > 0) {
        if (res) res += ' ';
        res += (thousands === 1 && !millions ? 'Satu Ribu' : (thousands === 1 ? 'Seribu' : convertChunk(thousands) + ' Ribu'));
      }
      if (remainder > 0) {
        if (res) res += ' ';
        res += convertChunk(remainder);
      }
      return res;
    }

    let words = 'Ringgit Malaysia: ' + convertNumber(whole);
    if (cents > 0) {
      words += ' Dan Sen ' + convertNumber(cents);
    }
    words += ' Sahaja';
    return words;
  }

  // 2. PENJANAAN NOMBOR BAUCAR (VOUCHER NUMBER)
  // EXPENSE -> MAA-BK-2026-0001 (Baucar Keluar)
  // INCOME  -> MAA-BM-2026-0001 (Baucar Masuk / Resit Penerimaan)
  function generateVoucherNo(type, year, sequenceNumber) {
    const prefix = type === 'EXPENSE' ? 'MAA-BK' : 'MAA-BM';
    const paddedSeq = String(sequenceNumber).padStart(4, '0');
    return `${prefix}-${year}-${paddedSeq}`;
  }

  // 3. PENGESAHAN DATA TRANSAKSI
  function validateTransaction(data) {
    const errors = [];
    if (!data.date || typeof data.date !== 'string') {
      errors.push('Tarikh diperlukan');
    }
    if (!data.type || !['INCOME', 'EXPENSE'].includes(data.type)) {
      errors.push('Jenis transaksi diperlukan');
    }
    if (!data.category || typeof data.category !== 'string' || !data.category.trim()) {
      errors.push('Kategori diperlukan');
    }
    const amt = Number(data.amount);
    if (isNaN(amt) || amt <= 0) {
      errors.push('Jumlah (RM) mestilah lebih daripada 0');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 4. PENGIRAAN RINGKASAN KEWANGAN (CEGAH RALAT FLOATING POINT)
  function calculateSummary(transactions = []) {
    let totalIncomeCents = 0;
    let totalExpenseCents = 0;

    for (const item of transactions) {
      const cents = Math.round((Number(item.amount) || 0) * 100);
      if (item.type === 'INCOME') {
        totalIncomeCents += cents;
      } else if (item.type === 'EXPENSE') {
        totalExpenseCents += cents;
      }
    }

    const netBalanceCents = totalIncomeCents - totalExpenseCents;

    return {
      totalIncome: Number((totalIncomeCents / 100).toFixed(2)),
      totalExpense: Number((totalExpenseCents / 100).toFixed(2)),
      netBalance: Number((netBalanceCents / 100).toFixed(2)),
      count: transactions.length
    };
  }

  // 5. PENAPIS TRANSAKSI (FILTER)
  function filterTransactions(transactions = [], filters = {}) {
    const { year, month, type, category, search } = filters;

    return transactions.filter(item => {
      if (year && !item.date.startsWith(String(year))) {
        return false;
      }
      if (month && !item.date.includes(`-${String(month).padStart(2, '0')}-`)) {
        return false;
      }
      if (type && item.type !== type) {
        return false;
      }
      if (category && item.category !== category) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchPayee = (item.payeeOrPayer || '').toLowerCase().includes(q);
        const matchVoucher = (item.voucherNo || '').toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        if (!matchDesc && !matchPayee && !matchVoucher && !matchCat) {
          return false;
        }
      }
      return true;
    });
  }

  // 6. FORMAT SANDARAN (BACKUP & RESTORE)
  function createBackupPayload(transactions, settings) {
    return {
      appName: 'ExpenseTracker-MasjidAlAzhar',
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions: transactions || [],
      settings: settings || {
        masjidName: 'Masjid Al-Azhar Kampung Sepakat Jaya Sepanggar',
        address: 'Kampung Sepakat Jaya, Sepanggar, 88450 Kota Kinabalu, Sabah',
        pengerusi: '',
        bendahari: ''
      }
    };
  }

  function validateBackupPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return { isValid: false, message: 'Data tidak sah atau kosong.' };
    }
    if (payload.appName !== 'ExpenseTracker-MasjidAlAzhar' || !Array.isArray(payload.transactions)) {
      return { isValid: false, message: 'Fail bukan sandaran rasmi Expense Tracker Masjid Al-Azhar.' };
    }
    return { isValid: true, message: 'Data sandaran sah.' };
  }

  // 7. MAMPATAN IMEJ RESIT (BROWSER CANVAS)
  async function compressReceiptImage(file, maxWidth = 1200, quality = 0.75) {
    if (typeof Image === 'undefined' || typeof document === 'undefined') {
      return null; // Persekitaran bukan pelayar
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 8. PEMBALUT INDEXEDDB (DEXIE.JS)
  let dbInstance = null;

  function getDatabase(DexieConstructor = (typeof Dexie !== 'undefined' ? Dexie : null)) {
    if (dbInstance) return dbInstance;
    if (!DexieConstructor) {
      return null;
    }

    const db = new DexieConstructor('MasjidAlAzharFinanceDB');
    db.version(1).stores({
      transactions: '++id, voucherNo, date, type, category, amount, payeeOrPayer, paymentMethod, createdAt',
      settings: 'key, value'
    });

    dbInstance = db;
    return db;
  }

  return {
    formatCurrency,
    generateVoucherNo,
    validateTransaction,
    calculateSummary,
    filterTransactions,
    createBackupPayload,
    validateBackupPayload,
    compressReceiptImage,
    getDatabase,
    numberToWordsMY
  };
});
