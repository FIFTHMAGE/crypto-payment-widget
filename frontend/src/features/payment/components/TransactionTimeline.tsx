/**
 * @title TransactionTimeline
 * @description Transaction timeline visualization
 */

export const TransactionTimeline = ({ transactions }: { transactions: any[] }) => (
  <div className="space-y-4">
    {transactions.map((tx, i) => (
      <div key={i} className="flex items-start gap-4">
        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
        <div>
          <p className="font-medium">{tx.type}</p>
          <p className="text-sm text-gray-600">{tx.amount}</p>
          <p className="text-xs text-gray-400">{tx.timestamp}</p>
        </div>
      </div>
    ))}
  </div>
);

