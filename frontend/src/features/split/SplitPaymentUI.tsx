/** SplitPaymentUI - Split payment interface */
export const SplitPaymentUI = () => <div className="p-4 space-y-3"><h3 className="font-semibold">Split Payment</h3><div className="space-y-2">{[1,2,3].map(i => (<div key={i} className="flex gap-2"><input placeholder="Address" className="flex-1 p-2 border rounded" /><input placeholder="Amount" className="w-24 p-2 border rounded" /></div>))}</div><button className="w-full p-2 bg-blue-600 text-white rounded">Split & Send</button></div>;

