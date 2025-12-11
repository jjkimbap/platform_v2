# Node 프로세스 및 .next 폴더 정리 스크립트

Write-Host "🧹 정리 시작..." -ForegroundColor Cyan

# Node 프로세스 종료
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "🛑 Node 프로세스 종료 중..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "✅ Node 프로세스 종료 완료" -ForegroundColor Green
} else {
    Write-Host "ℹ️ 실행 중인 Node 프로세스 없음" -ForegroundColor Gray
}

# .next 폴더 삭제
if (Test-Path .next) {
    Write-Host "🗑️ .next 폴더 삭제 중..." -ForegroundColor Yellow
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "✅ .next 폴더 삭제 완료" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ .next 폴더 삭제 실패: $_" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️ .next 폴더 없음" -ForegroundColor Gray
}

Write-Host "✨ 정리 완료!" -ForegroundColor Cyan

