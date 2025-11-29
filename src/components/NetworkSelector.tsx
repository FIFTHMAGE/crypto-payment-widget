/**
 * NetworkSelector Component
 * Select blockchain network for payments
 */

import React, { useState, useCallback } from 'react';

export interface Network {
  chainId: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorerUrl: string;
  logoURI?: string;
  isTestnet?: boolean;
  color?: string;
}

export interface NetworkSelectorProps {
  networks: Network[];
  selectedNetwork: Network | null;
  onSelect: (network: Network) => void;
  showTestnets?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  networks,
  selectedNetwork,
  onSelect,
  showTestnets = false,
  disabled = false,
  label = 'Network',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredNetworks = networks.filter(network => {
    if (!showTestnets && network.isTestnet) return false;
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      network.name.toLowerCase().includes(searchLower) ||
      network.shortName.toLowerCase().includes(searchLower) ||
      network.nativeCurrency.symbol.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = useCallback((network: Network) => {
    onSelect(network);
    setIsOpen(false);
    setSearch('');
  }, [onSelect]);

  const getNetworkColor = (network: Network): string => {
    return network.color || '#6366F1';
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      {/* Selected Network Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer'
        }`}
      >
        {selectedNetwork ? (
          <>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: getNetworkColor(selectedNetwork) }}
            >
              {selectedNetwork.logoURI ? (
                <img
                  src={selectedNetwork.logoURI}
                  alt={selectedNetwork.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                selectedNetwork.shortName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedNetwork.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedNetwork.nativeCurrency.symbol}
              </p>
            </div>
          </>
        ) : (
          <span className="text-gray-400">Select network</span>
        )}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search networks..."
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Network List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredNetworks.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No networks found
              </div>
            ) : (
              <>
                {/* Mainnet Networks */}
                <div className="p-2">
                  {filteredNetworks.filter(n => !n.isTestnet).map((network) => (
                    <button
                      key={network.chainId}
                      type="button"
                      onClick={() => handleSelect(network)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        selectedNetwork?.chainId === network.chainId
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: getNetworkColor(network) }}
                      >
                        {network.logoURI ? (
                          <img
                            src={network.logoURI}
                            alt={network.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          network.shortName.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {network.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Chain ID: {network.chainId}
                        </p>
                      </div>
                      {selectedNetwork?.chainId === network.chainId && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                {/* Testnet Networks */}
                {showTestnets && filteredNetworks.filter(n => n.isTestnet).length > 0 && (
                  <>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Testnets
                      </p>
                    </div>
                    <div className="p-2">
                      {filteredNetworks.filter(n => n.isTestnet).map((network) => (
                        <button
                          key={network.chainId}
                          type="button"
                          onClick={() => handleSelect(network)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            selectedNetwork?.chainId === network.chainId
                              ? 'bg-blue-50 dark:bg-blue-900/20'
                              : ''
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm opacity-75"
                            style={{ backgroundColor: getNetworkColor(network) }}
                          >
                            {network.shortName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {network.name}
                              </p>
                              <span className="px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                                Testnet
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearch('');
          }}
        />
      )}
    </div>
  );
};

export default React.memo(NetworkSelector);

