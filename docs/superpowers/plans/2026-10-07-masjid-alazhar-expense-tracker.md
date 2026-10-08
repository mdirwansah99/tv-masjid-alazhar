# Sistem Pengurusan Kewangan & Expense Tracker Masjid Al-Azhar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membina aplikasi web luar talian (Offline-First Single-Page Application) lengkap untuk Bendahari Masjid Al-Azhar Kampung Sepakat Jaya Sepanggar yang membolehkan rekod duit masuk/keluar, lampiran gambar resit, papan pemuka baki, cetakan A4 Baucar Bayaran & Penyata Audit, serta sandaran data.

**Architecture:** Menggunakan arkitektur Single-Page Web Modular (HTML5 + TailwindCSS + Dexie.js IndexedDB + CSS Print Media). Data transaksi dan imej resit disimpan selamat dalam IndexedDB tempatan pengguna tanpa memerlukan pelayan belakang (serverless), dengan sokongan eksport/import JSON untuk sandaran.

**Tech Stack:** HTML5, Modern Vanilla JavaScript (ES6+), TailwindCSS (CDN), Lucide Icons, Dexie.js (IndexedDB), Canvas API (Image Compression), Node.js + Playwright (Automated Test Verification).

**Spec:** `docs/superpowers/specs/2026-10-07-masjid-alazhar-expense-tracker-design.md`

## Global Constraints

- Sifar konfigurasi pelayan rumit: Aplikasi mesti boleh dibuka terus melalui pelayar web (cth: klik `index.html` atau melalui local server).
- Simpanan data tidak terhad kepada had 5MB: Menggunakan IndexedDB untuk imej resit.
- Mesra cetak A4: Format Baucar Bayaran dan Buku Tunai mesti muat elok dalam saiz kertas A4 standard tanpa elemen UI web (butang, navigasi) apabila dicetak.
- Nilai mata wang sentiasa dalam format Ringgit Malaysia (RM) dengan 2 tempat perpuluhan yang tepat.

## Review Focus

1. Fail imej resit bersaiz besar dimampatkan (compressed via Canvas) sebelum disimpan ke IndexedDB bagi mengelakkan memori pelayar membazir.
2. Pengiraan baki kumulatif (Wang Masuk - Wang Keluar) sentiasa tepat dan tidak menghasilkan ralat titik perpuluhan (floating point inaccuracy).
3. Penjanaan nombor baucar automatik mengikut turutan tahun semasa (cth: `MAA-BK-2026-0001` untuk belanja, `MAA-BM-2026-0001` untuk masuk).
4. Cetakan A4 Baucar Bayaran merangkumi maklumat masjid, butiran bayaran, ruang 3 tandatangan (Bendahari, Pengerusi, Penerima), dan lampiran resit pada halaman yang kemas.
5. Fungsi sandaran data (Backup JSON) mengeksport semua rekod beserta imej resit, dan fungsi import memulihkan semula data secara tepat.

---

### Task 1: Storan Pangkalan Data Tempatan & Utiliti Mampatan Resit (`db.js`)

**Files:**
- Create: `expense-tracker/db.js`
- Test: `test/test-expense-db.js`

**Interfaces:**
- Produces:
  - `initDB()`: Inisialisasi Dexie database (`MasjidAlAzharFinanceDB`).
  - `addTransaction(data)`: Menyimpan transaksi baru (Masuk/Keluar) bersama nombor baucar auto.
  - `getAllTransactions(filters)`: Mengambil senarai transaksi mengikut bulan/kategori/jenis.
  - `getTransactionById(id)`: Mengambil satu transaksi lengkap dengan imej resit.
  - `deleteTransaction(id)`: Memadam transaksi.
  - `compressReceiptImage(file, maxWidth, quality)`: Memampatkan imej resit kepada Base64 DataURL yang ringan.
  - `exportBackupData()`: Menjana objek sandaran JSON lengkap.
  - `importBackupData(jsonData)`: Memulihkan rekod dari JSON.
  - `getFinancialSummary()`: Mengira Jumlah Masuk, Jumlah Keluar, dan Baki Bersih.

- [ ] **Step 1: Tulis ujian unit untuk `db.js`**
  Cipta `test/test-expense-db.js` untuk menguji operasi pangkalan data logik dan pengiraan ringkasan kewangan.
- [ ] **Step 2: Jalankan ujian untuk sahkan ia gagal**
  Jalankan `node test/test-expense-db.js` (dijangka gagal kerana `db.js` belum wujud).
- [ ] **Step 3: Bina `expense-tracker/db.js`**
  Lengkapkan skema Dexie.js, fungsi kompresi imej, penomboran baucar automatik, dan pengiraan kewangan.
- [ ] **Step 4: Jalankan ujian semula untuk sahkan lulus**
  Jalankan `node test/test-expense-db.js` dan pastikan kesemua kes ujian lulus.
