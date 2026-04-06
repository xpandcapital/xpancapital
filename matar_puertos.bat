@echo off
echo ===================================================
echo     CERRANDO PUERTOS LOCALHOST (3000 - 3006)       
echo ===================================================
echo.
echo Buscando y cerrando procesos...
powershell -Command "Try { Get-Process -Id (Get-NetTCPConnection -LocalPort 3000,3001,3002,3003,3004,3005,3006 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force; Write-Host '  OK! Procesos cerrados exitosamente.' -ForegroundColor Green } Catch { Write-Host '  No se encontraron procesos activos en esos puertos o hubo un error.' -ForegroundColor Yellow }"
echo.
echo ===================================================
pause
