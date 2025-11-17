/** MilestoneUI */
export const MilestoneUI = () => <div className="p-4">{['Phase 1', 'Phase 2', 'Phase 3'].map((m, i) => (<div key={i} className="p-3 border rounded mb-2"><p className="font-medium">{m}</p><div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-blue-600 h-2 rounded-full" style={{width: `${(i+1)*30}%`}} /></div></div>))}</div>;

