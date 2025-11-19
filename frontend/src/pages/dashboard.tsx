import React from 'react';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">Total Payments</div>
        <div className="p-4 bg-white rounded-lg shadow">Success Rate</div>
        <div className="p-4 bg-white rounded-lg shadow">Volume</div>
      </div>
    </div>
  );
}
