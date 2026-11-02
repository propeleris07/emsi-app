import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoyaltyCard } from '@/models';
import type { WalletProvider } from '@/services/types';
import { persistStorage } from './storage';

interface CardState {
  card: LoyaltyCard | null;
  wallet: Record<WalletProvider, boolean>;
  setCard: (card: LoyaltyCard) => void;
  setWalletAdded: (provider: WalletProvider) => void;
  reset: () => void;
}

export const useCardStore = create<CardState>()(
  persist(
    (set) => ({
      card: null,
      wallet: { apple: false, google: false },
      setCard: (card) => set({ card }),
      setWalletAdded: (provider) => set((s) => ({ wallet: { ...s.wallet, [provider]: true } })),
      reset: () => set({ card: null, wallet: { apple: false, google: false } }),
    }),
    { name: 'emsi.card', storage: persistStorage },
  ),
);
