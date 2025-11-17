/**
 * @title CurrencySelector
 * @description Multi-currency selector with exchange rates
 */

const currencies = [
  { symbol: 'ETH', name: 'Ethereum', rate: 1 },
  { symbol: 'USDC', name: 'USD Coin', rate: 2000 },
  { symbol: 'DAI', name: 'Dai', rate: 2000 },
];

export const CurrencySelector = ({ onSelect }: { onSelect: (currency: string) => void }) => (
  <select onChange={(e) => onSelect(e.target.value)} className="w-full p-2 border rounded">
    {currencies.map(c => (
      <option key={c.symbol} value={c.symbol}>{c.name} ({c.symbol})</option>
    ))}
  </select>
);

