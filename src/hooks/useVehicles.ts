import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { Vehicle } from '@/models';
import { services } from '@/services';
import { useSession } from '@/store';

export function useVehicles() {
  const userId = useSession((s) => s.user?.id);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      services.vehicles.list(userId).then((v) => {
        setVehicles(v);
        setLoaded(true);
      });
    }, [userId]),
  );

  const save = async (v: Vehicle) => {
    if (userId) setVehicles(await services.vehicles.save(userId, v));
  };
  const remove = async (id: string) => {
    if (userId) setVehicles(await services.vehicles.remove(userId, id));
  };

  return { vehicles, loaded, save, remove };
}
