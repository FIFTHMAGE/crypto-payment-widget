/**
 * PaymentStatus component tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { PaymentStatus } from '../PaymentStatus';

const mockPayment = {
  id: 'pay_123',
  status: 'pending',
  amount: '100',
  token: { symbol: 'USDC', name: 'USD Coin' },
  txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
  timestamp: Date.now(),
};

describe('PaymentStatus', () => {
  const defaultProps = {
    payment: mockPayment,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render payment status', () => {
      render(<PaymentStatus {...defaultProps} />);

      expect(screen.getByText(/pending|processing/i)).toBeInTheDocument();
    });

    it('should show payment amount', () => {
      render(<PaymentStatus {...defaultProps} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('USDC')).toBeInTheDocument();
    });

    it('should show transaction hash', () => {
      render(<PaymentStatus {...defaultProps} />);

      expect(screen.getByText(/0x1234/)).toBeInTheDocument();
    });

    it('should show recipient address', () => {
      render(<PaymentStatus {...defaultProps} showRecipient />);

      expect(screen.getByText(/0x742d/)).toBeInTheDocument();
    });
  });

  describe('status states', () => {
    it('should show pending status', () => {
      render(<PaymentStatus {...defaultProps} />);

      expect(screen.getByText(/pending/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show confirming status', () => {
      const payment = { ...mockPayment, status: 'confirming', confirmations: 3, requiredConfirmations: 12 };
      render(<PaymentStatus payment={payment} />);

      expect(screen.getByText(/3.*12|confirming/i)).toBeInTheDocument();
    });

    it('should show confirmed status', () => {
      const payment = { ...mockPayment, status: 'confirmed' };
      render(<PaymentStatus payment={payment} />);

      expect(screen.getByText(/confirmed|success/i)).toBeInTheDocument();
    });

    it('should show failed status', () => {
      const payment = { ...mockPayment, status: 'failed', error: 'Transaction reverted' };
      render(<PaymentStatus payment={payment} />);

      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });

    it('should show expired status', () => {
      const payment = { ...mockPayment, status: 'expired' };
      render(<PaymentStatus payment={payment} />);

      expect(screen.getByText(/expired/i)).toBeInTheDocument();
    });

    it('should show cancelled status', () => {
      const payment = { ...mockPayment, status: 'cancelled' };
      render(<PaymentStatus payment={payment} />);

      expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
    });
  });

  describe('progress indicator', () => {
    it('should show progress bar for confirming', () => {
      const payment = { ...mockPayment, status: 'confirming', confirmations: 6, requiredConfirmations: 12 };
      render(<PaymentStatus payment={payment} />);

      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', '50');
    });

    it('should show spinner for pending', () => {
      render(<PaymentStatus {...defaultProps} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show checkmark for confirmed', () => {
      const payment = { ...mockPayment, status: 'confirmed' };
      render(<PaymentStatus payment={payment} />);

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should show error icon for failed', () => {
      const payment = { ...mockPayment, status: 'failed' };
      render(<PaymentStatus payment={payment} />);

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should show view on explorer link', () => {
      render(<PaymentStatus {...defaultProps} explorerUrl="https://etherscan.io" />);

      expect(screen.getByRole('link', { name: /view.*explorer/i })).toBeInTheDocument();
    });

    it('should have correct explorer link', () => {
      render(<PaymentStatus {...defaultProps} explorerUrl="https://etherscan.io" />);

      const link = screen.getByRole('link', { name: /view.*explorer/i });
      expect(link).toHaveAttribute('href', expect.stringContaining('etherscan.io'));
    });

    it('should show copy hash button', async () => {
      const mockClipboard = vi.fn();
      Object.assign(navigator, { clipboard: { writeText: mockClipboard } });

      render(<PaymentStatus {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /copy/i }));

      expect(mockClipboard).toHaveBeenCalledWith(mockPayment.txHash);
    });

    it('should show copied confirmation', async () => {
      Object.assign(navigator, { clipboard: { writeText: vi.fn() } });

      render(<PaymentStatus {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /copy/i }));

      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  describe('retry functionality', () => {
    it('should show retry button for failed payments', () => {
      const payment = { ...mockPayment, status: 'failed' };
      render(<PaymentStatus payment={payment} onRetry={() => {}} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should call onRetry when retry clicked', async () => {
      const onRetry = vi.fn();
      const payment = { ...mockPayment, status: 'failed' };
      render(<PaymentStatus payment={payment} onRetry={onRetry} />);

      await userEvent.click(screen.getByRole('button', { name: /retry/i }));

      expect(onRetry).toHaveBeenCalled();
    });

    it('should not show retry for confirmed payments', () => {
      const payment = { ...mockPayment, status: 'confirmed' };
      render(<PaymentStatus payment={payment} onRetry={() => {}} />);

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('error display', () => {
    it('should show error message', () => {
      const payment = { ...mockPayment, status: 'failed', error: 'Insufficient gas' };
      render(<PaymentStatus payment={payment} />);

      expect(screen.getByText('Insufficient gas')).toBeInTheDocument();
    });

    it('should show error details', () => {
      const payment = {
        ...mockPayment,
        status: 'failed',
        error: 'Transaction reverted',
        errorCode: 'CALL_EXCEPTION',
      };
      render(<PaymentStatus payment={payment} showErrorDetails />);

      expect(screen.getByText('CALL_EXCEPTION')).toBeInTheDocument();
    });
  });

  describe('timestamp', () => {
    it('should show payment timestamp', () => {
      render(<PaymentStatus {...defaultProps} showTimestamp />);

      expect(screen.getByText(/ago|just now/i)).toBeInTheDocument();
    });

    it('should show completion time for confirmed', () => {
      const payment = {
        ...mockPayment,
        status: 'confirmed',
        completedAt: Date.now(),
      };
      render(<PaymentStatus payment={payment} showTimestamp />);

      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });
  });

  describe('gas info', () => {
    it('should show gas used', () => {
      const payment = {
        ...mockPayment,
        status: 'confirmed',
        gasUsed: '150000',
        gasCost: '0.003',
      };
      render(<PaymentStatus payment={payment} showGasInfo />);

      expect(screen.getByText(/gas/i)).toBeInTheDocument();
    });
  });

  describe('polling', () => {
    it('should poll for updates when pending', async () => {
      const onPoll = vi.fn();
      vi.useFakeTimers();

      render(<PaymentStatus {...defaultProps} onPoll={onPoll} pollInterval={5000} />);

      vi.advanceTimersByTime(5000);

      expect(onPoll).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should stop polling when confirmed', async () => {
      const onPoll = vi.fn();
      vi.useFakeTimers();

      const { rerender } = render(
        <PaymentStatus {...defaultProps} onPoll={onPoll} pollInterval={5000} />
      );

      const confirmedPayment = { ...mockPayment, status: 'confirmed' };
      rerender(<PaymentStatus payment={confirmedPayment} onPoll={onPoll} pollInterval={5000} />);

      vi.advanceTimersByTime(10000);

      expect(onPoll).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('variants', () => {
    it('should render compact variant', () => {
      render(<PaymentStatus {...defaultProps} variant="compact" />);

      expect(screen.getByTestId('payment-status')).toHaveClass('compact');
    });

    it('should render detailed variant', () => {
      render(<PaymentStatus {...defaultProps} variant="detailed" />);

      expect(screen.getByTestId('payment-status')).toHaveClass('detailed');
    });

    it('should render card variant', () => {
      render(<PaymentStatus {...defaultProps} variant="card" />);

      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('should call onConfirmed when payment confirms', async () => {
      const onConfirmed = vi.fn();
      const { rerender } = render(
        <PaymentStatus {...defaultProps} onConfirmed={onConfirmed} />
      );

      const confirmedPayment = { ...mockPayment, status: 'confirmed' };
      rerender(<PaymentStatus payment={confirmedPayment} onConfirmed={onConfirmed} />);

      await waitFor(() => {
        expect(onConfirmed).toHaveBeenCalledWith(confirmedPayment);
      });
    });

    it('should call onFailed when payment fails', async () => {
      const onFailed = vi.fn();
      const { rerender } = render(
        <PaymentStatus {...defaultProps} onFailed={onFailed} />
      );

      const failedPayment = { ...mockPayment, status: 'failed' };
      rerender(<PaymentStatus payment={failedPayment} onFailed={onFailed} />);

      await waitFor(() => {
        expect(onFailed).toHaveBeenCalledWith(failedPayment);
      });
    });
  });

  describe('accessibility', () => {
    it('should have accessible status', () => {
      render(<PaymentStatus {...defaultProps} />);

      expect(screen.getByRole('status')).toHaveAccessibleName();
    });

    it('should announce status changes', async () => {
      const { rerender } = render(<PaymentStatus {...defaultProps} />);

      const confirmedPayment = { ...mockPayment, status: 'confirmed' };
      rerender(<PaymentStatus payment={confirmedPayment} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('animation', () => {
    it('should show animation on status change', () => {
      render(<PaymentStatus {...defaultProps} animated />);

      expect(screen.getByTestId('status-animation')).toBeInTheDocument();
    });

    it('should show success animation', () => {
      const payment = { ...mockPayment, status: 'confirmed' };
      render(<PaymentStatus payment={payment} animated showConfetti />);

      expect(screen.getByTestId('confetti')).toBeInTheDocument();
    });
  });
});

