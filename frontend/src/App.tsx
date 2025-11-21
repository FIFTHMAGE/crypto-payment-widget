import React from 'react';
import { PaymentWidget } from './components/PaymentWidget';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white text-center">
            Crypto Payment Widget
          </h1>
          <p className="text-center text-gray-400 mt-2">
            Accept cryptocurrency payments easily
          </p>
        </header>

        <main>
          <PaymentWidget />
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by Ethereum & Web3</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
