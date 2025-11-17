/** PaymentNotifications - Payment notification system */
export const PaymentNotifications = () => <div className="fixed top-4 right-4 w-80 space-y-2">{['Payment received', 'Transaction confirmed'].map((n, i) => (<div key={i} className="p-3 bg-white border rounded-lg shadow-lg"><p className="font-medium">{n}</p><p className="text-sm text-gray-600">Just now</p></div>))}</div>;

