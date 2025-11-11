# Quick Start Guide

Get up and running with the Crypto Payment Widget in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Get WalletConnect Project ID

1. Visit [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up / Log in
3. Create a new project
4. Copy your Project ID

### 3. Configure Environment

Create a `.env` file:

```env
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
PORT=5000
```

### 4. Run the Application

```bash
npm run dev
```

### 5. Test the Widget

1. Open http://localhost:3000
2. Click "Pay with Wallet"
3. Scan QR code with your wallet
4. Sign the transaction
5. Done! ✅

## 📦 Use in Your Project

```tsx
import PayWithWallet from './components/PayWithWallet'

<PayWithWallet
  amount="0.01"
  recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  onSuccess={(txHash) => console.log('Success!', txHash)}
  projectId="your-project-id"
/>
```

## 🎯 Key Features

- ✅ One-click wallet connection
- ✅ QR code scanning
- ✅ Transaction signing
- ✅ Automatic backend logging
- ✅ Error handling
- ✅ Modern UI

## 📚 Next Steps

- Read [SETUP.md](./SETUP.md) for detailed setup
- Read [USAGE.md](./USAGE.md) for usage examples
- Read [README.md](./README.md) for full documentation

## 🆘 Need Help?

- Check the browser console for errors
- Verify your WalletConnect Project ID
- Ensure backend is running on port 5000
- Check [SETUP.md](./SETUP.md) for troubleshooting

## 🔗 Useful Links

- [WalletConnect Cloud](https://cloud.walletconnect.com)
- [WalletConnect Docs](https://docs.walletconnect.com)
- [Etherscan](https://etherscan.io) - View transactions

---

That's it! You're ready to accept crypto payments. 🎉

