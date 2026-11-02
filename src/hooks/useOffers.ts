import { useEffect } from 'react';
import { useCardStore, useSession, useSettings } from '@/store';
import { useOffersStore } from '@/store/offers';

/** Pasiūlymai pagal kortelės tipą + aktyvuotų kuponų sąrašas. */
export function useOffers() {
  const userId = useSession((s) => s.user?.id);
  const cardType = useCardStore((s) => s.card?.type ?? 'general');
  const language = useSettings((s) => s.language);
  const { offers, activated, loading, load, activate } = useOffersStore();

  // Pasikeitus kalbai – turinys iš „serverio“ gaunamas iš naujo.
  useEffect(() => {
    if (userId) load(userId, cardType);
  }, [userId, cardType, load, language]);

  return {
    offers,
    activated,
    loading,
    reload: () => (userId ? load(userId, cardType) : Promise.resolve()),
    activate: (offerId: string) => (userId ? activate(userId, offerId) : Promise.resolve()),
  };
}
