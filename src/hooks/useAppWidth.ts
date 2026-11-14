import { Platform, useWindowDimensions } from 'react-native';
import { APP_MAX_WIDTH } from '@/config/theme';

/**
 * Programėlės turinio plotis. Naršyklėje plačiame lange programėlė rodoma
 * telefono pločio stulpelyje, todėl išdėstymą skaičiuojame pagal jį, o ne pagal langą.
 */
export function useAppWidth(): number {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' ? Math.min(width, APP_MAX_WIDTH) : width;
}
