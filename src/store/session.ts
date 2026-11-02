import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Consents, User } from '@/models';
import { persistStorage } from './storage';

interface SessionState {
  user: User | null;
  /** true – kai baigta registracija (sutikimai ir kortelė). */
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  setConsents: (consents: Consents) => void;
  updateUser: (patch: Partial<User>) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      setUser: (user) => set({ user }),
      setConsents: (consents) => set((s) => (s.user ? { user: { ...s.user, consents } } : s)),
      updateUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      completeOnboarding: () => set({ isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    { name: 'emsi.session', storage: persistStorage },
  ),
);
