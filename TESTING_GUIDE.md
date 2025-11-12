# Testing Guide

## Quick Start Testing

### 1. Open the Application

**Frontend URL:** http://localhost:3002/

The app should load with two payment modes:
- Simple Payment
- Smart Contract

## Test Simple Payment Mode

### Prerequisites
- MetaMask or any WalletConnect-compatible wallet installed
- Some test ETH (use Sepolia testnet for free testing)

### Steps to Test:

1. **Open the app** at http://localhost:3002/

2. **Click "Simple Payment" tab** (should be selected by default)

3. **Connect Your Wallet:**
   - Click the "Connect Wallet" button
   - Choose your wallet (MetaMask, WalletConnect, etc.)
   - Approve the connection

4. **Enter Payment Details:**
   - **Amount:** Try `0.001` ETH (small amount for testing)
   - **Recipient:** Use a test address or your own secondary wallet
     - Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

5. **Send Payment:**
   - Click "Pay 0.001 ETH" button
   - Your wallet will pop up asking for confirmation
   - Review the transaction details
   - Confirm the transaction

6. **Verify Success:**
   - You should see a success message
   - Transaction hash will be displayed
   - Click "View on Etherscan" to see the transaction

### Expected Results:
✅ Wallet connects successfully
✅ Payment button is enabled
✅ Transaction is sent
✅ Success message appears
✅ Transaction hash is displayed
✅ Etherscan link works

## Test Smart Contract Mode (After Deployment)

### Prerequisites
- Contract must be deployed first (see DEPLOYMENT.md)
- Contract address added to `.env` as `VITE_CONTRACT_ADDRESS`
- Dev server restarted after adding contract address

### Test Direct Payment:

1. **Click "Smart Contract" tab**

2. **Select "Direct Payment" mode** (default)

3. **Check Statistics:**
   - Should show Total Sent, Total Received, Total Payments
   - Initially will be 0 for new addresses

4. **Enter Payment Details:**
   - Recipient: Test address
   - Amount: `0.001` ETH
   - Metadata: `Test Payment #1` (optional)

5. **Send Payment:**
   - Click "Send Payment"
   - Approve in wallet
   - Wait for confirmation

6. **Verify:**
   - Success message appears
   - Statistics update
   - Transaction hash displayed

### Test Escrow Payment:

1. **Click "Escrow" mode**

2. **Read the warning** about escrow functionality

3. **Create Escrow:**
   - Recipient: Test address
   - Amount: `0.001` ETH
   - Release Time: Set to 5 minutes from now
   - Metadata: `Test Escrow`
   - Click "Create Escrow"

4. **Copy the Escrow ID** from the transaction

5. **Test Release:**
   - Paste Escrow ID in "Manage Escrow" section
   - Click "Release" button
   - Approve in wallet
   - Funds should be sent to recipient

6. **Test Refund (create new escrow first):**
   - Create another escrow
   - Paste new Escrow ID
   - Click "Refund" button
   - Funds should return to you

### Test Split Payment:

1. **Click "Split Payment" mode**

2. **Add Recipients:**
   - Default has 2 recipients
   - Click "+ Add Recipient" to add more
   - Enter addresses and amounts for each

