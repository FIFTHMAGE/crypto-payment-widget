/**
 * @title AddressBook
 * @description Address book management UI
 */

import { useState } from 'react';

export const AddressBook = ({ onSelect }: { onSelect: (address: string) => void }) => {
  const [addresses] = useState([
    { name: 'John Doe', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
    { name: 'Jane Smith', address: '0x1234567890123456789012345678901234567890' },
  ]);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Address Book</h3>
      {addresses.map((addr, i) => (
        <button
          key={i}
          onClick={() => onSelect(addr.address)}
          className="w-full p-3 text-left border rounded hover:bg-gray-50"
        >
          <p className="font-medium">{addr.name}</p>
          <p className="text-sm text-gray-600 truncate">{addr.address}</p>
        </button>
      ))}
    </div>
  );
};

