import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import i18n from '@/i18n';
import { Alert } from './alert';

/** Bendrinimas; jei naršyklė jo nepalaiko – tekstas nukopijuojamas į iškarpinę. */
export async function shareText(message: string, title?: string): Promise<{ action: string }> {
  try {
    return await Share.share({ message, title });
  } catch {
    await Clipboard.setStringAsync(message);
    Alert.alert(i18n.t('common.copied'));
    return { action: 'copied' };
  }
}
