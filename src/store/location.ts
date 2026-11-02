import { create } from 'zustand';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION, type LatLng } from '@/utils/geo';

interface LocationState {
  coords: LatLng;
  /** 'fallback' – rodome Vilniaus centrą, nes vieta neleidžiama arba nežinoma. */
  source: 'device' | 'fallback';
  requested: boolean;
  request: () => Promise<void>;
}

export const useLocationStore = create<LocationState>()((set, get) => ({
  coords: DEFAULT_LOCATION,
  source: 'fallback',
  requested: false,
  request: async () => {
    if (get().requested && get().source === 'device') return;
    set({ requested: true });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const last = await Location.getLastKnownPositionAsync();
      if (last) set({ coords: { lat: last.coords.latitude, lng: last.coords.longitude }, source: 'device' });
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      set({ coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }, source: 'device' });
    } catch {
      // Lieka numatytoji vieta.
    }
  },
}));
