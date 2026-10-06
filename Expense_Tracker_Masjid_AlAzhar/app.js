/**
 * app.js - Logik Utama Antaramuka Expense Tracker Masjid Al-Azhar
 */

const {
  formatCurrency,
  generateVoucherNo,
  calculateSummary,
  filterTransactions,
  validateTransaction,
  createBackupPayload,
  validateBackupPayload,
  compressReceiptImage,
  getDatabase
} = (typeof window !== 'undefined' ? window.MasjidDB : null) || (typeof require !== 'undefined' ? require('./db.js') : {});

// Kategori Lazim Masjid
const INCOME_CATEGORIES = [
  'Infaq Jumaat',
  'Tabung Am Masjid',
  'Tabung Kebajikan & Anak Yatim',
  'Sumbangan Wakaf Pembangunan',
  'Sumbangan Ihya Ramadan',
  'Sumbangan Korban & Aqiqah',
  'Derma Khas Jemaah',
  'Lain-lain Pendapatan'
];

const EXPENSE_CATEGORIES = [
  'Utiliti (Elektrik SESB)',
  'Utiliti (Air JANS)',
  'Penyelenggaraan & Pembaikan Bangunan',
  'Penyelenggaraan PA Sistem & Hawa Dingin',
  'Elaun Petugas (Imam/Bilal/Siak)',
  'Saguhati Penceramah Kuliah',
  'Program Dakwah & Ihya Ramadan',
  'Pengurusan Jenazah & Khairat',
  'Jamuan & Minum Petugas / Jemaah',
  'Pembersihan & Sanitasi',
  'Alat Tulis & Pengurusan Pejabat',
  'Lain-lain Perbelanjaan'
];

// Keadaan Aplikasi (State)
let db = null;
let allTransactions = [];
let currentReceiptImage = null;
let currentReceiptFileName = '';

// PENDENGAR ACARA DOM (INIT)
document.addEventListener('DOMContentLoaded', async () => {
  initIcons();
  await initDatabase();
  setupEventListeners();
  renderApp();
});

function initIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Inisialisasi IndexedDB
async function initDatabase() {
  try {
    db = getDatabase();
    if (db) {
      await db.open();
      const count = await db.transactions.count();
      if (count === 0) {
        await seedInitialData();
      }
      allTransactions = await db.transactions.orderBy('date').reverse().toArray();
    }
  } catch (err) {
    console.error('Ralat inisialisasi IndexedDB:', err);
    // Fallback: gunakan memori jika IndexedDB tidak disokong
    allTransactions = [];
  }
}

// Data Permulaan Contoh untuk Paparan Awal Bendahari
async function seedInitialData() {
  const currentYear = new Date().getFullYear();
  const sampleData = [
    {
      voucherNo: `MAA-BM-${currentYear}-0001`,
      date: `${currentYear}-10-02`,
      type: 'INCOME',
      category: 'Infaq Jumaat',
      amount: 1850.50,
      payeeOrPayer: 'Tabung Jumaat Jemaah',
      paymentMethod: 'Tunai',
      description: 'Kutipan tabung solat Jumaat minggu pertama',
      receiptImage: null,
      receiptFileName: '',
      createdAt: new Date().toISOString()
    },
    {
      voucherNo: `MAA-BK-${currentYear}-0001`,
      date: `${currentYear}-10-04`,
      type: 'EXPENSE',
      category: 'Utiliti (Elektrik SESB)',
      amount: 420.00,
      payeeOrPayer: 'Sabah Electricity Sdn Bhd (SESB)',
      paymentMethod: 'Pindahan Bank (Online)',
      description: 'Bayaran bil elektrik masjid bulan September',
      receiptImage: null,
      receiptFileName: '',
      createdAt: new Date().toISOString()
    },
    {
      voucherNo: `MAA-BK-${currentYear}-0002`,
      date: `${currentYear}-10-05`,
      type: 'EXPENSE',
      category: 'Penyelenggaraan PA Sistem & Hawa Dingin',
      amount: 250.00,
      payeeOrPayer: 'Kedai Servis Audio Sepanggar',
      paymentMethod: 'Tunai',
      description: 'Gantian mikrofon tanpa wayar dan servis mixer azan',
      receiptImage: null,
      receiptFileName: '',
      createdAt: new Date().toISOString()
    }
  ];

  if (db) {
    await db.transactions.bulkAdd(sampleData);
  }
}

