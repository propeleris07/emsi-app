import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { featureFlags } from '@/config/featureFlags';
import { brand } from '@/config/theme';
import { useTheme } from '@/theme';
import { Text } from './Text';

/** Mažas ženklas „Demonstracinė versija“ ekrano viršuje (nesugaudo paspaudimų). */
export function DemoBadge() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  if (!featureFlags.showDemoBadge) return null;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: insets.top + 2, left: 0, right: 0, alignItems: 'center' }}
    >
      <View style={{ backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, opacity: 0.9 }}>
        <Text variant="caption" style={{ color: colors.onAccent, fontSize: 10, fontWeight: '700' }}>
          {t('common.demoBadge')}
        </Text>
      </View>
    </View>
  );
}

/**
 * Ta pati žyma kaip siaura juosta virš programėlės. Naudojama naršyklėje, kur nėra
 * telefono būsenos juostos ir plaukiojantis ženklas užliptų ant ekrano antraštės.
 */
export function DemoStrip() {
  const { t } = useTranslation();
  if (!featureFlags.showDemoBadge) return null;
  return (
    <View style={{ height: 22, backgroundColor: brand.greenDark, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="caption" style={{ color: brand.yellow, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 }}>
        {t('common.demoBadge')}
      </Text>
    </View>
  );
}
