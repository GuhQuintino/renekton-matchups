# ==============================================================================
# SCRIPT DE RECOMPILACAO E EMPACOTAMENTO AUTOMATICO - RENEKTON MATCHUPS
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " [1/4] Limpando executaveis antigos da raiz..." -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

$rootExecutables = Get-ChildItem -Path . -Filter "*.exe" -File
if ($rootExecutables) {
    foreach ($exe in $rootExecutables) {
        Write-Host "   -> Removendo: $($exe.Name)" -ForegroundColor DarkGray
        Remove-Item $exe.FullName -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "   [OK] Raiz limpa com sucesso." -ForegroundColor Green

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host " [2/4] Executando build estatico do Frontend (Vite + TS)..." -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

npm run build

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host " [3/4] Empacotando com Tauri v2 (MSI + NSIS + Binario)..." -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

$env:PATH = "$($env:USERPROFILE)\.cargo\bin;$($env:PATH)"
npx tauri build

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host " [4/4] Copiando novos binarios limpos para a raiz..." -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

$nsisSetup = "src-tauri\target\release\bundle\nsis\Renekton Matchups_1.0.0_x64-setup.exe"
$releaseBin = "src-tauri\target\release\champion-matchup.exe"

if (Test-Path $nsisSetup) {
    Copy-Item $nsisSetup "Instalador-Renekton-Matchups.exe" -Force
    Write-Host "   [OK] Copiado: Instalador-Renekton-Matchups.exe" -ForegroundColor Green
} else {
    Write-Host "   [AVISO] Instalador NSIS nao encontrado em $nsisSetup" -ForegroundColor Red
}

if (Test-Path $releaseBin) {
    Copy-Item $releaseBin "Renekton-Matchups.exe" -Force
    Write-Host "   [OK] Copiado: Renekton-Matchups.exe" -ForegroundColor Green
} else {
    Write-Host "   [AVISO] Binario release nao encontrado em $releaseBin" -ForegroundColor Red
}

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host " RECOMPILACAO E EMPACOTAMENTO CONCLUIDOS COM SUCESSO!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Get-ChildItem -Path . -Filter "*.exe" -File | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