// Pasang Semua Pendengar Acara (Event Listeners)
function setupEventListeners() {
  // Butang Utama Buka Modal
  document.getElementById('btn-add-income')?.addEventListener('click', () => openTransactionModal('INCOME'));
  document.getElementById('btn-add-expense')?.addEventListener('click', () => openTransactionModal('EXPENSE'));
  document.getElementById('btn-open-reports')?.addEventListener('click', openReportsModal);
  document.getElementById('btn-open-backup')?.addEventListener('click', openBackupModal);

  // Penapis & Carian
  document.getElementById('filter-search')?.addEventListener('input', renderApp);
  document.getElementById('filter-year')?.addEventListener('change', renderApp);
  document.getElementById('filter-month')?.addEventListener('change', renderApp);
  document.getElementById('filter-type')?.addEventListener('change', renderApp);

  // Toggle Jenis dalam Borang Modal
  document.getElementById('toggle-type-income')?.addEventListener('click', () => setModalType('INCOME'));
  document.getElementById('toggle-type-expense')?.addEventListener('click', () => setModalType('EXPENSE'));

  // Pengendali Fail Resit
  const receiptFileInput = document.getElementById('tx-receipt-file');
  receiptFileInput?.addEventListener('change', handleReceiptFileSelect);

  document.getElementById('btn-remove-receipt')?.addEventListener('click', removeReceiptImage);

  // Penghantaran Borang Transaksi
  document.getElementById('form-transaction')?.addEventListener('submit', handleTransactionSubmit);

  // Butang Tutup Modal
  document.getElementById('modal-tx-close')?.addEventListener('click', closeTransactionModal);
  document.getElementById('modal-tx-cancel')?.addEventListener('click', closeTransactionModal);
  document.getElementById('receipt-modal-close')?.addEventListener('click', closeReceiptModal);
  document.getElementById('receipt-modal-done')?.addEventListener('click', closeReceiptModal);
  document.getElementById('modal-reports-close')?.addEventListener('click', closeReportsModal);
  document.getElementById('modal-backup-close')?.addEventListener('click', closeBackupModal);

  // Cetak Penyata Buku Tunai
  document.getElementById('btn-print-cash-book')?.addEventListener('click', handlePrintCashBook);

  // Sandaran & Pulihkan Data
  document.getElementById('btn-export-backup')?.addEventListener('click', handleExportBackup);
  document.getElementById('btn-do-restore')?.addEventListener('click', handleRestoreBackup);
}

