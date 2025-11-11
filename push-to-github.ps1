# PowerShell script to push to GitHub
# Usage: .\push-to-github.ps1

Write-Host "=== GitHub Repository Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if remote already exists
$remoteExists = git remote | Select-String -Pattern "origin"
if ($remoteExists) {
    Write-Host "Remote 'origin' already exists." -ForegroundColor Yellow
    git remote -v
    Write-Host ""
    $continue = Read-Host "Do you want to continue with existing remote? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Exiting. Please remove remote first: git remote remove origin" -ForegroundColor Red
        exit
    }
} else {
    Write-Host "No remote configured. Please provide your GitHub repository URL." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example URLs:" -ForegroundColor Cyan
    Write-Host "  HTTPS: https://github.com/username/repo-name.git"
    Write-Host "  SSH:   git@github.com:username/repo-name.git"
    Write-Host ""
    $repoUrl = Read-Host "Enter your GitHub repository URL"
    
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Host "Remote 'origin' added: $repoUrl" -ForegroundColor Green
    } else {
        Write-Host "No URL provided. Exiting." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "=== Pushing to GitHub ===" -ForegroundColor Cyan

# Check current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push -u origin $currentBranch
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your repository is now on GitHub!" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "❌ Error pushing to GitHub:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Authentication required - set up GitHub CLI or use Personal Access Token"
    Write-Host "2. Repository doesn't exist - create it on GitHub first"
    Write-Host "3. Branch name mismatch - ensure branch names match"
    Write-Host ""
    Write-Host "See GITHUB_SETUP.md for detailed instructions." -ForegroundColor Cyan
}

