import { Linking, Platform } from 'react-native';
import { Alert } from '@/utils/alert';
import type { TFunction } from 'i18next';

interface Target {
  lat: number;
  lng: number;
  name: string;
}

const appleUrl = (t: Target) => `https://maps.apple.com/?daddr=${t.lat},${t.lng}&q=${encodeURIComponent(t.name)}`;
const googleUrl = (t: Target) => `https://www.google.com/maps/dir/?api=1&destination=${t.lat},${t.lng}`;

/** „Važiuoti“: iOS leidžia pasirinkti Apple arba Google Maps, Android – Google Maps. */
export function openDirections(target: Target, t: TFunction) {
  if (Platform.OS !== 'ios') {
    Linking.openURL(googleUrl(target));
    return;
  }
  Alert.alert(t('stations.navigate'), target.name, [
    { text: 'Apple Maps', onPress: () => Linking.openURL(appleUrl(target)) },
    { text: 'Google Maps', onPress: () => Linking.openURL(googleUrl(target)) },
    { text: t('common.cancel'), style: 'cancel' },
  ]);
}
