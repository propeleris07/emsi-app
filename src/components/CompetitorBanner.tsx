import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { featureFlags } from '@/config/featureFlags';
import { useLang } from '@/hooks/useLang';
import type { CompetitorComparison, FuelType } from '@/models';
import { services } from '@/services';
import { useTheme } from '@/theme';
import { formatDistance } from '@/utils/format';
import { Text } from './Text';

/**
 * „EMSI pigiau X ct/l nei artimiausia konkurento degalinė“.
 * Rodoma tik įjungus featureFlags.competitorPriceComparison.
 */
export function CompetitorBanner({ stationId, fuel = 'D' }: { stationId: string; fuel?: FuelType }) {
  const { t } = useTranslation();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const [cmp, setCmp] = useState<CompetitorComparison | null>(null);

  useEffect(() => {
    if (!featureFlags.competitorPriceComparison) return;
    services.competitors.compare(stationId, fuel).then(setCmp);
  }, [stationId, fuel]);

  if (!featureFlags.competitorPriceComparison || !cmp || cmp.diffCt <= 0) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.md }}>
      <Ionicons name="trending-down" size={22} color={colors.onAccent} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" style={{ color: colors.onAccent }}>
          {t('competitor.cheaper', { ct: cmp.diffCt, fuel: t(`fuel.long.${cmp.fuel}`) })}
        </Text>
        <Text variant="caption" style={{ color: colors.onAccent }}>
          {t('competitor.detail', { name: cmp.competitorName, distance: formatDistance(cmp.distanceKm, lang) })}
        </Text>
      </View>
    </View>
  );
}
