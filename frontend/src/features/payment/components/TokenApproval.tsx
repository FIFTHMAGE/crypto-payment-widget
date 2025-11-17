/** TokenApproval - Token approval management UI */
export const TokenApproval = () => <div className="p-4 border rounded"><h3 className="font-semibold mb-3">Token Approvals</h3><div className="space-y-2">{['USDC', 'DAI', 'USDT'].map(t => (<div key={t} className="flex justify-between items-center p-2 bg-gray-50 rounded"><span>{t}</span><button className="text-sm text-blue-600">Revoke</button></div>))}</div></div>;

