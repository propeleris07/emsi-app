import { useEffect, useMemo } from 'react';
import type { Station } from '@/models';
import { useLocationStore } from '@/store/location';
import { useStationsStore } from '@/store/stations';
import { useSession } from '@/store';
import { distanceKm } from '@/utils/geo';

export interface StationWithDistance extends Station {
  distanceKm: number;
}

/** Degalinės, surikiuotos pagal atstumą nuo vartotojo. */
export function useStations() {
  const { stations, prices, loaded, loading, load } = useStationsStore();
  const coords = useLocationStore((s) => s.coords);
  const source = useLocationStore((s) => s.source);
  const requestLocation = useLocationStore((s) => s.request);
  const locationConsent = useSession((s) => s.user?.consents.location ?? false);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // Vietą prašome tik jei vartotojas davė sutikimą (BDAR).
    if (locationConsent) requestLocation();
  }, [locationConsent, requestLocation]);

  const sorted = useMemo<StationWithDistance[]>(
    () =>
      stations
        .map((s) => ({ ...s, distanceKm: distanceKm(coords, { lat: s.lat, lng: s.lng }) }))
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [stations, coords],
  );

  return {
    stations: sorted,
    nearest: sorted[0] as StationWithDistance | undefined,
    prices,
    loaded,
    loading,
    reload: () => load(true),
    locationSource: source,
    coords,
  };
}
