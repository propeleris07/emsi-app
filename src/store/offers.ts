import { create } from 'zustand';
import type { CardType, Offer } from '@/models';
import { services } from '@/services';

interface OffersState {
  offers: Offer[];
  activated: string[];
  loading: boolean;
  load: (userId: string, cardType: CardType) => Promise<void>;
  activate: (userId: string, offerId: string) => Promise<void>;
}

export const useOffersStore = create<OffersState>()((set) => ({
  offers: [],
  activated: [],
  loading: false,
  load: async (userId, cardType) => {
    set({ loading: true });
    try {
      const [offers, activated] = await Promise.all([
        services.offers.listOffers(cardType),
        services.offers.listActivated(userId),
      ]);
      set({ offers, activated });
    } finally {
      set({ loading: false });
    }
  },
  activate: async (userId, offerId) => {
    const activated = await services.offers.activate(userId, offerId);
    set({ activated });
  },
}));
