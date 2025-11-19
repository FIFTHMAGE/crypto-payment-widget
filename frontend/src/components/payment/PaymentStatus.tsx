import React from 'react';

interface PaymentStatusProps {
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, txHash }) => {
  const statusColors = {
    pending: 'text-yellow-600',
    confirmed: 'text-green-600',
    failed: 'text-red-600',
  };

  return (
    <div className={`p-4 ${statusColors[status]}`}>
      <p>Status: {status}</p>
      {txHash && <p className="text-sm text-gray-600">Tx: {txHash}</p>}
    </div>
  );
};
