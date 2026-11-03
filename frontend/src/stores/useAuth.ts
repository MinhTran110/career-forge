import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  userEmail: null,
  isAuthenticated: false,
  login: (token, email) => set({ token, userEmail: email, isAuthenticated: true }),
  logout: () => set({ token: null, userEmail: null, isAuthenticated: false }),
}));
