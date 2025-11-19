/**
 * Factory for creating data query hooks
 * @module hooks/factories/createQueryHook
 */

import { useState, useEffect } from 'react';

export interface QueryOptions {
  enabled?: boolean;
  refetchInterval?: number;
  cacheTime?: number;
}

export function createQueryHook<TData, TParams extends unknown[]>(
  queryFn: (...params: TParams) => Promise<TData>,
  options: QueryOptions = {}
) {
  return function useQuery(...params: TParams) {
    const [data, setData] = useState<TData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { enabled = true, refetchInterval } = options;

    useEffect(() => {
      if (!enabled) return;

      let isCancelled = false;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          const result = await queryFn(...params);
          if (!isCancelled) {
            setData(result);
            setError(null);
          }
        } catch (err) {
          if (!isCancelled) {
            setError(err instanceof Error ? err : new Error(String(err)));
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };

      fetchData();

      if (refetchInterval) {
        const interval = setInterval(fetchData, refetchInterval);
        return () => {
          isCancelled = true;
          clearInterval(interval);
        };
      }

      return () => {
        isCancelled = true;
      };
    }, [enabled, refetchInterval, ...params]);

    return { data, isLoading, error };
  };
}

