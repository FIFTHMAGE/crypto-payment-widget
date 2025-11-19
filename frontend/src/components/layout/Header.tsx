import React from 'react';

export const Header = () => (
  <header className="bg-white border-b px-6 py-4">
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold">Crypto Payment Widget</h1>
      <nav className="space-x-4">
        <a href="/dashboard">Dashboard</a>
        <a href="/transactions">Transactions</a>
      </nav>
    </div>
  </header>
);
