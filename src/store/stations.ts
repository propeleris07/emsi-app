import { create } from 'zustand';
import type { FuelPrice, Station } from '@/models';
import { services } from '@/services';

interface StationsState {
  stations: Station[];
  prices: Record<string, FuelPrice[]>;
  loaded: boolean;
  loading: boolean;
  load: (force?: boolean) => Promise<void>;
}

/** Degalinių ir kainų talpykla (nesaugoma diske – visada imama iš „services“). */
export const useStationsStore = create<StationsState>()((set, get) => ({
  stations: [],
  prices: {},
  loaded: false,
  loading: false,
  load: async (force) => {
    if ((get().loaded && !force) || get().loading) return;
    set({ loading: true });
    try {
      const [stations, prices] = await Promise.all([services.stations.listStations(), services.prices.getAllPrices()]);
      set({ stations, prices, loaded: true });
    } finally {
      set({ loading: false });
    }
  },
}));
