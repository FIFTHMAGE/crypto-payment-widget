/**
 * QRCodeDisplay component tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { QRCodeDisplay } from '../QRCodeDisplay';

describe('QRCodeDisplay', () => {
  const defaultProps = {
    value: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render QR code', () => {
      render(<QRCodeDisplay {...defaultProps} />);

      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    });

    it('should render QR code image', () => {
      render(<QRCodeDisplay {...defaultProps} />);

      expect(screen.getByRole('img', { name: /qr/i })).toBeInTheDocument();
    });

    it('should encode correct value', () => {
      render(<QRCodeDisplay {...defaultProps} />);

      const img = screen.getByRole('img', { name: /qr/i });
      expect(img).toHaveAttribute('data-value', defaultProps.value);
    });
  });

  describe('sizes', () => {
    it('should render small size', () => {
      render(<QRCodeDisplay {...defaultProps} size="sm" />);

      const qr = screen.getByTestId('qr-code');
      expect(qr).toHaveStyle({ width: '128px', height: '128px' });
    });

    it('should render medium size (default)', () => {
      render(<QRCodeDisplay {...defaultProps} size="md" />);

      const qr = screen.getByTestId('qr-code');
      expect(qr).toHaveStyle({ width: '200px', height: '200px' });
    });

    it('should render large size', () => {
      render(<QRCodeDisplay {...defaultProps} size="lg" />);

      const qr = screen.getByTestId('qr-code');
      expect(qr).toHaveStyle({ width: '300px', height: '300px' });
    });

    it('should accept custom size', () => {
      render(<QRCodeDisplay {...defaultProps} size={250} />);

      const qr = screen.getByTestId('qr-code');
      expect(qr).toHaveStyle({ width: '250px', height: '250px' });
    });
  });

  describe('with logo', () => {
    it('should show logo in center', () => {
      render(<QRCodeDisplay {...defaultProps} logoUrl="/logo.png" />);

      expect(screen.getByTestId('qr-logo')).toBeInTheDocument();
    });

    it('should apply correct logo size', () => {
      render(<QRCodeDisplay {...defaultProps} logoUrl="/logo.png" logoSize={40} />);

      const logo = screen.getByTestId('qr-logo');
      expect(logo).toHaveStyle({ width: '40px', height: '40px' });
    });
  });

  describe('copy functionality', () => {
    it('should show copy button', () => {
      render(<QRCodeDisplay {...defaultProps} showCopy />);

      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    });

    it('should copy value to clipboard', async () => {
      const mockClipboard = vi.fn();
      Object.assign(navigator, { clipboard: { writeText: mockClipboard } });

      render(<QRCodeDisplay {...defaultProps} showCopy />);

      await userEvent.click(screen.getByRole('button', { name: /copy/i }));

      expect(mockClipboard).toHaveBeenCalledWith(defaultProps.value);
    });

    it('should show copied feedback', async () => {
      Object.assign(navigator, { clipboard: { writeText: vi.fn() } });

      render(<QRCodeDisplay {...defaultProps} showCopy />);

      await userEvent.click(screen.getByRole('button', { name: /copy/i }));

      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });

    it('should reset copied state after timeout', async () => {
      vi.useFakeTimers();
      Object.assign(navigator, { clipboard: { writeText: vi.fn() } });

      render(<QRCodeDisplay {...defaultProps} showCopy />);

      await userEvent.click(screen.getByRole('button', { name: /copy/i }));

      expect(screen.getByText(/copied/i)).toBeInTheDocument();

      vi.advanceTimersByTime(3000);

      expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('download functionality', () => {
    it('should show download button', () => {
      render(<QRCodeDisplay {...defaultProps} showDownload />);

      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });

    it('should download QR code as image', async () => {
      const mockDownload = vi.fn();
      global.URL.createObjectURL = vi.fn(() => 'blob:test');
      
      render(<QRCodeDisplay {...defaultProps} showDownload onDownload={mockDownload} />);

      await userEvent.click(screen.getByRole('button', { name: /download/i }));

      expect(mockDownload).toHaveBeenCalled();
    });
  });

  describe('value display', () => {
    it('should show value below QR code', () => {
      render(<QRCodeDisplay {...defaultProps} showValue />);

      expect(screen.getByText(defaultProps.value)).toBeInTheDocument();
    });

    it('should truncate long values', () => {
      render(<QRCodeDisplay {...defaultProps} showValue truncateValue />);

      expect(screen.getByText(/0x742d.*f44e/)).toBeInTheDocument();
    });

    it('should show full value on hover', async () => {
      render(<QRCodeDisplay {...defaultProps} showValue truncateValue />);

      await userEvent.hover(screen.getByText(/0x742d/));

      expect(screen.getByRole('tooltip')).toHaveTextContent(defaultProps.value);
    });
  });

  describe('label', () => {
    it('should show label above QR code', () => {
      render(<QRCodeDisplay {...defaultProps} label="Scan to Pay" />);

      expect(screen.getByText('Scan to Pay')).toBeInTheDocument();
    });

    it('should show description below label', () => {
      render(
        <QRCodeDisplay
          {...defaultProps}
          label="Scan to Pay"
          description="Use your wallet app to scan"
        />
      );

      expect(screen.getByText('Use your wallet app to scan')).toBeInTheDocument();
    });
  });

  describe('colors', () => {
    it('should apply foreground color', () => {
      render(<QRCodeDisplay {...defaultProps} fgColor="#000000" />);

      const qr = screen.getByTestId('qr-code');
      expect(qr).toHaveAttribute('data-fg-color', '#000000');
    });

    it('should apply background color', () => {
      render(<QRCodeDisplay {...defaultProps} bgColor="#ffffff" />);

      const qr = screen.getByTestId('qr-code');
      expect(qr).toHaveAttribute('data-bg-color', '#ffffff');
    });
  });

  describe('error correction', () => {
    it('should use L error correction by default', () => {
      render(<QRCodeDisplay {...defaultProps} />);

      const qr = screen.getByTestId('qr-code');
      expect(qr).toHaveAttribute('data-level', 'L');
    });

    it('should support different error correction levels', () => {
      render(<QRCodeDisplay {...defaultProps} level="H" />);

      const qr = screen.getByTestId('qr-code');
      expect(qr).toHaveAttribute('data-level', 'H');
    });
  });

  describe('loading state', () => {
    it('should show loading skeleton', () => {
      render(<QRCodeDisplay {...defaultProps} loading />);

      expect(screen.getByTestId('qr-skeleton')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show error message', () => {
      render(<QRCodeDisplay {...defaultProps} error="Failed to generate QR code" />);

      expect(screen.getByText('Failed to generate QR code')).toBeInTheDocument();
    });

    it('should show retry button on error', async () => {
      const onRetry = vi.fn();
      render(<QRCodeDisplay {...defaultProps} error="Error" onRetry={onRetry} />);

      await userEvent.click(screen.getByRole('button', { name: /retry/i }));

      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('border', () => {
    it('should show border', () => {
      render(<QRCodeDisplay {...defaultProps} bordered />);

      expect(screen.getByTestId('qr-code')).toHaveClass('border');
    });

    it('should show rounded border', () => {
      render(<QRCodeDisplay {...defaultProps} bordered rounded />);

      expect(screen.getByTestId('qr-code')).toHaveClass('rounded');
    });
  });

  describe('expiry', () => {
    it('should show expiry countdown', () => {
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
      render(<QRCodeDisplay {...defaultProps} expiresAt={expiresAt} />);

      expect(screen.getByText(/expires.*5.*min/i)).toBeInTheDocument();
    });

    it('should call onExpired when expired', async () => {
      vi.useFakeTimers();
      const onExpired = vi.fn();
      const expiresAt = Date.now() + 1000;

      render(<QRCodeDisplay {...defaultProps} expiresAt={expiresAt} onExpired={onExpired} />);

      vi.advanceTimersByTime(1500);

      expect(onExpired).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should show expired state', async () => {
      const expiresAt = Date.now() - 1000; // Already expired
      render(<QRCodeDisplay {...defaultProps} expiresAt={expiresAt} />);

      expect(screen.getByText(/expired/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible image', () => {
      render(<QRCodeDisplay {...defaultProps} />);

      expect(screen.getByRole('img')).toHaveAccessibleName();
    });

    it('should describe QR code content', () => {
      render(<QRCodeDisplay {...defaultProps} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('aria-label', expect.stringContaining('QR'));
    });
  });

  describe('animation', () => {
    it('should animate on mount', () => {
      render(<QRCodeDisplay {...defaultProps} animated />);

      expect(screen.getByTestId('qr-code')).toHaveClass('animate-fade-in');
    });
  });
});

