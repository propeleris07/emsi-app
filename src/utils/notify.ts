import { services } from '@/services';
import { useSettings } from '@/store/settings';
import type { NotificationKind } from '@/store/settings';

/** Siunčia pranešimą tik jei vartotojas nėra išjungęs šio tipo pranešimų nustatymuose. */
export function notifyUser(kind: NotificationKind, title: string, body: string, url?: string) {
  if (!useSettings.getState().notifications[kind]) return Promise.resolve();
  return services.notifications.notify(title, body, url);
}

export function scheduleForUser(kind: NotificationKind, date: Date, title: string, body: string, url?: string) {
  if (!useSettings.getState().notifications[kind]) return Promise.resolve();
  return services.notifications.scheduleAt(date, title, body, url);
}
