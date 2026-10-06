@echo off
title Expense Tracker - Masjid Al-Azhar Kg Sepakat Jaya Sepanggar
echo =====================================================================
echo    SISTEM PENGURUSAN KEWANGAN & EXPENSE TRACKER
echo    MASJID AL-AZHAR, KAMPUNG SEPAKAT JAYA, SEPANGGAR
echo =====================================================================
echo.
echo [1/2] Membuka pelayar web...
start "" "http://localhost:8899/expense-tracker/index.html"
echo [2/2] Menjalankan pelayan sistem tempatan pada port 8899...
echo.
echo Petua: Biarkan tetingkap ini terbuka semasa anda menggunakan sistem.
echo Tutup tetingkap ini apabila anda selesai.
echo =====================================================================
python -m http.server 8899
