import React from 'react';

export const QRCodeDisplay = ({ data }: { data: string }) => (
  <div className="flex items-center justify-center p-8 border rounded">
    QR Code: {data}
  </div>
);
