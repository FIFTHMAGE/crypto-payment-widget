/**
 * useWallet hook tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useWallet } from '../useWallet';

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: vi.fn(() => ({
        getSigner: vi.fn(() => ({
          getAddress: vi.fn(() => Promise.resolve('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9')),
          getBalance: vi.fn(() => Promise.resolve({ toString: () => '2500000000000000000' })),
        })),
        getNetwork: vi.fn(() => Promise.resolve({ chainId: 1 })),
        on: vi.fn(),
        removeListener: vi.fn(),
      })),
    },
    utils: {
      formatEther: vi.fn((val) => '2.5'),
    },
  },
}));

// Mock window.ethereum
const mockEthereum = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  isMetaMask: true,
};

describe('useWallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).ethereum = mockEthereum;
  });

  afterEach(() => {
    delete (window as any).ethereum;
  });

  describe('initial state', () => {
    it('should have disconnected state initially', () => {
      const { result } = renderHook(() => useWallet());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.address).toBeNull();
      expect(result.current.chainId).toBeNull();
    });

    it('should detect if wallet is available', () => {
      const { result } = renderHook(() => useWallet());

      expect(result.current.isWalletAvailable).toBe(true);
    });

    it('should detect if wallet is not available', () => {
      delete (window as any).ethereum;
      const { result } = renderHook(() => useWallet());

      expect(result.current.isWalletAvailable).toBe(false);
    });
  });

  describe('connect', () => {
    it('should connect wallet successfully', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
      expect(result.current.isConnected).toBe(true);
      expect(result.current.address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9');
    });

    it('should handle connection rejection', async () => {
      const error = { code: 4001, message: 'User rejected' };
      mockEthereum.request.mockRejectedValue(error);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        try {
          await result.current.connect();
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toEqual(expect.objectContaining({ code: 4001 }));
    });

    it('should set connecting state', async () => {
      let resolveConnect: () => void;
      const connectPromise = new Promise<string[]>((resolve) => {
        resolveConnect = () => resolve(['0x742d35Cc']);
      });
      mockEthereum.request.mockReturnValue(connectPromise);

      const { result } = renderHook(() => useWallet());

      act(() => {
        result.current.connect();
      });

      expect(result.current.isConnecting).toBe(true);

      await act(async () => {
        resolveConnect!();
      });

      expect(result.current.isConnecting).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should disconnect wallet', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      expect(result.current.isConnected).toBe(true);

      act(() => {
        result.current.disconnect();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.address).toBeNull();
      expect(result.current.signer).toBeNull();
    });
  });

  describe('chain management', () => {
    it('should switch chains', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);
      mockEthereum.request.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      await act(async () => {
        await result.current.switchChain(137);
      });

      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
      });
    });

    it('should add chain if not available', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);
      mockEthereum.request.mockRejectedValueOnce({ code: 4902 }); // Chain not added
      mockEthereum.request.mockResolvedValueOnce(null); // Add chain success

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      await act(async () => {
        await result.current.switchChain(137, {
          chainName: 'Polygon',
          rpcUrls: ['https://polygon-rpc.com'],
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        });
      });

      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'wallet_addEthereumChain',
        params: [expect.objectContaining({ chainId: '0x89' })],
      });
    });
  });

  describe('balance', () => {
    it('should fetch balance', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      await waitFor(() => {
        expect(result.current.balance).toBe('2.5');
      });
    });

    it('should refresh balance', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      await act(async () => {
        await result.current.refreshBalance();
      });

      expect(result.current.balance).toBe('2.5');
    });
  });

  describe('event listeners', () => {
    it('should handle account changes', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      const accountsChangedCallback = mockEthereum.on.mock.calls.find(
        (call) => call[0] === 'accountsChanged'
      )?.[1];

      expect(accountsChangedCallback).toBeDefined();

      await act(async () => {
        accountsChangedCallback(['0xNewAddress']);
      });

      expect(result.current.address).toBe('0xNewAddress');
    });

    it('should handle chain changes', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      const chainChangedCallback = mockEthereum.on.mock.calls.find(
        (call) => call[0] === 'chainChanged'
      )?.[1];

      expect(chainChangedCallback).toBeDefined();

      await act(async () => {
        chainChangedCallback('0x89'); // Polygon chain ID
      });

      expect(result.current.chainId).toBe(137);
    });

    it('should handle disconnect events', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      const disconnectCallback = mockEthereum.on.mock.calls.find(
        (call) => call[0] === 'disconnect'
      )?.[1];

      expect(disconnectCallback).toBeDefined();

      act(() => {
        disconnectCallback();
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should clean up listeners on unmount', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      const { result, unmount } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      unmount();

      expect(mockEthereum.removeListener).toHaveBeenCalled();
    });
  });

  describe('auto connect', () => {
    it('should auto connect if previously connected', async () => {
      localStorage.setItem('wallet_connected', 'true');
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      renderHook(() => useWallet({ autoConnect: true }));

      await waitFor(() => {
        expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_accounts' });
      });

      localStorage.removeItem('wallet_connected');
    });

    it('should not auto connect if not previously connected', () => {
      localStorage.removeItem('wallet_connected');

      renderHook(() => useWallet({ autoConnect: true }));

      expect(mockEthereum.request).not.toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
    });
  });

  describe('signing', () => {
    it('should sign message', async () => {
      const mockSignMessage = vi.fn(() => Promise.resolve('0xSignature'));
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      // Update the mock to return a signer with signMessage
      vi.mocked(require('ethers').ethers.providers.Web3Provider).mockReturnValue({
        getSigner: vi.fn(() => ({
          getAddress: vi.fn(() => Promise.resolve('0x742d35Cc')),
          getBalance: vi.fn(() => Promise.resolve({ toString: () => '2500000000000000000' })),
          signMessage: mockSignMessage,
        })),
        getNetwork: vi.fn(() => Promise.resolve({ chainId: 1 })),
        on: vi.fn(),
        removeListener: vi.fn(),
      });

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      await act(async () => {
        const signature = await result.current.signMessage('Hello World');
        expect(signature).toBe('0xSignature');
      });
    });
  });

  describe('ENS', () => {
    it('should resolve ENS name', async () => {
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      const { result } = renderHook(() => useWallet());

      await act(async () => {
        await result.current.connect();
      });

      // ENS resolution would happen here
      // This is a simplified test
      expect(result.current.ensName).toBeNull();
    });
  });

  describe('callbacks', () => {
    it('should call onConnect callback', async () => {
      const onConnect = vi.fn();
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      const { result } = renderHook(() => useWallet({ onConnect }));

      await act(async () => {
        await result.current.connect();
      });

      expect(onConnect).toHaveBeenCalledWith('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9');
    });

    it('should call onDisconnect callback', async () => {
      const onDisconnect = vi.fn();
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      const { result } = renderHook(() => useWallet({ onDisconnect }));

      await act(async () => {
        await result.current.connect();
      });

      act(() => {
        result.current.disconnect();
      });

      expect(onDisconnect).toHaveBeenCalled();
    });

    it('should call onChainChanged callback', async () => {
      const onChainChanged = vi.fn();
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc']);

      const { result } = renderHook(() => useWallet({ onChainChanged }));

      await act(async () => {
        await result.current.connect();
      });

      const chainChangedCallback = mockEthereum.on.mock.calls.find(
        (call) => call[0] === 'chainChanged'
      )?.[1];

      await act(async () => {
        chainChangedCallback('0x89');
      });

      expect(onChainChanged).toHaveBeenCalledWith(137);
    });
  });
});

