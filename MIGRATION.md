# Migration to Reown AppKit

This project has been migrated from the direct WalletConnect SDK to **Reown AppKit** (formerly WalletConnect AppKit) with Wagmi integration.

## What Changed

### Dependencies
- ❌ Removed: `@walletconnect/ethereum-provider`, `@walletconnect/modal`, `@walletconnect/types`
- ✅ Added: `@reown/appkit`, `@reown/appkit-adapter-wagmi`
- ✅ Updated: `viem` to v2.x, `wagmi` to v2.x

### Architecture
- **Before**: Custom `WalletConnectService` class managing WalletConnect directly
- **After**: Reown AppKit with Wagmi hooks (`useAccount`, `useSendTransaction`, etc.)

### Configuration
- **Before**: Project ID and chains passed as props to `PayWithWallet`
- **After**: Project ID and chains configured globally in `config/appkit.ts`

### Component API
- **Before**: Required `projectId` and `chains` props
- **After**: No props needed (configured globally), uses `<appkit-button />` web component

## Benefits

1. **Better Integration**: Reown AppKit provides a more polished wallet connection experience
2. **Wagmi Hooks**: Use standard Wagmi hooks for all Ethereum interactions
3. **Multi-chain Support**: Easy to add more chains in configuration
4. **Better UX**: Built-in wallet modal with better UI/UX
5. **Type Safety**: Better TypeScript support with Wagmi

## Migration Guide

### For Existing Users

1. **Update Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Update Environment Variables**:
   - Ensure `VITE_WALLETCONNECT_PROJECT_ID` is set in `.env`
   - No changes needed to the variable name

3. **Update Component Usage**:
   ```tsx
   // Before
   <PayWithWallet
     amount="0.01"
     recipient="0x..."
     projectId="your-project-id"
     chains={[1]}
   />

   // After
   <PayWithWallet
     amount="0.01"
     recipient="0x..."
   />
   ```

4. **Wrap Your App**:
   ```tsx
   // Already done in main.tsx
   import AppKitProvider from './context/AppKitProvider'
   
   <AppKitProvider>
     <App />
   </AppKitProvider>
   ```

### Configuration

Chains are now configured in `frontend/src/config/appkit.ts`:

```ts
export const networks: [Chain, ...Chain[]] = [mainnet, arbitrum, base, polygon]
```

To add more chains, import from `@reown/appkit/networks` and add to the array.

## New Features

1. **Web Component**: Use `<appkit-button />` anywhere in your app
2. **Better Error Handling**: Improved error messages and handling
3. **Transaction Status**: Real-time transaction status with `useWaitForTransactionReceipt`
4. **Multi-chain**: Support for Ethereum, Polygon, Arbitrum, Base (easily extensible)

## Breaking Changes

1. **Props Removed**: `projectId`, `chains` props no longer accepted
2. **Internal API**: Component now uses Wagmi hooks instead of custom service
3. **Connection Flow**: Uses AppKit's modal instead of custom WalletConnect modal

## Need Help?

- Check the [README.md](./README.md) for usage examples
- See [USAGE.md](./USAGE.md) for detailed usage guide
- Review [config/appkit.ts](./frontend/src/config/appkit.ts) for configuration options

