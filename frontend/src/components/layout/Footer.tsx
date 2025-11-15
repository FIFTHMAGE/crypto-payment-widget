import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Crypto Payment Widget. Built with React, Wagmi, and WalletConnect.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Production-ready payment infrastructure for Web3
          </p>
        </div>
      </div>
    </footer>
  )
}

