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
const wazeUrl = (t: Target) => `https://waze.com/ul?ll=${t.lat},${t.lng}&navigate=yes`;
// Android parodo visų įdiegtų navigacijos programėlių sąrašą (Google Maps, Waze ir kt.).
const geoUrl = (t: Target) => `geo:${t.lat},${t.lng}?q=${t.lat},${t.lng}(${encodeURIComponent(t.name)})`;

/** „Važiuoti“: iOS – Apple Maps, Google Maps arba Waze; Android – sistemos pasirinkimas; naršyklėje – Google Maps. */
export function openDirections(target: Target, t: TFunction) {
  if (Platform.OS === 'web') {
    Linking.openURL(googleUrl(target));
    return;
  }
  if (Platform.OS === 'android') {
    Linking.openURL(geoUrl(target)).catch(() => Linking.openURL(googleUrl(target)));
    return;
  }
  Alert.alert(t('stations.navigate'), target.name, [
    { text: 'Apple Maps', onPress: () => Linking.openURL(appleUrl(target)) },
    { text: 'Google Maps', onPress: () => Linking.openURL(googleUrl(target)) },
    { text: 'Waze', onPress: () => Linking.openURL(wazeUrl(target)) },
    { text: t('common.cancel'), style: 'cancel' },
  ]);
}
