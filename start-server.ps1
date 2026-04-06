# --- SEGURIDAD: SOLICITUD DE CONTRASEÑA ENMASCARADA ---
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "   SISTEMA DE SEGURIDAD BLIS CORP" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

# Pedir la contrasena como SecureString para ocultarla (no muestra caracteres)
$securePass = Read-Host "Ingrese la contrasena de acceso" -AsSecureString
# Convertir SecureString a texto plano para verificar (2380)
$pass = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass))

if ($pass -ne "2380") {
    Write-Host ""
    Write-Host "[!] ACCESO DENEGADO. Contrasena incorrecta." -ForegroundColor Red
    Start-Sleep -Seconds 3
    exit
}

Clear-Host
Write-Host ""
Write-Host "[+] ACCESO CONCEDIDO. Iniciando..." -ForegroundColor Green
Write-Host ""

# Obtener la IPv4 local activa
$ip = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "WSL|Loopback|VirtualBox" } | Select-Object -First 1 -ExpandProperty IPAddress

Write-Host "==========================================" -ForegroundColor Green
Write-Host "   SERVIDOR ACTIVO (COMUNICACION LOCAL)" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Tu aplicacion estara disponible en:"
Write-Host "1. Local: http://localhost:3000"
Write-Host "2. Red:  http://$($ip):3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener y cerrar."
Write-Host "==========================================" -ForegroundColor Gray

# --- EJECUCION ---

# Abrir la App de Chrome automaticamente
Start-Process "C:\Program Files\Google\Chrome\Application\chrome_proxy.exe" -ArgumentList "--profile-directory=Default", "--app-id=hbblfifohofgngfbjbiimbbcimepbdcb"

# Ejecutar Next.js permitiendo acceso externo
npm run dev -- -H 0.0.0.0

# Cerrar terminal al finalizar
exit
