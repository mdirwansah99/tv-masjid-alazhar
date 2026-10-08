@echo off
title Lumina PhotoStudio Pro Server
echo ========================================================
echo   Lumina PhotoStudio Pro - Editor Grafik, PDF & Penukar
echo ========================================================
echo.
echo Melancarkan pelayan tempatan pada port 8080...
start "" "http://localhost:8080"
python -m http.server 8080
pause
