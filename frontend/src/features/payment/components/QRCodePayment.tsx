/**
 * @title QRCodePayment
 * @description QR code payment component
 */

import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui';

interface QRCodePaymentProps {
  address: string;
  amount?: string;
  token?: string;
}

export const QRCodePayment = ({ address, amount, token }: QRCodePaymentProps) => {
  const paymentData = `ethereum:${address}${amount ? `?value=${amount}` : ''}`;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Scan to Pay</h3>
      <div className="flex justify-center">
        <QRCodeSVG value={paymentData} size={256} />
      </div>
      <p className="text-sm text-center text-gray-600 mt-4">
        Scan with your wallet app
      </p>
    </Card>
  );
};

