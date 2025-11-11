# Setup Instructions

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A WalletConnect Project ID (get one at [cloud.walletconnect.com](https://cloud.walletconnect.com))

## Step-by-Step Setup

### 1. Install Dependencies

Run the following command to install all dependencies for both frontend and backend:

```bash
npm run install:all
```

Or install them separately:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env
```

Edit `.env` and add your WalletConnect Project ID:

```env
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
PORT=5000
NODE_ENV=development
```

**Important:** Replace `your-project-id-here` with your actual WalletConnect Project ID.

### 3. Get WalletConnect Project ID

1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Paste it into your `.env` file

### 4. Run the Application

Start both frontend and backend servers:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Frontend (port 3000)
npm run dev:frontend

# Terminal 2 - Backend (port 5000)
npm run dev:backend
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Testing the Widget

1. Open http://localhost:3000 in your browser
2. Enter an amount (e.g., 0.01 ETH)
3. Enter a recipient address (or use the default)
4. Click "Pay with Wallet"
5. Scan the QR code with your wallet app (MetaMask, Trust Wallet, etc.)
6. Approve the connection
7. Review and sign the transaction
8. Check the transaction hash and view it on Etherscan

## Common Issues

### WalletConnect Modal Not Opening

- **Issue:** QR code modal doesn't appear
- **Solution:** 
  - Check that your Project ID is correct in `.env`
  - Ensure you're using a modern browser
  - Check browser console for errors

### Transaction Fails

- **Issue:** Transaction is rejected or fails
- **Solution:**
  - Verify recipient address is valid (0x followed by 40 hex characters)
  - Check that amount is greater than 0
  - Ensure your wallet has sufficient balance
  - Check that you're on the correct network (mainnet, testnet, etc.)

### Backend Not Responding

- **Issue:** API calls fail or return errors
- **Solution:**
  - Verify backend is running on port 5000
  - Check that CORS is enabled (it should be by default)
  - Check backend logs for errors
  - Verify the API endpoint URLs are correct

### Port Already in Use

- **Issue:** Port 3000 or 5000 is already in use
- **Solution:**
  - Change the port in `frontend/vite.config.ts` (frontend)
  - Change the `PORT` in `.env` (backend)
  - Or stop the process using the port

## Next Steps

- Read [USAGE.md](./USAGE.md) for detailed usage instructions
- Read [README.md](./README.md) for project overview
- Customize the widget for your needs
- Deploy to production (see README.md for deployment instructions)

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the backend logs
3. Verify your environment variables
4. Check the WalletConnect documentation
5. Open an issue on GitHub

