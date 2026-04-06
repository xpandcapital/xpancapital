$filePath = 'c:\Users\kevin\.gemini\antigravity\scratch\blis-corp\app\superadmin\productos\page.tsx'
$lines = [System.IO.File]::ReadAllLines($filePath)
$fixed = 0
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '</div\s+>') {
        $lines[$i] = $lines[$i] -replace '</div\s+>', '</div>'
        $fixed++
        Write-Host "Fixed line $($i+1): $($lines[$i])"
    }
    if ($lines[$i] -match '</AnimatePresence\s+>') {
        $lines[$i] = $lines[$i] -replace '</AnimatePresence\s+>', '</AnimatePresence>'
        $fixed++
        Write-Host "Fixed line $($i+1): $($lines[$i])"
    }
}
[System.IO.File]::WriteAllLines($filePath, $lines)
Write-Host "Total fixed: $fixed"
