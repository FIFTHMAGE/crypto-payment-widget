# Changelog

## [2.0.0] - Migration to Reown AppKit

### Added
- ✨ Reown AppKit integration (formerly WalletConnect AppKit)
- ✨ Wagmi v2 integration with React hooks
- ✨ Support for multiple chains (Ethereum, Polygon, Arbitrum, Base)
- ✨ `<appkit-button />` web component for wallet connection
- ✨ Better transaction status tracking with `useWaitForTransactionReceipt`
- ✨ Improved error handling and user feedback
- ✨ TypeScript type definitions for AppKit web components

### Changed
- 🔄 Migrated from direct WalletConnect SDK to Reown AppKit
- 🔄 Replaced custom `WalletConnectService` with Wagmi hooks
- 🔄 Project ID and chains now configured globally in `config/appkit.ts`
- 🔄 Updated `viem` to v2.x
- 🔄 Simplified component API (removed `projectId` and `chains` props)

### Removed
- ❌ `@walletconnect/ethereum-provider` dependency
- ❌ `@walletconnect/modal` dependency
- ❌ `@walletconnect/types` dependency
- ❌ Custom `WalletConnectService` class
- ❌ `projectId` and `chains` props from `PayWithWallet` component

### Fixed
- 🐛 Better error messages and validation
- 🐛 Improved transaction status handling
- 🐛 Fixed address validation

### Migration Guide
See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions.

## [1.0.0] - Initial Release

### Added
- ✅ Basic WalletConnect integration
- ✅ Payment widget component
- ✅ Backend API for transaction logging
- ✅ React + TypeScript setup
- ✅ Tailwind CSS styling
- ✅ Demo application

