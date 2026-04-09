Write-Host ""
Write-Host "=== ClaudeCoach Installer ===" -ForegroundColor Cyan
Write-Host ""

# Clone if not already in the repo
if (-not (Test-Path "pyproject.toml")) {
    git clone https://github.com/HiroakiNakano1985/claudecoach.git
    Set-Location claudecoach
}

# Python dependencies
Write-Host "[1/3] Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt -q

# Node.js dependencies
Write-Host "[2/3] Installing Node.js dependencies..." -ForegroundColor Yellow
Set-Location web
npm install --silent
Set-Location ..

# .env
if (-not (Test-Path ".env")) {
    Write-Host "[3/3] Creating .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
} else {
    Write-Host "[3/3] .env already exists, skipping." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ClaudeCoach installed successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  To start:"
Write-Host "    cd claudecoach"
Write-Host "    .\start.ps1"
Write-Host ""
Write-Host "  Or manually:"
Write-Host "    python -m agent.cli ingest"
Write-Host "    uvicorn server.main:app --port 8000"
Write-Host "    cd web; npm run dev"
Write-Host "    Open http://localhost:3000"
Write-Host ""
