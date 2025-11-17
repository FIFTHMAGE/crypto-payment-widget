/** PaymentTemplates - Payment template/preset system */
export const PaymentTemplates = () => <div className="p-4"><h3 className="font-semibold mb-2">Payment Templates</h3><div className="space-y-2">{['Salary', 'Invoice', 'Subscription'].map(t => (<button key={t} className="w-full p-2 border rounded hover:bg-gray-50">{t}</button>))}</div></div>;
