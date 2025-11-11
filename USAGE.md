# Usage Guide

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
PORT=5000
```

Get your WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)

### 3. Run the Application

```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

## Using the Widget in Your Project

### Basic Integration

```tsx
import PayWithWallet from './components/PayWithWallet'

function CheckoutPage() {
  return (
    <PayWithWallet
      amount="0.01"
      recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      onSuccess={(txHash) => {
        console.log('Payment successful!', txHash)
        // Redirect to success page
      }}
      onError={(error) => {
        console.error('Payment failed:', error)
        // Show error message
      }}
    />
  )
}
```

**Note**: Project ID is configured globally in `config/appkit.ts`. No need to pass it as a prop.

### With Transaction Logging

```tsx
<PayWithWallet
  amount="0.01"
  recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  onSuccess={(txHash) => {
    // Handle success
  }}
  onTransactionLogged={(data) => {
    // Transaction was logged to backend
    console.log('Transaction logged:', data)
    // Update UI, send confirmation email, etc.
  }}
/>
```

### Custom Styling

```tsx
<PayWithWallet
  amount="0.01"
  recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  className="my-custom-class"
  projectId="your-walletconnect-project-id"
/>
```

### Multiple Chains

```tsx
// Chains are configured globally in config/appkit.ts
// Supported chains: Ethereum, Polygon, Arbitrum, Base
// To add more chains, edit frontend/src/config/appkit.ts

<PayWithWallet
  amount="0.01"
  recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
/>
```

## Backend API Usage

### Log Transaction

```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "amount": "0.01",
    "value": "0x2386f26fc10000"
  }'
```

### Get All Transactions

```bash
curl http://localhost:5000/api/transactions?limit=10&offset=0
```

### Get Transaction by Hash

```bash
curl http://localhost:5000/api/transactions/0x...
```

## Production Deployment

### Frontend

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

3. Set environment variables in your hosting provider's dashboard

### Backend

1. Set up a database (replace in-memory storage)

2. Add environment variables:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=your-database-url
```

3. Deploy to your server (AWS, Heroku, Railway, etc.)

### Environment Variables for Production

- `VITE_WALLETCONNECT_PROJECT_ID` - Your WalletConnect Project ID
- `PORT` - Backend port (default: 5000)
- `NODE_ENV` - Set to "production"

## Customization

### Changing the Button Text

Modify the component in `frontend/src/components/PayWithWallet.tsx`:

```tsx
// Change "Pay with Wallet" to your custom text
{isConnecting ? 'Connecting...' : 'Your Custom Text'}
```

### Adding Custom Validation

Add validation logic in the `handlePayment` function:

```tsx
const handlePayment = async () => {
  // Add your custom validation
  if (amount > maxAmount) {
    throw new Error('Amount exceeds maximum')
  }
  // ... rest of the function
}
```

### Custom Transaction Processing

Modify the backend in `backend/src/server.js` to add:
- Database storage
- Email notifications
- Webhook calls
- Off-ramp integration

## Troubleshooting

### WalletConnect Modal Not Opening

- Check that your Project ID is correct
- Ensure you're using HTTPS in production (WalletConnect requires HTTPS)
- Check browser console for errors

### Transaction Fails

- Verify recipient address is valid
- Check that amount is greater than 0
- Ensure wallet has sufficient balance
- Check network (mainnet, testnet, etc.)

### Backend Not Logging Transactions

- Verify backend is running on port 5000
- Check CORS settings
- Verify API endpoint is correct
- Check backend logs for errors

## Support

For issues and questions, please check the README.md or open an issue on GitHub.

