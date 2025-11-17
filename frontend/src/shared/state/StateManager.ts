/**
 * @title StateManager
 * @description Centralized state management architecture
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface GlobalState {
  isLoading: boolean;
  error: string | null;
  user: any | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: any) => void;
  clearState: () => void;
}

export const useGlobalStore = create<GlobalState>()(
  devtools(
    persist(
      (set) => ({
        isLoading: false,
        error: null,
        user: null,
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setUser: (user) => set({ user }),
        clearState: () => set({ isLoading: false, error: null, user: null }),
      }),
      { name: 'global-store' }
    )
  )
);

