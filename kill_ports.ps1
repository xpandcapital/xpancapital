$ports = 3000..3006

foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $pidValue = $conn.OwningProcess
                Write-Host "Encontrado proceso $pidValue en el puerto $port. Cerrando..." -ForegroundColor Yellow
                Stop-Process -Id $pidValue -Force -ErrorAction SilentlyContinue
                Write-Host "Proceso $pidValue cerrado." -ForegroundColor Green
            }
        } else {
            Write-Host "Ningún proceso encontrado en el puerto $port." -ForegroundColor Gray
        }
    } catch {
        Write-Host "Error al verificar el puerto $port: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Completado." -ForegroundColor Cyan
