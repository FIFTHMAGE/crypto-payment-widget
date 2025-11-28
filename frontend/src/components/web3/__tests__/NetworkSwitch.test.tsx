/**
 * NetworkSwitch component tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { NetworkSwitch } from '../NetworkSwitch';

const mockNetworks = [
  { chainId: 1, name: 'Ethereum', icon: '/networks/eth.png', rpcUrl: 'https://mainnet.infura.io' },
  { chainId: 137, name: 'Polygon', icon: '/networks/polygon.png', rpcUrl: 'https://polygon-rpc.com' },
  { chainId: 42161, name: 'Arbitrum', icon: '/networks/arbitrum.png', rpcUrl: 'https://arb1.arbitrum.io/rpc' },
  { chainId: 10, name: 'Optimism', icon: '/networks/optimism.png', rpcUrl: 'https://mainnet.optimism.io' },
];

describe('NetworkSwitch', () => {
  const defaultProps = {
    networks: mockNetworks,
    currentChainId: 1,
    onSwitch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render network switch button', () => {
      render(<NetworkSwitch {...defaultProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show current network name', () => {
      render(<NetworkSwitch {...defaultProps} />);

      expect(screen.getByText('Ethereum')).toBeInTheDocument();
    });

    it('should show current network icon', () => {
      render(<NetworkSwitch {...defaultProps} />);

      expect(screen.getByAltText('Ethereum')).toBeInTheDocument();
    });
  });

  describe('dropdown', () => {
    it('should open dropdown on click', async () => {
      render(<NetworkSwitch {...defaultProps} />);

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should show all networks in dropdown', async () => {
      render(<NetworkSwitch {...defaultProps} />);

      await userEvent.click(screen.getByRole('button'));

      mockNetworks.forEach((network) => {
        expect(screen.getByText(network.name)).toBeInTheDocument();
      });
    });

    it('should close dropdown on network selection', async () => {
      render(<NetworkSwitch {...defaultProps} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByText('Polygon'));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown on click outside', async () => {
      render(<NetworkSwitch {...defaultProps} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown on Escape', async () => {
      render(<NetworkSwitch {...defaultProps} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('network selection', () => {
    it('should call onSwitch with new chain ID', async () => {
      const onSwitch = vi.fn();
      render(<NetworkSwitch {...defaultProps} onSwitch={onSwitch} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByText('Polygon'));

      expect(onSwitch).toHaveBeenCalledWith(137);
    });

    it('should highlight current network', async () => {
      render(<NetworkSwitch {...defaultProps} />);

      await userEvent.click(screen.getByRole('button'));

      const ethOption = screen.getByRole('option', { name: /ethereum/i });
      expect(ethOption).toHaveAttribute('aria-selected', 'true');
    });

    it('should show checkmark on current network', async () => {
      render(<NetworkSwitch {...defaultProps} />);

      await userEvent.click(screen.getByRole('button'));

      const ethOption = screen.getByRole('option', { name: /ethereum/i });
      expect(ethOption.querySelector('[data-testid="check-icon"]')).toBeInTheDocument();
    });

    it('should not call onSwitch when selecting current network', async () => {
      const onSwitch = vi.fn();
      render(<NetworkSwitch {...defaultProps} onSwitch={onSwitch} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByText('Ethereum'));

      expect(onSwitch).not.toHaveBeenCalled();
    });
  });

  describe('switching state', () => {
    it('should show switching indicator', () => {
      render(<NetworkSwitch {...defaultProps} isSwitching />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show switching text', () => {
      render(<NetworkSwitch {...defaultProps} isSwitching />);

      expect(screen.getByText(/switching/i)).toBeInTheDocument();
    });

    it('should disable button while switching', () => {
      render(<NetworkSwitch {...defaultProps} isSwitching />);

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('wrong network', () => {
    it('should show warning for wrong network', () => {
      render(
        <NetworkSwitch
          {...defaultProps}
          currentChainId={999}
          requiredChainId={1}
        />
      );

      expect(screen.getByText(/wrong.*network|unsupported/i)).toBeInTheDocument();
    });

    it('should show required network name', () => {
      render(
        <NetworkSwitch
          {...defaultProps}
          currentChainId={999}
          requiredChainId={1}
          requiredNetworkName="Ethereum"
        />
      );

      expect(screen.getByText(/switch.*ethereum/i)).toBeInTheDocument();
    });

    it('should highlight switch button for wrong network', () => {
      render(
        <NetworkSwitch
          {...defaultProps}
          currentChainId={999}
          requiredChainId={1}
        />
      );

      expect(screen.getByRole('button')).toHaveClass('warning');
    });
  });

  describe('unsupported network', () => {
    it('should show unsupported message', () => {
      render(<NetworkSwitch {...defaultProps} currentChainId={12345} />);

      expect(screen.getByText(/unsupported/i)).toBeInTheDocument();
    });

    it('should prompt to switch', () => {
      render(<NetworkSwitch {...defaultProps} currentChainId={12345} />);

      expect(screen.getByRole('button', { name: /switch/i })).toBeInTheDocument();
    });
  });

  describe('disabled networks', () => {
    it('should disable specific networks', async () => {
      render(
        <NetworkSwitch
          {...defaultProps}
          disabledNetworks={[137]}
        />
      );

      await userEvent.click(screen.getByRole('button'));

      const polygonOption = screen.getByRole('option', { name: /polygon/i });
      expect(polygonOption).toHaveAttribute('aria-disabled', 'true');
    });

    it('should show tooltip on disabled network', async () => {
      render(
        <NetworkSwitch
          {...defaultProps}
          disabledNetworks={[137]}
          disabledReason="Coming soon"
        />
      );

      await userEvent.click(screen.getByRole('button'));
      await userEvent.hover(screen.getByText('Polygon'));

      expect(screen.getByRole('tooltip')).toHaveTextContent('Coming soon');
    });
  });

  describe('search', () => {
    it('should show search when many networks', async () => {
      const manyNetworks = Array.from({ length: 10 }, (_, i) => ({
        chainId: i + 1,
        name: `Network ${i + 1}`,
        icon: `/networks/${i}.png`,
        rpcUrl: `https://rpc${i}.com`,
      }));

      render(<NetworkSwitch {...defaultProps} networks={manyNetworks} />);

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('should filter networks by name', async () => {
      render(<NetworkSwitch {...defaultProps} searchable />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.type(screen.getByRole('searchbox'), 'poly');

      expect(screen.getByText('Polygon')).toBeInTheDocument();
      expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
    });
  });

  describe('network info', () => {
    it('should show network details on hover', async () => {
      render(<NetworkSwitch {...defaultProps} showNetworkDetails />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.hover(screen.getByText('Polygon'));

      expect(screen.getByText(/chain.*id.*137/i)).toBeInTheDocument();
    });
  });

  describe('testnet toggle', () => {
    it('should show testnet toggle', async () => {
      const networksWithTestnet = [
        ...mockNetworks,
        { chainId: 5, name: 'Goerli', icon: '/networks/goerli.png', rpcUrl: 'https://goerli.infura.io', testnet: true },
      ];

      render(<NetworkSwitch {...defaultProps} networks={networksWithTestnet} showTestnets />);

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByRole('switch', { name: /testnet/i })).toBeInTheDocument();
    });

    it('should hide testnets by default', async () => {
      const networksWithTestnet = [
        ...mockNetworks,
        { chainId: 5, name: 'Goerli', icon: '/networks/goerli.png', rpcUrl: 'https://goerli.infura.io', testnet: true },
      ];

      render(<NetworkSwitch {...defaultProps} networks={networksWithTestnet} showTestnets />);

      await userEvent.click(screen.getByRole('button'));

      expect(screen.queryByText('Goerli')).not.toBeInTheDocument();
    });

    it('should show testnets when enabled', async () => {
      const networksWithTestnet = [
        ...mockNetworks,
        { chainId: 5, name: 'Goerli', icon: '/networks/goerli.png', rpcUrl: 'https://goerli.infura.io', testnet: true },
      ];

      render(<NetworkSwitch {...defaultProps} networks={networksWithTestnet} showTestnets />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByRole('switch', { name: /testnet/i }));

      expect(screen.getByText('Goerli')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should render default variant', () => {
      render(<NetworkSwitch {...defaultProps} variant="default" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render compact variant', () => {
      render(<NetworkSwitch {...defaultProps} variant="compact" />);

      expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
      expect(screen.getByAltText('Ethereum')).toBeInTheDocument();
    });

    it('should render badge variant', () => {
      render(<NetworkSwitch {...defaultProps} variant="badge" />);

      expect(screen.getByTestId('network-badge')).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate with arrow keys', async () => {
      render(<NetworkSwitch {...defaultProps} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.keyboard('{ArrowDown}');

      const polygonOption = screen.getByRole('option', { name: /polygon/i });
      expect(polygonOption).toHaveClass('highlighted');
    });

    it('should select with Enter', async () => {
      const onSwitch = vi.fn();
      render(<NetworkSwitch {...defaultProps} onSwitch={onSwitch} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.keyboard('{ArrowDown}{Enter}');

      expect(onSwitch).toHaveBeenCalledWith(137);
    });
  });

  describe('accessibility', () => {
    it('should have accessible button', () => {
      render(<NetworkSwitch {...defaultProps} />);

      expect(screen.getByRole('button')).toHaveAccessibleName();
    });

    it('should have accessible listbox', async () => {
      render(<NetworkSwitch {...defaultProps} />);

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByRole('listbox')).toHaveAccessibleName();
    });

    it('should announce network changes', async () => {
      render(<NetworkSwitch {...defaultProps} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByText('Polygon'));

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});

