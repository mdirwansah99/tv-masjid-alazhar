# HaierShield 🛡️

Aplikasi Penyekat Iklan TV Android khusus untuk jenama Haier bagi kegunaan TV Masjid Al-Azhar.

## Ringkasan Fungsi

1. **⚡ Penutup Pop-up Automatik (Accessibility Service):**
   - Mengesan kemunculan iklan overlay sistem Haier dan menekan butang dismiss/tutup ("Close", "×", "Skip", "关闭") secara automatik.
   - Dilengkapi fungsi fallback (kekunci BACK) sekiranya butang dismiss tiada.
   - Dilengkapi kawalan cooldown (500ms) bagi mengelakkan kitaran klik berulang.

2. **🌐 Penyekat DNS Tempatan (Local VPN Service):**
   - Memintas query DNS port 53 secara tempatan tanpa pelayan luar (zero external leaks).
   - Menyekat domain pengiklanan dan telemetri Haier (`ads.haier.com`, `push.haier.com`, `tracker.haier.com`, dll).
   - Mengembalikan jawapan pantas `0.0.0.0` (NXDOMAIN) untuk sebarang trafik iklan.

3. **🔔 Pembersih Notifikasi (Notification Listener Service):**
   - Memadam push notification promosi/iklan yang dihantar oleh pakej iklan Haier secara automatik.

4. **🔄 Mula Automatik (Boot Receiver):**
   - Menghidupkan perlindungan semula secara automatik setiap kali TV dimatikan dan dihidupkan semula.

## Muat Turun & Pemasangan Terus pada TV

Buka pelayar web (Browser) pada TV Haier masjid anda dan layari:
- **Laman Muat Turun TV:** `https://mdirwansah99.github.io/tv-masjid-alazhar/haiershield-download.html`
- **Pautan Terus APK:** `https://github.com/mdirwansah99/tv-masjid-alazhar/releases/download/haiershield-latest/HaierShield.apk`

## Struktur Projek

```
app/
├── src/main/
│   ├── java/com/haiershield/
│   │   ├── HaierShieldApp.kt              # Permulaan aplikasi & Notification Channel
│   │   ├── service/
│   │   │   ├── AdOverlayDetector.kt        # AccessibilityService pengesan pop-up
│   │   │   ├── DnsBlockerVpn.kt            # VpnService penyekat domain DNS
│   │   │   ├── AdNotifCleaner.kt           # NotificationListenerService
│   │   │   └── BootReceiver.kt             # Auto-start semasa reboot
│   │   ├── data/
│   │   │   ├── BlocklistManager.kt         # Pengurusan senarai domain
│   │   │   ├── ShieldStatus.kt             # Status LiveData reaktif
│   │   │   ├── PrefsManager.kt             # Tetapan SharedPreferences
│   │   │   ├── StatsTracker.kt             # Tracking statistik harian
│   │   │   └── db/
│   │   │       ├── AppDatabase.kt          # Room SQLite Database
│   │   │       ├── StatsDao.kt             # DAO untuk kiraan iklan disekat
│   │   │       └── StatsEntity.kt          # Entiti rekod tarikh harian
│   │   ├── ui/
│   │   │   ├── MainActivity.kt             # Gerbang utama Android TV
│   │   │   ├── DashboardFragment.kt        # Dashboard Leanback TV
│   │   │   ├── CustomDomainsFragment.kt    # Pengurusan domain kustom
│   │   │   ├── SetupWizardActivity.kt      # Wizard konfigurasi kali pertama
│   │   │   └── SetupStepFragment.kt        # Langkah konfigurasi wizard
│   │   └── util/
│   │       ├── AdPatterns.kt               # Pengecaman corak teks/pakej iklan
│   │       ├── DnsPacketParser.kt          # Penghurai paket UDP DNS binary
│   │       └── ServiceUtils.kt             # Pembantu semakan kebenaran sistem
│   └── res/
│       ├── layout/                         # Susun atur antaramuka TV
│       ├── values/                         # strings.xml, colors.xml, styles.xml
│       └── xml/accessibility_config.xml    # Konfigurasi Accessibility
```
