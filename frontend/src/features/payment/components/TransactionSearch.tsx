/** TransactionSearch - Transaction search and filter interface */
export const TransactionSearch = () => <div className="space-y-4"><input placeholder="Search transactions..." className="w-full p-2 border rounded" /><div className="flex gap-2">{['All', 'Sent', 'Received'].map(f => (<button key={f} className="px-4 py-2 border rounded hover:bg-gray-50">{f}</button>))}</div></div>;
