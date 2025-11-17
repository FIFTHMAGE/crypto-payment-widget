/** PaymentChart - Payment history charts */
export const PaymentChart = () => <div className="p-4 border rounded"><h3 className="font-semibold mb-4">Payment History</h3><div className="h-64 flex items-end justify-around">{[40, 70, 50, 90, 60].map((h, i) => (<div key={i} className="w-12 bg-blue-500" style={{height: `${h}%`}} />))}</div></div>;

