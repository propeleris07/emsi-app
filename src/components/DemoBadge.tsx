import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { featureFlags } from '@/config/featureFlags';
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
