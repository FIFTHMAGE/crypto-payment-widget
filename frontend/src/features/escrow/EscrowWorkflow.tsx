/** EscrowWorkflow - Escrow payment workflow */
export const EscrowWorkflow = () => <div className="p-4 space-y-4"><div className="flex items-center gap-4">{['Create', 'Fund', 'Release'].map((s, i) => (<div key={i} className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">{i+1}</div><span>{s}</span></div>))}</div></div>;

