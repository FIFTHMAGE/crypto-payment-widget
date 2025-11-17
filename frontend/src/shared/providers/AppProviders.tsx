/**
 * @title AppProviders
 * @description Proper provider composition
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundaryWrapper } from '../errors/ErrorBoundaryWrapper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundaryWrapper>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundaryWrapper>
);

