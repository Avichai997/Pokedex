import { create } from 'zustand';

import { IUser } from '@/types';

interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  setUser: (user: IUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<IAuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
