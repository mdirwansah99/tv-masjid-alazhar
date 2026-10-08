# Spesifikasi Reka Bentuk: Sistem Pengurusan Kewangan & Expense Tracker Masjid Al-Azhar Kg Sepakat Jaya Sepanggar

## 1. Pengenalan & Matlamat Projek
Sistem ini dibina khas untuk memudahkan Bendahari dan Jawatankuasa Masjid Al-Azhar Kampung Sepakat Jaya, Sepanggar dalam mengurus rekod aliran tunai masjid secara telus, tersusun, dan mesra audit.

Aplikasi ini beroperasi secara **Luar Talian (Offline-First Standalone Web App)** tanpa memerlukan sebarang pelayan web yang rumit, membolehkan Bendahari menggunakannya terus pada komputer riba atau peranti mudah alih dengan simpanan data tempatan yang selamat serta sokongan cetakan rasmi A4.

---

## 2. Arkitektur & Teknologi

- **Antaramuka (Frontend UI):** Single Page Application (HTML5, TailwindCSS CDN, Lucide Icons CDN, Google Fonts Inter/Amiri).
- **Storan Data Tempatan (Storage):** IndexedDB melalui Dexie.js (v3/v4 CDN) bagi membolehkan penyimpanan data transaksi dan fail imej resit beresolusi tinggi tanpa batasan 5MB LocalStorage.
- **Enjin Cetakan (Print Engine):** CSS Print Media (`@media print`) khusus untuk kertas saiz A4 piawai, menghasilkan:
  1. **Baucar Bayaran Rasmi (Payment Voucher)** bersama lampiran imej resit.
  2. **Buku Tunai / Penyata Aliran Tunai Bulanan & Tahunan** mengikut standard perakaunan masjid.
  3. **Laporan Ringkasan Kategori Perbelanjaan & Pendapatan**.
- **Sandaran & Pemulihan (Backup & Restore):** Eksport dan import fail JSON sandaran lengkap (termasuk imej resit Base64/Blob) untuk menjamin keselamatan data bendahari.

---

## 3. Komponen & Struktur Sistem

Direktori sistem akan ditempatkan di:
`expense-tracker/` (atau fail kendiri `expense-tracker/index.html`, `expense-tracker/app.js`, `expense-tracker/styles.css`).

### 3.1 Skema Data (IndexedDB - Dexie.js)
- **Table: `transactions`**
  - `id` (Auto-increment integer)
  - `voucherNo` (String, cth: `MAA-BK-2026-0001` untuk Keluar, `MAA-BM-2026-0001` untuk Masuk)
  - `date` (ISO Date YYYY-MM-DD)
  - `type` (`INCOME` / `EXPENSE`)
  - `category` (String, cth: `Infaq Jumaat`, `Tabung Am`, `Utiliti`, `Penyelenggaraan`, `Elaun Petugas`, `Program Dakwah`)
  - `amount` (Number, dalam RM dua tempat perpuluhan)
  - `payeeOrPayer` (String: Nama penerima atau penyumbang)
  - `paymentMethod` (String: `Tunai`, `Pindahan Bank`, `Cek`, `DuitNow QR`)
  - `description` (Text ringkas butiran transaksi)
  - `receiptImage` (Base64 data URL atau Blob bagi imej resit/invois)
  - `receiptFileName` (String)
  - `createdAt` (Timestamp)
  - `updatedAt` (Timestamp)

- **Table: `settings`**
  - Maklumat masjid: Nama, Alamat penuh, No. Pendaftaran, Nama Pengerusi/Imam, Nama Bendahari.

---

## 4. Aliran Kerja Pengguna (User Flows)

### 4.1 Merekod Duit Keluar (Belanja)
1. Bendahari klik "Tambah Duit Keluar / Baucar Bayaran".
2. Sistem mencadangkan nombor baucar automatik (cth: `MAA-BK-2026-0005`).
3. Bendahari mengisi tarikh, kategori belanja, jumlah RM, nama penerima/pembekal, kaedah bayaran, dan butiran ringkas.
4. Bendahari memuat naik atau menangkap gambar resit/invois fizikal.
5. Tekan "Simpan Transaksi". Baki terkini dikemas kini serta-merta.

### 4.2 Merekod Duit Masuk (Kutipan/Infaq)
1. Bendahari klik "Tambah Duit Masuk".
2. Masukkan tarikh, kategori (cth: Tabung Jumaat, Derma Kematian), jumlah RM, dan catatan.
3. Muat naik slip deposit bank / resit (pilihan).
4. Tekan "Simpan Transaksi".

### 4.3 Cetakan Baucar Bayaran (Audit Ready)
1. Pada senarai transaksi, klik ikon cetak pada baris transaksi belanja.
2. Mod cetak membuka paparan **Baucar Bayaran Rasmi**:
   - Kepala surat (Letterhead) Masjid Al-Azhar Kampung Sepakat Jaya Sepanggar.
   - Maklumat baucar: No. Baucar, Tarikh, Penerima, Kaedah Bayaran, Butiran & Jumlah RM (dalam angka dan perkataan).
   - Petak tandatangan: Disediakan oleh (Bendahari), Disemak/Disahkan oleh (Pengerusi/Imam), Diterima oleh (Penerima).
   - Bahagian lampiran resit asal dipaparkan di bawah atau muka surat seterusnya.
3. Bendahari boleh tekan butang Cetak / Simpan sebagai PDF terus dari pelayar.

### 4.4 Cetakan Penyata Aliran Tunai & Audit Bulanan/Tahunan
1. Bendahari memilih tempoh (Bulan & Tahun, atau Julat Tarikh).
2. Sistem menjana Buku Tunai terperinci:
   - Lajur: Tarikh | No. Rujukan | Keterangan / Penerima | Masuk (RM) | Keluar (RM) | Baki (RM)
   - Ringkasan Jumlah Masuk, Jumlah Keluar, dan Baki Akhir.
   - Ruang perakuan dan tandatangan rasmi Juruaudit Dalaman Masjid.
3. Tekan cetak ke saiz A4.

### 4.5 Sandaran & Pulihkan Data (Backup & Restore)
1. Butang "Sandaran Data (Export JSON)": Muat turun fail `.json` dengan tarikh dan masa.
2. Butang "Muat Semula Data (Import JSON)": Untuk memulihkan rekod sekiranya bertukar komputer atau komputer dibersihkan.

---

## 5. Pelan Pengujian & Verifikasi
1. **Ujian Unit/Logik Transaksi:**
   - Pengiraan baki tunai tepat tanpa ralat titik perpuluhan (*floating point precision* cth: `Math.round(cents)`).
   - Auto-penjanaan nombor baucar unik mengikut turutan tahun semasa.
2. **Ujian Storan Resit:**
   - Pengesahan muat naik fail resit pelbagai format (PNG, JPG, WEBP) dan pemampatan imej ringan sebelum simpan ke IndexedDB.
3. **Ujian Susun Atur Cetakan (Print Preview):**
   - Paparan cetakan bersih tanpa elemen navigasi, menu, atau butang aplikasi.
   - Sesuai dengan saiz A4 standard (portrait & landscape mengikut jenis penyata).
4. **Ujian Sandaran Data:**
   - Eksport fail JSON, kosongkan data, dan pulihkan semula dengan semakan integriti resit dan jumlah baki.