// ----------------------------------------------------
// PENGURUSAN BORANG & MODAL TRANSAKSI
// ----------------------------------------------------
function openTransactionModal(type = 'INCOME', editItem = null) {
  const modal = document.getElementById('modal-transaction');
  const form = document.getElementById('form-transaction');
  form.reset();

  currentReceiptImage = null;
  currentReceiptFileName = '';
  updateReceiptPreviewUI();

  const idInput = document.getElementById('tx-id');
  const dateInput = document.getElementById('tx-date');
  const voucherInput = document.getElementById('tx-voucher');

  if (editItem) {
    idInput.value = editItem.id;
    dateInput.value = editItem.date;
    voucherInput.value = editItem.voucherNo;
    document.getElementById('tx-category').value = editItem.category;
    document.getElementById('tx-amount').value = editItem.amount;
    document.getElementById('tx-payee').value = editItem.payeeOrPayer || '';
    document.getElementById('tx-payment-method').value = editItem.paymentMethod || 'Tunai';
    document.getElementById('tx-desc').value = editItem.description || '';
    
    if (editItem.receiptImage) {
      currentReceiptImage = editItem.receiptImage;
      currentReceiptFileName = editItem.receiptFileName || 'resit.jpg';
      updateReceiptPreviewUI();
    }
    setModalType(editItem.type, false);
  } else {
    idInput.value = '';
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    setModalType(type, true);
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  initIcons();
}

function closeTransactionModal() {
  const modal = document.getElementById('modal-transaction');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function setModalType(type, autoGenerateVoucher = true) {
  const typeInput = document.getElementById('tx-type');
  typeInput.value = type;

  const btnIncome = document.getElementById('toggle-type-income');
  const btnExpense = document.getElementById('toggle-type-expense');
  const modalHeader = document.getElementById('modal-tx-header');
  const modalTitle = document.getElementById('modal-tx-title');
  const labelPayee = document.getElementById('label-tx-payee');
  const inputPayee = document.getElementById('tx-payee');
  const datalist = document.getElementById('category-options');

  datalist.innerHTML = '';

  if (type === 'INCOME') {
    modalHeader.className = 'px-6 py-4 bg-emerald-700 text-white flex items-center justify-between';
    modalTitle.textContent = 'Rekod Duit Masuk (Kutipan/Infaq)';
    labelPayee.textContent = 'Diterima Daripada / Nama Penyumbang';
    inputPayee.placeholder = 'Nama jemaah, syarikat, atau Tabung Jumaat...';

    btnIncome.className = 'py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm';
    btnExpense.className = 'py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition bg-slate-50 text-slate-600 border-slate-200';

    INCOME_CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      datalist.appendChild(opt);
    });
  } else {
    modalHeader.className = 'px-6 py-4 bg-rose-700 text-white flex items-center justify-between';
    modalTitle.textContent = 'Rekod Duit Keluar (Baucar Bayaran)';
    labelPayee.textContent = 'Dibayar Kepada / Nama Penerima / Pembekal *';
    inputPayee.placeholder = 'Nama kedai, kontraktor, atau pembekal perkhidmatan...';

    btnExpense.className = 'py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition bg-rose-50 text-rose-700 border-rose-500 shadow-sm';
    btnIncome.className = 'py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition bg-slate-50 text-slate-600 border-slate-200';

    EXPENSE_CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      datalist.appendChild(opt);
    });
  }

  if (autoGenerateVoucher) {
    const year = new Date().getFullYear();
    const countThisType = allTransactions.filter(t => t.type === type && t.date?.startsWith(String(year))).length;
    document.getElementById('tx-voucher').value = generateVoucherNo(type, year, countThisType + 1);
  }

  initIcons();
}

async function handleReceiptFileSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const filenameLabel = document.getElementById('tx-receipt-filename');
    filenameLabel.textContent = 'Memampatkan gambar...';

    const compressed = await compressReceiptImage(file, 1200, 0.75);
    currentReceiptImage = compressed;
    currentReceiptFileName = file.name;
    updateReceiptPreviewUI();
  } catch (err) {
    alert('Ralat memproses imej resit: ' + err.message);
  }
}

function removeReceiptImage() {
  currentReceiptImage = null;
  currentReceiptFileName = '';
  document.getElementById('tx-receipt-file').value = '';
  updateReceiptPreviewUI();
}

function updateReceiptPreviewUI() {
  const container = document.getElementById('receipt-preview-container');
  const img = document.getElementById('receipt-preview-img');
  const filenameLabel = document.getElementById('tx-receipt-filename');

  if (currentReceiptImage) {
    img.src = currentReceiptImage;
    container.classList.remove('hidden');
    filenameLabel.textContent = currentReceiptFileName || 'Resit Dilampirkan';
  } else {
    img.src = '';
    container.classList.add('hidden');
    filenameLabel.textContent = 'Tiada fail dipilih';
  }
  initIcons();
}

async function handleTransactionSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('tx-id').value;
  const type = document.getElementById('tx-type').value;
  const date = document.getElementById('tx-date').value;
  const voucherNo = document.getElementById('tx-voucher').value.trim();
  const category = document.getElementById('tx-category').value.trim();
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const payeeOrPayer = document.getElementById('tx-payee').value.trim();
  const paymentMethod = document.getElementById('tx-payment-method').value;
  const description = document.getElementById('tx-desc').value.trim();

  const data = {
    date,
    type,
    category,
    amount,
    voucherNo,
    payeeOrPayer,
    paymentMethod,
    description,
    receiptImage: currentReceiptImage,
    receiptFileName: currentReceiptFileName,
    updatedAt: new Date().toISOString()
  };

  const validation = validateTransaction(data);
  if (!validation.isValid) {
    alert('Sila lengkapkan maklumat:\n- ' + validation.errors.join('\n- '));
    return;
  }

  try {
    if (db) {
      if (id) {
        await db.transactions.update(Number(id), data);
      } else {
        data.createdAt = new Date().toISOString();
        await db.transactions.add(data);
      }
      allTransactions = await db.transactions.orderBy('date').reverse().toArray();
    } else {
      // Memory fallback
      if (id) {
        const idx = allTransactions.findIndex(t => t.id === Number(id));
        if (idx !== -1) allTransactions[idx] = { ...data, id: Number(id) };
      } else {
        data.id = Date.now();
        data.createdAt = new Date().toISOString();
        allTransactions.unshift(data);
      }
    }

    closeTransactionModal();
    renderApp();
  } catch (err) {
    alert('Ralat menyimpan transaksi: ' + err.message);
  }
}

