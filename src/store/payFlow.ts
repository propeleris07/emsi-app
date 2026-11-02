import { create } from 'zustand';
import type { FuelType, PayMode } from '@/models';

/** Mokėjimo prie kolonėlės vedlio būsena (nesaugoma diske). */
interface PayFlowState {
  stationId?: string;
  pumpNumber?: number;
  fuel?: FuelType;
  mode: PayMode;
  value: number;
  paymentMethodId?: string;
  vehiclePlate?: string;
  odometerKm?: number;
  set: (patch: Partial<Omit<PayFlowState, 'set' | 'reset'>>) => void;
  reset: () => void;
}

const initial = { mode: 'amount' as PayMode, value: 30 };

export const usePayFlow = create<PayFlowState>()((set) => ({
  ...initial,
  set: (patch) => set(patch),
  reset: () =>
    set({ ...initial, stationId: undefined, pumpNumber: undefined, fuel: undefined, vehiclePlate: undefined, odometerKm: undefined }),
}));
