# GitHub Repository Setup Guide

## Initial Commit Complete ✅

Your code has been committed locally. Now you can push it to GitHub.

## Option 1: Create New GitHub Repository (Recommended)

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `crypto-payment-widget` (or your preferred name)
3. Description: "Drop-in crypto payment widget using Reown AppKit and WalletConnect"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

### Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/crypto-payment-widget.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Option 2: Use SSH (If you have SSH keys set up)

```bash
# Add remote with SSH
git remote add origin git@github.com:YOUR_USERNAME/crypto-payment-widget.git

# Push to GitHub
git push -u origin main
```

## Option 3: Quick Push (If repository already exists)

If you already created the repository on GitHub:

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push
git push -u origin main
```

## Verify Push

After pushing, verify your code is on GitHub:

1. Go to your repository on GitHub
2. You should see all your files
3. Check that `.env` is NOT in the repository (it's in .gitignore)

## Important Notes

⚠️ **Never commit `.env` file** - It contains sensitive information (Project ID)
✅ **`.env` is already in `.gitignore`** - It won't be committed
✅ **`env.example` is committed** - This is safe to share

## Next Steps After Pushing

1. Add repository description on GitHub
2. Add topics/tags: `crypto`, `walletconnect`, `reown`, `payment-widget`, `react`, `typescript`
3. Consider adding a LICENSE file
4. Set up GitHub Actions for CI/CD (optional)
5. Add a GitHub Pages deployment (optional)

## Troubleshooting

### Authentication Issues

If you get authentication errors:

1. **Use GitHub CLI** (if installed):
   ```bash
   gh auth login
   git push -u origin main
   ```

2. **Use Personal Access Token**:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Create a new token with `repo` permissions
   - Use token as password when pushing

3. **Use SSH** (recommended for frequent pushes):
   - Set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
   - Use SSH URL for remote

### Branch Name Issues

If your default branch is `master` instead of `main`:

```bash
# Rename branch
git branch -M main

# Push
git push -u origin main
```

## Repository Settings to Consider

After creating the repository:

1. **Settings > General > Features**:
   - Enable Issues
   - Enable Wiki (optional)
   - Enable Discussions (optional)

2. **Settings > Secrets and variables > Actions**:
   - Add `VITE_WALLETCONNECT_PROJECT_ID` as a secret (for CI/CD)

3. **Settings > Pages** (if deploying to GitHub Pages):
   - Set source branch (usually `main` or `gh-pages`)

## Badge Suggestions

Add these badges to your README.md (after pushing):

```markdown
![GitHub](https://img.shields.io/github/license/YOUR_USERNAME/crypto-payment-widget)
![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/crypto-payment-widget)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/crypto-payment-widget)
```

---

**Ready to push?** Follow the steps above to create your GitHub repository and push your code! 🚀

