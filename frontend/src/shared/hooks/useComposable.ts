/**
 * @title useComposable
 * @description Composable hooks pattern
 */

import { useState, useCallback, useEffect } from 'react';

export const useComposable = <T>(initialState: T) => {
  const [state, setState] = useState<T>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback((newState: Partial<T>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setError(null);
  }, [initialState]);

  return { state, loading, error, update, reset, setLoading, setError };
};

