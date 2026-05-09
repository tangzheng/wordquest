/**
 * Auth store - manages user authentication state
 * Also handles syncing game state when user logs in/out
 */
import { create } from 'zustand';
import { supabase, onAuthStateChange } from '@/services/supabase';
import { useGameStore } from './useGameStore';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  initialize: () => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: () => {
    if (get().initialized) return;

    // Set initial state from Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      set({ user, initialized: true });

      // Load remote state if user is logged in
      if (user) {
        useGameStore.getState().loadFromRemote(user.id);
      }
    });

    // Listen for auth changes
    onAuthStateChange(async (userId) => {
      if (userId) {
        const { data: { user } } = await supabase.auth.getUser();
        set({ user: user ?? null });

        // Load remote state for new user
        if (user) {
          const loaded = await useGameStore.getState().loadFromRemote(user.id);
          if (!loaded) {
            // First time user - sync local to remote to create initial state
            await useGameStore.getState().syncToRemote(user.id);
          }
        }
      } else {
        set({ user: null });
      }
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    return { error: error as Error | null };
  },

  signUp: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({ email, password });
    set({ loading: false });
    return { error: error as Error | null };
  },

  signOut: async () => {
    const userId = get().user?.id;

    // Sync local state to remote before logging out
    if (userId) {
      await useGameStore.getState().syncToRemote(userId);
    }

    set({ loading: true });
    await supabase.auth.signOut();
    set({ loading: false, user: null });
  },
}));