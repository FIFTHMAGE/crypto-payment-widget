/** SubscriptionManager - Subscription management UI */
export const SubscriptionManager = () => <div className="p-4 space-y-3"><h3 className="font-semibold">Active Subscriptions</h3>{['Netflix', 'Spotify'].map(s => (<div key={s} className="p-3 border rounded flex justify-between items-center"><div><p className="font-medium">{s}</p><p className="text-sm text-gray-600">$9.99/month</p></div><button className="text-red-600 text-sm">Cancel</button></div>))}</div>;

