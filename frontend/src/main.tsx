import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import AppKitProvider from './context/AppKitProvider.tsx'
import { ErrorBoundary } from './components/ui'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppKitProvider>
        <App />
      </AppKitProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