3. **Example Split:**
   - Recipient 1: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb` - `0.001` ETH
   - Recipient 2: `0x123...` - `0.002` ETH
   - Total: `0.003` ETH

4. **Send Split Payment:**
   - Click "Split Payment"
   - Approve in wallet
   - All recipients receive funds in one transaction

## Testing on Different Networks

### Sepolia Testnet (Recommended for Testing)

1. **Get Test ETH:**
   - Visit https://sepoliafaucet.com/
   - Enter your wallet address
   - Receive free test ETH

2. **Switch Network in Wallet:**
   - Open MetaMask
   - Click network dropdown
   - Select "Sepolia"

3. **Test all features** with free test ETH

### Local Hardhat Network

1. **Start Hardhat Node:**
   ```bash
   npx hardhat node
   ```

2. **Deploy Contract:**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Add Local Network to MetaMask:**
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH

4. **Import Test Account:**
   - Hardhat provides test accounts with 10000 ETH each
   - Import private key from Hardhat output

5. **Test all features** with unlimited test ETH

## Common Test Scenarios

### Scenario 1: Simple Payment Flow
```
1. Connect wallet → 2. Enter amount → 3. Send → 4. Confirm → 5. Success
```

### Scenario 2: Escrow with Time Lock
```
1. Create escrow with future release time
2. Try to release immediately (should fail)
3. Wait for release time
4. Release successfully
```

### Scenario 3: Split Payment to 3 Recipients
```
1. Add 3 recipients
2. Set different amounts
3. Send in one transaction
4. Verify all received funds
```

### Scenario 4: Payment with Metadata
```
1. Send payment with order ID
2. Check transaction on Etherscan
3. Verify metadata is stored
```

## Troubleshooting Tests

### Issue: "Contract not deployed" error
**Solution:** 
- Deploy contract first (see DEPLOYMENT.md)
- Add contract address to `.env`
- Restart dev server

### Issue: Transaction fails
**Solution:**
- Check you have enough ETH for gas
- Verify recipient address is valid
- Check you're on the correct network
- Try increasing gas limit

### Issue: Wallet won't connect
**Solution:**
- Refresh the page
- Check WalletConnect Project ID in `.env`
- Try different browser
- Clear browser cache

### Issue: "Insufficient funds"
**Solution:**
- Get test ETH from faucet
- Check you're on testnet, not mainnet
- Verify wallet balance

## Test Checklist

### Simple Payment Mode
- [ ] Wallet connection works
- [ ] Can enter amount and recipient
- [ ] Payment button is clickable
- [ ] Transaction is sent
- [ ] Success message appears
- [ ] Transaction hash is displayed
- [ ] Etherscan link works
- [ ] Backend logs transaction

### Smart Contract Mode - Direct Payment
- [ ] Contract address is displayed
- [ ] Statistics show correctly
- [ ] Can send payment
- [ ] Platform fee is deducted (0.25%)
- [ ] Metadata is stored
- [ ] Transaction confirms

### Smart Contract Mode - Escrow
- [ ] Can create escrow
- [ ] Release time validation works
- [ ] Can release escrow
- [ ] Can refund escrow
- [ ] Funds are held securely
- [ ] Time lock is enforced

### Smart Contract Mode - Split Payment
- [ ] Can add/remove recipients
- [ ] Total amount calculates correctly
- [ ] All recipients receive funds
- [ ] Single transaction for all
- [ ] Gas is optimized

### UI/UX
- [ ] Responsive on mobile
- [ ] Loading states show
- [ ] Error messages are clear
- [ ] Success feedback is visible
- [ ] Navigation is intuitive
- [ ] Buttons are disabled when appropriate

## Performance Testing

### Gas Usage
- Simple payment: ~21,000 gas
- Direct contract payment: ~50,000-70,000 gas
- Escrow creation: ~100,000-120,000 gas
- Split payment (3 recipients): ~150,000-200,000 gas

### Transaction Speed
- Simple payment: 1-2 blocks (~12-24 seconds)
- Contract interactions: 1-3 blocks (~12-36 seconds)

## Security Testing

### Test Invalid Inputs
- [ ] Invalid recipient address (should fail)
- [ ] Zero amount (should fail)
- [ ] Negative amount (should fail)
- [ ] Empty fields (should fail)
- [ ] Very large amounts (should warn)

### Test Edge Cases
- [ ] Disconnect wallet mid-transaction
- [ ] Switch networks during transaction
- [ ] Multiple rapid transactions
- [ ] Transaction rejection in wallet
- [ ] Network timeout

## Browser Testing

Test on multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Brave

## Mobile Testing

Test on mobile devices:
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] MetaMask mobile app
- [ ] Trust Wallet app

## Next Steps After Testing

1. **If all tests pass:**
   - Deploy to testnet
   - Test on testnet
   - Deploy to mainnet (when ready)

2. **If tests fail:**
   - Check console for errors
   - Review error messages
   - Check network connection
   - Verify configuration

3. **For production:**
   - Add comprehensive error logging
   - Set up monitoring
   - Add analytics
   - Implement rate limiting
   - Add database for transactions

## Support

If you encounter issues:
1. Check browser console (F12)
2. Check dev server logs
3. Verify `.env` configuration
4. Review DEPLOYMENT.md
5. Check network status

---

**Happy Testing!** 🧪

Start with Simple Payment mode on Sepolia testnet for the easiest testing experience.
