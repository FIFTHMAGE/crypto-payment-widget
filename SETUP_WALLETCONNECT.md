# WalletConnect Project ID Setup

## Why You Need a Project ID

The WalletConnect Project ID (API key) is required for the payment widget to work. It's used to:
- Connect to WalletConnect's infrastructure
- Enable wallet connections via QR codes
- Support 300+ crypto wallets

## How to Get Your Project ID

### Step 1: Create a WalletConnect Cloud Account

1. Go to https://cloud.walletconnect.com
2. Sign up or log in with your GitHub account
3. Verify your email if required

### Step 2: Create a New Project

1. Click **"Create New Project"** or **"New Project"**
2. Enter a project name (e.g., "Crypto Payment Widget")
3. Enter a description (optional)
4. Click **"Create"**

### Step 3: Get Your Project ID

1. After creating the project, you'll see your **Project ID**
2. It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
3. Copy this Project ID

### Step 4: Add Project ID to Your .env File

1. Create a `.env` file in the root directory (if it doesn't exist)
2. Add your Project ID:

```env
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
PORT=5000
NODE_ENV=development
```

Replace `your-project-id-here` with your actual Project ID.

## Quick Setup

### Option 1: Manual Setup

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and replace `your-project-id-here` with your Project ID

### Option 2: Create .env File Directly

Create a `.env` file with this content:

```env
VITE_WALLETCONNECT_PROJECT_ID=your-actual-project-id
PORT=5000
NODE_ENV=development
```

## Verify Setup

After adding your Project ID:

1. Restart the development server:
   ```bash
   npm run dev
   ```

2. Check the browser console - you should NOT see the warning:
   ```
   ⚠️ AppKit not initialized: Project ID is missing.
   ```

3. Try connecting a wallet - the WalletConnect modal should open

## Security Notes

⚠️ **Important Security Reminders:**

- ✅ `.env` is in `.gitignore` - it won't be committed to Git
- ✅ `env.example` is safe to commit - it has no secrets
- ❌ **Never commit your `.env` file** to version control
- ❌ **Never share your Project ID publicly**

## Troubleshooting

### Project ID Not Working

- Verify you copied the entire Project ID (it's a long string)
- Check for extra spaces or quotes in `.env` file
- Restart the development server after changing `.env`
- Check browser console for error messages

### WalletConnect Modal Not Opening

- Verify Project ID is correct in `.env`
- Check that `.env` file is in the root directory
- Ensure the environment variable name is `VITE_WALLETCONNECT_PROJECT_ID`
- Restart the development server

### Getting "Project ID is missing" Warning

- Make sure `.env` file exists in the root directory
- Verify the variable name is exactly `VITE_WALLETCONNECT_PROJECT_ID`
- Check that there are no typos in the `.env` file
- Restart the development server

## Free Tier

WalletConnect Cloud has a generous free tier that should be sufficient for development and small projects. You can upgrade later if needed.

## Need Help?

- WalletConnect Documentation: https://docs.walletconnect.com
- WalletConnect Cloud: https://cloud.walletconnect.com
- Create an issue on GitHub if you encounter problems

---

**Once you have your Project ID, add it to `.env` and restart the development server!** 🚀

