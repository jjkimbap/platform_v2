# 개발 서버 시작 스크립트 (자동 정리 포함)

Write-Host "🚀 개발 서버 시작..." -ForegroundColor Cyan

# 정리 스크립트 실행
& "$PSScriptRoot\cleanup.ps1"

# 잠시 대기
Start-Sleep -Seconds 2

# 개발 서버 시작
Write-Host "📦 개발 서버 시작 중..." -ForegroundColor Yellow
Write-Host "💡 팁: Ctrl+C로 종료하면 자동으로 정리됩니다." -ForegroundColor Gray

try {
    npm run dev
} finally {
    # 종료 시 정리
    Write-Host "`n🧹 종료 중 정리..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

