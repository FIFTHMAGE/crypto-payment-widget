import React from 'react';
export const PaymentCard = ({ amount, status }: { amount: string; status: string }) => (
  <div className="border rounded p-4">
    <div>Amount: {amount}</div>
    <div>Status: {status}</div>
  </div>
);
