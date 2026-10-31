param(
    [string]$RepoUrl
)

$gitExe = "$env:LOCALAPPDATA\Programs\MinGit\cmd\git.exe"
if (-not (Test-Path $gitExe)) {
    $gitExe = "git"
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    PUSH PROJECT 'MEO TIN SHOW POSTER' TO GITHUB          " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $RepoUrl) {
    Write-Host ""
    Write-Host "Vui lòng nhập đường dẫn GitHub Repository của bạn:" -ForegroundColor Yellow
    Write-Host "Ví dụ: https://github.com/ten-tai-khoan/meo-tin-show-poster.git" -ForegroundColor Gray
    $RepoUrl = Read-Host "Link Repository"
}

if (-not $RepoUrl) {
    Write-Host "Lỗi: Chưa nhập đường dẫn repository!" -ForegroundColor Red
    exit 1
}

try {
    # Check if origin already exists
    $remotes = & $gitExe remote
    if ($remotes -contains "origin") {
        Write-Host "Cập nhật remote origin..." -ForegroundColor Yellow
        & $gitExe remote set-url origin $RepoUrl
    } else {
        Write-Host "Thêm remote origin..." -ForegroundColor Yellow
        & $gitExe remote add origin $RepoUrl
    }

    Write-Host "Đang đẩy code lên branch main..." -ForegroundColor Cyan
    & $gitExe branch -M main
    & $gitExe push -u origin main

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 THÀNH CÔNG! Dự án đã được đẩy lên GitHub:" -ForegroundColor Green
        Write-Host "$RepoUrl" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "Lưu ý: Nếu GitHub yêu cầu đăng nhập, hãy đăng nhập bằng Personal Access Token (PAT) hoặc tài khoản GitHub trong cửa sổ hiện lên." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Lỗi khi push: $($_.Exception.Message)" -ForegroundColor Red
}
