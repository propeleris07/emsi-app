import { create } from 'zustand';
import type { FleetAccount, LoyaltyCard } from '@/models';
import { services } from '@/services';

interface FleetState {
  account: FleetAccount | null;
  loaded: boolean;
  load: (userId: string) => Promise<void>;
  link: (userId: string, companyCode: string, pin: string) => Promise<void>;
  unlink: (userId: string) => Promise<void>;
}

export const useFleetStore = create<FleetState>()((set) => ({
  account: null,
  loaded: false,
  load: async (userId) => set({ account: await services.fleet.getAccount(userId), loaded: true }),
  link: async (userId, companyCode, pin) => set({ account: await services.fleet.link(userId, companyCode, pin) }),
  unlink: async (userId) => {
    await services.fleet.unlink(userId);
    set({ account: null });
  },
}));

/** Įmonės kortelė kaip lojalumo kortelė (kodas kasai, nuolaidų taisyklės „fleet“). */
export function fleetCard(account: FleetAccount, userId: string): LoyaltyCard {
  return {
    id: `fleetcard-${account.id}`,
    userId,
    type: 'fleet',
    number: account.cardNumber,
    status: 'active',
    issuedAt: '',
    savedThisYear: 0,
    savedTotal: 0,
  };
}
