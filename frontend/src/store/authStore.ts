import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: any | null;
  role: string | null;
  setAuth: (token: string, user: any, role: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      role: null,
      setAuth: (token, user, role) => set({ token, user, role }),
      logout: () => set({ token: null, user: null, role: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'auth-storage' }
  )
);
