import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { Transaction } from '@/models';
import { useLang } from '@/hooks/useLang';
import { useTheme } from '@/theme';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/utils/categories';
import { formatDateTime, formatMoney, formatPlate } from '@/utils/format';
import { FUEL_ORDER } from '@/utils/pricing';
import { Text } from './Text';

// Kvitų eilutės yra lietuviškos (fiskalinis dokumentas) – sąraše rodome išverstą pavadinimą.
const LT_FUEL: Record<string, string> = { 'Benzinas 95': '95', 'Benzinas 98': '98', Dyzelinas: 'D', 'SND (dujos)': 'LPG', AdBlue: 'ADBLUE' };

export function TransactionRow({ tx, onPress }: { tx: Transaction; onPress?: () => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const { colors, spacing, radius } = useTheme();
  const first = tx.items[0];
  const fuelKey = first ? LT_FUEL[first.name] : undefined;
  const fuelName = fuelKey && FUEL_ORDER.includes(fuelKey as never) ? t(`fuel.long.${fuelKey}`) : first?.name;
  const title =
    tx.category === 'fuel' && first
      ? `${fuelName} · ${first.qty.toFixed(2).replace('.', lang === 'lt' ? ',' : '.')} l`
      : (first?.name ?? t(`category.${tx.category}`));
  const where = tx.vehiclePlate ? `${formatPlate(tx.vehiclePlate)}${tx.odometerKm ? ` · ${tx.odometerKm} km` : ''}` : tx.stationName.replace(/^EMSI /, '');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
      })}
    >
      <View style={{ width: 40, height: 40, borderRadius: radius.sm, backgroundColor: CATEGORY_COLORS[tx.category], alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={CATEGORY_ICONS[tx.category]} size={20} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
          {tx.items.length > 1 ? ` +${tx.items.length - 1}` : ''}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {formatDateTime(tx.createdAt, lang)} · {where}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text variant="bodyStrong">{formatMoney(tx.total, lang)}</Text>
        {tx.discount > 0 ? (
          <Text variant="caption" tone="primary">
            –{formatMoney(tx.discount, lang)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
