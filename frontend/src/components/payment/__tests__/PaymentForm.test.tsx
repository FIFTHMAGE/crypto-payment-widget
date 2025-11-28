/**
 * PaymentForm component tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { PaymentForm } from '../PaymentForm';

const mockTokens = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', address: '0xa0b8', decimals: 6 },
  { symbol: 'DAI', name: 'Dai', address: '0x6b17', decimals: 18 },
];

describe('PaymentForm', () => {
  const defaultProps = {
    tokens: mockTokens,
    onSubmit: vi.fn(),
    recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render payment form', () => {
      render(<PaymentForm {...defaultProps} />);

      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should render amount input', () => {
      render(<PaymentForm {...defaultProps} />);

      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });

    it('should render token selector', () => {
      render(<PaymentForm {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<PaymentForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /pay|submit/i })).toBeInTheDocument();
    });

    it('should show recipient address', () => {
      render(<PaymentForm {...defaultProps} />);

      expect(screen.getByText(/0x742d/i)).toBeInTheDocument();
    });
  });

  describe('amount input', () => {
    it('should update amount on input', async () => {
      render(<PaymentForm {...defaultProps} />);

      const input = screen.getByLabelText(/amount/i);
      await userEvent.type(input, '100');

      expect(input).toHaveValue('100');
    });

    it('should only allow numeric values', async () => {
      render(<PaymentForm {...defaultProps} />);

      const input = screen.getByLabelText(/amount/i);
      await userEvent.type(input, 'abc123');

      expect(input).toHaveValue('123');
    });

    it('should allow decimal values', async () => {
      render(<PaymentForm {...defaultProps} />);

      const input = screen.getByLabelText(/amount/i);
      await userEvent.type(input, '99.99');

      expect(input).toHaveValue('99.99');
    });

    it('should show error for empty amount', async () => {
      render(<PaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /pay|submit/i }));

      expect(screen.getByText(/amount.*required/i)).toBeInTheDocument();
    });

    it('should show error for amount below minimum', async () => {
      render(<PaymentForm {...defaultProps} minAmount="10" />);

      const input = screen.getByLabelText(/amount/i);
      await userEvent.type(input, '5');
      await userEvent.click(screen.getByRole('button', { name: /pay|submit/i }));

      expect(screen.getByText(/minimum/i)).toBeInTheDocument();
    });
  });

  describe('token selection', () => {
    it('should show all available tokens', async () => {
      render(<PaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByRole('combobox'));

      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('USDC')).toBeInTheDocument();
      expect(screen.getByText('DAI')).toBeInTheDocument();
    });

    it('should update selected token', async () => {
      render(<PaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('USDC'));

      expect(screen.getByRole('combobox')).toHaveTextContent('USDC');
    });

    it('should pre-select default token', () => {
      render(<PaymentForm {...defaultProps} defaultToken="USDC" />);

      expect(screen.getByRole('combobox')).toHaveTextContent('USDC');
    });
  });

  describe('memo/reference', () => {
    it('should show memo input when enabled', () => {
      render(<PaymentForm {...defaultProps} showMemo />);

      expect(screen.getByLabelText(/memo|reference|note/i)).toBeInTheDocument();
    });

    it('should update memo value', async () => {
      render(<PaymentForm {...defaultProps} showMemo />);

      const input = screen.getByLabelText(/memo|reference|note/i);
      await userEvent.type(input, 'Payment for services');

      expect(input).toHaveValue('Payment for services');
    });

    it('should validate memo length', async () => {
      render(<PaymentForm {...defaultProps} showMemo maxMemoLength={20} />);

      const input = screen.getByLabelText(/memo|reference|note/i);
      await userEvent.type(input, 'This is a very long memo that exceeds the limit');

      expect(screen.getByText(/max.*characters/i)).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should call onSubmit with form data', async () => {
      const onSubmit = vi.fn();
      render(<PaymentForm {...defaultProps} onSubmit={onSubmit} />);

      await userEvent.type(screen.getByLabelText(/amount/i), '100');
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('ETH'));
      await userEvent.click(screen.getByRole('button', { name: /pay|submit/i }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: '100',
          token: expect.objectContaining({ symbol: 'ETH' }),
          recipient: defaultProps.recipientAddress,
        })
      );
    });

    it('should show loading state during submission', async () => {
      render(<PaymentForm {...defaultProps} isSubmitting />);

      expect(screen.getByRole('button', { name: /pay|submit/i })).toBeDisabled();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should disable form during submission', async () => {
      render(<PaymentForm {...defaultProps} isSubmitting />);

      expect(screen.getByLabelText(/amount/i)).toBeDisabled();
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  describe('USD conversion', () => {
    it('should show USD equivalent', async () => {
      render(
        <PaymentForm
          {...defaultProps}
          showUsdValue
          tokenPrices={{ ETH: 2500, USDC: 1, DAI: 1 }}
        />
      );

      await userEvent.type(screen.getByLabelText(/amount/i), '1');
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('ETH'));

      expect(screen.getByText(/\$2,?500/)).toBeInTheDocument();
    });
  });

  describe('balance display', () => {
    it('should show token balance when available', () => {
      render(
        <PaymentForm
          {...defaultProps}
          balances={{ ETH: '2.5', USDC: '1000', DAI: '500' }}
        />
      );

      expect(screen.getByText(/balance/i)).toBeInTheDocument();
    });

    it('should show insufficient balance error', async () => {
      render(
        <PaymentForm
          {...defaultProps}
          balances={{ ETH: '0.5', USDC: '100' }}
        />
      );

      await userEvent.type(screen.getByLabelText(/amount/i), '1');
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('ETH'));
      await userEvent.click(screen.getByRole('button', { name: /pay|submit/i }));

      expect(screen.getByText(/insufficient.*balance/i)).toBeInTheDocument();
    });

    it('should show max button', () => {
      render(
        <PaymentForm
          {...defaultProps}
          balances={{ ETH: '2.5' }}
          showMaxButton
        />
      );

      expect(screen.getByRole('button', { name: /max/i })).toBeInTheDocument();
    });
  });

  describe('fixed amount mode', () => {
    it('should disable amount input when fixed', () => {
      render(<PaymentForm {...defaultProps} fixedAmount="100" />);

      expect(screen.getByLabelText(/amount/i)).toBeDisabled();
      expect(screen.getByLabelText(/amount/i)).toHaveValue('100');
    });

    it('should display fixed amount badge', () => {
      render(<PaymentForm {...defaultProps} fixedAmount="100" />);

      expect(screen.getByText(/fixed/i)).toBeInTheDocument();
    });
  });

  describe('gas estimate', () => {
    it('should show gas estimate', () => {
      render(
        <PaymentForm
          {...defaultProps}
          showGasEstimate
          gasEstimate={{ cost: '0.002', costUsd: '5.00' }}
        />
      );

      expect(screen.getByText(/gas|fee/i)).toBeInTheDocument();
      expect(screen.getByText(/\$5/)).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display form error', () => {
      render(<PaymentForm {...defaultProps} error="Payment failed" />);

      expect(screen.getByRole('alert')).toHaveTextContent('Payment failed');
    });

    it('should clear error on input change', async () => {
      const { rerender } = render(
        <PaymentForm {...defaultProps} error="Payment failed" />
      );

      await userEvent.type(screen.getByLabelText(/amount/i), '100');

      rerender(<PaymentForm {...defaultProps} error={undefined} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible form', () => {
      render(<PaymentForm {...defaultProps} />);

      expect(screen.getByRole('form')).toHaveAccessibleName();
    });

    it('should have labeled inputs', () => {
      render(<PaymentForm {...defaultProps} />);

      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });

    it('should show validation errors accessibly', async () => {
      render(<PaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /pay|submit/i }));

      const input = screen.getByLabelText(/amount/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });
});

