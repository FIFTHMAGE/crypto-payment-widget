/**
 * PaymentHistory Component
 * Display transaction payment history table
 */

import React, { useState, useCallback, useMemo } from 'react';

export interface PaymentRecord {
  id: string;
  transactionHash: string;
  type: 'sent' | 'received';
  amount: string;
  currency: string;
  from: string;
  to: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  fee?: string;
  memo?: string;
}

export interface PaymentHistoryProps {
  payments: PaymentRecord[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onPaymentClick?: (payment: PaymentRecord) => void;
  showFilters?: boolean;
  className?: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onPaymentClick,
  showFilters = true,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      if (filter !== 'all' && payment.type !== filter) return false;
      if (statusFilter !== 'all' && payment.status !== statusFilter) return false;
      return true;
    });
  }, [payments, filter, statusFilter]);

  const formatAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }, []);

  const getStatusColor = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const getTypeIcon = (type: PaymentRecord['type']) => {
    if (type === 'sent') {
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
      </svg>
    );
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment History
          </h3>
          
          {showFilters && (
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-none outline-none text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Types</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-none outline-none text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                From/To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {isLoading ? 'Loading...' : 'No transactions found'}
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  onClick={() => onPaymentClick?.(payment)}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                    onPaymentClick ? 'cursor-pointer' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(payment.type)}
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {payment.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${
                      payment.type === 'received' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {payment.type === 'received' ? '+' : '-'}{payment.amount} {payment.currency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {formatAddress(payment.type === 'sent' ? payment.to : payment.from)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                    {formatDate(payment.timestamp)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full py-2 text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(PaymentHistory);

