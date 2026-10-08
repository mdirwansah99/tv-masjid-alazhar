# Lumina PhotoStudio Pro 🎨📄📱

Aplikasi studio penyunting grafik profesional (ala **Adobe Photoshop**) berasaskan web standard moden dengan keupayaan membuka, menyunting, dan menukar fail **`.ps` (Adobe PostScript)**, dokumen **PDF**, serta boleh **dipasang terus ke telefon pintar (PWA / Progressive Web App)**!

---

## 🌟 Ciri-Ciri Utama

### 1. Pembaca & Penghurai Fail `.ps` (PostScript Engine) ⚡
* **Buka Fail .PS / .EPS Terus di Telefon:** Membaca kod arahan vektor PostScript (`moveto`, `lineto`, `curveto`, `arc`, `BoundingBox`, warna RGB/CMYK, teks, dan imej).
* **Tukar ke PDF / PNG Serta-merta:** Tukar fail `.ps` kepada dokumen PDF atau imej PNG berkualiti tinggi tanpa memerlukan perisian luar seperti Ghostscript.
* **Sunting Kandungan:** Masukkan fail `.ps` sebagai lapisan (*layer*) untuk diubah suai atau diconteng di atas kanvas.

### 2. Pasang di Telefon Pintar (Mobile PWA) 📱
* **Install Tanpa Play Store:** Buka pautan web pada telefon pintar anda dan pasang ke skrin utama (*Add to Home Screen*).
* **Sokongan Luar Talian (Offline):** Dilengkapi *Service Worker* dan fail *manifest* untuk beroperasi pantas walaupun tanpa sambungan internet.
* **Kawalan Sentuhan Mesra Telefon:** Sokongan sentuhan jari untuk melukis dan cubit dua jari untuk besarkan/kecilkan paparan (*pinch-to-zoom*).

### 3. Enjin Grafik & Lapisan (Photoshop Pro Core) 🎨
* **Sistem Lapisan (Layers):** Tambah lapisan baharu, pendua (*duplicate*), padam, cantum ke bawah (*merge down*), ratakan (*flatten*), kawalan kelegapan (*opacity* 0–100%), dan 12 Mod Campuran (*Blend Modes* seperti Multiply, Screen, Overlay, Color Dodge).
* **Alatan Studio Penuh:**
  * Move Tool (`V`), Rectangular Marquee (`M`), Brush (`B`), Pencil (`N`), Eraser (`E`), Paint Bucket (`G`), Horizontal Text (`T`), Custom Shapes (`U`), Eyedropper (`I`), Hand (`H`), dan Zoom (`Z`).
* **Penapis & Pelarasan (Filters & Adjustments):**
  * Brightness, Contrast, Saturation, dan Gaussian Blur dengan *live sliders*.
  * Grayscale, Invert, Sepia Vintage, Sharpen, Find Edges, dan Emboss.
  * Putaran 90° serta *Flip Horizontal / Vertical*.
* **Sistem Sejarah (History / Undo & Redo):** Sokongan `Ctrl+Z` dan `Ctrl+Y`.

### 4. Studio Dokumen PDF & Penukar Format (Converter Hub) 📄
* **Buka Fail PDF:** Buka fail PDF berbilang halaman, belek halaman, dan masukkan mana-mana halaman sebagai lapisan resolusi tinggi (150/200/300 DPI).
* **Penukar Format Serba Lengkap:**
  * `.ps` $\rightarrow$ PDF / PNG / JPG / WebP
  * PDF $\rightarrow$ PNG / JPG / WebP / SVG
  * Imej $\rightarrow$ Dokumen PDF
  * Kanvas Aktif $\rightarrow$ Dokumen PDF beresolusi tinggi.

---

## 🚀 Cara Menjalankan & Memasang di Telefon

### Untuk Membuka di Komputer:
1. Dwiklik pada fail **`run_server.bat`** (pelayan tempatan) atau **`launch.bat`**.
2. Aplikasi akan dibuka di pelayar web anda.

### Untuk Memasang di Telefon Pintar (Smartphone):
1. Pastikan telefon dan komputer berada di dalam rangkaian WiFi yang sama, kemudian buka alamat IP komputer anda (contoh: `http://192.168.x.x:8080`) di pelayar telefon (Chrome atau Safari).
2. **Android:** Tekan menu tiga titik (⋮) di pelayar Chrome $\rightarrow$ pilih **"Install app"** atau **"Add to Home screen"**.
3. **iPhone (iOS):** Tekan butang *Share* di pelayar Safari $\rightarrow$ pilih **"Add to Home Screen"**.
4. Ikon **Lumina PhotoStudio** akan muncul pada skrin utama telefon anda seperti aplikasi rasmi!
