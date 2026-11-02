import { Platform } from 'react-native';
import { Alert } from '@/utils/alert';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import type { NotificationService } from '../types';

let configured = false;

/** Vienkartinė konfigūracija: rodyti pranešimus ir kai programėlė atidaryta; Android kanalas. */
export async function configureNotifications() {
  if (configured || Platform.OS === 'web') return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'EMSI',
      importance: AndroidImportance.HIGH,
    });
  }
}

/**
 * Vietiniai pranešimai per expo-notifications (veikia Expo Go).
 * Tikroje versijoje serverio pranešimai ateis per push (APNs / FCM).
 */
export class LocalNotificationService implements NotificationService {
  async requestPermission() {
    if (Platform.OS === 'web') return true;
    await configureNotifications();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted || asked.ios?.status === IosAuthorizationStatus.PROVISIONAL;
  }

  async notify(title: string, body: string, url?: string) {
    if (Platform.OS === 'web') {
      Alert.alert(title, body);
      return;
    }
    if (!(await this.requestPermission())) return;
    await Notifications.scheduleNotificationAsync({ content: { title, body, data: url ? { url } : {} }, trigger: null });
  }

  async scheduleAt(date: Date, title: string, body: string, url?: string) {
    if (Platform.OS === 'web' || date.getTime() <= Date.now()) return;
    if (!(await this.requestPermission())) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: url ? { url } : {} },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    });
  }
}
