
$filePath = "c:\Users\kevin\.gemini\antigravity\scratch\blis-corp\app\superadmin\trading\TerminalLogic.tsx"
$content = Get-Content $filePath
$newContent = @()
$found = $false
foreach ($line in $content) {
    $newContent += $line
    if ($line -match 'Para perfil conservador, sugiero filtros lentos y riesgo mínimo' -and -not $found) {
        $found = $true
        # Wait for the next '}'
    } elseif ($found -and $line -match '^\s*\}') {
        $newContent += "                                                              } else if (prompt.toLowerCase().includes('stocastic') || prompt.toLowerCase().includes('estocástico')) {"
        $newContent += "                                                                  suggest = { "
        $newContent += "                                                                      emaFast: 14, emaSlow: 50, rsiPeriod: 14, rsiBuy: 30, rsiSell: 70,"
        $newContent += "                                                                      stochK: 14, stochD: 3, stochOverbought: 92, stochOversold: 8,"
        $newContent += "                                                                      atrMultiplier: 1.5, tpRatio: 2.5, risk: 2, beTrigger: 20, beLock: 2, trailingDist: 25"
        $newContent += "                                                                  };"
        $newContent += "                                                                  text = 'Configuración de Estocástico 92/8 ACTIVADA. He sincronizado las EMAs para confirmar la tendencia principal y asegurar entradas de alta precisión.';"
        $found = $false
    }
}
$newContent | Set-Content $filePath
