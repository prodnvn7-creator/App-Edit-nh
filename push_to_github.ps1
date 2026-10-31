$gitExe = "$env:LOCALAPPDATA\Programs\MinGit\cmd\git.exe"
if (-not (Test-Path $gitExe)) {
    $gitExe = "git"
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PUSH UPDATES TO GITHUB: App-Edit-nh                    " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

& $gitExe add .
$status = & $gitExe status --porcelain
if ($status) {
    $msg = Read-Host "Nhap ghi chu commit (mac dinh: 'update poster studio')"
    if (-not $msg) { $msg = "update poster studio" }
    & $gitExe commit -m $msg
}

Write-Host "Dang day code len GitHub..." -ForegroundColor Yellow
& $gitExe push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 THANH CONG! Code da duoc cap nhat len GitHub:" -ForegroundColor Green
    Write-Host "https://github.com/prodnvn7-creator/App-Edit-nh" -ForegroundColor White
} else {
    Write-Host "Co loi khi push len GitHub." -ForegroundColor Red
}
