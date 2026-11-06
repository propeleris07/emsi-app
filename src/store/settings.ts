import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/models';
import { persistStorage } from './storage';

export type ThemeMode = 'system' | 'light' | 'dark';

export type NotificationKind = 'priceAlerts' | 'receipts' | 'offers' | 'reminders';

interface SettingsState {
  themeMode: ThemeMode;
  language: Language;
  /** Mokėti įmonės kortele (Fleet). */
  fleetMode: boolean;
  notifications: Record<NotificationKind, boolean>;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  setFleetMode: (on: boolean) => void;
  setNotification: (kind: NotificationKind, on: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      // Numatytoji – šviesi tema (balta ir šviesiai pilka, kaip dizaino gairėse).
      themeMode: 'light',
      language: 'lt',
      fleetMode: false,
      notifications: { priceAlerts: true, receipts: true, offers: true, reminders: true },
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      setFleetMode: (fleetMode) => set({ fleetMode }),
      setNotification: (kind, on) => set((s) => ({ notifications: { ...s.notifications, [kind]: on } })),
    }),
    {
      name: 'emsi.settings',
      storage: persistStorage,
      version: 1,
      // v0 numatytoji buvo „system“ – tamsiuose telefonuose rodė tamsią temą. Perjungiame į šviesią.
      migrate: (state, version) => {
        const s = state as SettingsState;
        return version < 1 && s.themeMode === 'system' ? { ...s, themeMode: 'light' } : s;
      },
    },
  ),
);