- [ ] **Step 5: Komit kod Task 1**

---

### Task 2: Antaramuka Pengguna Papan Pemuka & Borang Transaksi (`index.html`)

**Files:**
- Create: `expense-tracker/index.html`
- Create: `expense-tracker/styles.css`
- Modify: `expense-tracker/app.js`

**Interfaces:**
- Consumes: Fungsi dari `db.js`.
- Produces:
  - Header Masjid Al-Azhar Kampung Sepakat Jaya Sepanggar.
  - Kad Ringkasan (Baki Semasa, Jumlah Masuk, Jumlah Keluar).
  - Borang Modal "Tambah Transaksi" (Pilihan Wang Masuk / Wang Keluar, input kategori, jumlah, tarikh, nama penerima/penyumbang, muat naik gambar resit dengan pra-tonton).
  - Jadual Senarai Transaksi Terkini lengkap dengan penapis (Bulan, Tahun, Kategori, Jenis).
  - Modal Paparan Resit Penuh (Pratonton imej resit beresolusi tinggi).

- [ ] **Step 1: Sediakan susun atur HTML & CSS responsif**
  Bina `expense-tracker/index.html` menggunakan Tailwind CSS, fon kemas, dan komponen mesra pengguna (laptop & telefon).
- [ ] **Step 2: Sambungkan borang transaksi dengan `app.js`**
  Sambungkan fungsi tambah transaksi, input fail imej kamera/galeri, pengiraan pantas baki, dan senarai jadual.
- [ ] **Step 3: Pasang modal pratonton resit dan butang padam/kemaskini**
- [ ] **Step 4: Uji interaksi asas borang dan penyimpanan resit**
- [ ] **Step 5: Komit kod Task 2**

---

### Task 3: Enjin Cetakan A4 Mesra Audit (Baucar Bayaran & Buku Tunai Penyata Aliran Tunai)

**Files:**
- Create: `expense-tracker/print.css`
- Modify: `expense-tracker/index.html`
- Modify: `expense-tracker/app.js`

**Interfaces:**
- Produces:
  - `openPaymentVoucherPrint(transactionId)`: Membuka paparan Baucar Bayaran rasmi saiz A4 untuk dicetak atau disimpan sebagai PDF.
  - `openMonthlyStatementPrint(year, month)`: Membuka paparan Penyata Buku Tunai bulanan/tahunan lengkap dengan lajur Masuk, Keluar, Baki dan ruang tandatangan Juruaudit.
  - Susun atur cetakan `@media print` yang menyembunyikan semua butang navigasi web dan melaraskan margin kertas A4.

- [ ] **Step 1: Bina templat HTML Baucar Bayaran Rasmi (Payment Voucher)**
  Sertakan kepala surat Masjid Al-Azhar Kg Sepakat Jaya Sepanggar, No. Baucar, Tarikh, Penerima, Kaedah Bayaran, Keterangan, Jumlah RM (nombor dan ejaan ringkas), ruang tandatangan (Bendahari, Pengerusi, Penerima), dan lampiran imej resit di bahagian bawah.
- [ ] **Step 2: Bina templat HTML Penyata Buku Tunai Bulanan/Tahunan**
  Format jadual lajur kemas (Tarikh, No Baucar, Butiran, Masuk, Keluar, Baki) dan ruang perakuan Juruaudit Dalaman.
- [ ] **Step 3: Konfigurasi `print.css` untuk cetakan A4 sempurna**
- [ ] **Step 4: Uji paparan cetakan melalui fungsi pelayar**
- [ ] **Step 5: Komit kod Task 3**

---

### Task 4: Modul Sandaran & Pemulihan Data (Backup & Restore) serta Verifikasi Menyeluruh

**Files:**
- Modify: `expense-tracker/app.js`
- Create: `test/test-expense-e2e.js`

**Interfaces:**
- Produces:
  - Butang "Eksport Sandaran (Backup JSON)" yang memuat turun fail sandaran lengkap dengan tarikh/masa.
  - Butang "Pulihkan Sandaran (Restore JSON)" yang mengesahkan format fail dan memulihkan data ke IndexedDB.
  - Ujian automasi Playwright E2E mengesahkan aliran lengkap daripada merekod belanja -> muat naik resit -> semak baki -> pratonton cetak baucar -> sandaran data.

- [ ] **Step 1: Bina fungsi UI Export & Import Backup di `app.js`**
- [ ] **Step 2: Tulis skrip ujian Playwright E2E di `test/test-expense-e2e.js`**
- [ ] **Step 3: Jalankan ujian E2E secara senyap (`node test/test-expense-e2e.js`)**
- [ ] **Step 4: Pastikan kesemua ujian lulus 100% dan tiada ralat**
- [ ] **Step 5: Komit kod Task 4**
