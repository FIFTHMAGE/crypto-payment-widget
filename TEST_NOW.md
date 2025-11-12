# 🧪 Test Your Payment Widget NOW!

## ✅ Your App is Running!

**Frontend:** http://localhost:3002/
**Backend:** http://localhost:5001/ (API)

## Quick 5-Minute Test

### Step 1: Open the App (30 seconds)

1. Open your browser
2. Go to: **http://localhost:3002/**
3. You should see "Crypto Payment Widget" with two tabs

### Step 2: Test Simple Payment (2 minutes)

1. **Click "Simple Payment" tab** (if not already selected)

2. **Connect Your Wallet:**
   - Click the wallet connect button
   - Choose MetaMask (or your wallet)
   - Approve the connection
   - You should see "Connected: 0x..." in green

3. **Enter Test Payment:**
   - Amount: `0.001` (or any small amount)
   - Recipient: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
   - Click "Pay 0.001 ETH"

4. **Approve in Wallet:**
   - MetaMask will pop up
   - Review the transaction
   - Click "Confirm"

5. **See Success:**
   - Wait a few seconds
   - You'll see "Transaction successful!"
   - Transaction hash will appear
   - Click "View on Etherscan" to verify

### Step 3: Test Smart Contract UI (2 minutes)

**Note:** Smart contract features require deployment first. For now, just test the UI.

1. **Click "Smart Contract" tab**

2. **Explore the Interface:**
   - See the three modes: Direct Payment, Escrow, Split Payment
   - Notice the statistics section (Total Sent, Received, Payments)
   - Try switching between modes

3. **Test Direct Payment UI:**
   - Enter a recipient address
   - Enter an amount
   - Add metadata (optional)
   - Notice the "Send Payment" button

4. **Test Escrow UI:**
   - Click "Escrow" mode
   - See the time picker for release time
   - Notice the "Manage Escrow" section below

5. **Test Split Payment UI:**
   - Click "Split Payment" mode
   - Click "+ Add Recipient" to add more
   - Enter different amounts
   - See the total calculation at the bottom

## What You Should See

### ✅ Working Features:
- Wallet connection via WalletConnect
- Simple ETH transfers
- Real-time transaction status
- Etherscan links
- Modern, responsive UI
- Tab navigation
- Loading states
- Error messages

### ⏳ Requires Deployment:
- Smart contract direct payments
- Escrow functionality
- Split payments
- Payment statistics

## Quick Checks

### Is the Frontend Working?
- [ ] Page loads at http://localhost:3002/
- [ ] You see "Crypto Payment Widget" title
- [ ] Two tabs are visible: "Simple Payment" and "Smart Contract"
- [ ] UI looks modern and styled (not plain HTML)

### Can You Connect a Wallet?
- [ ] Wallet connect button appears
- [ ] Clicking it opens wallet selection
- [ ] You can connect MetaMask or other wallet
- [ ] After connecting, you see "Connected: 0x..."

### Can You Send a Simple Payment?
- [ ] Amount and recipient fields work
- [ ] "Pay" button is clickable when connected
- [ ] Clicking it opens your wallet
- [ ] Transaction can be confirmed
- [ ] Success message appears

## Common Issues & Quick Fixes

### Issue: Page won't load
**Fix:** Check the dev server is running. Look for "Local: http://localhost:3002/" in the terminal.

### Issue: Wallet won't connect
**Fix:** 
- Make sure MetaMask is installed
- Check your WalletConnect Project ID in `.env`
- Try refreshing the page

### Issue: "Contract not deployed" message
**This is normal!** Smart contract features need deployment first. Simple payments work without it.

### Issue: Transaction fails
**Fix:**
- Make sure you have enough ETH for gas
- Check you're on the right network (Sepolia for testing)
- Verify the recipient address is valid

## Get Test ETH (Free!)

To test without spending real money:

1. **Switch to Sepolia Testnet:**
   - Open MetaMask
   - Click network dropdown at top
   - Select "Sepolia"

2. **Get Free Test ETH:**
   - Go to: https://sepoliafaucet.com/
   - Enter your wallet address
   - Click "Send Me ETH"
   - Wait 1-2 minutes

3. **Test with Free ETH:**
   - Now you can test payments without cost!
   - Use small amounts like 0.001 ETH

## Next Steps

### To Deploy Smart Contract:

1. **Get Sepolia Test ETH** (see above)

2. **Add to `.env`:**
   ```env
   PRIVATE_KEY=your-wallet-private-key-here
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY
   ```

3. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. **Add Contract Address to `.env`:**
   ```env
   VITE_CONTRACT_ADDRESS=0xYourContractAddress
   ```

5. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

See `DEPLOYMENT.md` for detailed instructions.

## Test Results

After testing, you should have:

✅ **Working:**
- Simple wallet-to-wallet payments
- WalletConnect integration
- Transaction tracking
- Modern UI

⏳ **Ready to Deploy:**
- Smart contract payments
- Escrow system
- Split payments
- On-chain tracking

## Need Help?

1. **Check browser console** (Press F12)
2. **Check terminal** for server errors
3. **Review `.env`** file configuration
4. **See `TESTING_GUIDE.md`** for detailed tests
5. **See `DEPLOYMENT.md`** for contract deployment

---

## 🎉 Start Testing Now!

**Open:** http://localhost:3002/

**Try:** Connect wallet → Enter amount → Send payment → Success!

It's that simple! 🚀