// ----------------------------------------------------
// PAPARAN JADUAL & METRIK KEWANGAN
// ----------------------------------------------------
function renderApp() {
  const search = document.getElementById('filter-search')?.value.trim();
  const year = document.getElementById('filter-year')?.value;
  const month = document.getElementById('filter-month')?.value;
  const type = document.getElementById('filter-type')?.value;

  const filtered = filterTransactions(allTransactions, { search, year, month, type });

  // Kemaskini Metrik
  const summary = calculateSummary(allTransactions);
  document.getElementById('stat-net-balance').textContent = formatCurrency(summary.netBalance);
  document.getElementById('stat-total-income').textContent = formatCurrency(summary.totalIncome);
  document.getElementById('stat-total-expense').textContent = formatCurrency(summary.totalExpense);

  const receiptCount = allTransactions.filter(t => !!t.receiptImage).length;
  document.getElementById('stat-receipt-count').textContent = `${receiptCount} Resit`;

  // Kemaskini Jadual
  const tbody = document.getElementById('transaction-table-body');
  const emptyState = document.getElementById('empty-state');
  const showingCount = document.getElementById('tx-showing-count');

  showingCount.textContent = filtered.length;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');

    filtered.forEach(tx => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50/80 transition-colors';

      const isIncome = tx.type === 'INCOME';
      const badgeClass = isIncome ? 'badge-income' : 'badge-expense';
      const typeLabel = isIncome ? 'Masuk' : 'Keluar';

      tr.innerHTML = `
        <td class="py-3 px-4 font-medium whitespace-nowrap text-slate-800">${tx.date}</td>
        <td class="py-3 px-4 font-mono font-semibold text-xs whitespace-nowrap text-slate-700">${tx.voucherNo || '-'}</td>
        <td class="py-3 px-4">
          <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">
            ${tx.category}
          </span>
        </td>
        <td class="py-3 px-4">
          <div class="font-medium text-slate-900">${tx.payeeOrPayer || '-'}</div>
          <div class="text-xs text-slate-500 mt-0.5">${tx.description || tx.paymentMethod || ''}</div>
        </td>
        <td class="py-3 px-4 text-right font-bold text-teal-600 whitespace-nowrap">
          ${isIncome ? formatCurrency(tx.amount) : '-'}
        </td>
        <td class="py-3 px-4 text-right font-bold text-rose-600 whitespace-nowrap">
          ${!isIncome ? formatCurrency(tx.amount) : '-'}
        </td>
        <td class="py-3 px-4 text-center">
          ${tx.receiptImage ? `
            <button type="button" class="btn-view-receipt inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold transition" data-id="${tx.id}">
              <i data-lucide="image" class="w-3.5 h-3.5"></i>
              <span>Lihat</span>
            </button>
          ` : `
            <span class="text-xs text-slate-400 italic">Tiada</span>
          `}
        </td>
        <td class="py-3 px-4 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5">
            ${!isIncome ? `
              <button type="button" class="btn-print-voucher p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition" data-id="${tx.id}" title="Cetak Baucar Bayaran A4">
                <i data-lucide="printer" class="w-4 h-4"></i>
              </button>
            ` : ''}
            <button type="button" class="btn-edit-tx p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition" data-id="${tx.id}" title="Sunting Rekod">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button type="button" class="btn-delete-tx p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition" data-id="${tx.id}" title="Padam Rekod">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Pasang butang dalam baris jadual
    tbody.querySelectorAll('.btn-view-receipt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const tx = allTransactions.find(t => t.id === id);
        if (tx && tx.receiptImage) openReceiptModal(tx);
      });
    });

    tbody.querySelectorAll('.btn-print-voucher').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        openPaymentVoucherPrint(id);
      });
    });

    tbody.querySelectorAll('.btn-edit-tx').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const tx = allTransactions.find(t => t.id === id);
        if (tx) openTransactionModal(tx.type, tx);
      });
    });

    tbody.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        confirmDeleteTransaction(id);
      });
    });
  }

  initIcons();
}

async function confirmDeleteTransaction(id) {
  const tx = allTransactions.find(t => t.id === id);
  if (!tx) return;

  const msg = `Adakah anda pasti ingin memadamkan rekod ini?\nNo Baucar: ${tx.voucherNo || '-'}\nJumlah: ${formatCurrency(tx.amount)}`;
  if (!confirm(msg)) return;

  try {
    if (db) {
      await db.transactions.delete(id);
      allTransactions = await db.transactions.orderBy('date').reverse().toArray();
    } else {
      allTransactions = allTransactions.filter(t => t.id !== id);
    }
    renderApp();
  } catch (err) {
    alert('Ralat memadam rekod: ' + err.message);
  }
}

// ----------------------------------------------------
// PRATONTON RESIT PENUH
// ----------------------------------------------------
function openReceiptModal(tx) {
  const modal = document.getElementById('modal-receipt-view');
  const img = document.getElementById('receipt-modal-img');
  const title = document.getElementById('receipt-modal-title');
  const subtitle = document.getElementById('receipt-modal-subtitle');
  const dlLink = document.getElementById('receipt-modal-download');

  title.textContent = `Resit: ${tx.category} (${formatCurrency(tx.amount)})`;
  subtitle.textContent = `No Baucar: ${tx.voucherNo || '-'} • Tarikh: ${tx.date} • Penerima: ${tx.payeeOrPayer || '-'}`;
  img.src = tx.receiptImage;
  dlLink.href = tx.receiptImage;
  dlLink.download = `${tx.voucherNo || 'resit'}-${tx.date}.jpg`;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  initIcons();
}

function closeReceiptModal() {
  const modal = document.getElementById('modal-receipt-view');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// ----------------------------------------------------
// LAPORAN & CETAKAN
// ----------------------------------------------------
function openReportsModal() {
  const modal = document.getElementById('modal-reports');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  initIcons();
}

function closeReportsModal() {
  const modal = document.getElementById('modal-reports');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// Cetak Baucar Bayaran (Payment Voucher A4)
function openPaymentVoucherPrint(transactionId) {
  const tx = allTransactions.find(t => t.id === transactionId);
  if (!tx) {
    alert('Rekod transaksi tidak ditemui.');
    return;
  }

  // Isi Data Baucar
  document.getElementById('pv-voucher').textContent = tx.voucherNo || '-';
  document.getElementById('pv-date').textContent = tx.date;
  document.getElementById('pv-payee').textContent = tx.payeeOrPayer || 'Tidak Dinyatakan';
  document.getElementById('pv-method').textContent = tx.paymentMethod || 'Tunai';
  document.getElementById('pv-category').textContent = tx.category;
  document.getElementById('pv-description').textContent = tx.description || `Bayaran untuk ${tx.category}`;
  document.getElementById('pv-amount').textContent = formatCurrency(tx.amount);
  document.getElementById('pv-total-amount').textContent = formatCurrency(tx.amount);

  const receiptSection = document.getElementById('pv-receipt-attachment');
  const receiptImg = document.getElementById('pv-receipt-image');

  if (tx.receiptImage) {
    receiptImg.src = tx.receiptImage;
    receiptSection.classList.remove('hidden');
  } else {
    receiptImg.src = '';
    receiptSection.classList.add('hidden');
  }

  // Sediakan paparan cetak
  const voucherPrint = document.getElementById('print-voucher-view');
  const cashbookPrint = document.getElementById('print-cashbook-view');

  voucherPrint.classList.remove('hidden');
  cashbookPrint.classList.add('hidden');

  // Cetak
  window.print();
}

// Cetak Penyata Buku Tunai (Cash Book A4)
function handlePrintCashBook() {
  const year = document.getElementById('report-year').value;
  const month = document.getElementById('report-month').value;

  closeReportsModal();
  openCashBookPrint(year, month);
}

function openCashBookPrint(year, month) {
  const monthNames = {
    '01': 'Januari', '02': 'Februari', '03': 'Mac', '04': 'April',
    '05': 'Mei', '06': 'Jun', '07': 'Julai', '08': 'Ogos',
    '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Disember'
  };

  const periodLabel = month ? `${monthNames[month]} ${year}` : `Sepanjang Tahun ${year}`;
  document.getElementById('cb-period').textContent = periodLabel;
  document.getElementById('cb-generated-date').textContent = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // Tapis data mengikut tempoh dan susun mengikut tarikh menaik (Ascending) untuk Buku Tunai
  const filtered = filterTransactions(allTransactions, { year, month })
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  const tbody = document.getElementById('cb-table-body');
  tbody.innerHTML = '';

  let runningBalanceCents = 0;
  let totalIncomeCents = 0;
  let totalExpenseCents = 0;

  filtered.forEach(item => {
    const isIncome = item.type === 'INCOME';
    const amountCents = Math.round(Number(item.amount) * 100);

    if (isIncome) {
      totalIncomeCents += amountCents;
      runningBalanceCents += amountCents;
    } else {
      totalExpenseCents += amountCents;
      runningBalanceCents -= amountCents;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.date}</td>
      <td class="font-mono text-xs">${item.voucherNo || '-'}</td>
      <td>${item.category}</td>
      <td>${item.payeeOrPayer ? `<strong>${item.payeeOrPayer}</strong> - ` : ''}${item.description || ''}</td>
      <td class="text-right">${isIncome ? formatCurrency(item.amount) : '-'}</td>
      <td class="text-right">${!isIncome ? formatCurrency(item.amount) : '-'}</td>
      <td class="text-right font-bold">${formatCurrency(runningBalanceCents / 100)}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('cb-sum-income').textContent = formatCurrency(totalIncomeCents / 100);
  document.getElementById('cb-sum-expense').textContent = formatCurrency(totalExpenseCents / 100);
  document.getElementById('cb-sum-balance').textContent = formatCurrency(runningBalanceCents / 100);

  // Sediakan paparan cetak
  const voucherPrint = document.getElementById('print-voucher-view');
  const cashbookPrint = document.getElementById('print-cashbook-view');

  voucherPrint.classList.add('hidden');
  cashbookPrint.classList.remove('hidden');

  window.print();
}

// ----------------------------------------------------
// SANDARAN & PULIHKAN DATA (BACKUP & RESTORE)
// ----------------------------------------------------
function openBackupModal() {
  const modal = document.getElementById('modal-backup');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  initIcons();
}

function closeBackupModal() {
  const modal = document.getElementById('modal-backup');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function handleExportBackup() {
  const payload = createBackupPayload(allTransactions);
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const nowStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `Sandaran_Kewangan_Masjid_AlAzhar_${nowStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function handleRestoreBackup() {
  const fileInput = document.getElementById('input-restore-file');
  const file = fileInput?.files?.[0];

  if (!file) {
    alert('Sila pilih fail sandaran (.json) terlebih dahulu.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const validation = validateBackupPayload(parsed);

      if (!validation.isValid) {
        alert('Fail tidak sah: ' + validation.message);
        return;
      }

      const count = parsed.transactions.length;
      if (!confirm(`Fail sah mengandungi ${count} rekod transaksi.\nAdakah anda pasti ingin memuatkan semula data ini? (Data semasa akan digantikan)`)) {
        return;
      }

      if (db) {
        await db.transactions.clear();
        await db.transactions.bulkAdd(parsed.transactions);
        allTransactions = await db.transactions.orderBy('date').reverse().toArray();
      } else {
        allTransactions = parsed.transactions;
      }

      closeBackupModal();
      renderApp();
      alert(`Berjaya memulihkan ${count} rekod transaksi!`);
    } catch (err) {
      alert('Ralat membaca fail sandaran: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// Dedahkan ke window untuk rujukan global
if (typeof window !== 'undefined') {
  window.MasjidApp = {
    allTransactions,
    renderApp,
    openPaymentVoucherPrint,
    openCashBookPrint
  };
}
