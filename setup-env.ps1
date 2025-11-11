# PowerShell script to set up .env file with WalletConnect Project ID
# Usage: .\setup-env.ps1

Write-Host "=== WalletConnect Project ID Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path .env) {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Exiting. Your existing .env file is unchanged." -ForegroundColor Yellow
        exit
    }
}

Write-Host "To get your WalletConnect Project ID:" -ForegroundColor Yellow
Write-Host "1. Go to https://cloud.walletconnect.com" -ForegroundColor White
Write-Host "2. Sign up or log in with your GitHub account" -ForegroundColor White
Write-Host "3. Create a new project" -ForegroundColor White
Write-Host "4. Copy your Project ID (it's a long string)" -ForegroundColor White
Write-Host ""

$projectId = Read-Host "Enter your WalletConnect Project ID"

if ([string]::IsNullOrWhiteSpace($projectId)) {
    Write-Host "❌ No Project ID provided. Exiting." -ForegroundColor Red
    exit
}

# Create .env file
$envContent = @"
# WalletConnect / Reown Project ID
# Get your project ID from https://cloud.walletconnect.com
VITE_WALLETCONNECT_PROJECT_ID=$projectId

# Backend Port (optional, defaults to 5000)
PORT=5000

# Node Environment
NODE_ENV=development
"@

# Write to .env file
$envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Your Project ID has been saved to .env file." -ForegroundColor Cyan
Write-Host "⚠️  Remember: .env is in .gitignore and will NOT be committed to Git." -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your development server: npm run dev" -ForegroundColor White
Write-Host "2. Test the wallet connection in your browser" -ForegroundColor White
Write-Host ""

