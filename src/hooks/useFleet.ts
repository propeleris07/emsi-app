import { useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSession, useSettings } from '@/store';
import { fleetCard, useFleetStore } from '@/store/fleet';

/** Įmonės paskyra (jei susieta) ir ar šiuo metu mokama įmonės kortele. */
export function useFleet() {
  const userId = useSession((s) => s.user?.id);
  const { account, loaded, load, link, unlink } = useFleetStore();
  const fleetMode = useSettings((s) => s.fleetMode);
  const setFleetMode = useSettings((s) => s.setFleetMode);

  useFocusEffect(
    useCallback(() => {
      if (userId) load(userId);
    }, [userId, load]),
  );

  const card = useMemo(() => (account && userId ? fleetCard(account, userId) : null), [account, userId]);

  return {
    account,
    loaded,
    active: !!account && fleetMode,
    card,
    setFleetMode,
    reload: () => (userId ? load(userId) : Promise.resolve()),
    link: (code: string, pin: string) => (userId ? link(userId, code, pin) : Promise.resolve()),
    unlink: async () => {
      if (!userId) return;
      await unlink(userId);
      setFleetMode(false);
    },
  };
}
