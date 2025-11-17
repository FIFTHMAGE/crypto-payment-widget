/** NetworkStatus - Network status indicator */
export const NetworkStatus = ({ status = 'online' }: { status?: string }) => <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}><div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />{status}</div>;

