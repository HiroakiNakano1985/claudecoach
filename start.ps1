Write-Host ""
Write-Host "=== Starting ClaudeCoach ===" -ForegroundColor Cyan
Write-Host ""

# Ingest latest logs
Write-Host "[1/3] Ingesting Claude Code logs..." -ForegroundColor Yellow
python -m agent.cli ingest

# Start backend
Write-Host "[2/3] Starting backend (port 8000)..." -ForegroundColor Yellow
$backend = Start-Process -NoNewWindow -PassThru -FilePath "uvicorn" -ArgumentList "server.main:app", "--port", "8000"
Start-Sleep -Seconds 2

# Start frontend
Write-Host "[3/3] Starting frontend (port 3000)..." -ForegroundColor Yellow
$frontend = Start-Process -NoNewWindow -PassThru -WorkingDirectory "web" -FilePath "npm" -ArgumentList "run", "dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ClaudeCoach is running!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Dashboard:  http://localhost:3000"
Write-Host "  API:        http://localhost:8000/api/health"
Write-Host ""
Write-Host "  Press Enter to stop all services."
Write-Host ""

# Open browser
Start-Process "http://localhost:3000"

# Wait for user to press Enter, then cleanup
Read-Host
if ($backend -and !$backend.HasExited) { Stop-Process -Id $backend.Id -Force }
if ($frontend -and !$frontend.HasExited) { Stop-Process -Id $frontend.Id -Force }
Write-Host "Stopped." -ForegroundColor Yellow
