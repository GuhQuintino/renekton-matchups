$msvcBin = "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.44.35207\bin\Hostx86\x64"
$winSdkBin = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64"
$cargoBin = "$env:USERPROFILE\.cargo\bin"

$env:PATH = "$msvcBin;$winSdkBin;$cargoBin;$env:PATH"

$msvcLib = "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.44.35207\lib\x64"
$winSdkUm = "C:\Program Files (x86)\Windows Kits\10\Lib\10.0.26100.0\um\x64"
$winSdkUcrt = "C:\Program Files (x86)\Windows Kits\10\Lib\10.0.26100.0\ucrt\x64"

$env:LIB = "$msvcLib;$winSdkUm;$winSdkUcrt;$env:LIB"

$msvcInc = "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.44.35207\include"
$winSdkUcrtInc = "C:\Program Files (x86)\Windows Kits\10\Include\10.0.26100.0\ucrt"
$winSdkUmInc = "C:\Program Files (x86)\Windows Kits\10\Include\10.0.26100.0\um"
$winSdkSharedInc = "C:\Program Files (x86)\Windows Kits\10\Include\10.0.26100.0\shared"

$env:INCLUDE = "$msvcInc;$winSdkUcrtInc;$winSdkUmInc;$winSdkSharedInc;$env:INCLUDE"

Set-Location "c:\Users\Gustavo\Desktop\Champion Matchup"

Write-Host "Running npx tauri build with full MSVC environment..." -ForegroundColor Cyan
npx tauri build
exit $LASTEXITCODE
