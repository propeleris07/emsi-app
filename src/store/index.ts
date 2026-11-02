import { useSyncExternalStore } from 'react';
import { useCardStore } from './card';
import { useSession } from './session';
import { useSettings } from './settings';
import { useFleetStore } from './fleet';
import { useOffersStore } from './offers';

export { useCardStore, useSession, useSettings };

const persisted = [useSession, useCardStore, useSettings];

/** Laukia, kol visos saugyklos bus atkurtos iš AsyncStorage. */
const hydrated = () => persisted.every((s) => s.persist.hasHydrated());
const subscribeHydration = (cb: () => void) => {
  const unsubs = persisted.map((s) => s.persist.onFinishHydration(cb));
  return () => unsubs.forEach((u) => u());
};

export function useStoresHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, hydrated, hydrated);
}

/** Ištrina visus vietinius duomenis (atsijungimas / paskyros ištrynimas). */
export function resetAllStores() {
  useCardStore.getState().reset();
  useFleetStore.setState({ account: null, loaded: false });
  useOffersStore.setState({ offers: [], activated: [] });
  useSettings.getState().setFleetMode(false);
  useSession.getState().logout();
}
