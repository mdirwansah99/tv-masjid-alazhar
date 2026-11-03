/**
 * app.js - Logik Utama Antaramuka Expense Tracker Masjid Al-Azhar
 */

const {
  formatCurrency,
  generateVoucherNo,
  calculateSummary,
  filterTransactions,
  validateTransaction,
  resolveAccount,
  resolveFund,
  createBackupPayload,
  validateBackupPayload,
  compressReceiptImage,
  getDatabase,
  numberToWordsMY
} = (typeof window !== 'undefined' ? window.MasjidDB : null) || (typeof require !== 'undefined' ? require('./db.js') : {});

const {
  getStoredPin,
  setStoredPin,
  verifyPin,
  isDeviceUnlocked,
  setDeviceUnlocked,
  validateCloudConfig,
  getCloudConfig,
  saveCloudConfig,
  isCloudEnabled,
  fetchCloudTransactions,
  pushTransactionToCloud
} = (typeof window !== 'undefined' ? window.MasjidCloud : null) || (typeof require !== 'undefined' ? require('./cloud.js') : {});

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
let currentVbReceiptImage = null;
let currentVbReceiptFileName = '';

// PENDENGAR ACARA DOM (INIT)
document.addEventListener('DOMContentLoaded', async () => {
  initIcons();
  await initDatabase();
  setupEventListeners();
  checkSecurityPinLock();
  setupPinKeypad();
  renderApp();
  if (isCloudEnabled && isCloudEnabled()) {
    syncWithCloudSilently();
  }
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
      account: 'CASH',
      fund: 'GENERAL',
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
      account: 'BANK',
      fund: 'GENERAL',
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
      account: 'CASH',
      fund: 'GENERAL',
      description: 'Gantian mikrofon tanpa wayar dan servis mixer azan',
      receiptImage: null,
      receiptFileName: '',
      createdAt: new Date().toISOString()
    },
    {
      voucherNo: `MAA-BM-${currentYear}-0002`,
      date: `${currentYear}-10-06`,
      type: 'INCOME',
      category: 'Tabung Kebajikan & Khairat',
      amount: 800.00,
      payeeOrPayer: 'Kutipan Yuran & Infaq Khairat Jemaah',
      paymentMethod: 'Pindahan Bank (Online)',
      account: 'BANK',
      fund: 'KHAIRAT',
      description: 'Kutipan yuran tahunan dan derma khas Tabung Khairat Kematian',
      receiptImage: null,
      receiptFileName: '',
      createdAt: new Date().toISOString()
    },
    {
      voucherNo: `MAA-BP-${currentYear}-0001`,
      date: `${currentYear}-10-07`,
      type: 'TRANSFER',
      category: 'Pindahan Dana Kontra',
      amount: 500.00,
      fromAccount: 'CASH',
      toAccount: 'BANK',
      fromFund: 'GENERAL',
      toFund: 'GENERAL',
      account: 'BANK',
      fund: 'GENERAL',
      payeeOrPayer: 'Pindahan: Tunai ➔ Bank',
      paymentMethod: 'Pindahan Kontra',
      description: 'Deposit sebahagian kutipan tunai Jumaat ke akaun CDM Bank Islam Sepanggar',
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
  document.getElementById('btn-open-transfer')?.addEventListener('click', openTransferModal);
  document.getElementById('btn-open-opening-balance')?.addEventListener('click', openOpeningBalanceModal);
  document.getElementById('btn-open-voucher')?.addEventListener('click', openVoucherBuilderModal);
  document.getElementById('btn-open-reports')?.addEventListener('click', openReportsModal);
  document.getElementById('btn-open-backup')?.addEventListener('click', openBackupModal);

  // Modal Pindahan Dana Listeners
  document.getElementById('modal-transfer-close')?.addEventListener('click', closeTransferModal);
  document.getElementById('modal-transfer-cancel')?.addEventListener('click', closeTransferModal);
  document.getElementById('transfer-receipt-file')?.addEventListener('change', handleTransferReceiptFileSelect);
  document.getElementById('btn-remove-transfer-receipt')?.addEventListener('click', removeTransferReceiptImage);
  document.getElementById('form-transfer')?.addEventListener('submit', handleTransferSubmit);

  // Modal Baki Awal Listeners
  document.getElementById('modal-ob-close')?.addEventListener('click', closeOpeningBalanceModal);
  document.getElementById('modal-ob-cancel')?.addEventListener('click', closeOpeningBalanceModal);
  document.getElementById('form-opening-balance')?.addEventListener('submit', handleOpeningBalanceSubmit);

  // Baucar Bayaran Modal Listeners
  document.getElementById('modal-voucher-close')?.addEventListener('click', closeVoucherBuilderModal);
  document.getElementById('modal-voucher-cancel')?.addEventListener('click', closeVoucherBuilderModal);
  document.getElementById('vb-btn-add-item')?.addEventListener('click', () => addVoucherItemRow());
  document.getElementById('vb-receipt-file')?.addEventListener('change', handleVoucherReceiptFileSelect);
  document.getElementById('vb-btn-remove-receipt')?.addEventListener('click', removeVoucherReceiptImage);
  document.getElementById('btn-print-blank-voucher')?.addEventListener('click', handlePrintBlankVoucher);
  document.getElementById('form-voucher-builder')?.addEventListener('submit', handleVoucherBuilderSubmit);

  // Penapis & Carian
  document.getElementById('filter-search')?.addEventListener('input', renderApp);
  document.getElementById('filter-year')?.addEventListener('change', renderApp);
  document.getElementById('filter-month')?.addEventListener('change', renderApp);
  document.getElementById('filter-type')?.addEventListener('change', renderApp);
  document.getElementById('filter-account')?.addEventListener('change', renderApp);
  document.getElementById('filter-fund')?.addEventListener('change', renderApp);

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

  // Penyegerakan Awan & PIN Keselamatan
  document.getElementById('btn-open-cloud')?.addEventListener('click', openCloudSettingsModal);
  document.getElementById('modal-cloud-close')?.addEventListener('click', closeCloudSettingsModal);
  document.getElementById('btn-cloud-modal-done')?.addEventListener('click', closeCloudSettingsModal);
  document.getElementById('btn-save-cloud-config')?.addEventListener('click', handleSaveCloudConfig);
  document.getElementById('btn-submit-change-pin')?.addEventListener('click', handleChangePinSubmit);
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
    const accEl = document.getElementById('tx-account');
    const fundEl = document.getElementById('tx-fund');
    if (accEl) accEl.value = resolveAccount(editItem);
    if (fundEl) fundEl.value = resolveFund(editItem);
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
    const accEl = document.getElementById('tx-account');
    const fundEl = document.getElementById('tx-fund');
    if (accEl) accEl.value = type === 'INCOME' ? 'CASH' : 'BANK';
    if (fundEl) fundEl.value = 'GENERAL';
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
  const account = document.getElementById('tx-account')?.value || (paymentMethod === 'Tunai' ? 'CASH' : 'BANK');
  const fund = document.getElementById('tx-fund')?.value || 'GENERAL';
  const description = document.getElementById('tx-desc').value.trim();

  const data = {
    date,
    type,
    category,
    amount,
    voucherNo,
    payeeOrPayer,
    paymentMethod,
    account,
    fund,
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
    if (typeof pushTxToCloudIfEnabled === 'function') {
      pushTxToCloudIfEnabled(data);
    }
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
  const account = document.getElementById('filter-account')?.value;
  const fund = document.getElementById('filter-fund')?.value;

  const filtered = filterTransactions(allTransactions, { search, year, month, type, account, fund });

  // Kemaskini Metrik (4 Kad Utama & Statistik Semasa)
  const summary = calculateSummary(allTransactions);
  const cashEl = document.getElementById('stat-cash-balance');
  const bankEl = document.getElementById('stat-bank-balance');
  const khairatEl = document.getElementById('stat-khairat-balance');
  const netEl = document.getElementById('stat-net-balance');
  const genEl = document.getElementById('stat-general-balance');
  const incomeEl = document.getElementById('stat-total-income');
  const expenseEl = document.getElementById('stat-total-expense');

  if (cashEl) cashEl.textContent = formatCurrency(summary.cashBalance);
  if (bankEl) bankEl.textContent = formatCurrency(summary.bankBalance);
  if (khairatEl) khairatEl.textContent = formatCurrency(summary.khairatBalance);
  if (netEl) netEl.textContent = formatCurrency(summary.netBalance);
  if (genEl) genEl.textContent = formatCurrency(summary.generalBalance);
  if (incomeEl) incomeEl.textContent = formatCurrency(summary.totalIncome);
  if (expenseEl) expenseEl.textContent = formatCurrency(summary.totalExpense);

  const receiptCount = allTransactions.filter(t => !!t.receiptImage).length;
  const rcEl = document.getElementById('stat-receipt-count');
  if (rcEl) rcEl.textContent = `${receiptCount} Fail`;

  // Kemaskini Jadual
  const tbody = document.getElementById('transaction-table-body');
  const emptyState = document.getElementById('empty-state');
  const showingCount = document.getElementById('tx-showing-count');

  if (showingCount) showingCount.textContent = filtered.length;
  if (!tbody) return;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState?.classList.remove('hidden');
  } else {
    emptyState?.classList.add('hidden');

    filtered.forEach(tx => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50/80 transition-colors';

      const isTransfer = tx.type === 'TRANSFER';
      const isIncome = tx.type === 'INCOME' || tx.type === 'OPENING_BALANCE';
      const acc = resolveAccount(tx);
      const fnd = resolveFund(tx);

      let badgeHtml = '';
      if (isTransfer) {
        badgeHtml = `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">⇄ Pindahan Kontra</span>`;
      } else if (tx.type === 'OPENING_BALANCE' || tx.category?.includes('Baki Awal')) {
        badgeHtml = `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">⚙️ Baki Awal</span>`;
      } else {
        const badgeClass = isIncome ? 'badge-income' : 'badge-expense';
        badgeHtml = `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">${tx.category}</span>`;
      }

      const accBadge = acc === 'CASH'
        ? `<span class="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">Tunai</span>`
        : `<span class="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">Bank</span>`;

      const fundBadge = fnd === 'KHAIRAT'
        ? `<span class="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-semibold ml-1">🤝 Khairat</span>`
        : `<span class="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-semibold ml-1">Am</span>`;

      tr.innerHTML = `
        <td class="py-3 px-4 font-medium whitespace-nowrap text-slate-800">${tx.date}</td>
        <td class="py-3 px-4 font-mono font-semibold text-xs whitespace-nowrap text-slate-700">${tx.voucherNo || '-'}</td>
        <td class="py-3 px-4">
          <div>${badgeHtml}</div>
          <div class="mt-1">${accBadge} ${fundBadge}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-medium text-slate-900">${tx.payeeOrPayer || '-'}</div>
          <div class="text-xs text-slate-500 mt-0.5">${tx.description || tx.paymentMethod || ''}</div>
        </td>
        <td class="py-3 px-4 text-right font-bold whitespace-nowrap ${isTransfer ? 'text-sky-700' : 'text-teal-600'}">
          ${isIncome || isTransfer ? formatCurrency(tx.amount) : '-'}
        </td>
        <td class="py-3 px-4 text-right font-bold whitespace-nowrap ${isTransfer ? 'text-sky-700' : 'text-rose-600'}">
          ${!isIncome || isTransfer ? formatCurrency(tx.amount) : '-'}
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
            ${isTransfer ? `
              <button type="button" class="btn-print-transfer p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition" data-id="${tx.id}" title="Cetak Baucar Pindahan Dana A4">
                <i data-lucide="printer" class="w-4 h-4"></i>
              </button>
            ` : (!isIncome ? `
              <button type="button" class="btn-print-voucher p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition" data-id="${tx.id}" title="Cetak Baucar Bayaran A4">
                <i data-lucide="printer" class="w-4 h-4"></i>
              </button>
            ` : '')}
            ${!isTransfer ? `
              <button type="button" class="btn-edit-tx p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition" data-id="${tx.id}" title="Sunting Rekod">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
            ` : ''}
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

    tbody.querySelectorAll('.btn-print-transfer').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const tx = allTransactions.find(t => t.id === id);
        if (tx) renderAndPrintTransferVoucher(tx);
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

// ----------------------------------------------------
// PENJANA BAUCAR BAYARAN KHUSUS (PAYMENT VOUCHER BUILDER)
// ----------------------------------------------------
function openVoucherBuilderModal() {
  const modal = document.getElementById('modal-voucher-builder');
  const form = document.getElementById('form-voucher-builder');
  form.reset();
  currentVbReceiptImage = null;
  currentVbReceiptFileName = '';
  updateVbReceiptPreviewUI();

  // Isi Pilihan Kategori Perbelanjaan
  const catSelect = document.getElementById('vb-category');
  catSelect.innerHTML = '';
  EXPENSE_CATEGORIES.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    catSelect.appendChild(opt);
  });

  // Auto Jana No Baucar
  const year = new Date().getFullYear();
  const countExpense = allTransactions.filter(t => t.type === 'EXPENSE' && t.date?.startsWith(String(year))).length;
  document.getElementById('vb-voucher-no').value = generateVoucherNo('EXPENSE', year, countExpense + 1);

  // Tarikh hari ini
  document.getElementById('vb-date').value = new Date().toISOString().split('T')[0];

  // Sediakan bekas baris butiran
  const container = document.getElementById('vb-items-container');
  container.innerHTML = '';
  addVoucherItemRow('', ''); // Baris pertama

  recalcVoucherTotals();

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  initIcons();
}

function closeVoucherBuilderModal() {
  const modal = document.getElementById('modal-voucher-builder');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function addVoucherItemRow(desc = '', amount = '') {
  const container = document.getElementById('vb-items-container');
  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 vb-item-row';
  row.innerHTML = `
    <input type="text" placeholder="Butiran item perbelanjaan..." value="${desc}" class="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 vb-item-desc" required>
    <div class="relative w-32">
      <span class="absolute left-2.5 top-2 text-xs font-bold text-slate-400">RM</span>
      <input type="number" step="0.01" min="0" placeholder="0.00" value="${amount}" class="w-full pl-8 pr-2.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800 text-right vb-item-amt" required>
    </div>
    <button type="button" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition vb-btn-del-item" title="Padam baris">
      <i data-lucide="trash-2" class="w-4 h-4"></i>
    </button>
  `;

  row.querySelector('.vb-item-amt').addEventListener('input', recalcVoucherTotals);
  row.querySelector('.vb-btn-del-item').addEventListener('click', () => {
    const totalRows = container.querySelectorAll('.vb-item-row').length;
    if (totalRows > 1) {
      row.remove();
      recalcVoucherTotals();
    } else {
      row.querySelector('.vb-item-desc').value = '';
      row.querySelector('.vb-item-amt').value = '';
      recalcVoucherTotals();
    }
  });

  container.appendChild(row);
  initIcons();
}

function recalcVoucherTotals() {
  const container = document.getElementById('vb-items-container');
  const amtInputs = container.querySelectorAll('.vb-item-amt');
  let totalCents = 0;

  amtInputs.forEach(input => {
    const val = parseFloat(input.value) || 0;
    totalCents += Math.round(val * 100);
  });

  const total = totalCents / 100;
  document.getElementById('vb-total-display').textContent = formatCurrency(total);
  document.getElementById('vb-amount-words').textContent = numberToWordsMY(total);
  return total;
}

async function handleVoucherReceiptFileSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const filenameLabel = document.getElementById('vb-receipt-filename');
    filenameLabel.textContent = 'Memampatkan gambar...';

    const compressed = await compressReceiptImage(file, 1200, 0.75);
    currentVbReceiptImage = compressed;
    currentVbReceiptFileName = file.name;
    updateVbReceiptPreviewUI();
  } catch (err) {
    alert('Ralat memproses imej resit: ' + err.message);
  }
}

function removeVoucherReceiptImage() {
  currentVbReceiptImage = null;
  currentVbReceiptFileName = '';
  document.getElementById('vb-receipt-file').value = '';
  updateVbReceiptPreviewUI();
}

function updateVbReceiptPreviewUI() {
  const container = document.getElementById('vb-receipt-preview-container');
  const img = document.getElementById('vb-receipt-preview-img');
  const filenameLabel = document.getElementById('vb-receipt-filename');

  if (currentVbReceiptImage) {
    img.src = currentVbReceiptImage;
    container.classList.remove('hidden');
    filenameLabel.textContent = currentVbReceiptFileName || 'Resit Dilampirkan';
  } else {
    img.src = '';
    container.classList.add('hidden');
    filenameLabel.textContent = 'Tiada fail dipilih';
  }
  initIcons();
}

async function handleVoucherBuilderSubmit(e) {
  e.preventDefault();

  const voucherNo = document.getElementById('vb-voucher-no').value.trim();
  const date = document.getElementById('vb-date').value;
  const payee = document.getElementById('vb-payee').value.trim();
  const idNo = document.getElementById('vb-id-no').value.trim();
  const paymentMethod = document.getElementById('vb-method').value;
  const account = document.getElementById('vb-account')?.value || (paymentMethod === 'Tunai' ? 'CASH' : 'BANK');
  const fund = document.getElementById('vb-fund')?.value || 'GENERAL';
  const category = document.getElementById('vb-category').value;

  const container = document.getElementById('vb-items-container');
  const rows = container.querySelectorAll('.vb-item-row');
  const items = [];
  let totalCents = 0;

  rows.forEach(row => {
    const desc = row.querySelector('.vb-item-desc').value.trim();
    const amt = parseFloat(row.querySelector('.vb-item-amt').value) || 0;
    if (desc && amt > 0) {
      items.push({ desc, amount: amt });
      totalCents += Math.round(amt * 100);
    }
  });

  const totalAmount = totalCents / 100;

  if (totalAmount <= 0 || items.length === 0) {
    alert('Sila masukkan sekurang-kurangnya satu item bayaran dengan jumlah melebihi RM 0.00.');
    return;
  }

  const combinedDesc = items.map(it => it.desc).join(', ');
  const payeeWithId = idNo ? `${payee} (No. K/P: ${idNo})` : payee;

  const data = {
    date,
    type: 'EXPENSE',
    category,
    amount: totalAmount,
    voucherNo,
    payeeOrPayer: payeeWithId,
    idNo,
    paymentMethod,
    account,
    fund,
    description: combinedDesc,
    items,
    receiptImage: currentVbReceiptImage,
    receiptFileName: currentVbReceiptFileName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    // 1. Simpan terus dalam rekod fail / pangkalan data
    if (db) {
      await db.transactions.add(data);
      allTransactions = await db.transactions.orderBy('date').reverse().toArray();
    } else {
      data.id = Date.now();
      allTransactions.unshift(data);
    }

    closeVoucherBuilderModal();
    renderApp();
    if (typeof pushTxToCloudIfEnabled === 'function') {
      pushTxToCloudIfEnabled(data);
    }

    // 2. Terus buka templat cetakan rasmi sedia print dan sign
    renderAndPrintVoucher(data, false);
  } catch (err) {
    alert('Ralat menyimpan baucar bayaran: ' + err.message);
  }
}

function handlePrintBlankVoucher() {
  closeVoucherBuilderModal();
  renderAndPrintVoucher({}, true);
}

// ----------------------------------------------------
// ENJIN CETAKAN BAUCAR BAYARAN & BUKU TUNAI
// ----------------------------------------------------
function renderAndPrintVoucher(data = {}, isBlank = false) {
  const tbody = document.getElementById('pv-items-tbody');
  tbody.innerHTML = '';

  const receiptSection = document.getElementById('pv-receipt-attachment');
  const receiptImg = document.getElementById('pv-receipt-image');

  if (isBlank) {
    document.getElementById('pv-voucher').textContent = 'MAA-BK-______-_____';
    document.getElementById('pv-date').textContent = '_____ / _____ / 2026';
    document.getElementById('pv-payee').textContent = '....................................................................................';
    document.getElementById('pv-id-no').textContent = '..................................................';
    document.getElementById('pv-method').textContent = '[  ] Tunai    [  ] Pindahan Bank    [  ] Cek';
    document.getElementById('pv-category').textContent = '..................................................';

    for (let i = 1; i <= 4; i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-center py-3.5">${i}</td>
        <td class="py-3.5 text-slate-300">........................................................................................................................</td>
        <td class="text-right py-3.5 text-slate-300">RM ......................</td>
      `;
      tbody.appendChild(tr);
    }

    document.getElementById('pv-total-amount').textContent = 'RM ......................';
    document.getElementById('pv-amount-in-words').textContent = 'Ringgit Malaysia: ...................................................................................................................................';
    document.getElementById('pv-sign-recipient').textContent = '......................................................';
    document.getElementById('pv-sign-recipient-id').textContent = 'No. K/P: .......................................';

    receiptImg.src = '';
    receiptSection.classList.add('hidden');
  } else {
    document.getElementById('pv-voucher').textContent = data.voucherNo || '-';
    document.getElementById('pv-date').textContent = data.date || '-';
    document.getElementById('pv-payee').textContent = data.payeeOrPayer || 'Tidak Dinyatakan';
    document.getElementById('pv-id-no').textContent = data.idNo || '-';
    document.getElementById('pv-method').textContent = data.paymentMethod || 'Tunai';
    document.getElementById('pv-category').textContent = data.category || '-';

    const items = data.items && data.items.length > 0 ? data.items : [
      { desc: data.description || `Bayaran untuk ${data.category}`, amount: data.amount }
    ];

    items.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-center py-3">${idx + 1}</td>
        <td class="py-3">${item.desc}</td>
        <td class="text-right font-bold py-3">${formatCurrency(item.amount)}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('pv-total-amount').textContent = formatCurrency(data.amount);
    document.getElementById('pv-amount-in-words').textContent = numberToWordsMY(data.amount);
    document.getElementById('pv-sign-recipient').textContent = data.payeeOrPayer || '......................................................';
    document.getElementById('pv-sign-recipient-id').textContent = data.idNo ? `No. K/P: ${data.idNo}` : 'No. K/P: .......................................';

    if (data.receiptImage) {
      receiptImg.src = data.receiptImage;
      receiptSection.classList.remove('hidden');
    } else {
      receiptImg.src = '';
      receiptSection.classList.add('hidden');
    }
  }

  const voucherPrint = document.getElementById('print-voucher-view');
  const cashbookPrint = document.getElementById('print-cashbook-view');
  const transferPrint = document.getElementById('print-transfer-view');

  voucherPrint?.classList.remove('hidden');
  cashbookPrint?.classList.add('hidden');
  transferPrint?.classList.add('hidden');

  window.print();
}

function openPaymentVoucherPrint(transactionId) {
  const tx = allTransactions.find(t => t.id === transactionId);
  if (!tx) {
    alert('Rekod transaksi tidak ditemui.');
    return;
  }
  renderAndPrintVoucher(tx, false);
}

// Cetak Penyata Buku Tunai 2-Lajur (Cash Book A4)
function handlePrintCashBook() {
  const year = document.getElementById('report-year')?.value;
  const month = document.getElementById('report-month')?.value;
  const fundScope = document.getElementById('report-fund')?.value || 'ALL';

  closeReportsModal();
  openCashBookPrint(year, month, fundScope);
}

function openCashBookPrint(year, month, fundScope = 'ALL') {
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

  const subtitleEl = document.getElementById('cb-fund-subtitle');
  if (subtitleEl) {
    if (fundScope === 'KHAIRAT') subtitleEl.textContent = 'PENYATA KHAS TABUNG KHAIRAT KEMATIAN';
    else if (fundScope === 'GENERAL') subtitleEl.textContent = 'PENYATA TABUNG AM MASJID';
    else subtitleEl.textContent = 'SEMUA DANA (BUKU TUNAI 2-LAJUR: TUNAI & BANK)';
  }

  // Tapis data mengikut tempoh dan skop tabung, susun menaik (Ascending)
  let filtered = filterTransactions(allTransactions, { year, month })
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  if (fundScope && fundScope !== 'ALL') {
    filtered = filtered.filter(item => resolveFund(item) === fundScope);
  }

  const tbody = document.getElementById('cb-table-body');
  tbody.innerHTML = '';

  let runningBalanceCents = 0;
  let sumCashInCents = 0;
  let sumBankInCents = 0;
  let sumCashOutCents = 0;
  let sumBankOutCents = 0;

  filtered.forEach(item => {
    const amountCents = Math.round(Number(item.amount) * 100);
    const acc = resolveAccount(item);
    const fund = resolveFund(item);

    let cashIn = 0;
    let bankIn = 0;
    let cashOut = 0;
    let bankOut = 0;

    if (item.type === 'INCOME' || item.type === 'OPENING_BALANCE') {
      if (acc === 'CASH') {
        cashIn = item.amount;
        sumCashInCents += amountCents;
      } else {
        bankIn = item.amount;
        sumBankInCents += amountCents;
      }
      runningBalanceCents += amountCents;
    } else if (item.type === 'EXPENSE') {
      if (acc === 'CASH') {
        cashOut = item.amount;
        sumCashOutCents += amountCents;
      } else {
        bankOut = item.amount;
        sumBankOutCents += amountCents;
      }
      runningBalanceCents -= amountCents;
    } else if (item.type === 'TRANSFER') {
      // Pindahan Kontra
      if (item.fromAccount === 'CASH') {
        cashOut = item.amount;
        sumCashOutCents += amountCents;
      } else {
        bankOut = item.amount;
        sumBankOutCents += amountCents;
      }

      if (item.toAccount === 'CASH') {
        cashIn = item.amount;
        sumCashInCents += amountCents;
      } else {
        bankIn = item.amount;
        sumBankInCents += amountCents;
      }
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="whitespace-nowrap">${item.date}</td>
      <td class="font-mono text-xs">${item.voucherNo || '-'}</td>
      <td class="text-xs font-semibold ${fund === 'KHAIRAT' ? 'text-amber-800' : 'text-slate-600'}">${fund === 'KHAIRAT' ? 'Khairat' : 'Am'}</td>
      <td>
        <div class="font-medium">${item.payeeOrPayer ? `<strong>${item.payeeOrPayer}</strong>` : (item.category || '-')}</div>
        <div class="text-[10px] text-slate-500">${item.description || ''}</div>
      </td>
      <td class="text-right ${cashIn > 0 ? 'font-semibold text-teal-700' : 'text-slate-300'}">${cashIn > 0 ? formatCurrency(cashIn) : '-'}</td>
      <td class="text-right ${bankIn > 0 ? 'font-semibold text-sky-700' : 'text-slate-300'}">${bankIn > 0 ? formatCurrency(bankIn) : '-'}</td>
      <td class="text-right ${cashOut > 0 ? 'font-semibold text-rose-700' : 'text-slate-300'}">${cashOut > 0 ? formatCurrency(cashOut) : '-'}</td>
      <td class="text-right ${bankOut > 0 ? 'font-semibold text-rose-700' : 'text-slate-300'}">${bankOut > 0 ? formatCurrency(bankOut) : '-'}</td>
      <td class="text-right font-bold text-slate-900">${formatCurrency(runningBalanceCents / 100)}</td>
    `;
    tbody.appendChild(tr);
  });

  const sumCashInEl = document.getElementById('cb-sum-cash-in');
  const sumBankInEl = document.getElementById('cb-sum-bank-in');
  const sumCashOutEl = document.getElementById('cb-sum-cash-out');
  const sumBankOutEl = document.getElementById('cb-sum-bank-out');
  const sumBalanceEl = document.getElementById('cb-sum-balance');

  if (sumCashInEl) sumCashInEl.textContent = formatCurrency(sumCashInCents / 100);
  if (sumBankInEl) sumBankInEl.textContent = formatCurrency(sumBankInCents / 100);
  if (sumCashOutEl) sumCashOutEl.textContent = formatCurrency(sumCashOutCents / 100);
  if (sumBankOutEl) sumBankOutEl.textContent = formatCurrency(sumBankOutCents / 100);
  if (sumBalanceEl) sumBalanceEl.textContent = formatCurrency(runningBalanceCents / 100);

  // Sediakan paparan cetak
  const voucherPrint = document.getElementById('print-voucher-view');
  const cashbookPrint = document.getElementById('print-cashbook-view');
  const transferPrint = document.getElementById('print-transfer-view');

  voucherPrint?.classList.add('hidden');
  transferPrint?.classList.add('hidden');
  cashbookPrint?.classList.remove('hidden');

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

// ----------------------------------------------------
// KESELAMATAN PIN & KAWALAN PERANTI (MOBILE & DESKTOP)
// ----------------------------------------------------
function checkSecurityPinLock() {
  const pinScreen = document.getElementById('screen-pin-lock');
  if (!pinScreen) return;

  if (typeof isDeviceUnlocked === 'function' && isDeviceUnlocked()) {
    pinScreen.classList.add('hidden');
  } else {
    pinScreen.classList.remove('hidden');
    const input = document.getElementById('pin-input-screen');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 100);
    }
  }
}

function handleUnlockApp() {
  const pinInput = document.getElementById('pin-input-screen');
  const errorMsg = document.getElementById('pin-screen-error');
  const rememberCheckbox = document.getElementById('pin-remember-device');
  const val = (pinInput?.value || '').trim();

  if (typeof verifyPin === 'function' && verifyPin(val)) {
    if (errorMsg) errorMsg.classList.add('hidden');
    if (rememberCheckbox?.checked && typeof setDeviceUnlocked === 'function') {
      setDeviceUnlocked(true);
    }
    const pinScreen = document.getElementById('screen-pin-lock');
    if (pinScreen) pinScreen.classList.add('hidden');

    // Segerak terus jika awan diaktifkan
    if (typeof isCloudEnabled === 'function' && isCloudEnabled()) {
      syncWithCloudSilently();
    }
  } else {
    if (errorMsg) {
      errorMsg.textContent = 'Kod PIN salah. Sila masukkan PIN yang sah.';
      errorMsg.classList.remove('hidden');
    }
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
  }
}

function handleLockApp() {
  if (typeof setDeviceUnlocked === 'function') {
    setDeviceUnlocked(false);
  }
  const pinScreen = document.getElementById('screen-pin-lock');
  const pinInput = document.getElementById('pin-input-screen');
  const errorMsg = document.getElementById('pin-screen-error');
  if (errorMsg) errorMsg.classList.add('hidden');
  if (pinInput) pinInput.value = '';
  if (pinScreen) {
    pinScreen.classList.remove('hidden');
    setTimeout(() => pinInput?.focus(), 100);
  }
}

function setupPinKeypad() {
  const pinInput = document.getElementById('pin-input-screen');
  document.querySelectorAll('.pin-key').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!pinInput) return;
      const key = btn.getAttribute('data-key');
      if (key === 'clear') {
        pinInput.value = '';
      } else if (key === 'backspace') {
        pinInput.value = pinInput.value.slice(0, -1);
      } else if (key !== null) {
        if (pinInput.value.length < 8) {
          pinInput.value += key;
        }
      }
      if (pinInput.value.length === 6) {
        handleUnlockApp();
      }
    });
  });

  pinInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleUnlockApp();
    }
  });

  document.getElementById('btn-submit-screen-pin')?.addEventListener('click', handleUnlockApp);
  document.getElementById('btn-lock-app')?.addEventListener('click', handleLockApp);
}

// ----------------------------------------------------
// PENGURUSAN TETAPAN AWAN (FIREBASE & SYNC)
// ----------------------------------------------------
function openCloudSettingsModal() {
  const modal = document.getElementById('modal-cloud-settings');
  if (!modal) return;

  const cfg = (typeof getCloudConfig === 'function' ? getCloudConfig() : null) || {};
  const toggle = document.getElementById('cloud-toggle-enable');
  const projectIdInput = document.getElementById('cloud-input-project-id');
  const apiKeyInput = document.getElementById('cloud-input-api-key');

  if (toggle) toggle.checked = !!cfg.enabled;
  if (projectIdInput) projectIdInput.value = cfg.projectId || '';
  if (apiKeyInput) apiKeyInput.value = cfg.apiKey || '';

  const connected = typeof isCloudEnabled === 'function' && isCloudEnabled();
  updateCloudBadgeUI(connected);

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeCloudSettingsModal() {
  const modal = document.getElementById('modal-cloud-settings');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function updateCloudBadgeUI(connected) {
  const badge = document.getElementById('cloud-status-badge');
  if (!badge) return;
  if (connected) {
    badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Disambung ke Awan';
  } else {
    badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-400"></span> Belum Disambung';
  }
}

async function handleSaveCloudConfig() {
  const toggle = document.getElementById('cloud-toggle-enable');
  const projectId = document.getElementById('cloud-input-project-id')?.value.trim() || '';
  const apiKey = document.getElementById('cloud-input-api-key')?.value.trim() || '';

  const config = {
    enabled: !!toggle?.checked,
    projectId,
    apiKey
  };

  if (config.enabled && typeof validateCloudConfig === 'function') {
    const val = validateCloudConfig(config);
    if (!val.isValid) {
      alert('Sila lengkapkan tetapan: ' + val.message);
      return;
    }
  }

  if (typeof saveCloudConfig === 'function') {
    saveCloudConfig(config);
  }

  if (config.enabled) {
    const btn = document.getElementById('btn-save-cloud-config');
    try {
      if (btn) btn.disabled = true;
      const count = await syncWithCloudSilently();
      updateCloudBadgeUI(true);
      alert(`Sambungan Berjaya! Diselaraskan dengan ${count || 0} rekod dari awan.`);
    } catch (err) {
      updateCloudBadgeUI(false);
      alert('Gagal menyambung ke Firebase Firestore: ' + err.message);
    } finally {
      if (btn) btn.disabled = false;
    }
  } else {
    updateCloudBadgeUI(false);
    alert('Penyegerakan awan telah disimpan (mod luar talian aktif).');
  }
}

function handleChangePinSubmit() {
  const currentPin = document.getElementById('pin-input-current')?.value.trim();
  const newPin = document.getElementById('pin-input-new')?.value.trim();
  const statusEl = document.getElementById('pin-change-status');

  if (typeof verifyPin === 'function' && !verifyPin(currentPin)) {
    if (statusEl) {
      statusEl.textContent = 'PIN semasa salah!';
      statusEl.className = 'text-xs font-semibold text-rose-600';
    }
    return;
  }

  if (!newPin || newPin.length < 4) {
    if (statusEl) {
      statusEl.textContent = 'PIN baharu mesti sekurang-kurangnya 4 digit!';
      statusEl.className = 'text-xs font-semibold text-rose-600';
    }
    return;
  }

  if (typeof setStoredPin === 'function') {
    setStoredPin(newPin);
  }

  if (statusEl) {
    statusEl.textContent = 'PIN berjaya ditukar!';
    statusEl.className = 'text-xs font-semibold text-emerald-600';
  }
  const currInput = document.getElementById('pin-input-current');
  const newInput = document.getElementById('pin-input-new');
  if (currInput) currInput.value = '';
  if (newInput) newInput.value = '';
}

async function syncWithCloudSilently() {
  if (typeof isCloudEnabled !== 'function' || !isCloudEnabled()) return 0;
  try {
    const config = getCloudConfig();
    const cloudDocs = await fetchCloudTransactions(config);
    if (!cloudDocs || !cloudDocs.length) return 0;

    if (db) {
      for (const doc of cloudDocs) {
        if (!doc.voucherNo) continue;
        const existing = await db.transactions.where('voucherNo').equals(doc.voucherNo).first();
        if (existing) {
          await db.transactions.update(existing.id, doc);
        } else {
          await db.transactions.add(doc);
        }
      }
      allTransactions = await db.transactions.orderBy('date').reverse().toArray();
      renderApp();
    }
    return cloudDocs.length;
  } catch (err) {
    console.warn('Penyegerakan awan latar belakang gagal:', err.message);
    return 0;
  }
}

async function pushTxToCloudIfEnabled(tx) {
  if (typeof isCloudEnabled !== 'function' || !isCloudEnabled()) return;
  try {
    const config = getCloudConfig();
    await pushTransactionToCloud(tx, config);
  } catch (err) {
    console.warn('Gagal menghantar rekod ke awan:', err.message);
  }
}

// ----------------------------------------------------
// PENGURUSAN PINDAHAN DANA (TRANSFER / KONTRA)
// ----------------------------------------------------
let currentTransferReceiptImage = null;
let currentTransferReceiptFileName = '';

function openTransferModal() {
  const modal = document.getElementById('modal-transfer');
  const form = document.getElementById('form-transfer');
  form?.reset();

  currentTransferReceiptImage = null;
  currentTransferReceiptFileName = '';
  updateTransferReceiptPreviewUI();

  const currentYear = new Date().getFullYear();
  const dateInput = document.getElementById('transfer-date');
  const voucherInput = document.getElementById('transfer-voucher');

  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  if (voucherInput) {
    const seq = allTransactions.filter(t => t.type === 'TRANSFER').length + 1;
    voucherInput.value = generateVoucherNo('TRANSFER', currentYear, seq);
  }

  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
  initIcons();
}

function closeTransferModal() {
  const modal = document.getElementById('modal-transfer');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

async function handleTransferReceiptFileSelect(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  try {
    const filenameLabel = document.getElementById('transfer-receipt-filename');
    if (filenameLabel) filenameLabel.textContent = 'Memampatkan slip...';
    currentTransferReceiptImage = await compressReceiptImage(file, 1200, 0.75);
    currentTransferReceiptFileName = file.name;
    updateTransferReceiptPreviewUI();
  } catch (err) {
    alert('Ralat memproses imej slip: ' + err.message);
  }
}

function removeTransferReceiptImage() {
  currentTransferReceiptImage = null;
  currentTransferReceiptFileName = '';
  const fileInput = document.getElementById('transfer-receipt-file');
  if (fileInput) fileInput.value = '';
  updateTransferReceiptPreviewUI();
}

function updateTransferReceiptPreviewUI() {
  const container = document.getElementById('transfer-preview-container');
  const img = document.getElementById('transfer-preview-img');
  const filenameLabel = document.getElementById('transfer-receipt-filename');

  if (!container || !img || !filenameLabel) return;

  if (currentTransferReceiptImage) {
    img.src = currentTransferReceiptImage;
    container.classList.remove('hidden');
    filenameLabel.textContent = currentTransferReceiptFileName || 'Slip Dilampirkan';
  } else {
    img.src = '';
    container.classList.add('hidden');
    filenameLabel.textContent = 'Tiada fail dipilih';
  }
  initIcons();
}

async function handleTransferSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('transfer-date').value;
  const voucherNo = document.getElementById('transfer-voucher').value.trim();
  const fromAccount = document.getElementById('transfer-from-account').value;
  const toAccount = document.getElementById('transfer-to-account').value;
  const fromFund = document.getElementById('transfer-from-fund').value;
  const toFund = document.getElementById('transfer-to-fund').value;
  const amount = parseFloat(document.getElementById('transfer-amount').value);
  const description = document.getElementById('transfer-desc').value.trim();

  const fromLabel = fromAccount === 'CASH' ? 'Tunai' : 'Bank';
  const toLabel = toAccount === 'CASH' ? 'Tunai' : 'Bank';

  const data = {
    date,
    type: 'TRANSFER',
    category: 'Pindahan Dana Kontra',
    amount,
    voucherNo,
    fromAccount,
    toAccount,
    fromFund,
    toFund,
    account: toAccount,
    fund: toFund,
    payeeOrPayer: `Pindahan: ${fromLabel} ➔ ${toLabel}`,
    paymentMethod: 'Pindahan Kontra',
    description: description || `Pindahan dana kontra antara akaun masjid (${fromLabel} ke ${toLabel})`,
    receiptImage: currentTransferReceiptImage,
    receiptFileName: currentTransferReceiptFileName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const validation = validateTransaction(data);
  if (!validation.isValid) {
    alert('Sila lengkapkan maklumat:\n- ' + validation.errors.join('\n- '));
    return;
  }

  try {
    if (db) {
      await db.transactions.add(data);
      allTransactions = await db.transactions.orderBy('date').reverse().toArray();
    } else {
      data.id = Date.now();
      allTransactions.unshift(data);
    }

    closeTransferModal();
    renderApp();

    if (typeof pushTxToCloudIfEnabled === 'function') {
      pushTxToCloudIfEnabled(data);
    }

    if (confirm('Pindahan kontra berjaya disimpan!\nAdakah anda ingin mencetak Baucar Pindahan Dana sekarang?')) {
      renderAndPrintTransferVoucher(data);
    }
  } catch (err) {
    alert('Ralat menyimpan pindahan: ' + err.message);
  }
}

function renderAndPrintTransferVoucher(data = {}) {
  const pFrom = document.getElementById('ptv-from');
  const pTo = document.getElementById('ptv-to');
  const pFunds = document.getElementById('ptv-funds');
  const pVoucher = document.getElementById('ptv-voucher');
  const pDate = document.getElementById('ptv-date');
  const pDesc = document.getElementById('ptv-description');
  const pAmount = document.getElementById('ptv-amount');
  const pTotal = document.getElementById('ptv-total-amount');
  const pWords = document.getElementById('ptv-amount-in-words');
  const receiptImg = document.getElementById('ptv-receipt-image');
  const receiptSec = document.getElementById('ptv-receipt-attachment');

  const fromAccLabel = data.fromAccount === 'CASH' ? 'Tunai di Tangan (Peti Besi)' : 'Akaun Bank Masjid';
  const toAccLabel = data.toAccount === 'CASH' ? 'Tunai di Tangan (Peti Besi)' : 'Akaun Bank Masjid';
  const fromFundLabel = data.fromFund === 'KHAIRAT' ? 'Tabung Khairat' : 'Tabung Am';
  const toFundLabel = data.toFund === 'KHAIRAT' ? 'Tabung Khairat' : 'Tabung Am';

  if (pFrom) pFrom.textContent = fromAccLabel;
  if (pTo) pTo.textContent = toAccLabel;
  if (pFunds) pFunds.textContent = `${fromFundLabel} ➔ ${toFundLabel}`;
  if (pVoucher) pVoucher.textContent = data.voucherNo || '-';
  if (pDate) pDate.textContent = data.date || '-';
  if (pDesc) pDesc.textContent = data.description || 'Pindahan Dana Kontra Antara Akaun Masjid';
  if (pAmount) pAmount.textContent = formatCurrency(data.amount || 0);
  if (pTotal) pTotal.textContent = formatCurrency(data.amount || 0);
  if (pWords) pWords.textContent = numberToWordsMY(data.amount || 0);

  if (data.receiptImage) {
    if (receiptImg) receiptImg.src = data.receiptImage;
    if (receiptSec) receiptSec.classList.remove('hidden');
  } else {
    if (receiptImg) receiptImg.src = '';
    if (receiptSec) receiptSec.classList.add('hidden');
  }

  document.getElementById('print-voucher-view')?.classList.add('hidden');
  document.getElementById('print-cashbook-view')?.classList.add('hidden');
  document.getElementById('print-transfer-view')?.classList.remove('hidden');

  window.print();
}

// ----------------------------------------------------
// PENGURUSAN BAKI AWAL (OPENING BALANCE)
// ----------------------------------------------------
function openOpeningBalanceModal() {
  const modal = document.getElementById('modal-opening-balance');
  const dateInput = document.getElementById('ob-date');
  const cashInput = document.getElementById('ob-cash');
  const bankInput = document.getElementById('ob-bank');
  const khairatInput = document.getElementById('ob-khairat');

  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  const summary = calculateSummary(allTransactions);
  if (cashInput && !cashInput.value && summary.cashBalance > 0) cashInput.value = summary.cashBalance;
  if (bankInput && !bankInput.value && summary.bankBalance > 0) bankInput.value = summary.bankBalance;
  if (khairatInput && !khairatInput.value && summary.khairatBalance > 0) khairatInput.value = summary.khairatBalance;

  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
  initIcons();
}

function closeOpeningBalanceModal() {
  const modal = document.getElementById('modal-opening-balance');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

async function handleOpeningBalanceSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('ob-date').value;
  const cashAmt = parseFloat(document.getElementById('ob-cash').value) || 0;
  const bankAmt = parseFloat(document.getElementById('ob-bank').value) || 0;
  const khairatAmt = parseFloat(document.getElementById('ob-khairat').value) || 0;
  const notes = document.getElementById('ob-notes').value.trim();

  const currentYear = date ? new Date(date).getFullYear() : new Date().getFullYear();
  const createdRecords = [];

  if (cashAmt > 0) {
    createdRecords.push({
      date,
      type: 'INCOME',
      category: 'Baki Awal / Bawa Ke Hadapan',
      amount: cashAmt,
      voucherNo: generateVoucherNo('INCOME', currentYear, Math.floor(Math.random() * 800) + 9000),
      payeeOrPayer: 'Baki Bawa Ke Hadapan (Tunai di Tangan)',
      paymentMethod: 'Tunai',
      account: 'CASH',
      fund: 'GENERAL',
      description: notes || 'Baki awal pegangan tunai di tangan masjid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  const bankGeneralAmt = Math.max(0, bankAmt - khairatAmt);
  if (bankGeneralAmt > 0) {
    createdRecords.push({
      date,
      type: 'INCOME',
      category: 'Baki Awal / Bawa Ke Hadapan',
      amount: bankGeneralAmt,
      voucherNo: generateVoucherNo('INCOME', currentYear, Math.floor(Math.random() * 800) + 9000),
      payeeOrPayer: 'Baki Bawa Ke Hadapan (Bank - Tabung Am)',
      paymentMethod: 'Pindahan Bank (Online)',
      account: 'BANK',
      fund: 'GENERAL',
      description: notes || 'Baki awal akaun bank masjid (Tabung Am)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  if (khairatAmt > 0) {
    createdRecords.push({
      date,
      type: 'INCOME',
      category: 'Baki Awal / Bawa Ke Hadapan',
      amount: khairatAmt,
      voucherNo: generateVoucherNo('INCOME', currentYear, Math.floor(Math.random() * 800) + 9000),
      payeeOrPayer: 'Baki Bawa Ke Hadapan (Tabung Khairat)',
      paymentMethod: 'Pindahan Bank (Online)',
      account: 'BANK',
      fund: 'KHAIRAT',
      description: notes || 'Baki awal hak milik Tabung Khairat Kematian',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  if (createdRecords.length === 0) {
    alert('Sila masukkan sekurang-kurangnya satu jumlah baki (Tunai atau Bank).');
    return;
  }

  try {
    if (db) {
      for (const rec of createdRecords) {
        await db.transactions.add(rec);
      }
      allTransactions = await db.transactions.orderBy('date').reverse().toArray();
    } else {
      for (const rec of createdRecords) {
        rec.id = Date.now() + Math.random();
        allTransactions.unshift(rec);
      }
    }

    closeOpeningBalanceModal();
    renderApp();

    for (const rec of createdRecords) {
      if (typeof pushTxToCloudIfEnabled === 'function') {
        pushTxToCloudIfEnabled(rec);
      }
    }

    alert(`Berjaya menetapkan Baki Awal:\n- Tunai: ${formatCurrency(cashAmt)}\n- Bank: ${formatCurrency(bankAmt)}\n(Termasuk Khairat: ${formatCurrency(khairatAmt)})`);
  } catch (err) {
    alert('Ralat menetapkan baki awal: ' + err.message);
  }
}

// Dedahkan ke window untuk rujukan global
if (typeof window !== 'undefined') {
  window.MasjidApp = {
    allTransactions,
    renderApp,
    openPaymentVoucherPrint,
    openCashBookPrint,
    openVoucherBuilderModal,
    renderAndPrintVoucher,
    openTransferModal,
    closeTransferModal,
    renderAndPrintTransferVoucher,
    openOpeningBalanceModal,
    closeOpeningBalanceModal,
    handleUnlockApp,
    handleLockApp,
    openCloudSettingsModal,
    closeCloudSettingsModal
  };
}
