/** WalletBalance - Wallet balance tracker */
export const WalletBalance = ({ balance = '1.5432' }: { balance?: string }) => <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg"><p className="text-sm opacity-80">Total Balance</p><p className="text-3xl font-bold">{balance} ETH</p><p className="text-sm opacity-80 mt-2">≈ $3,086.40 USD</p></div>;
