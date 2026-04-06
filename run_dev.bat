@echo off
setlocal enabledelayedexpansion
title BLIS CORP - ACCESO SECTOR CUANTICO
cd /d "%~dp0"
:: Cambiar a UTF-8 para evitar caracteres extraños
chcp 65001 >nul

:: Configuracion de Seguridad
set "PASSWORD=2380"

:login
cls
color 0C
echo.
echo  ########################################################
echo  #                                                      #
echo  #          [ BLIS CORP - CONTROL DE ACCESO ]           #
echo  #                                                      #
echo  ########################################################
echo.
echo  [SISTEMA]: INICIANDO PROTOCOLO DE AUTENTICACION...
echo  [ESTADO]: ESPERANDO CODIGO DE ACCESO...
echo.
powershell -Command "$p = Read-Host ' [CLAVE SECRETA]' -AsSecureString; $p2 = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($p)); if ($p2 -eq '%PASSWORD%') { exit 0 } else { exit 1 }"
if %errorlevel% neq 0 (
    powershell -Command "Write-Host ' [CRITICO]: CLAVE INCORRECTA. ALERTA ACTIVADA.' -ForegroundColor Black -BackgroundColor Red"
    timeout /t 3 >nul
    goto :login
)

cls
color 0A
echo.
echo  ########################################################
echo  #          AUTENTICACION EXITOSA - BIENVENIDO          #
echo  ########################################################
echo.
powershell -Command "Write-Host ' [v] IP OCULTA: 127.0.0.1 (LOCAL)' -ForegroundColor Green"
powershell -Command "Write-Host ' [v] SALTANDO CORTAFUEGOS... LISTO' -ForegroundColor Green"
powershell -Command "Write-Host ' [v] SINCRONIZANDO DATABASE... LISTO' -ForegroundColor Green"
timeout /t 1 >nul

:: Detectar IP Local de forma robusta
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|VirtualBox|VMware' -and $_.IPAddress -like '192.*' }).IPAddress | Select-Object -First 1"`) do (
    set "IP=%%a"
)
if "%IP%"=="" (
    for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' }).IPAddress | Select-Object -First 1"`) do (
        set "IP=%%a"
    )
)

cls
echo.
powershell -Command "Write-Host '  ########################################################' -ForegroundColor Cyan"
powershell -Command "Write-Host '  #           SISTEMA DE DESARROLLO BLIS CORP          #' -ForegroundColor Cyan"
powershell -Command "Write-Host '  ########################################################' -ForegroundColor Cyan"
echo.
powershell -Command "Write-Host '  [PUNTO LOCAL] : http://localhost:3000' -ForegroundColor White"
powershell -Command "Write-Host '  [ACCESO RED]  : http://%IP%:3000' -ForegroundColor Cyan"
echo.

:: Generar QR usando la IP detectada (Añadido -UseBasicParsing para evitar la advertencia de seguridad)
if not "%IP%"=="" (
    powershell -NoProfile -Command "Write-Host '  [!] ESCANEA PARA ACCESO MOVIL DIRECTO:' -ForegroundColor Yellow; $url = 'http://qrenco.de/http://%IP%:3000'; try { $qr = (Invoke-WebRequest -Uri $url -UserAgent 'curl' -UseBasicParsing).Content; Write-Host $qr -ForegroundColor White } catch { Write-Host '  [!] SERVIDOR DE QR FUERA DE LINEA.' -ForegroundColor Red }"
)

echo.
powershell -Command "Write-Host '  [MONITOR]: MODO DESARROLLADOR ACTIVO...' -ForegroundColor Gray"
powershell -Command "Write-Host '  [REGISTROS]: ESCUCHANDO EN EL PUERTO 3000...' -ForegroundColor Gray"
echo.

:: La minimizar la consola automatica fue removida a peticion del usuario

:: Iniciar servidor y abrir en pestaña de incognito para evitar cachés rotos (Service Workers de la PWA)
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:3000/superadmin/trading" --incognito

:: Ejecutar Next.js
npm run dev
