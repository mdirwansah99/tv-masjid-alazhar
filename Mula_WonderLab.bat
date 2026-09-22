@echo off
title WonderLab Kids - Local Server
color 0B

echo ===================================================
echo      PELAYAN WEB TEMPATAN (WONDERLAB KIDS)
echo ===================================================
echo Memulakan server untuk ujian di tablet/telefon bimbit...
echo.
echo Jika anda ingin menguji aplikasi ini di telefon / tablet anda:
echo 1. Pastikan telefon dan komputer ini berada di WiFi yang sama.
echo 2. Buka pelayar web (Chrome/Safari) di telefon anda.
echo 3. Taipkan Alamat IPv4 di bawah, diikuti dengan :8000
echo.
echo Contoh: http://192.168.1.5:8000/makmal-intro.html
echo ===================================================
echo ALAMAT IP KOMPUTER ANDA:
ipconfig | findstr /i "ipv4"
echo ===================================================
echo.
echo Biarkan tetingkap hitam ini terbuka. Tekan CTRL+C untuk tutup.
python -m http.server 8000
pause
