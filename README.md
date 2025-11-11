# Crypto Payment Widget

A drop-in crypto payment widget using WalletConnect SDK for merchant sites or events. Users can pay with their crypto wallets through a simple "Pay with Wallet" button.

## Features

- 🔗 **Reown AppKit Integration** - Connect to 300+ crypto wallets via WalletConnect
- 🎯 **Wagmi Integration** - Modern React hooks for Ethereum interactions
- 💰 **Easy Payment Flow** - Simple "Pay with Wallet" button
- 📊 **Transaction Logging** - Automatic backend transaction logging
- 🎨 **Modern UI** - Beautiful, responsive design
- ⚡ **TypeScript** - Fully typed for better development experience
- 🔒 **Secure** - Transaction signing through WalletConnect

## Flow

1. User clicks "Pay with Wallet"
2. WalletConnect modal opens with QR code
3. User scans QR code with their wallet app
4. User reviews and signs the transaction
5. Backend logs the transaction
6. Success confirmation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Reown/WalletConnect Project ID (get one at [cloud.walletconnect.com](https://cloud.walletconnect.com))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd "Pay widget"
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` and add your WalletConnect Project ID:
```
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
```

### Running the Application

Start both frontend and backend:
```bash
npm run dev
```

Or run them separately:
```bash
# Frontend (port 3000)
npm run dev:frontend

# Backend (port 5000)
npm run dev:backend
```

### Building for Production

```bash
npm run build
```

## Usage

### Basic Usage

```tsx
import PayWithWallet from './components/PayWithWallet'

function App() {
  return (
    <PayWithWallet
      amount="0.01"
      recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      onSuccess={(txHash) => console.log('Payment successful:', txHash)}
      onError={(error) => console.error('Payment failed:', error)}
      projectId="your-walletconnect-project-id"
      chains={[1]} // Ethereum mainnet
    />
  )
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `amount` | `string` | Yes | Amount in ETH or native token |
| `recipient` | `string` | Yes | Recipient wallet address |
| `onSuccess` | `(txHash: string) => void` | No | Callback on successful payment |
| `onError` | `(error: Error) => void` | No | Callback on error |
| `onTransactionLogged` | `(data: any) => void` | No | Callback when transaction is logged |
| `className` | `string` | No | Additional CSS classes |
| `disabled` | `boolean` | No | Disable the button |

**Note**: Project ID and chains are configured globally in `config/appkit.ts`. See [Configuration](#configuration) section.

## API Endpoints

### POST /api/transactions
Log a transaction.

**Request Body:**
```json
{
  "txHash": "0x...",
  "from": "0x...",
  "to": "0x...",
  "amount": "0.01",
  "value": "0x2386f26fc10000",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/transactions
Get all transactions (with pagination).

**Query Parameters:**
- `limit` - Number of transactions to return (default: 50)
- `offset` - Number of transactions to skip (default: 0)

### GET /api/transactions/:txHash
Get a specific transaction by hash.

### POST /api/transactions/:txHash/verify
Verify a transaction (optional).

## Project Structure

```
.
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PayWithWallet.tsx    # Main payment widget component
│   │   ├── utils/
│   │   │   └── walletConnect.ts     # WalletConnect service
│   │   ├── App.tsx                  # Demo app
│   │   └── main.tsx                 # Entry point
│   └── package.json
├── backend/
│   ├── src/
│   │   └── server.js                # Express server
│   └── package.json
└── package.json
```

## Customization

### Styling
The component uses Tailwind CSS. You can customize the styles by:
1. Modifying the `className` prop
2. Overriding Tailwind classes in `tailwind.config.js`
3. Adding custom CSS

### Configuration

Chains and Project ID are configured in `frontend/src/config/appkit.ts`:

```ts
// config/appkit.ts
import { mainnet, arbitrum, base, polygon } from '@reown/appkit/networks'

export const networks: [Chain, ...Chain[]] = [mainnet, arbitrum, base, polygon]
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
```

To add more chains, import from `@reown/appkit/networks` and add to the `networks` array.

## Production Considerations

1. **Database**: Replace in-memory storage with a database (PostgreSQL, MongoDB, etc.)
2. **Transaction Verification**: Implement on-chain transaction verification
3. **Error Handling**: Add comprehensive error handling and logging
4. **Security**: Add rate limiting, authentication, and input validation
5. **Off-ramp Integration**: Integrate with off-ramp APIs if needed
6. **Webhooks**: Set up webhooks for payment notifications
7. **Monitoring**: Add monitoring and alerting

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

