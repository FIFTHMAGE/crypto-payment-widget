/**
 * ConnectButton component tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ConnectButton } from '../ConnectButton';

const mockWalletConnectors = [
  { id: 'metamask', name: 'MetaMask', icon: '/wallets/metamask.png' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '/wallets/walletconnect.png' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '/wallets/coinbase.png' },
  { id: 'injected', name: 'Browser Wallet', icon: '/wallets/browser.png' },
];

describe('ConnectButton', () => {
  const defaultProps = {
    onConnect: vi.fn(),
    onDisconnect: vi.fn(),
    connectors: mockWalletConnectors,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('disconnected state', () => {
    it('should render connect button', () => {
      render(<ConnectButton {...defaultProps} />);

      expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
    });

    it('should open wallet modal on click', async () => {
      render(<ConnectButton {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /connect/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should show all wallet options', async () => {
      render(<ConnectButton {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /connect/i }));

      expect(screen.getByText('MetaMask')).toBeInTheDocument();
      expect(screen.getByText('WalletConnect')).toBeInTheDocument();
      expect(screen.getByText('Coinbase Wallet')).toBeInTheDocument();
    });

    it('should call onConnect with connector when wallet selected', async () => {
      const onConnect = vi.fn();
      render(<ConnectButton {...defaultProps} onConnect={onConnect} />);

      await userEvent.click(screen.getByRole('button', { name: /connect/i }));
      await userEvent.click(screen.getByText('MetaMask'));

      expect(onConnect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'metamask' })
      );
    });

    it('should close modal on wallet selection', async () => {
      render(<ConnectButton {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /connect/i }));
      await userEvent.click(screen.getByText('MetaMask'));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close modal on backdrop click', async () => {
      render(<ConnectButton {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /connect/i }));
      await userEvent.click(screen.getByTestId('modal-backdrop'));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('connecting state', () => {
    it('should show connecting indicator', () => {
      render(<ConnectButton {...defaultProps} isConnecting />);

      expect(screen.getByText(/connecting/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should disable button while connecting', () => {
      render(<ConnectButton {...defaultProps} isConnecting />);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show which wallet is connecting', () => {
      render(
        <ConnectButton
          {...defaultProps}
          isConnecting
          connectingWallet="metamask"
        />
      );

      expect(screen.getByText(/connecting.*metamask/i)).toBeInTheDocument();
    });
  });

  describe('connected state', () => {
    const connectedProps = {
      ...defaultProps,
      isConnected: true,
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
      balance: '2.5',
      balanceSymbol: 'ETH',
    };

    it('should show connected button', () => {
      render(<ConnectButton {...connectedProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show truncated address', () => {
      render(<ConnectButton {...connectedProps} />);

      expect(screen.getByText(/0x742d.*f44e/i)).toBeInTheDocument();
    });

    it('should show balance', () => {
      render(<ConnectButton {...connectedProps} showBalance />);

      expect(screen.getByText(/2\.5.*ETH/i)).toBeInTheDocument();
    });

    it('should show ENS name when available', () => {
      render(<ConnectButton {...connectedProps} ensName="user.eth" />);

      expect(screen.getByText('user.eth')).toBeInTheDocument();
    });

    it('should open dropdown on click', async () => {
      render(<ConnectButton {...connectedProps} />);

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should show disconnect option', async () => {
      render(<ConnectButton {...connectedProps} />);

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByRole('menuitem', { name: /disconnect/i })).toBeInTheDocument();
    });

    it('should call onDisconnect when disconnect clicked', async () => {
      const onDisconnect = vi.fn();
      render(<ConnectButton {...connectedProps} onDisconnect={onDisconnect} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByRole('menuitem', { name: /disconnect/i }));

      expect(onDisconnect).toHaveBeenCalled();
    });

    it('should show copy address option', async () => {
      render(<ConnectButton {...connectedProps} />);

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByRole('menuitem', { name: /copy/i })).toBeInTheDocument();
    });

    it('should copy address to clipboard', async () => {
      const mockClipboard = vi.fn();
      Object.assign(navigator, { clipboard: { writeText: mockClipboard } });

      render(<ConnectButton {...connectedProps} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByRole('menuitem', { name: /copy/i }));

      expect(mockClipboard).toHaveBeenCalledWith(connectedProps.address);
    });

    it('should show view on explorer option', async () => {
      render(<ConnectButton {...connectedProps} explorerUrl="https://etherscan.io" />);

      await userEvent.click(screen.getByRole('button'));

      const link = screen.getByRole('menuitem', { name: /explorer/i });
      expect(link).toHaveAttribute('href', expect.stringContaining('etherscan.io'));
    });
  });

  describe('error state', () => {
    it('should show error message', () => {
      render(<ConnectButton {...defaultProps} error="Connection rejected" />);

      expect(screen.getByText('Connection rejected')).toBeInTheDocument();
    });

    it('should show retry button', async () => {
      const onConnect = vi.fn();
      render(<ConnectButton {...defaultProps} error="Error" onConnect={onConnect} />);

      await userEvent.click(screen.getByRole('button', { name: /try again|retry/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('wallet detection', () => {
    it('should highlight installed wallets', async () => {
      render(
        <ConnectButton
          {...defaultProps}
          installedWallets={['metamask']}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /connect/i }));

      const metamaskOption = screen.getByText('MetaMask').closest('button');
      expect(metamaskOption).toHaveClass('installed');
    });

    it('should show install link for uninstalled wallets', async () => {
      render(
        <ConnectButton
          {...defaultProps}
          installedWallets={['metamask']}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /connect/i }));

      const coinbaseOption = screen.getByText('Coinbase Wallet').closest('button');
      expect(coinbaseOption).toContainElement(screen.getByText(/install/i));
    });
  });

  describe('recent wallets', () => {
    it('should show recently used wallets first', async () => {
      render(
        <ConnectButton
          {...defaultProps}
          recentWallets={['walletconnect']}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /connect/i }));

      const options = screen.getAllByRole('button', { name: /wallet/i });
      expect(options[0]).toHaveTextContent('WalletConnect');
    });
  });

  describe('variants', () => {
    it('should render default variant', () => {
      render(<ConnectButton {...defaultProps} variant="default" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render outline variant', () => {
      render(<ConnectButton {...defaultProps} variant="outline" />);

      expect(screen.getByRole('button')).toHaveClass('border');
    });

    it('should render ghost variant', () => {
      render(<ConnectButton {...defaultProps} variant="ghost" />);

      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });
  });

  describe('sizes', () => {
    it('should render small size', () => {
      render(<ConnectButton {...defaultProps} size="sm" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render medium size', () => {
      render(<ConnectButton {...defaultProps} size="md" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render large size', () => {
      render(<ConnectButton {...defaultProps} size="lg" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('label customization', () => {
    it('should use custom connect label', () => {
      render(<ConnectButton {...defaultProps} connectLabel="Link Wallet" />);

      expect(screen.getByRole('button', { name: /link wallet/i })).toBeInTheDocument();
    });

    it('should use custom connecting label', () => {
      render(
        <ConnectButton
          {...defaultProps}
          isConnecting
          connectingLabel="Linking..."
        />
      );

      expect(screen.getByText(/linking/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible button', () => {
      render(<ConnectButton {...defaultProps} />);

      expect(screen.getByRole('button')).toHaveAccessibleName();
    });

    it('should have accessible modal', async () => {
      render(<ConnectButton {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /connect/i }));

      expect(screen.getByRole('dialog')).toHaveAccessibleName();
    });

    it('should support keyboard navigation in modal', async () => {
      render(<ConnectButton {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /connect/i }));
      await userEvent.keyboard('{Tab}');

      const firstOption = screen.getAllByRole('button')[1];
      expect(firstOption).toHaveFocus();
    });

    it('should close modal on Escape', async () => {
      render(<ConnectButton {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /connect/i }));
      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('chain info', () => {
    it('should show chain name when connected', () => {
      render(
        <ConnectButton
          {...defaultProps}
          isConnected
          address="0x742d35Cc"
          chainId={1}
          chainName="Ethereum"
        />
      );

      expect(screen.getByText('Ethereum')).toBeInTheDocument();
    });

    it('should show wrong network warning', () => {
      render(
        <ConnectButton
          {...defaultProps}
          isConnected
          address="0x742d35Cc"
          chainId={1}
          requiredChainId={137}
        />
      );

      expect(screen.getByText(/wrong.*network/i)).toBeInTheDocument();
    });
  });
});

